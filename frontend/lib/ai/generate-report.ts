import type { ReportData, ReportInsights } from '@/lib/api/types';

export async function generateReportInsights(reportData: ReportData): Promise<ReportInsights> {
  const response = await fetch('/api/ai/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate report insights.');
  }

  const parsed = await response.json();

  return {
    summary: parsed.summary || 'No summary available.',
    tips: Array.isArray(parsed.tips) ? parsed.tips : [],
    patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
  };
}
