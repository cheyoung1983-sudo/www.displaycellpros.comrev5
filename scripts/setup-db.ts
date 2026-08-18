import { query } from '../src/lib/serverDb.ts';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function setup() {
  console.log('--- Database Setup ---');

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      comment TEXT
    )
  `;

  try {
    console.log('Running: CREATE TABLE comments...');
    await query(createTableQuery);
    console.log('✓ Table "comments" is ready.');

    // Verify by listing tables
    const res = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('\nCurrent Tables:');
    console.table(res.rows);

  } catch (error: any) {
    console.error('\n❌ Setup Failed:');
    console.error(error.message);

    if (error.message.includes('PAM authentication failed')) {
      console.log('\nTIP: Remember to GRANT rds_iam TO your database user if using IAM auth.');
    }
  }
}

setup();
