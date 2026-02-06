import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
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

    // 4. Query the System Catalog (Information Schema)
    // This SQL works on every Postgres database to list tables and columns
    const query = `
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position;
    `;

    const result = await client.query(query);
    await client.end(); // Close connection immediately

    // 5. Transform flat rows into a nested structure for Frontend
    // Rows come in like: [ {table: 'users', col: 'id'}, {table: 'users', col: 'email'} ]
    // We want: [ { table_name: 'users', columns: [...] } ]
    const tables: Record<string, any[]> = {};
    
    result.rows.forEach((row) => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push({
        name: row.column_name,
        type: row.data_type,
        // You can add more metadata here if you want (e.g. isPk)
      });
    });

    const schema = Object.entries(tables).map(([name, cols]) => ({
      table_name: name,
      columns: cols
    }));

    return NextResponse.json(schema);

  } catch (error: any) {
    console.error("Schema Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch schema. Check your connection string." }, { status: 500 });
  }
}