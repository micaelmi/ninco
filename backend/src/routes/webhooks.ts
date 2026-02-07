import { FastifyInstance } from 'fastify';
import { Webhook } from 'svix';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/clerk', async (request, reply) => {
    const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!CLERK_WEBHOOK_SECRET) {
      return reply.status(500).send({ error: 'Webhook secret not configured' });
    }

    const headers = request.headers;
    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return reply.status(400).send({ error: 'Missing svix headers' });
    }

    const payload = request.body;
    const body = JSON.stringify(payload);

    const wh = new Webhook(CLERK_WEBHOOK_SECRET);

    let evt: any;

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return reply.status(400).send({ error: 'Invalid signature' });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook received: ${eventType} for user ${id}`);

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { 
        email_addresses, 
        primary_email_address_id, 
        first_name, 
        last_name, 
        image_url 
      } = evt.data;
      
      const primaryEmail = email_addresses.find(
        (email: any) => email.id === primary_email_address_id
      )?.email_address;

      if (!primaryEmail) {
        return reply.status(400).send({ error: 'No primary email found' });
      }

      const fullName = first_name && last_name ? `${first_name} ${last_name}` : (first_name || last_name || null);

      await prisma.user.upsert({
        where: { id },
        update: { 
          email: primaryEmail,
          name: fullName,
          imageUrl: image_url
        },
        create: { 
          id, 
          email: primaryEmail,
          name: fullName,
          imageUrl: image_url
        },
      });
    }

    if (eventType === 'user.deleted') {
      await prisma.user.delete({
        where: { id },
      });
    }

    return reply.status(200).send({ success: true });
  });
}
