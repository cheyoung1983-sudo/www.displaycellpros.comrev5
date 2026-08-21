function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const auth0Config = {
  domain: requireEnv('AUTH0_DOMAIN'),
  clientId: requireEnv('AUTH0_CLIENT_ID'),
};

