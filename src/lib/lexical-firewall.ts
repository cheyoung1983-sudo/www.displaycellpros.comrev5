// src/lib/lexical-firewall.ts

type LexicalResult = { isSafe: boolean; reason?: string };

// AST-Lite token matchers optimized for Vercel Edge compute limitations
const CRITICAL_SYNTAX_TOKENS = [
  { pattern: /(--|\/\*|\*\/)/g, name: "SQL_COMMENT_BLOCK" },
  { pattern: /;\s*(DROP|ALTER|TRUNCATE|DELETE)\b/i, name: "SQL_DESTRUCTIVE_COMMAND" },
  { pattern: /(;|&&|\|\||`|\$\()/g, name: "SHELL_ESCAPE_SEQUENCE" },
  { pattern: /<script\b[^>]*>([\s\S]*?)<\/script>/i, name: "XSS_INJECTION" }
];

const BRAND_LEXICON_BLACKLIST = [
  /INTERNAL_SYSTEM_PROMPT/i,
  /MASTER_SECRET_KEY/i,
  /COMPETITOR_BRAND_XYZ/i
];

/**
 * Validates inbound structural data objects
 */
export function validateLexicalPayload(payload: unknown): LexicalResult {
  const serialized = JSON.stringify(payload);

  for (const { pattern, name } of CRITICAL_SYNTAX_TOKENS) {
    if (pattern.test(serialized)) {
      return { isSafe: false, reason: `Violated safety rule: ${name}` };
    }
  }
  return { isSafe: true };
}

/**
 * Purges forbidden brand language or system code from AI outputs
 */
export function sanitizeAIResponse(rawText: string): string {
  let sanitized = rawText;
  for (const forbiddenPattern of BRAND_LEXICON_BLACKLIST) {
    sanitized = sanitized.replace(forbiddenPattern, "[REDACTED_SYSTEM_TERM]");
  }
  return sanitized;
}
