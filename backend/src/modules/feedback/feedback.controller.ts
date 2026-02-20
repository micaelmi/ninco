import { FastifyReply, FastifyRequest } from 'fastify';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { env } from '../../lib/env';
import { sendEmail } from '../../lib/mailer';
import { FeedbackInput } from './feedback.schema';

export async function sendFeedbackHandler(
  request: FastifyRequest<{ Body: FeedbackInput }>,
  reply: FastifyReply
) {
  const { subject, message } = request.body;
  const userId = request.userId;

  try {
    const user = await clerkClient.users.getUser(userId);
    const userEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress;
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';

    if (!userEmail) {
      return reply.status(400).send({ message: 'User email not found' });
    }

    const emailContent = `
      <h1>New Feedback Received</h1>
      <p><strong>From:</strong> ${userName} (${userEmail})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <h2>Message:</h2>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    await sendEmail(env.FEEDBACK_EMAIL_TO, `Feedback: ${subject}`, emailContent, userEmail);

    return reply.status(200).send({ message: 'Feedback sent successfully' });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Failed to send feedback' });
  }
}
