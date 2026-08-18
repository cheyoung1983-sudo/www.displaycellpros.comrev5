/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vercel Aurora PostgreSQL Database Connection & RDS Signer Module
 */

import { Signer } from "@aws-sdk/rds-signer";
import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { attachDatabasePool } from "@vercel/functions";
import { Pool, ClientBase } from "pg";

let poolInstance: Pool | null = null;

export function getAuroraPool(): Pool {
  if (poolInstance) {
    return poolInstance;
  }

  const hostname = process.env.PGHOST;
  const port = Number(process.env.PGPORT || 5432);
  const username = process.env.PGUSER;
  const region = process.env.AWS_REGION;
  const roleArn = process.env.AWS_ROLE_ARN;
  const database = process.env.PGDATABASE;
  const password = process.env.PGPASSWORD;

  if (!hostname || !username || !database) {
    throw new Error("Aurora PostgreSQL requires host, user, and database configuration");
  }
  if ((!region || !roleArn) && !password) {
    throw new Error("Aurora PostgreSQL requires AWS IAM configuration or explicit PGPASSWORD for local development");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid Aurora PostgreSQL port: ${port}`);
  }

  const signer = region && roleArn
    ? new Signer({
        hostname,
        port,
        username,
        region,
        credentials: awsCredentialsProvider({
          roleArn,
          clientConfig: { region },
        }),
      })
    : null;

  poolInstance = new Pool({
    host: hostname,
    user: username,
    database,
    password: signer ? () => signer.getAuthToken() : password,
    port,
    ssl: { rejectUnauthorized: false },
    max: 20,
  });

  try {
    attachDatabasePool(poolInstance);
  } catch (e) {
    console.warn("[Aurora DB] Vercel attachDatabasePool skipped in non-Vercel environment:", e);
  }

  return poolInstance;
}

export async function query(sql: string, args: unknown[] = []) {
  const pool = getAuroraPool();
  return pool.query(sql, args);
}

export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>
): Promise<T> {
  const pool = getAuroraPool();
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
