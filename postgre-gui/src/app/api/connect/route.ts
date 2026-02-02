import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/crypto';
import { getDbClient, closeDbClient } from '@/lib/db-connect'; // Still using 'pg' for validation
import { prisma } from '@/lib/prisma'; // Import Prisma
import { z } from 'zod';

const ConnectSchema = z.object({
  connectionString: z.string().startsWith('postgres://'),
  userId: z.string().optional(), // Now we accept a userId if logged in
  name: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const { connectionString, userId, name } = ConnectSchema.parse(body);

  // 1. Validate with 'pg' (Dry Run)
  let client;
  try {
    client = await getDbClient(connectionString);
    await client.query('SELECT 1');
  } catch (e) {
    return NextResponse.json({ error: "Connection failed" }, { status: 400 });
  } finally {
    if (client) await closeDbClient(client);
  }

  // 2. Encrypt
  const encryptedString = await encrypt(connectionString);

  // 3. PERSIST with Prisma (If User is logged in)
  if (userId) {
    try {
      const savedConnection = await prisma.connection.create({
        data: {
          name: name || "Untitled Database",
          encryptedString: encryptedString,
          userId: userId,
        },
      });
      return NextResponse.json({ status: "connected", id: savedConnection.id });
    } catch (e) {
      return NextResponse.json({ error: "Failed to save connection" }, { status: 500 });
    }
  }

  // 4. Guest Mode (Cookie Fallback) - Same as before
  const response = NextResponse.json({ status: "connected", mode: "guest" });
  response.cookies.set('db_session_guest', encryptedString, { httpOnly: true });
  return response;
}