import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveShopifyConfig, isShopifyConfigured } from './shopify.ts';

const KEYS = [
  'SHOPIFY_STORE_DOMAIN',
  'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
  'DCP_SANDBOX_SHOPIFY_STORE_DOMAIN',
  'DCP_SANDBOX_SHOPIFY_STOREFRONT_ACCESS_TOKEN',
] as const;

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = {};
  for (const key of KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

describe('resolveShopifyConfig', () => {
  it('returns null when nothing is configured, rather than a hardcoded store', () => {
    expect(resolveShopifyConfig()).toBeNull();
    expect(isShopifyConfigured()).toBe(false);
  });

  it('requires both the domain and the token', () => {
    process.env.SHOPIFY_STORE_DOMAIN = 'example.myshopify.com';
    expect(isShopifyConfigured()).toBe(false);

    delete process.env.SHOPIFY_STORE_DOMAIN;
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'token';
    expect(isShopifyConfigured()).toBe(false);
  });

  it('treats blank and whitespace-only values as unset', () => {
    process.env.SHOPIFY_STORE_DOMAIN = '   ';
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = '';
    expect(isShopifyConfigured()).toBe(false);
  });

  it('falls back to the sandbox pair when the canonical vars are absent', () => {
    process.env.DCP_SANDBOX_SHOPIFY_STORE_DOMAIN = 'sandbox.myshopify.com';
    process.env.DCP_SANDBOX_SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'sandbox-token';

    expect(resolveShopifyConfig()).toEqual({
      domain: 'sandbox.myshopify.com',
      storefrontAccessToken: 'sandbox-token',
    });
  });

  // Regression: the sandbox vars were previously checked first, so a machine
  // with both sets configured passed a production credentials check and then
  // sent real customer carts to the sandbox store.
  it('prefers the canonical vars when both pairs are set', () => {
    process.env.SHOPIFY_STORE_DOMAIN = 'live.myshopify.com';
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'live-token';
    process.env.DCP_SANDBOX_SHOPIFY_STORE_DOMAIN = 'sandbox.myshopify.com';
    process.env.DCP_SANDBOX_SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'sandbox-token';

    expect(resolveShopifyConfig()).toEqual({
      domain: 'live.myshopify.com',
      storefrontAccessToken: 'live-token',
    });
  });

  it('normalizes a scheme prefix and trailing slashes out of the domain', () => {
    process.env.SHOPIFY_STORE_DOMAIN = 'https://live.myshopify.com/';
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'live-token';

    expect(resolveShopifyConfig()?.domain).toBe('live.myshopify.com');
  });
});
