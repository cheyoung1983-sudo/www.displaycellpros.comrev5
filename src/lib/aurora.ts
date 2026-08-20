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

  const hostname = process.env.PGHOST || "dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com";
  const port = Number(process.env.PGPORT || 5432);
  const username = process.env.PGUSER || "postgres";
  const region = process.env.AWS_REGION || "us-east-1";
  const roleArn = process.env.AWS_ROLE_ARN || "arn:aws:iam::595710543826:role/Vercel/access-dcp-production-db";

  const signer = new Signer({
    hostname,
    port,
    username,
    region,
    credentials: awsCredentialsProvider({
      roleArn,
      clientConfig: { region },
    }),
  });

  poolInstance = new Pool({
    host: hostname,
    user: username,
    database: process.env.PGDATABASE || "postgres",
    password: () => signer.getAuthToken(),
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
