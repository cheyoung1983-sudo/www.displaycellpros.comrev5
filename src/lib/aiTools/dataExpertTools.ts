import { tool } from 'ai';
import { z } from 'zod';

// Read-only tool surface for the Data Expert agent. Every tool here wraps an
// existing, already-verified data access path (Aurora via serverDb.ts,
// Shopify Storefront via shopify.ts) rather than opening new query surface —
// the agent never constructs SQL itself, only picks from these fixed shapes.
//
// Authorization: every tool that can return customer PII declares a
// contextSchema and checks it in execute() rather than trusting the model's
// tool-call arguments — the model chooses *what* to ask for, but the caller's
// session (passed in via toolsContext by the route handler) decides whether
// that's allowed. A technician (isTechnician) may look up anyone; a caller
// who isn't a technician may only look up their own callerEmail.

const CustomerAuthContextSchema = z.object({
  callerEmail: z.string(),
  isTechnician: z.boolean(),
});

function deniedForEmail(customerEmail: string, context: { callerEmail: string; isTechnician: boolean }) {
  if (context.isTechnician) return null;
  if (customerEmail.trim().toLowerCase() === context.callerEmail.trim().toLowerCase()) return null;
  return { error: 'Not authorized: you can only look up your own orders/bookings.' };
}

export const lookupRepairTicket = tool({
  description:
    'Look up a single repair ticket by its ticket number (e.g. DCP-1234). Technician-only — ticket lookup by number has no per-customer ownership check. Returns null if not found — never fabricate ticket data.',
  inputSchema: z.object({
    ticketNumber: z.string().max(30).describe('The ticket number, e.g. DCP-1234'),
  }),
  contextSchema: CustomerAuthContextSchema,
  execute: async ({ ticketNumber }, { context }) => {
    if (!context.isTechnician) {
      return { error: 'Not authorized: ticket lookup by number is technician-only.' };
    }
    const { queryReadOnly } = await import('../serverDb.ts');
    const result = await queryReadOnly(
      `SELECT ticket_number, customer_name, customer_email, device_manufacturer, device_model,
              service_tier, status, current_stage, issue_description, technician_notes,
              assigned_tech, telemetry, estimated_completion, created_at, updated_at
       FROM repair_tickets WHERE ticket_number = $1 LIMIT 1`,
      [ticketNumber.trim().toUpperCase().slice(0, 30)]
    );
    return result.rows[0] || null;
  },
});

export const lookupCustomerOrders = tool({
  description:
    'List all repair tickets/orders for a customer by email. Returns an empty array if the customer has no tickets — never fabricate orders.',
  inputSchema: z.object({
    customerEmail: z.string().email().describe('The customer\'s email address'),
  }),
  contextSchema: CustomerAuthContextSchema,
  execute: async ({ customerEmail }, { context }) => {
    const denied = deniedForEmail(customerEmail, context);
    if (denied) return denied;

    const { queryReadOnly } = await import('../serverDb.ts');
    const result = await queryReadOnly(
      `SELECT ticket_number, device_manufacturer, device_model, service_tier, status,
              current_stage, estimated_completion, costs, payment_status, warranty, created_at
       FROM repair_tickets WHERE customer_email = $1 ORDER BY created_at DESC`,
      [customerEmail.trim().toLowerCase()]
    );
    return result.rows;
  },
});

export const lookupBookings = tool({
  description:
    'List drop-off bookings for a customer by email. Returns an empty array if none exist.',
  inputSchema: z.object({
    customerEmail: z.string().email().describe('The customer\'s email address'),
  }),
  contextSchema: CustomerAuthContextSchema,
  execute: async ({ customerEmail }, { context }) => {
    const denied = deniedForEmail(customerEmail, context);
    if (denied) return denied;

    const { queryReadOnly } = await import('../serverDb.ts');
    const result = await queryReadOnly(
      `SELECT booking_id, drop_off_date, time_slot, drop_off_type, device_category, service_tier, notes, created_at
       FROM bookings WHERE customer_email = $1 ORDER BY created_at DESC`,
      [customerEmail.trim().toLowerCase()]
    );
    return result.rows;
  },
});

export const searchShopifyProducts = tool({
  description:
    'Search the live Shopify product catalog by a keyword (e.g. device model or part name). Returns matching product titles, prices, and variant availability.',
  inputSchema: z.object({
    keyword: z.string().max(100).describe('Keyword to search for, e.g. "iPhone 15 screen"'),
  }),
  execute: async ({ keyword }) => {
    const { isShopifyConfigured, shopifyFetch } = await import('../shopify.ts');
    if (!isShopifyConfigured()) {
      return { configured: false, products: [] };
    }
    const { PRODUCTS_QUERY } = await import('../shopify-queries.ts');
    const data = await shopifyFetch<{ products: { nodes: any[] } }>(PRODUCTS_QUERY, { first: 50 });
    const needle = keyword.toLowerCase();
    const matches = data.products.nodes
      .filter((p) => p.title.toLowerCase().includes(needle))
      .slice(0, 10)
      .map((p) => ({
        title: p.title,
        priceRange: p.priceRange,
        available: p.variants?.nodes?.some((v: any) => v.availableForSale) ?? null,
      }));
    return { configured: true, products: matches };
  },
});

export const lookupComments = tool({
  description:
    'Read the most recent internal comments/notes from the comments table (bench notes, ops log). Technician-only. No filtering by device/customer is available today — this is a flat recent-comments feed.',
  inputSchema: z.object({
    limit: z.number().int().min(1).max(50).optional().default(20),
  }),
  contextSchema: CustomerAuthContextSchema,
  execute: async ({ limit }, { context }) => {
    if (!context.isTechnician) {
      return { error: 'Not authorized: internal bench notes are technician-only.' };
    }
    const { queryReadOnly } = await import('../serverDb.ts');
    const result = await queryReadOnly('SELECT id, comment FROM comments ORDER BY id DESC LIMIT $1', [limit]);
    return result.rows;
  },
});

export const dataExpertTools = {
  lookupRepairTicket,
  lookupCustomerOrders,
  lookupBookings,
  searchShopifyProducts,
  lookupComments,
};
