import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client();

export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || 'dev-wqlbqf0zkr5j45di.us.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID || 'EqlG32Qor7XQbfbIdtITGeXp2vNattIF',
};
