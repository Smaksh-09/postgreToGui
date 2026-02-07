import { NextResponse } from "next/server";
import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Client } from "pg";

const ConnectSchema = z.object({
  connectionString: z.string().refine(
    (s) => s.startsWith("postgres://") || s.startsWith("postgresql://"),
    "Must be a valid PostgreSQL connection string"
  ),
});

async function testConnection(connectionString: string) {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.end();
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { connectionString } = ConnectSchema.parse(body);

    // Test the connection
    await testConnection(connectionString);

    let dbName = "Untitled Database";
    let provider = "Postgres";

    try {
      const url = new URL(connectionString);
      if (url.pathname.length > 1) {
        dbName = url.pathname.slice(1);
      }

      const host = url.hostname;
      if (host.includes("aws")) provider = "AWS RDS";
      else if (host.includes("supabase")) provider = "Supabase";
      else if (host.includes("neon")) provider = "Neon Tech";
      else if (host.includes("localhost") || host.includes("127.0.0.1")) {
        provider = "Localhost";
      }
    } catch (e) {
      console.log("Could not parse DB name, using default");
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const encryptedString = await encrypt(connectionString);
    const connection = await prisma.connection.create({
      data: {
        name: dbName,
        provider,
        encryptedString,
        userId: user.id,
      } as any,
    });

    return NextResponse.json({ status: "connected", connection });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}