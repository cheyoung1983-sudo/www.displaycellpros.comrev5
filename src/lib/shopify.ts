/**
 * Shopify Storefront API client.
 *
 * SERVER-SIDE ONLY. Credentials come from the process environment, which Next
 * exposes to server code (Route Handlers, Server Components, Server Actions)
 * but not to the browser — only `NEXT_PUBLIC_*` crosses that boundary. A Client
 * Component importing this gets undefined credentials, which surfaces as the
 * configuration error from `resolveShopifyConfig()` rather than a silent
 * fallback to some other store.
 *
 * `isShopifyConfigured()` is the single source of truth for "can we talk to
 * Shopify". Callers deciding between a real checkout and a placeholder must use
 * it rather than testing environment variables themselves — when the two drift,
 * the gate and the client disagree about which store is in play.
 */

export const SHOPIFY_API_VERSION = '2025-01';

export type ShopifyConfig = {
  domain: string;
  storefrontAccessToken: string;
};

function readEnv(name: string): string | undefined {
  if (typeof process === 'undefined' || !process.env) return undefined;
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

/**
 * Credential precedence: the canonical `SHOPIFY_*` vars win, and the
 * `DCP_SANDBOX_SHOPIFY_*` pair is a fallback for local sandbox work.
 *
 * The sandbox vars used to be checked *first*, which meant a machine with both
 * sets configured would pass a production-looking credentials check and then
 * send real customer carts to the sandbox store.
 */
export function resolveShopifyConfig(): ShopifyConfig | null {
  const domain =
    readEnv('SHOPIFY_STORE_DOMAIN') ?? readEnv('DCP_SANDBOX_SHOPIFY_STORE_DOMAIN');
  const storefrontAccessToken =
    readEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN') ??
    readEnv('DCP_SANDBOX_SHOPIFY_STOREFRONT_ACCESS_TOKEN');

  if (!domain || !storefrontAccessToken) return null;

  return {
    domain: domain.replace(/^https?:\/\//, '').replace(/\/+$/, ''),
    storefrontAccessToken,
  };
}

/** Whether a real Storefront API call can be made. */
export function isShopifyConfigured(): boolean {
  return resolveShopifyConfig() !== null;
}

function requireShopifyConfig(): ShopifyConfig {
  const config = resolveShopifyConfig();
  if (!config) {
    throw new Error(
      'Shopify Storefront API is not configured — set SHOPIFY_STORE_DOMAIN and ' +
        'SHOPIFY_STOREFRONT_ACCESS_TOKEN (see .env.example). This module is ' +
        'server-side only; credentials are not available in Client Components.'
    );
  }
  return config;
}

type ShopifyResponse<T> = {
  data: T;
  errors?: { message: string }[];
};

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const { domain, storefrontAccessToken } = requireShopifyConfig();
  const endpoint = `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  } as RequestInit);

  if (!response.ok) {
    // A 401/404 body is not GraphQL JSON, so parsing it first would fail with
    // an opaque error instead of the actual status.
    throw new Error(
      `Shopify Storefront API responded ${response.status} ${response.statusText}`
    );
  }

  const json: ShopifyResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join('\n'));
  }

  return json.data;
}
