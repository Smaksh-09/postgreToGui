// lib/db-connect.ts
import { Client } from 'pg';

export async function getDbClient(connectionString: string) {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 5000, // Fail fast (5s)
    ssl: { rejectUnauthorized: false }, // Required for Neon/Supabase usually
  });

  await client.connect();
  return client;
}

// Helper to close safely
export async function closeDbClient(client: Client) {
  try {
    await client.end();
  } catch (e) {
    console.error("Error closing DB connection", e);
  }
}