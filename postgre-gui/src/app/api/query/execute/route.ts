import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { Client } from 'pg'; // Standard Postgres Client
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const { sql } = await req.json();

  let encryptedString: string | undefined;
  let connectionId: string | undefined;

  // ---------------------------------------------------------
  // 1. DETERMINE CONNECTION (The Patch)
  // ---------------------------------------------------------
  
  // A. Check Session (Logged In User)
  const session = await getServerSession(authOptions);
  
  if (session?.user?.email) {
    // Find the user's most recent active connection
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { connections: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    
    if (user?.connections[0]) {
      encryptedString = user.connections[0].encryptedString;
      connectionId = user.connections[0].id;
    }
  }

  // B. Guest Mode Fallback (If not found above)
  if (!encryptedString) {
    const cookieStore = await cookies();
    encryptedString = cookieStore.get('db_session_guest')?.value;
  }

  // If still no string, they aren't connected
  if (!encryptedString) {
    return NextResponse.json({ error: "Unauthorized: No active connection found." }, { status: 401 });
  }

  // ---------------------------------------------------------
  // 2. SECURITY GUARDRAILS (Your excellent code)
  // ---------------------------------------------------------
  const upperSql = sql.toUpperCase();
  const forbiddenKeywords = ['DROP ', 'DELETE ', 'INSERT ', 'UPDATE ', 'ALTER ', 'TRUNCATE ', 'GRANT ', 'REVOKE '];

  if (forbiddenKeywords.some(keyword => upperSql.includes(keyword))) {
    return NextResponse.json(
      { error: "Security Alert: Destructive actions are disabled in this demo." }, 
      { status: 403 }
    );
  }

  // ---------------------------------------------------------
  // 3. EXECUTE QUERY
  // ---------------------------------------------------------
  const startTime = Date.now();
  let client: Client | null = null;
  
  try {
    const connectionString = await decrypt(encryptedString);
    
    // Connect to the User's Database
    client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false } // Necessary for Neon/Supabase/Cloud DBs
    });

    await client.connect();

    // TIMEOUT PROTECTION: Kill query if it takes > 5 seconds
    await client.query("SET statement_timeout = 5000");

    // Run the actual SQL
    const result = await client.query(sql);

    // LOGGING (Optional - Keep if you have a QueryLog model)
    if (connectionId) {
        // We wrap this in a fire-and-forget catch so it doesn't block the UI
        prisma.queryLog?.create({
            data: {
                sql: sql,
                success: true,
                durationMs: Date.now() - startTime,
                connectionId: connectionId
            }
        }).catch(err => console.log("Logging skipped (Model might not exist)"));
    }

    // Return Data + Fields
    return NextResponse.json({ 
      rows: result.rows,
      fields: result.fields.map((f: any) => f.name),
      rowCount: result.rowCount
    });

  } catch (error: any) {
    // Log Failure
    if (connectionId) {
        prisma.queryLog?.create({
            data: {
                sql: sql,
                success: false,
                durationMs: Date.now() - startTime,
                connectionId: connectionId
            }
        }).catch(err => console.log("Logging skipped"));
    }
    
    return NextResponse.json({ error: error.message || "Query Failed" }, { status: 400 });

  } finally {
    // CRITICAL: Close connection
    if (client) {
      await client.end();
    }
  }
}