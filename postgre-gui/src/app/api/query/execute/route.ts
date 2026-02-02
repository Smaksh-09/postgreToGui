import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/crypto';
import { getDbClient, closeDbClient } from '@/lib/db-connect';
import { prisma } from '@/lib/prisma'; // Import Prisma
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { sql, connectionId } = await req.json(); // Accept connectionId if saving history
  
  // ... (Security Guardrails logic from previous answer) ...

  const startTime = Date.now();
  let success = false;
  let client;
  
  try {
    // ... (Decrypt and connect logic using 'pg') ...
    //@ts-ignore
    const result = await client.query(sql);
    success = true;
    
    // --- CHANGE: Log to Prisma (Fire and Forget) ---
    // We don't await this because we don't want to slow down the user's response
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
    // -----------------------------------------------

    return NextResponse.json({ rows: result.rows });

  } catch (error) {
    // Log failed queries too!
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
    
    return NextResponse.json({ error: "Query Failed" }, { status: 400 });
  } 
}