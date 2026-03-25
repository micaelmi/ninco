import { FastifyInstance } from 'fastify';
import { Webhook } from 'svix';
import { prisma } from '../../lib/prisma';
import { env } from '../../lib/env';

const AI_LIMITS = { normal: 10, premium: 100 } as const;

interface ClerkUserEventData {
  id: string;
  email_addresses: { id: string; email_address: string }[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  public_metadata?: { role?: string };
}

interface ClerkSubscriptionEventData {
  id: string;
  user_id: string;
  plan: {
    id: string;
    name: string;
    slug: string;
  };
  status: string;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserEventData | ClerkSubscriptionEventData;
}

export async function clerkSync(app: FastifyInstance) {
  // Tells Fastify not to parse JSON automatically for this specific plugin scope
  // By parsing as 'buffer', request.body will be the exact raw byte stream
  app.removeAllContentTypeParsers();
  app.addContentTypeParser('application/json', { parseAs: 'buffer' }, function (req, body, done) {
    done(null, body);
  });

  app.post('/clerk', async (request, reply) => {
    const headers = request.headers;
    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return reply.status(400).send({ error: 'Missing svix headers' });
    }

    // Convert raw buffer back to string to preserve EXACT formatting from payload
    const bodyBuffer = request.body as Buffer;
    
    if (!bodyBuffer) {
      return reply.status(400).send({ error: 'Missing raw body' });
    }

    const bodyText = bodyBuffer.toString('utf8');
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

    let evt: ClerkWebhookEvent;

    try {
      evt = wh.verify(bodyText, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error('[Webhook] Verification failed:', (err as Error).message);
      return reply.status(400).send({ error: 'Invalid signature' });
    }

    const eventType = evt.type;
    request.log.info(`Webhook received: ${eventType}`);

    // ── User events ──────────────────────────────────────────────────
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const data = evt.data as ClerkUserEventData;
      const { id, public_metadata } = data;

      const { 
        email_addresses, 
        primary_email_address_id, 
        first_name, 
        last_name, 
        image_url 
      } = data;
      
      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      )?.email_address;

      if (!primaryEmail) {
        return reply.status(400).send({ error: 'No primary email found' });
      }

      const fullName = first_name && last_name ? `${first_name} ${last_name}` : (first_name || last_name || null);

      const isMetadataPremium = public_metadata?.role === 'premium';

      const targetTypeStr = isMetadataPremium ? 'premium' : 'normal';
      const targetType = await prisma.userType.findUnique({
        where: { type: targetTypeStr },
      });

      const normalType = await prisma.userType.findUnique({
        where: { type: 'normal' },
      });

      const initialLimit = isMetadataPremium ? AI_LIMITS.premium : AI_LIMITS.normal;

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
          userTypeId: targetType?.id ?? normalType?.id,
          preferredCurrencyCode: 'USD',
          accounts: {
            create: {
              name: 'Main Account',
              balance: 0,
              color: '#3b82f6',
              icon: 'Bank',
              currencyCode: 'USD'
            }
          },
          aiCredit: {
            create: {
              remaining: initialLimit,
              limit: initialLimit,
              periodStart: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)),
            }
          }
        },
      });

      // If this was an update, and they have premium metadata, we should ensure they are upgraded.
      if (eventType === 'user.updated' && isMetadataPremium) {
        const currentUser = await prisma.user.findUnique({ 
          where: { id },
          include: { userType: true, aiCredit: true }
        });
        
        if (currentUser && currentUser.userType?.type !== 'premium') {
          if (targetType) {
            await prisma.user.update({
              where: { id },
              data: { userTypeId: targetType.id },
            });
            
            const credit = currentUser.aiCredit;
            if (credit) {
              const newRemaining = credit.remaining + (AI_LIMITS.premium - credit.limit);
              await prisma.aiCredit.update({
                 where: { userId: id },
                 data: { limit: AI_LIMITS.premium, remaining: Math.max(newRemaining, 0) }
              });
            }
          }
        }
      }
    }

    if (eventType === 'user.deleted') {
      const data = evt.data as ClerkUserEventData;
      await prisma.user.delete({
        where: { id: data.id },
      });
    }

    // ── Subscription events ──────────────────────────────────────────
    if (
      eventType === 'subscription.created' ||
      eventType === 'subscription.updated'
    ) {
      try {
        const data = evt.data as any;
        require('fs').appendFileSync('C:\\tmp\\clerk_webhook.log', JSON.stringify({ type: eventType, data }) + '\n');
        
        // Find user_id inside payer object
        const userId = data.payer?.user_id || data.user_id || data.id;

        // Clerk's subscription object stores plans inside `items` array
        const items = data.items || [];
        const isPremium = items.some((item: any) => 
          item.plan?.slug?.toLowerCase().includes('premium') && 
          (item.status === 'active' || item.status === 'trialing' || item.status === 'past_due')
        );

        const targetType = isPremium ? 'premium' : 'normal';
        const targetLimit = isPremium ? AI_LIMITS.premium : AI_LIMITS.normal;

        const userTypeRecord = await prisma.userType.findUnique({
          where: { type: targetType },
        });

        if (userTypeRecord && userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { userTypeId: userTypeRecord.id },
          });
        }

        // Sync AI credit limit
        if (userId) {
          const credit = await prisma.aiCredit.findUnique({ where: { userId } });
          if (credit) {
            const newRemaining = isPremium
              ? credit.remaining + (targetLimit - credit.limit) // upgrade: top up
              : Math.min(credit.remaining, targetLimit);         // downgrade: cap

            await prisma.aiCredit.update({
              where: { userId },
              data: { limit: targetLimit, remaining: Math.max(newRemaining, 0) },
            });
          }
        }

        request.log.info(`Subscription ${eventType}: user ${userId} → ${targetType} (limit: ${targetLimit})`);
      } catch (err: any) {
        require('fs').appendFileSync('C:\\tmp\\clerk_webhook.log', 'ERROR: ' + err.stack + '\n');
        throw err;
      }
    }

    if (eventType === 'subscription.canceled') {
      const data = evt.data as ClerkSubscriptionEventData | any;
      const userId = data.payer?.user_id || data.user_id || data.id;

      const normalType = await prisma.userType.findUnique({
        where: { type: 'normal' },
      });

      if (normalType) {
        await prisma.user.update({
          where: { id: userId },
          data: { userTypeId: normalType.id },
        });
      }

      // Reset AI credits to normal limits
      const credit = await prisma.aiCredit.findUnique({ where: { userId } });
      if (credit) {
        await prisma.aiCredit.update({
          where: { userId },
          data: {
            limit: AI_LIMITS.normal,
            remaining: Math.min(credit.remaining, AI_LIMITS.normal),
          },
        });
      }

      request.log.info(`Subscription canceled: user ${userId} → normal`);
    }

    return reply.status(200).send({ success: true });
  });
}
