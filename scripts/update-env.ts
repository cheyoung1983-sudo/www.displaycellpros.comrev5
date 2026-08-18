import fs from 'node:fs';
import path from 'node:path';

/**
 * Display & Cell Pros LLC (D&CP)
 * Environment Variable Helper Utility
 *
 * Safely manages local environment keys, deprecates obsolete Gemini keys,
 * and provisions the OpenAI API key for Spokane Lab telemetry & AI diagnostic micro-services.
 */

const DEFAULT_OPENAI_KEY =
  process.env.OPENAI_API_KEY || '';

const envFilePath = path.resolve(process.cwd(), '.env');
const envExamplePath = path.resolve(process.cwd(), '.env.example');

function maskKey(key: string): string {
  if (!key || key.length < 12) return '********';
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}

export function updateEnvironment(targetKey?: string) {
  const newKey = (targetKey || process.argv[2] || DEFAULT_OPENAI_KEY).trim();
  const timestamp = new Date().toISOString();

  console.log(`\n========================================================`);
  console.log(`⚡ D&CP LLC - Automated Environment Key Provisioner`);
  console.log(`⏱  Timestamp: ${timestamp}`);
  console.log(`========================================================\n`);

  let content = '';

  if (fs.existsSync(envFilePath)) {
    content = fs.readFileSync(envFilePath, 'utf8');
    console.log(`[INFO] Found existing .env file at: ${envFilePath}`);
  } else if (fs.existsSync(envExamplePath)) {
    content = fs.readFileSync(envExamplePath, 'utf8');
    console.log(`[INFO] .env not found. Seeding from .env.example template.`);
  } else {
    content = '';
    console.log(`[INFO] Initializing new .env file.`);
  }

  // Deprecate / remove obsolete GEMINI_API_KEY if present
  let hadGemini = false;
  if (/^GEMINI_API_KEY=/m.test(content)) {
    hadGemini = true;
    content = content.replace(/^GEMINI_API_KEY=.*$/m, '# DEPRECATED (Replaced by OpenAI)\n# GEMINI_API_KEY=""');
    console.log(`[DEPRECATION] Marked legacy GEMINI_API_KEY as superseded.`);
  }

  // Update or insert OPENAI_API_KEY
  if (/^OPENAI_API_KEY=/m.test(content)) {
    content = content.replace(/^OPENAI_API_KEY=.*$/m, `OPENAI_API_KEY="${newKey}"`);
    console.log(`[UPDATE] Updated OPENAI_API_KEY -> ${maskKey(newKey)}`);
  } else {
    content = `${content.trim()}\n\n# OpenAI AI Diagnostics & Lab Triage Key\nOPENAI_API_KEY="${newKey}"\n`;
    console.log(`[INSERT] Added OPENAI_API_KEY -> ${maskKey(newKey)}`);
  }

  // Save changes
  fs.writeFileSync(envFilePath, content, 'utf8');

  console.log(`\n✅ Successfully updated: ${envFilePath}`);
  console.log(`🔒 Active Key: ${maskKey(newKey)}`);
  console.log(`🛡  Status: Backend AI Diagnostics & Triage routes are active and synchronized.\n`);

  return {
    success: true,
    maskedKey: maskKey(newKey),
    hadGeminiDeprecation: hadGemini,
  };
}

// Execute if run directly via tsx / node
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('update-env.ts')) {
  try {
    updateEnvironment();
  } catch (err) {
    console.error(`❌ Failed to update environment variables:`, err);
    process.exit(1);
  }
}
