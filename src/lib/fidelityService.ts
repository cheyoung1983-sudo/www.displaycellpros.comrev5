import { generateText } from 'ai';

// Verifies generated diagnostic text against a grounding source document before
// it reaches a technician. Per-paragraph: extract technical entities (part
// numbers, rail names, component codes), check what fraction also appear in
// the grounding source, and regenerate once if any paragraph falls below the
// match threshold ("Active Redo Logic") rather than silently shipping an
// ungrounded claim.

const FIDELITY_MATCH_THRESHOLD = 0.35;

// Matches technical entities: component/part codes (1610A3, VDD_MAIN, FL1728, U2),
// and other alphanumeric tokens likely to be domain-specific rather than prose.
const ENTITY_PATTERN = /\b([A-Z][A-Z0-9_]{2,}|[A-Z]\d[A-Z0-9]{2,}|\d[A-Za-z]\d[A-Za-z0-9]*)\b/g;

function extractEntities(text: string): string[] {
  const matches = text.match(ENTITY_PATTERN) || [];
  return Array.from(new Set(matches.map((m) => m.toUpperCase())));
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export interface ParagraphFidelityResult {
  paragraph: string;
  entities: string[];
  matchedEntities: string[];
  matchRatio: number;
  passed: boolean;
}

export function verifyFidelity(text: string, groundingSource: string): {
  passed: boolean;
  paragraphResults: ParagraphFidelityResult[];
} {
  const sourceUpper = groundingSource.toUpperCase();
  const paragraphResults = splitParagraphs(text).map((paragraph) => {
    const entities = extractEntities(paragraph);
    if (entities.length === 0) {
      // No checkable technical claims in this paragraph — nothing to fail.
      return { paragraph, entities, matchedEntities: [], matchRatio: 1, passed: true };
    }
    const matchedEntities = entities.filter((e) => sourceUpper.includes(e));
    const matchRatio = matchedEntities.length / entities.length;
    return { paragraph, entities, matchedEntities, matchRatio, passed: matchRatio >= FIDELITY_MATCH_THRESHOLD };
  });

  return {
    passed: paragraphResults.every((p) => p.passed),
    paragraphResults,
  };
}

export interface FidelityCheckedGeneration {
  text: string;
  fidelityPassed: boolean;
  regenerated: boolean;
  paragraphResults: ParagraphFidelityResult[];
}

export async function generateWithFidelityCheck(options: {
  model: Parameters<typeof generateText>[0]['model'];
  instructions: string;
  prompt: string;
  groundingSource: string;
}): Promise<FidelityCheckedGeneration> {
  const { model, instructions, prompt, groundingSource } = options;

  const first = await generateText({ model, instructions, prompt, temperature: 0.2 });
  let check = verifyFidelity(first.text, groundingSource);
  if (check.passed) {
    return { text: first.text, fidelityPassed: true, regenerated: false, paragraphResults: check.paragraphResults };
  }

  // Active Redo Logic: regenerate once, explicitly steering the model back to
  // the grounding source instead of silently shipping the ungrounded draft.
  const redo = await generateText({
    model,
    instructions: `${instructions}\n\nIMPORTANT: Your previous answer included technical claims (component codes, rail names, part numbers) not present in the grounding source. Only state technical specifics that are explicitly supported by the grounding source provided in the prompt. If you're unsure, say so instead of guessing a value.`,
    prompt,
    temperature: 0.1,
  });
  check = verifyFidelity(redo.text, groundingSource);

  return {
    text: redo.text,
    fidelityPassed: check.passed,
    regenerated: true,
    paragraphResults: check.paragraphResults,
  };
}
