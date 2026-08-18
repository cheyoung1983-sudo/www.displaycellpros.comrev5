/**
 * ============================================================================
 * AUTH0 MANAGEMENT API TOKEN MANAGEMENT UTILITY (`src/lib/auth0-mgmt.ts`)
 * ============================================================================
 * Securely retrieves, caches, and automatically refreshes Auth0 Management API
 * (v2) access tokens using the OAuth 2.0 Client Credentials Grant.
 *
 * Prevents race conditions during concurrent requests (thundering herd) and
 * includes a safety margin buffer before token expiration.
 * ============================================================================
 */

export interface Auth0MgmtTokenResponse {
  access_token: string;
  scope?: string;
  expires_in: number; // Duration in seconds
  token_type: string; // "Bearer"
}

export interface GetManagementTokenOptions {
  /** If true, bypasses in-memory cache and requests a fresh token from Auth0 */
  forceRefresh?: boolean;
  /** Safety buffer in seconds before nominal expiry to consider token expired (default: 120s) */
  expiryBufferSeconds?: number;
}

// In-memory cache for the Management API Access Token
let cachedAccessToken: string | null = null;
let tokenExpiryTimeMs = 0;
let pendingTokenPromise: Promise<string> | null = null;

/**
 * Extracts and cleans the Auth0 domain string from environment variables.
 */
function getAuth0Domain(): string {
  let domainRaw =
    process.env.AUTH0_DOMAIN ||
    process.env.AUTH0_ISSUER_BASE_URL;

  if (!domainRaw && process.env.AUTH0_BASE_URL && process.env.AUTH0_BASE_URL.includes('auth0.com')) {
    domainRaw = process.env.AUTH0_BASE_URL;
  }

  if (!domainRaw) {
    domainRaw = 'displaycellpros.us.auth0.com';
  }

  let cleaned = domainRaw.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const parsed = new URL(cleaned);
    return parsed.hostname || 'displaycellpros.us.auth0.com';
  } catch {
    let stripped = cleaned.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0].split('#')[0].trim();
    return stripped || 'displaycellpros.us.auth0.com';
  }
}

/**
 * Checks whether the currently cached Management API token is expired or within safety buffer.
 *
 * @param bufferSeconds Safety buffer in seconds (defaults to 120s)
 */
export function isManagementAccessTokenExpired(bufferSeconds = 120): boolean {
  if (!cachedAccessToken) return true;
  return Date.now() >= tokenExpiryTimeMs - bufferSeconds * 1000;
}

/**
 * Returns remaining valid lifetime of the cached token in seconds.
 */
export function getManagementAccessTokenRemainingLifetime(): number {
  if (!cachedAccessToken) return 0;
  const remainingMs = tokenExpiryTimeMs - Date.now();
  return Math.max(0, Math.floor(remainingMs / 1000));
}

/**
 * Clears the in-memory Management API access token cache.
 */
export function clearManagementAccessTokenCache(): void {
  cachedAccessToken = null;
  tokenExpiryTimeMs = 0;
  pendingTokenPromise = null;
}

/**
 * Securely retrieves or refreshes an Auth0 Management API (v2) access token.
 * Uses Client Credentials flow with environment variables.
 *
 * @param options Configuration options for force refreshing or custom buffer times
 * @returns Valid JWT access token for Auth0 Management API (`https://<domain>/api/v2/`)
 */
export async function getManagementAccessToken(
  options: GetManagementTokenOptions = {}
): Promise<string> {
  const { forceRefresh = false, expiryBufferSeconds = 120 } = options;

  // Return cached token if valid and no force refresh requested
  if (!forceRefresh && cachedAccessToken && !isManagementAccessTokenExpired(expiryBufferSeconds)) {
    return cachedAccessToken;
  }

  // Deduplicate concurrent token requests using pending promise
  if (pendingTokenPromise) {
    return pendingTokenPromise;
  }

  pendingTokenPromise = (async () => {
    try {
      const domain = getAuth0Domain();
      const clientId =
        process.env.AUTH0_MGMT_CLIENT_ID ||
        process.env.AUTH0_CLIENT_ID ||
        'dummy_client_id_for_preview';
      const clientSecret =
        process.env.AUTH0_MGMT_CLIENT_SECRET ||
        process.env.AUTH0_CLIENT_SECRET ||
        'dummy_client_secret_for_preview';

      const tokenEndpoint = `https://${domain}/oauth/token`;
      const audience = `https://${domain}/api/v2/`;

      const payload = {
        client_id: clientId,
        client_secret: clientSecret,
        audience,
        grant_type: 'client_credentials',
      };

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `[Auth0 Mgmt Token] Acquisition failed (HTTP ${response.status}): ${errorBody}`
        );
      }

      const data = (await response.json()) as Auth0MgmtTokenResponse;

      if (!data.access_token) {
        throw new Error('[Auth0 Mgmt Token] Invalid token response: missing access_token');
      }

      cachedAccessToken = data.access_token;
      // Set expiry timestamp ms
      const expiresInMs = (data.expires_in || 86400) * 1000;
      tokenExpiryTimeMs = Date.now() + expiresInMs;

      return cachedAccessToken;
    } catch (err) {
      // Clear cache state on error
      cachedAccessToken = null;
      tokenExpiryTimeMs = 0;
      throw err;
    } finally {
      pendingTokenPromise = null;
    }
  })();

  return pendingTokenPromise;
}

/**
 * Helper to make an authenticated fetch call to the Auth0 Management API v2.
 * Automatically injects Bearer token and retries once on HTTP 401.
 */
export async function auth0MgmtFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const domain = getAuth0Domain();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `https://${domain}/api/v2${cleanPath}`;

  let token = await getManagementAccessToken();

  let response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
  });

  // Handle 401 Unauthorized by force refreshing token and retrying once
  if (response.status === 401) {
    console.warn(`[Auth0 Mgmt Fetch] Received HTTP 401 on ${cleanPath}. Force refreshing token and retrying...`);
    token = await getManagementAccessToken({ forceRefresh: true });
    response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(init.headers ?? {}),
      },
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `[Auth0 Mgmt Fetch] Request to ${cleanPath} failed with HTTP ${response.status}: ${errorText}`
    );
  }

  return (await response.json()) as T;
}
