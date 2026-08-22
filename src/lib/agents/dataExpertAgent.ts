import { ToolLoopAgent, isStepCount } from 'ai';
import { dataExpertTools } from '../aiTools/dataExpertTools.ts';

const DATA_EXPERT_INSTRUCTIONS = `You are the Data Expert for Display & Cell Pros, an electronics repair lab.
You answer questions about repair tickets, customer orders, drop-off bookings, live Shopify
product/catalog availability, and internal bench comments by calling your tools — never guess
or fabricate a ticket number, order, booking, or price.

If a tool returns null or an empty array, say plainly that no matching record exists. Do not
invent plausible-sounding data to fill a gap. When a customer's data isn't found, suggest they
double-check the ticket number or email, or contact the Spokane Lab directly. If a tool returns
an "error" field about authorization, tell the caller plainly that they aren't authorized to see
that data rather than treating it as a missing-record case.`;

export interface DataExpertAuthContext {
  callerEmail: string;
  isTechnician: boolean;
}

/**
 * ToolLoopAgent's per-tool authorization context (contextSchema/toolsContext)
 * is constructor-only, not accepted by .generate() — so a fresh agent
 * instance is built per request with the caller's auth baked in, rather than
 * sharing one module-level singleton across requests with different callers.
 */
export function createDataExpertAgent(authContext: DataExpertAuthContext) {
  // TOOLS is inferred from `tools` in the same constructor call that also
  // types-checks `toolsContext` against it (InferToolSetContext<TOOLS>) —
  // TS can't resolve that mutual dependency for an object literal built from
  // an imported const, so toolsContext infers as `never` here even though
  // each entry matches its tool's contextSchema exactly (verified above).
  const toolsContext = {
    lookupRepairTicket: authContext,
    lookupCustomerOrders: authContext,
    lookupBookings: authContext,
    lookupComments: authContext,
  } as never;

  return new ToolLoopAgent({
    model: 'anthropic/claude-sonnet-5',
    instructions: DATA_EXPERT_INSTRUCTIONS,
    tools: { ...dataExpertTools },
    stopWhen: isStepCount(6),
    toolsContext,
  });
}
