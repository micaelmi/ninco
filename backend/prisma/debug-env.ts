import 'dotenv/config';
import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';

async function main() {
  console.log('--- Environment Debug ---');
  console.log('CWD:', process.cwd());
  console.log('DATABASE_URL in env:', process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND');
  
  const envPath = path.resolve(process.cwd(), '.env');
  console.log('Checking .env at:', envPath);
  console.log('.env exists:', fs.existsSync(envPath));
  
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('.env first 20 chars:', content.substring(0, 20));
  }
  
  console.log('--- End Debug ---');
}

main().catch(console.error);
