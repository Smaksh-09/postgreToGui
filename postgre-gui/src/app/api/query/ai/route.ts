import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { Client } from "pg";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    // 1. Auth & Input Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    // 2. Get Active DB Connection
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { connections: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    const connection = user?.connections[0];
    if (!connection) {
      return NextResponse.json({ error: "No database connected" }, { status: 404 });
    }

    // 3. Fetch Schema Context
    const connectionString = await decrypt(connection.encryptedString);
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    const schemaQuery = `
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position;
    `;
    const schemaRes = await client.query(schemaQuery);
    await client.end();

    const schemaMap: Record<string, string[]> = {};
    schemaRes.rows.forEach((row: any) => {
      if (!schemaMap[row.table_name]) schemaMap[row.table_name] = [];
      schemaMap[row.table_name].push(`${row.column_name} (${row.data_type})`);
    });

    const schemaContext = Object.entries(schemaMap)
      .map(([table, cols]) => `Table '${table}': ${cols.join(", ")}`)
      .join("\n");

    // 4. Construct Prompt
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const fullPrompt = `
      You are a PostgreSQL expert. Convert the following natural language request into a valid SQL query.

      My Database Schema:
      ${schemaContext}

      User Request: "${prompt}"

      Rules:
      1. Return ONLY the raw SQL query. Do not wrap it in markdown code blocks (like \`\`\`sql).
      2. Do not include explanations.
      3. Use ILIKE for text searching if ambiguous.
      4. Always limit results to 100 if no limit is specified.
    `;

    // 5. Generate
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let sql = response.text().trim();
    sql = sql.replace(/```sql/g, "").replace(/```/g, "").trim();

    return NextResponse.json({ sql });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate query" }, { status: 500 });
  }
}