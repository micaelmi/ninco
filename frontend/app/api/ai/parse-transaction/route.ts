import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ContextItem {
  id: string;
  name: string;
}

interface ParseContext {
  accounts: ContextItem[];
  categories: (ContextItem & { type: 'INCOME' | 'EXPENSE' })[];
  tags: ContextItem[];
  defaultAccountId?: string;
}

interface RequestBody {
  message: string;
  context: ParseContext;
}

const SYSTEM_PROMPT = `You are a financial transaction parser for the Ninco personal finance app.
Your job is to parse natural language messages into structured transaction data.

Rules:
- Return ONLY a valid JSON object, no markdown, no explanation.
- "type" must be "EXPENSE" (default) or "INCOME" (if it's clearly income like salary, payment received, refund).
- "amount" must be a positive number (no currency symbols).
- "date" must be one of: "today", "yesterday", "2daysago", "3daysago", or an ISO date string (YYYY-MM-DD).
- "description" is the name/label of the transaction.
- "accountId" match by account name from the provided list (case-insensitive). If not specified or ambiguous, use the defaultAccountId.
- "categoryId" match by category name from the provided list (case-insensitive, only match categories that match the transaction type). Use best guess based on description.
- "tagIds" array of matched tag IDs from the provided list. Tags may be prefixed with # in the message.
- "comments" any extra notes.

Return this JSON shape:
{
  "type": "EXPENSE" | "INCOME",
  "amount": number,
  "description": string | null,
  "date": "today" | "yesterday" | "2daysago" | "3daysago" | "YYYY-MM-DD",
  "accountId": string | null,
  "categoryId": string | null,
  "tagIds": string[],
  "comments": string | null
}`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
    }

    const body: RequestBody = await request.json();
    const { message, context } = body;

    if (!message || !context) {
      return NextResponse.json(
        { error: 'Missing required fields: message and context.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const contextStr = `
Available accounts: ${JSON.stringify(context.accounts)}
Default account ID: ${context.defaultAccountId || 'none'}
Available categories: ${JSON.stringify(context.categories)}
Available tags: ${JSON.stringify(context.tags)}
Current date (ISO): ${new Date().toISOString()}
`;

    const prompt = `${SYSTEM_PROMPT}

${contextStr}

User message: "${message}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip any markdown code fences if present
    const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(jsonText);

    return NextResponse.json({
      type: parsed.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
      amount: Number(parsed.amount) || 0,
      description: parsed.description || null,
      date: parsed.date || 'today',
      accountId: parsed.accountId || context.defaultAccountId || null,
      categoryId: parsed.categoryId || null,
      tagIds: Array.isArray(parsed.tagIds) ? parsed.tagIds : [],
      comments: parsed.comments || null,
    });
  } catch (error) {
    console.error('Parse transaction API error:', error);
    return NextResponse.json(
      { error: 'Failed to parse transaction message.' },
      { status: 500 }
    );
  }
}
