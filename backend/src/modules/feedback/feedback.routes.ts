import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendFeedbackHandler } from './feedback.controller';
import { feedbackSchema } from './feedback.schema';

export async function feedbackRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        body: feedbackSchema,
        tags: ['Feedback'],
        summary: 'Submit user feedback',
        security: [{ bearerAuth: [] }],
      },
    },
    sendFeedbackHandler
  );
}
