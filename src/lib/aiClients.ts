/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Lazily-initialized OpenAI/Gemini clients shared by the /api/ai/*,
 * /api/support/chat, and /api/academy/generate-video Route Handlers.
 * Ported from server.ts's getOpenAI()/getGemini().
 */
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

let openaiClient: OpenAI | null = null;
export function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

let geminiClient: GoogleGenAI | null = null;
export function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}
