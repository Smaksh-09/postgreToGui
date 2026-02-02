import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { prompt, schemaContext } = await req.json();

  const systemMessage = `
    You are a PostgreSQL expert. Convert the user's question into a READ-ONLY SQL query.
    1. schema: ${JSON.stringify(schemaContext)}
    2. Only use SELECT. Never use DELETE, DROP, INSERT, or UPDATE.
    3. Return ONLY the raw SQL string. No markdown formatting.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0,
    });

    const sql = response.choices[0].message.content?.trim();
    return NextResponse.json({ sql });

  } catch (error) {
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 });
  }
}