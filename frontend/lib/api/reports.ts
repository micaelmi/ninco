import { apiClient } from './client';
import type { ReportData } from './types';

export async function getReportData(filters: { from: string; to: string }): Promise<ReportData> {
  const response = await apiClient.get<ReportData>('/reports/data', {
    params: filters,
  });
  return response.data;
}
