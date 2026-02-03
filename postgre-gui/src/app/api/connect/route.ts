import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/crypto';
import { getDbClient, closeDbClient } from '@/lib/db-connect';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 1. Import NextAuth tools
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...next_auth]/route";

const ConnectSchema = z.object({
  connectionString: z.string().refine(
    (s) => s.startsWith('postgres://') || s.startsWith('postgresql://'),
    "Must be a valid PostgreSQL connection string"
  ),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // 2. GET USER SECURELY (NextAuth way)
    const session = await getServerSession(authOptions);
    //@ts-ignore
    const userId = session?.user?.id; // This comes from our callback in step 3

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { connectionString, name } = ConnectSchema.parse(body);

    // ... (Validation Logic & DB Ping stays the same) ...

    const encryptedString = await encrypt(connectionString);

    // 3. PERSIST (If User is logged in)
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

    // ... (Guest Mode Cookie Logic stays the same) ...
    
    return NextResponse.json({ status: "connected", mode: "guest" });

  } catch (error) {
    // ... Error handling
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}