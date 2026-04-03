import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type PiiRisk = "HIGH" | "MEDIUM";

type PiiSeed = {
  tableName: string;
  sensitiveColumns: string[];
  baseRisk: string;
};

type TableLike = {
  table_name?: unknown;
  columns?: unknown;
};

type ColumnLike = {
  name?: unknown;
  type?: unknown;
};

type RelationLike = {
  source_table?: unknown;
  source_column?: unknown;
  target_table?: unknown;
  target_column?: unknown;
};

type GeminiSeedLike = {
  tableName?: unknown;
  sensitiveColumns?: unknown;
  baseRisk?: unknown;
};

function edgeIdFromRelation(rel: RelationLike) {
  // Must match the deterministic edge ids created in `SchemaGraph.tsx`
  const sourceTable = typeof rel.source_table === "string" ? rel.source_table : "?";
  const sourceColumn = typeof rel.source_column === "string" ? rel.source_column : "?";
  const targetTable = typeof rel.target_table === "string" ? rel.target_table : "?";
  const targetColumn = typeof rel.target_column === "string" ? rel.target_column : "?";
  return `e-${sourceTable}.${sourceColumn}-${targetTable}.${targetColumn}`;
}

function parseGeminiJsonArray(text: string): unknown[] {
  const trimmed = (text ?? "").trim();
  if (!trimmed) throw new Error("Empty Gemini response");

  // Try direct parse first.
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) return parsed;
    throw new Error("Gemini response was not a JSON array");
  } catch {
    // Fallback: extract the first [...last] JSON array substring.
  }

  const first = trimmed.indexOf("[");
  const last = trimmed.lastIndexOf("]");
  if (first === -1 || last === -1 || last < first) {
    throw new Error("Failed to locate JSON array in Gemini response");
  }

  const candidate = trimmed.slice(first, last + 1);
  const parsed = JSON.parse(candidate) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Gemini JSON was not an array");
  return parsed as unknown[];
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as unknown;
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    // Accept either `{ tables, relations }` or `{ schema: { tables, relations } }`.
    const bodyObj = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
    const schemaObj =
      bodyObj && "schema" in bodyObj && bodyObj.schema && typeof bodyObj.schema === "object"
        ? (bodyObj.schema as Record<string, unknown>)
        : bodyObj ?? ({} as Record<string, unknown>);

    const tables = schemaObj.tables;
    const relations = schemaObj.relations;

    if (!Array.isArray(tables) || !Array.isArray(relations)) {
      return NextResponse.json(
        { error: "Request must include { tables: [], relations: [] }" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    // 1) Prepare schema context for Gemini (tables + columns + foreign keys).
    const tablesText = (tables as unknown[]).map((t) => {
      const tableLike = t as TableLike;
      const tableName = typeof tableLike.table_name === "string" ? tableLike.table_name : "";
      const cols = Array.isArray(tableLike.columns) ? (tableLike.columns as unknown[]) : [];
      const colsText = cols
        .map((c) => {
          const colLike = c as ColumnLike;
          const colName = typeof colLike.name === "string" ? colLike.name : "unknown";
          const colType = typeof colLike.type === "string" ? colLike.type : "unknown";
          return `${colName} (${colType})`;
        })
        .join(", ");
      return `Table '${tableName}': ${colsText}`;
    }).join("\n");

    const relationsText = (relations as unknown[]).map((r) => {
      const relLike = r as RelationLike;
      const sourceTable = typeof relLike.source_table === "string" ? relLike.source_table : "?";
      const sourceColumn = typeof relLike.source_column === "string" ? relLike.source_column : "?";
      const targetTable = typeof relLike.target_table === "string" ? relLike.target_table : "?";
      const targetColumn = typeof relLike.target_column === "string" ? relLike.target_column : "?";
      return `ForeignKey '${sourceTable}.${sourceColumn}' -> '${targetTable}.${targetColumn}'`;
    }).join("\n");

    const fullPrompt = `
You are a database security analyst.
Analyze the following PostgreSQL schema and identify tables containing Personally Identifiable Information (PII).

PII includes (but is not limited to): emails, phone numbers, physical addresses, postal codes, government IDs (SSN, passport, etc), dates of birth, names, usernames linked to individuals.

Return ONLY a valid JSON array (no markdown, no backticks) with this exact item format:
[
  {
    "tableName": "string (must match a provided table name)",
    "sensitiveColumns": ["string (must match provided column names)"],
    "baseRisk": "HIGH"
  }
]

Rules:
- Only include tables that have at least one sensitive column.
- Use exact table/column names as provided.
- If a column is ambiguous, include it if it's likely to contain PII.

Schema:
${tablesText}

Relationships:
${relationsText}
`.trim();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const geminiText = response.text();

    // 2) Gemini seed detection
    const rawSeeds = parseGeminiJsonArray(geminiText);

    const seeds: PiiSeed[] = rawSeeds
      .map((s) => {
        const seedLike = s as GeminiSeedLike;
        const tableName = typeof seedLike.tableName === "string" ? seedLike.tableName : "";
        const sensitiveColumns = Array.isArray(seedLike.sensitiveColumns)
          ? seedLike.sensitiveColumns.filter((c): c is string => typeof c === "string")
          : [];
        const baseRisk = typeof seedLike.baseRisk === "string" ? seedLike.baseRisk : "";
        return { tableName, sensitiveColumns, baseRisk };
      })
      .filter((s) => s.tableName && s.sensitiveColumns.length > 0);

    const infectedNodes: Record<string, PiiRisk> = {};
    const infectedEdges = new Set<string>();

    const highTables = new Set<string>();
    const sensitiveByTable = new Map<string, string[]>();

    for (const seed of seeds) {
      const base = (seed.baseRisk ?? "").toUpperCase();
      sensitiveByTable.set(seed.tableName, seed.sensitiveColumns);
      if (base === "HIGH") {
        highTables.add(seed.tableName);
        infectedNodes[seed.tableName] = "HIGH";
      }
    }

    // 3) Contagion algorithm (blast radius)
    // If a HIGH-risk table is referenced by a foreign key, the referencing table becomes MEDIUM.
    for (const rel of relations as unknown[]) {
      const relLike = rel as RelationLike;
      const sourceTable = relLike.source_table;
      const targetTable = relLike.target_table;
      if (typeof sourceTable !== "string" || typeof targetTable !== "string") continue;
      if (!highTables.has(targetTable)) continue;

      // targetTable is HIGH -> sourceTable becomes MEDIUM (unless it was already HIGH).
      if (infectedNodes[sourceTable] !== "HIGH") {
        infectedNodes[sourceTable] = "MEDIUM";
      }

      infectedEdges.add(edgeIdFromRelation(relLike));
    }

    // 4) Recommendations generator
    const improvements = new Set<string>();

    // High-risk table recommendations based on Gemini-sensitive columns.
    for (const [tableName, cols] of sensitiveByTable.entries()) {
      // Only generate column-level advice for tables marked HIGH by Gemini.
      if (!highTables.has(tableName)) continue;
      for (const col of cols) {
        improvements.add(
          `Encrypt or tokenize '${col}' in '${tableName}'.`
        );
      }
    }

    // Medium (implicit-risk) recommendations based on foreign keys pointing to HIGH.
    for (const rel of relations as unknown[]) {
      const relLike = rel as RelationLike;
      const sourceTable = relLike.source_table;
      const targetTable = relLike.target_table;
      const sourceColumn = relLike.source_column;
      const targetColumn = relLike.target_column;

      if (typeof sourceTable !== "string" || typeof targetTable !== "string") continue;
      if (!highTables.has(targetTable)) continue;

      if (infectedNodes[sourceTable] === "MEDIUM") {
        const fkLeft = typeof sourceColumn === "string" ? sourceColumn : "FK column";
        const fkRight = typeof targetColumn === "string" ? targetColumn : "Referenced column";
        improvements.add(
          `Table '${sourceTable}' inherits PII risk via '${fkLeft}' -> '${fkRight}' because '${targetTable}' contains PII.`
        );
      }
    }

    if (improvements.size === 0) {
      improvements.add("No obvious PII patterns detected from the provided schema.");
    }

    // 5) Risk scoring (simple heuristic for UI gauge)
    const highCount = Object.values(infectedNodes).filter((r) => r === "HIGH").length;
    const mediumCount = Object.values(infectedNodes).filter((r) => r === "MEDIUM").length;

    const level = highCount > 0 ? "CRITICAL" : mediumCount > 0 ? "ELEVATED" : "NONE";
    const score = Math.max(
      0,
      Math.min(100, highCount * 55 + mediumCount * 25 + (highCount > 0 ? 20 : 0))
    );

    return NextResponse.json({
      riskScore: { level, score },
      infectedNodes,
      infectedEdges: Array.from(infectedEdges),
      improvements: Array.from(improvements),
    });
  } catch (error: unknown) {
    console.error("PII scan error:", error);
    const message =
      error && typeof error === "object" && "message" in error && typeof (error as Record<string, unknown>).message === "string"
        ? (error as Record<string, unknown>).message
        : "Failed to scan PII";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

