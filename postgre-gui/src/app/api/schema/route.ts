import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Client } from "pg"; 
import { decrypt } from "@/lib/crypto"; // <--- Import decrypt

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch the user's active connection
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        // Grab the most recent connection
        include: { connections: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    const connection = user?.connections[0];

    if (!connection) {
        return NextResponse.json({ error: "No database connected" }, { status: 404 });
    }

    // 2. DECRYPT the connection string
    // We cannot pass 'encryptedString' to pg.Client, it needs the real password.
    const realConnectionString = await decrypt(connection.encryptedString);

    // 3. Connect to the USER'S database
    const client = new Client({
      connectionString: realConnectionString,
      ssl: { rejectUnauthorized: false } // Required for most cloud DBs (Neon, Supabase)
    });

    await client.connect();

    // 4. Query A: Get Tables & Columns
    const tablesQuery = `
      SELECT table_name, column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog') 
      ORDER BY table_name, ordinal_position;
    `;

    // 5. Query B: Get Foreign Keys
    const relationsQuery = `
      SELECT
          tc.table_name AS source_table,
          kcu.column_name AS source_column,
          ccu.table_name AS target_table,
          ccu.column_name AS target_column
      FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema NOT IN ('information_schema', 'pg_catalog');
    `;

    const [tablesRes, relationsRes] = await Promise.all([
      client.query(tablesQuery),
      client.query(relationsQuery)
    ]);

    await client.end(); // Close connection immediately

    // 6. Transform Data
    const tablesMap = new Map<string, { table_name: string; columns: any[] }>();
    tablesRes.rows.forEach((row: any) => {
      if (!tablesMap.has(row.table_name)) {
        tablesMap.set(row.table_name, { table_name: row.table_name, columns: [] });
      }
      tablesMap.get(row.table_name)!.columns.push({
        name: row.column_name,
        type: row.data_type,
      });
    });

    const schema = Array.from(tablesMap.values());
    const relations = relationsRes.rows;

    return NextResponse.json({ schema, relations });

  } catch (error: any) {
    console.error("Schema Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch schema. Check your connection string." }, { status: 500 });
  }
}