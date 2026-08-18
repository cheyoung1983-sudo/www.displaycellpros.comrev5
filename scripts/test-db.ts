/**
 * FORENSIC POOL — Aurora IAM Connectivity Verification Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs a direct SELECT NOW() against the configured Aurora cluster using the
 * same IAM token auth path as the production server pool.
 *
 * Usage (from project root):
 *   npx tsx scripts/test-db.ts
 *
 * Prerequisites:
 *   - .env.local must have SQL_HOST, SQL_USER, SQL_DB_NAME, AWS_REGION filled in
 *   - AWS credentials available (VERCEL_OIDC_TOKEN or local AWS_PROFILE)
 *   - IAM authentication must be enabled on the Aurora cluster
 *   - The SQL_USER must have GRANT rds_iam in the DB
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as dotenv from "dotenv";
import * as dotenvLocal from "dotenv";

// Load .env then .env.local (local overrides win)
dotenv.config();
dotenvLocal.config({ path: ".env.local", override: true });

import { getDbPool } from "../src/lib/serverDb.ts";

const REQUIRED_VARS = ["SQL_HOST", "SQL_USER", "SQL_DB_NAME", "AWS_REGION"] as const;

function preflight(): void {
  const missing = REQUIRED_VARS.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("\n[FORENSIC PREFLIGHT FAULT] Missing environment variables:");
    missing.forEach((k) => console.error(`  ✗ ${k}`));
    console.error(
      "\nFill these in your .env.local file, then re-run.\n"
    );
    process.exit(1);
  }
  console.log("[FORENSIC PREFLIGHT] All required env vars present ✓");
}

async function runConnectivityProbe(): Promise<void> {
  preflight();

  const authMode = process.env.AWS_REGION ? "IAM_TOKEN (RDS Signer)" : "PASSWORD";
  console.log(`\n[FORENSIC POOL] Auth mode  : ${authMode}`);
  console.log(`[FORENSIC POOL] Target host: ${process.env.SQL_HOST}`);
  console.log(`[FORENSIC POOL] Database   : ${process.env.SQL_DB_NAME}`);
  console.log(`[FORENSIC POOL] Region     : ${process.env.AWS_REGION ?? "N/A"}`);
  console.log(`[FORENSIC POOL] DB User    : ${process.env.SQL_USER}`);
  console.log("\nConnecting…\n");

  const pool = getDbPool();

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() AS aurora_time, version() AS pg_version");
    client.release();

    const row = result.rows[0];
    console.log("╔══════════════════════════════════════════════════════╗");
    console.log("║        FORENSIC POOL — CONNECTION NOMINAL            ║");
    console.log("╠══════════════════════════════════════════════════════╣");
    console.log(`║  Aurora Time : ${String(row.aurora_time).padEnd(38)}║`);
    console.log(`║  PG Version  : ${String(row.pg_version).slice(0, 38).padEnd(38)}║`);
    console.log("╚══════════════════════════════════════════════════════╝\n");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("\n[FORENSIC POOL FAULT] Connection failed:");
    console.error(`  ${message}\n`);

    // ── Common failure hints ────────────────────────────────────────────────
    if (message.includes("SSL")) {
      console.error("HINT: Aurora requires SSL. Ensure your pg Pool has ssl: { rejectUnauthorized: true }");
    }
    if (message.includes("password authentication failed") || message.includes("PAM")) {
      console.error("HINT: IAM auth token invalid or expired. Check that:");
      console.error("  1. IAM DB authentication is ENABLED on the Aurora cluster.");
      console.error("  2. SQL_USER has GRANT rds_iam in Aurora.");
      console.error("  3. Your IAM policy includes the rds-db:connect action.");
    }
    if (message.includes("could not connect") || message.includes("ECONNREFUSED")) {
      console.error("HINT: Cannot reach Aurora endpoint. Check:");
      console.error("  1. SQL_HOST is the correct cluster writer endpoint.");
      console.error("  2. Security group inbound rule allows TCP/5432 from your IP.");
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runConnectivityProbe();
