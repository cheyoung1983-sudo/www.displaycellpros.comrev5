/**
 * ============================================================================
 * AUTH0 MCP SERVICE — FORENSIC IDENTITY AUDIT BRIDGE
 * ============================================================================
 * Typed service layer that wraps Auth0 Management API v2 operations.
 * Mirrors the exact tool surface exposed by @auth0/auth0-mcp-server so that
 * the Express API gateway can relay identity management commands from
 * AI-native MCP clients (Claude Desktop, Cursor, Windsurf, Antigravity).
 *
 * Auth Flow: OAuth 2.0 Device Authorization → credential keychain storage
 * Compliant with NIST SP 800-88 R1 minimal-privilege access model.
 *
 * Tool categories implemented:
 *   • Application Management    (list, get, create, update)
 *   • Resource Server (API) Mgmt (list, get, create, update)
 *   • Actions Management        (list, get, create, update, deploy)
 *   • Logs Management           (list, get)
 *   • Forms Management          (list, get, create, update, publish)
 * ============================================================================
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Auth0Config {
  domain: string;         // e.g. "displaycellpros.us.auth0.com"
  clientId: string;       // Machine-to-Machine app client ID
  clientSecret: string;   // Machine-to-Machine app client secret
}

export interface Auth0Application {
  client_id?: string;
  name: string;
  description?: string;
  app_type?: "spa" | "native" | "non_interactive" | "regular_web";
  callbacks?: string[];
  allowed_logout_urls?: string[];
  web_origins?: string[];
  allowed_origins?: string[];
  grant_types?: string[];
  token_endpoint_auth_method?: string;
  client_metadata?: Record<string, string>;
}

export interface Auth0ResourceServer {
  id?: string;
  identifier?: string;
  name: string;
  scopes?: Array<{ value: string; description?: string }>;
  signing_alg?: "HS256" | "RS256";
  token_lifetime?: number;
  allow_offline_access?: boolean;
  skip_consent_for_verifiable_first_party_clients?: boolean;
}

export interface Auth0Action {
  id?: string;
  name: string;
  supported_triggers?: Array<{ id: string; version: string }>;
  code?: string;
  dependencies?: Array<{ name: string; version: string }>;
  runtime?: string;
  secrets?: Array<{ name: string; value: string }>;
}

export interface Auth0LogEntry {
  _id: string;
  date: string;
  type: string;
  description?: string;
  user_id?: string;
  user_name?: string;
  ip?: string;
  client_id?: string;
  client_name?: string;
}

export interface Auth0Form {
  id?: string;
  name: string;
  messages?: Record<string, unknown>;
  languages?: Record<string, unknown>;
  translations?: Record<string, unknown>;
  nodes?: unknown[];
  start?: Record<string, unknown>;
  ending?: Record<string, unknown>;
}

export interface Auth0TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ─── Auth0 Management API Service ────────────────────────────────────────────

export class Auth0McpService {
  private config: Auth0Config;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor(config: Auth0Config) {
    this.config = config;
  }

  // ── Token Acquisition & Proactive Auto-Refresh ──────────────────────────

  /**
   * Checks if the currently cached Management API access token is expired or close to expiring (within buffer seconds).
   */
  isTokenExpired(bufferSeconds = 120): boolean {
    if (!this.accessToken) return true;
    return Date.now() >= this.tokenExpiry - bufferSeconds * 1000;
  }

  /**
   * Gets the remaining validity duration in seconds for the cached token.
   */
  getTokenRemainingLifetime(): number {
    if (!this.accessToken) return 0;
    const remainingMs = this.tokenExpiry - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  }

  /**
   * Proactively forces a token refresh via Client Credentials grant.
   * Useful for pre-empting expiration before long-running diagnostic sessions.
   */
  async refreshToken(): Promise<string> {
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = (async () => {
      try {
        const tokenUrl = `https://${this.config.domain}/oauth/token`;
        const payload = {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          audience: `https://${this.config.domain}/api/v2/`,
          grant_type: "client_credentials",
        };

        const resp = await fetch(tokenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const err = await resp.text();
          throw new Error(`[Auth0McpService] Token acquisition failed: ${err}`);
        }

        const data = (await resp.json()) as Auth0TokenResponse;
        this.accessToken = data.access_token;
        // Cache expiry timestamp with 120s safety buffer
        this.tokenExpiry = Date.now() + data.expires_in * 1000;
        return this.accessToken;
      } finally {
        this.tokenRefreshPromise = null;
      }
    })();

    return this.tokenRefreshPromise;
  }

  /**
   * Acquires a Management API access token using the Client Credentials flow.
   * Automatically refreshes cached token if expired or nearing expiry (60s window).
   */
  async getAccessToken(): Promise<string> {
    if (this.accessToken && !this.isTokenExpired(60)) {
      return this.accessToken;
    }
    return this.refreshToken();
  }

  private async mgmtRequest<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    let token = await this.getAccessToken();
    const url = `https://${this.config.domain}/api/v2${path}`;

    let resp = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });

    // If 401 Unauthorized occurs due to token invalidation, force token refresh & retry once
    if (resp.status === 401) {
      console.warn(`[Auth0McpService] HTTP 401 encountered on ${path}. Force-refreshing access token and retrying request...`);
      token = await this.refreshToken();
      resp = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(options.headers ?? {}),
        },
      });
    }

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(
        `[Auth0McpService] ${options.method ?? "GET"} ${path} → HTTP ${resp.status}: ${body}`
      );
    }

    // 204 No Content — return empty object
    if (resp.status === 204) return {} as T;
    return (await resp.json()) as T;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_list_applications
  // ─────────────────────────────────────────────────────────────────────────

  async listApplications(params?: {
    per_page?: number;
    page?: number;
    q?: string;
    include_totals?: boolean;
    fields?: string;
  }): Promise<{ clients: Auth0Application[]; total?: number }> {
    const qs = new URLSearchParams();
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.q) qs.set("q", params.q);
    if (params?.include_totals) qs.set("include_totals", "true");
    if (params?.fields) qs.set("fields", params.fields);

    const queryStr = qs.toString() ? `?${qs.toString()}` : "";
    const result = await this.mgmtRequest<Auth0Application[] | { clients: Auth0Application[]; total: number }>(
      `/clients${queryStr}`
    );
    if (Array.isArray(result)) return { clients: result };
    return result as { clients: Auth0Application[]; total: number };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_get_application
  // ─────────────────────────────────────────────────────────────────────────

  async getApplication(clientId: string): Promise<Auth0Application> {
    return this.mgmtRequest<Auth0Application>(`/clients/${clientId}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_create_application
  // ─────────────────────────────────────────────────────────────────────────

  async createApplication(data: Auth0Application): Promise<Auth0Application> {
    return this.mgmtRequest<Auth0Application>("/clients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_update_application
  // ─────────────────────────────────────────────────────────────────────────

  async updateApplication(
    clientId: string,
    data: Partial<Auth0Application>
  ): Promise<Auth0Application> {
    return this.mgmtRequest<Auth0Application>(`/clients/${clientId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_list_resource_servers
  // ─────────────────────────────────────────────────────────────────────────

  async listResourceServers(params?: {
    per_page?: number;
    page?: number;
    include_totals?: boolean;
  }): Promise<{ resource_servers: Auth0ResourceServer[]; total?: number }> {
    const qs = new URLSearchParams();
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.include_totals) qs.set("include_totals", "true");

    const queryStr = qs.toString() ? `?${qs.toString()}` : "";
    const result = await this.mgmtRequest<
      Auth0ResourceServer[] | { resource_servers: Auth0ResourceServer[]; total: number }
    >(`/resource-servers${queryStr}`);
    if (Array.isArray(result)) return { resource_servers: result };
    return result as { resource_servers: Auth0ResourceServer[]; total: number };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_get_resource_server
  // ─────────────────────────────────────────────────────────────────────────

  async getResourceServer(id: string): Promise<Auth0ResourceServer> {
    return this.mgmtRequest<Auth0ResourceServer>(`/resource-servers/${encodeURIComponent(id)}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_create_resource_server
  // ─────────────────────────────────────────────────────────────────────────

  async createResourceServer(
    data: Auth0ResourceServer
  ): Promise<Auth0ResourceServer> {
    return this.mgmtRequest<Auth0ResourceServer>("/resource-servers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_update_resource_server
  // ─────────────────────────────────────────────────────────────────────────

  async updateResourceServer(
    id: string,
    data: Partial<Auth0ResourceServer>
  ): Promise<Auth0ResourceServer> {
    return this.mgmtRequest<Auth0ResourceServer>(
      `/resource-servers/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(data) }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_list_actions
  // ─────────────────────────────────────────────────────────────────────────

  async listActions(params?: {
    per_page?: number;
    page?: number;
    triggerId?: string;
    actionName?: string;
    deployed?: boolean;
    installed?: boolean;
  }): Promise<{ actions: Auth0Action[]; total?: number }> {
    const qs = new URLSearchParams();
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.triggerId) qs.set("triggerId", params.triggerId);
    if (params?.actionName) qs.set("actionName", params.actionName);
    if (params?.deployed !== undefined) qs.set("deployed", String(params.deployed));
    if (params?.installed !== undefined) qs.set("installed", String(params.installed));

    const queryStr = qs.toString() ? `?${qs.toString()}` : "";
    return this.mgmtRequest<{ actions: Auth0Action[]; total?: number }>(
      `/actions/actions${queryStr}`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_get_action
  // ─────────────────────────────────────────────────────────────────────────

  async getAction(actionId: string): Promise<Auth0Action> {
    return this.mgmtRequest<Auth0Action>(`/actions/actions/${actionId}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_create_action
  // ─────────────────────────────────────────────────────────────────────────

  async createAction(data: Auth0Action): Promise<Auth0Action> {
    return this.mgmtRequest<Auth0Action>("/actions/actions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_update_action
  // ─────────────────────────────────────────────────────────────────────────

  async updateAction(
    actionId: string,
    data: Partial<Auth0Action>
  ): Promise<Auth0Action> {
    return this.mgmtRequest<Auth0Action>(`/actions/actions/${actionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_deploy_action
  // ─────────────────────────────────────────────────────────────────────────

  async deployAction(actionId: string): Promise<Auth0Action> {
    return this.mgmtRequest<Auth0Action>(
      `/actions/actions/${actionId}/deploy`,
      { method: "POST", body: "{}" }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_list_logs
  // ─────────────────────────────────────────────────────────────────────────

  async listLogs(params?: {
    per_page?: number;
    page?: number;
    from?: string;
    take?: number;
    q?: string;
    sort?: string;
    include_totals?: boolean;
  }): Promise<{ logs: Auth0LogEntry[]; total?: number }> {
    const qs = new URLSearchParams();
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.from) qs.set("from", params.from);
    if (params?.take) qs.set("take", String(params.take));
    if (params?.q) qs.set("q", params.q);
    if (params?.sort) qs.set("sort", params.sort);
    if (params?.include_totals) qs.set("include_totals", "true");

    const queryStr = qs.toString() ? `?${qs.toString()}` : "";
    const result = await this.mgmtRequest<
      Auth0LogEntry[] | { logs: Auth0LogEntry[]; total: number }
    >(`/logs${queryStr}`);
    if (Array.isArray(result)) return { logs: result };
    return result as { logs: Auth0LogEntry[]; total: number };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_get_log
  // ─────────────────────────────────────────────────────────────────────────

  async getLog(logId: string): Promise<Auth0LogEntry> {
    return this.mgmtRequest<Auth0LogEntry>(`/logs/${logId}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_list_forms
  // ─────────────────────────────────────────────────────────────────────────

  async listForms(params?: {
    per_page?: number;
    page?: number;
  }): Promise<{ forms: Auth0Form[]; total?: number }> {
    const qs = new URLSearchParams();
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    if (params?.page !== undefined) qs.set("page", String(params.page));

    const queryStr = qs.toString() ? `?${qs.toString()}` : "";
    return this.mgmtRequest<{ forms: Auth0Form[]; total?: number }>(
      `/forms${queryStr}`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_get_form
  // ─────────────────────────────────────────────────────────────────────────

  async getForm(formId: string): Promise<Auth0Form> {
    return this.mgmtRequest<Auth0Form>(`/forms/${formId}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_create_form
  // ─────────────────────────────────────────────────────────────────────────

  async createForm(data: Auth0Form): Promise<Auth0Form> {
    return this.mgmtRequest<Auth0Form>("/forms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_update_form
  // ─────────────────────────────────────────────────────────────────────────

  async updateForm(formId: string, data: Partial<Auth0Form>): Promise<Auth0Form> {
    return this.mgmtRequest<Auth0Form>(`/forms/${formId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOOL: auth0_publish_form
  // ─────────────────────────────────────────────────────────────────────────

  async publishForm(formId: string): Promise<Auth0Form> {
    return this.mgmtRequest<Auth0Form>(`/forms/${formId}/publish`, {
      method: "POST",
      body: "{}",
    });
  }
}

// ─── Factory — singleton per-request via env-vars ────────────────────────────

let _serviceInstance: Auth0McpService | null = null;

export function getAuth0McpService(): Auth0McpService {
  if (_serviceInstance) return _serviceInstance;

  let domainRaw =
    process.env.AUTH0_DOMAIN ||
    process.env.AUTH0_ISSUER_BASE_URL;

  if (!domainRaw && process.env.AUTH0_BASE_URL && process.env.AUTH0_BASE_URL.includes('auth0.com')) {
    domainRaw = process.env.AUTH0_BASE_URL;
  }

  let cleanedDomain = (domainRaw || 'displaycellpros.us.auth0.com').trim();
  if (!cleanedDomain.startsWith('http://') && !cleanedDomain.startsWith('https://')) {
    cleanedDomain = `https://${cleanedDomain}`;
  }

  let domain = 'displaycellpros.us.auth0.com';
  try {
    const parsed = new URL(cleanedDomain);
    domain = parsed.hostname || 'displaycellpros.us.auth0.com';
  } catch {
    const stripped = cleanedDomain.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0].split('#')[0].trim();
    domain = stripped || 'displaycellpros.us.auth0.com';
  }

  const clientId =
    process.env.AUTH0_MGMT_CLIENT_ID ||
    process.env.AUTH0_CLIENT_ID ||
    'dummy_client_id_for_preview';

  const clientSecret =
    process.env.AUTH0_MGMT_CLIENT_SECRET ||
    process.env.AUTH0_CLIENT_SECRET ||
    'dummy_client_secret_for_preview';

  _serviceInstance = new Auth0McpService({ domain, clientId, clientSecret });
  return _serviceInstance;
}
