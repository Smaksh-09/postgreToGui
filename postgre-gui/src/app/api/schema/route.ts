import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/crypto';
import { getDbClient, closeDbClient } from '@/lib/db-connect';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();

  const encryptedString = cookieStore.get('db_session_guest')?.value;

  if (!encryptedString) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let client;
  try {
    const connectionString = await decrypt(encryptedString);
    client = await getDbClient(connectionString);

    // This scary looking query fetches all Tables + Columns + Types
    const introspectionQuery = `
      SELECT 
        t.table_name,
        json_agg(json_build_object(
          'column_name', c.column_name, 
          'data_type', c.data_type
        )) as columns
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
      WHERE t.table_schema = 'public'
      GROUP BY t.table_name;
    `;

    const result = await client.query(introspectionQuery);
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch schema" }, { status: 500 });
  } finally {
    if (client) await closeDbClient(client);
  }
}