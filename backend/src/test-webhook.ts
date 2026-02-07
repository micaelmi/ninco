import { Webhook } from 'svix';
import axios from 'axios';
import 'dotenv/config';

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
const WEBHOOK_URL = 'http://localhost:3333/webhooks/clerk';

if (!CLERK_WEBHOOK_SECRET) {
  console.error('CLERK_WEBHOOK_SECRET not found in .env');
  process.exit(1);
}

async function testWebhook() {
  const payload = {
    data: {
      id: 'user_test_123',
      email_addresses: [
        {
          id: 'email_123',
          email_address: 'test@example.com',
        },
      ],
      primary_email_address_id: 'email_123',
      first_name: 'Micael',
      last_name: 'User',
      image_url: 'https://example.com/avatar.png',
    },
    type: 'user.created',
  };

  const body = JSON.stringify(payload);
  const wh = new Webhook(CLERK_WEBHOOK_SECRET || "");

  const timestamp = new Date();
  const svix_id = 'msg_123';
  
  // Svix signature is basically hmac of (msg_id + timestamp + body)
  const svix_signature = wh.sign(svix_id, timestamp, body);

  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'svix-id': svix_id,
        'svix-timestamp': Math.floor(timestamp.getTime() / 1000).toString(),
        'svix-signature': svix_signature,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testWebhook();
