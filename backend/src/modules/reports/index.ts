import { FastifyInstance } from 'fastify';
import { getReportData } from './get-report-data';

export async function reportRoutes(app: FastifyInstance) {
  app.register(getReportData);
}
