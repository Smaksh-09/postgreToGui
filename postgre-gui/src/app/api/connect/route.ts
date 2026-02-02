import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/crypto';
import { getDbClient, closeDbClient } from '@/lib/db-connect';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// FIX 1: Allow both 'postgres://' and 'postgresql://'
const ConnectSchema = z.object({
  connectionString: z.string().refine(
    (s) => s.startsWith('postgres://') || s.startsWith('postgresql://'),
    "Must be a valid PostgreSQL connection string"
  ),
  userId: z.string().optional(),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // FIX 2: Parse JSON safely
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { connectionString, userId, name } = ConnectSchema.parse(body);

    // 1. Validate with 'pg' (Dry Run)
    let client;
    try {
      client = await getDbClient(connectionString);
      await client.query('SELECT 1');
    } catch (e) {
      return NextResponse.json({ error: "Connection failed: Check your string or firewall." }, { status: 400 });
    } finally {
      if (client) await closeDbClient(client);
    }

    // 2. Encrypt
    // Note: This returns "iv:content" combined. Make sure your Prisma schema 
    // stores this in a single 'encryptedString' column.
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
        console.error("Prisma Error:", e);
        return NextResponse.json({ error: "Failed to save connection" }, { status: 500 });
      }
    }

    // 4. Guest Mode (Cookie Fallback)
    const response = NextResponse.json({ status: "connected", mode: "guest" });
    
    // FIX 3: Proper Cookie Attributes
    response.cookies.set('db_session_guest', encryptedString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2, // 2 hours
    });
    
    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      //@ts-ignore
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}