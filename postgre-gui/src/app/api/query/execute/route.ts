import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/crypto';
import { getDbClient, closeDbClient } from '@/lib/db-connect';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  // 1. Parse Input
  const { sql, connectionId } = await req.json();

  // 2. Determine Source of Connection String
  // STRATEGY: If connectionId exists, check DB (User). If not, check Cookie (Guest).
  let encryptedString: string | undefined;

  if (connectionId) {
    // A. Logged In User Mode
    const savedConnection = await prisma.connection.findUnique({
      where: { id: connectionId },
      select: { encryptedString: true }
    });
    
    if (savedConnection) {
      encryptedString = savedConnection.encryptedString;
    }
  } 
  
  // B. Guest Mode Fallback
  if (!encryptedString) {
    const cookieStore = await cookies();
    encryptedString = cookieStore.get('db_session_guest')?.value;
  }

  // If we still don't have a string, they are unauthorized
  if (!encryptedString) {
    return NextResponse.json({ error: "Unauthorized: No active connection." }, { status: 401 });
  }

  // 3. Security Guardrails (Regex Check)
  const upperSql = sql.toUpperCase();
  const forbiddenKeywords = ['DROP ', 'DELETE ', 'INSERT ', 'UPDATE ', 'ALTER ', 'TRUNCATE ', 'GRANT ', 'REVOKE '];

  if (forbiddenKeywords.some(keyword => upperSql.includes(keyword))) {
    return NextResponse.json(
      { error: "Security Alert: destructive actions are disabled." }, 
      { status: 403 }
    );
  }

  const startTime = Date.now();
  let client; // Declare outside try/catch so we can close it in 'finally'
  
  try {
    const connectionString = await decrypt(encryptedString);
    client = await getDbClient(connectionString);

    // 4. TIMEOUT PROTECTION (Vital!)
    // If a query takes > 5 seconds, kill it to save resources
    await client.query("SET statement_timeout = 5000");

    // 5. Execute
    const result = await client.query(sql);

    // 6. Log Success (Fire & Forget)
    if (connectionId) {
      prisma.queryLog.create({
        data: {
          sql: sql,
          success: true,
          durationMs: Date.now() - startTime,
          connectionId: connectionId
        }
      }).catch(err => console.error("Failed to log query", err));
    }

    // 7. Return Rows AND Fields (Column Names)
    // We map fields to simple names so the frontend table knows what columns to show
    return NextResponse.json({ 
      rows: result.rows,
      fields: result.fields.map((f: any) => f.name) 
    });

  } catch (error: any) {
    // Log Failure
    if (connectionId) {
       prisma.queryLog.create({
        data: {
          sql: sql,
          success: false,
          durationMs: Date.now() - startTime,
          connectionId: connectionId
        }
      }).catch(e => console.error(e));
    }
    
    // Return the actual DB error message so the user knows what they did wrong
    return NextResponse.json({ error: error.message || "Query Failed" }, { status: 400 });

  } finally {
    // 8. CRITICAL: CLOSE THE CONNECTION
    if (client) {
      await closeDbClient(client);
    }
  }
}