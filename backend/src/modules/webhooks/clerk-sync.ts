import { FastifyInstance } from 'fastify';
import { Webhook } from 'svix';
import { prisma } from '../../lib/prisma';
import { env } from '../../lib/env';

import fastifyRawBody from 'fastify-raw-body';

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: { id: string; email_address: string }[];
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
}

// Add a type declaration for FastifyRequest to include rawBody
declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: string | Buffer;
  }
}

export async function clerkSync(app: FastifyInstance) {
  // Register raw body plugin specifically for webhooks
  app.register(fastifyRawBody, {
    field: 'rawBody',
    global: false,
    encoding: 'utf8',
    runFirst: true,
  });

  app.post('/clerk', { config: { rawBody: true } }, async (request, reply) => {
    const headers = request.headers;
    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return reply.status(400).send({ error: 'Missing svix headers' });
    }

    // We must pass the raw body verbatim to Svix because JSON.stringify alters whitespace
    const body = request.rawBody as string;

    if (!body) {
      return reply.status(400).send({ error: 'Missing raw body' });
    }

    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

    let evt: ClerkWebhookEvent;

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      request.log.error(err, 'Error verifying webhook');
      return reply.status(400).send({ error: 'Invalid signature' });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    request.log.info(`Webhook received: ${eventType} for user ${id}`);

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { 
        email_addresses, 
        primary_email_address_id, 
        first_name, 
        last_name, 
        image_url 
      } = evt.data;
      
      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
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
          imageUrl: image_url,
          accounts: {
            create: {
              name: 'Main Account',
              balance: 0,
              color: '#3b82f6',
              icon: 'Bank'
            }
          }
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
