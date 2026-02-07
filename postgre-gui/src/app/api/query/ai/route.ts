// app/api/query/ai/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth'; // Make sure path points to your auth options

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    // 1. SECURITY CHECK: Ensure user is logged in
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get Data
    const { prompt, schemaContext } = await req.json();

    // 3. Construct System Prompt
    const systemMessage = `
      You are a PostgreSQL expert. Convert the user's question into a READ-ONLY SQL query.
      
      Context:
      - Schema: ${JSON.stringify(schemaContext)}
      - Dialect: PostgreSQL
      
      Rules:
      1. Only use SELECT. Never use DELETE, DROP, INSERT, or UPDATE.
      2. Return ONLY the raw SQL string. No markdown formatting, no code blocks (like \`\`\`sql).
      3. If the user asks for something vague, return a LIMIT 10 query.
    `;

    // 4. Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0,
    });

    const sql = response.choices[0].message.content?.trim();
    
    // Clean up if AI still added markdown
    const cleanSql = sql?.replace(/```sql|```/g, "").trim();

    return NextResponse.json({ sql: cleanSql });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 });
  }
}