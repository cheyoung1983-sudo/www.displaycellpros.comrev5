import { queryWithToken as query } from '../src/lib/serverDb.ts';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testConnection() {
  console.log('--- RDS Connection Test (Singleton) ---');

  try {
    console.log('\nExecuting query via singleton pool...');
    const res = await query('SELECT version(), current_database(), current_user');
    console.log('✓ Connected successfully!');

    console.log('\nDatabase Info:');
    console.table(res.rows[0]);

  } catch (error: any) {
    console.error('\n❌ Connection Failed:');
    console.error(error.message);

    if (error.message.includes('PAM authentication failed')) {
      console.log('\nTIP: "PAM authentication failed" usually means the RDS user is not set up for IAM auth.');
      console.log('To fix this, connect to your database with a regular password and run:');
      console.log(`   GRANT rds_iam TO ${process.env.PGUSER || 'postgres'};`);
    }
  }
}

testConnection();
