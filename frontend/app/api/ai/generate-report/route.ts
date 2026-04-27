import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ReportData } from '@/lib/api/types';

const REPORT_SYSTEM_PROMPT = `You are a personal finance advisor for the Ninco app.
Given the following structured financial data for a specific time period, generate a JSON response with:

1. "summary": A brief 2-3 sentence summary of the user's financial health for this period.
2. "tips": An array of 3-5 actionable, specific tips to improve their financial situation based on the data provided (e.g. if food expenses are high, suggest meal prepping).
3. "patterns": An array of 2-3 notable patterns, trends, or observations from the data (e.g. "Your income peaked in week 2" or "Entertainment is your highest expense category").

Rules:
- Return ONLY a valid JSON object, no markdown, no explanation.
- Be specific - reference actual categories, amounts, and percentages from the data.
- Tips should be practical and actionable.
- Keep the tone friendly and encouraging.
- If there is very little or no data, acknowledge it and provide general financial tips instead.

Return this JSON shape:
{
  "summary": string,
  "tips": string[],
  "patterns": string[]
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

    const reportData: ReportData = await request.json();

    if (!reportData || !reportData.period) {
      return NextResponse.json(
        { error: 'Missing required report data.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const dataStr = JSON.stringify({
      period: reportData.period,
      totals: reportData.totals,
      weeklyAverages: reportData.weeklyAverages,
      topExpenseCategories: reportData.topCategories.expense,
      topIncomeCategories: reportData.topCategories.income,
      topTags: reportData.topTags,
      transactionCount: reportData.transactionCount,
      weeklyBreakdown: reportData.weeklyBreakdown,
    }, null, 2);

    const prompt = `${REPORT_SYSTEM_PROMPT}\n\nFinancial Data:\n${dataStr}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip any markdown code fences if present
    const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(jsonText);

    return NextResponse.json({
      summary: parsed.summary || 'No summary available.',
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
    });
  } catch (error) {
    console.error('Generate report API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report insights.' },
      { status: 500 }
    );
  }
}
