import { FastifyInstance } from 'fastify';
import { Webhook } from 'svix';
import { prisma } from '../../lib/prisma';
import { env } from '../../lib/env';

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

export async function clerkSync(app: FastifyInstance) {
  // Tells Fastify not to parse JSON automatically for this specific plugin scope
  // By parsing as 'buffer', request.body will be the exact raw byte stream
  app.removeAllContentTypeParsers();
  app.addContentTypeParser('application/json', { parseAs: 'buffer' }, function (req, body, done) {
    done(null, body);
  });

  app.post('/clerk', async (request, reply) => {
    console.log('[Webhook] Incoming request received');

    const headers = request.headers;
    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    console.log('[Webhook] Headers:', { svix_id, svix_timestamp, svix_signature: svix_signature?.substring(0, 20) + '...' });

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.log('[Webhook] Missing svix headers!');
      return reply.status(400).send({ error: 'Missing svix headers' });
    }

    // Convert raw buffer back to string to preserve EXACT formatting/spaces from payload
    const bodyBuffer = request.body as Buffer;
    
    if (!bodyBuffer) {
      return reply.status(400).send({ error: 'Missing raw body. Ensure request is sent with a body.' });
    }

    const bodyText = bodyBuffer.toString('utf8');
    
    const secret = env.CLERK_WEBHOOK_SECRET;
    console.log('[Webhook] Secret prefix:', secret.substring(0, 12) + '...');
    console.log('[Webhook] Secret length:', secret.length);
    console.log('[Webhook] Body length:', bodyText.length);
    console.log('[Webhook] Body preview:', bodyText.substring(0, 80) + '...');
    
    const wh = new Webhook(secret);

    let evt: ClerkWebhookEvent;

    try {
      evt = wh.verify(bodyText, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error('[Webhook] VERIFICATION FAILED:', (err as Error).message);
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
