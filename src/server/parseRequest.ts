import { CATEGORY_BY_ID } from '@/data/categories';
import { REGISTER_BY_ID } from '@/data/registers';
import type { WireGenerateRequest } from '@/services/llm/wire';
import type { CategoryId, GenerationRequest, GenerationStyle, RegisterId, RequestItem } from '@/types';

const STYLES: GenerationStyle[] = ['auto', 'shorter', 'politer', 'simpler'];

/**
 * Validate the app's POST /v1/generate body. The prompt is rebuilt on the
 * server from these fields, so a client-supplied `prompt` is ignored.
 */
export function parseGenerateRequest(body: unknown): GenerationRequest | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Partial<WireGenerateRequest>;

  const registerId = b.register?.id as RegisterId | undefined;
  if (!registerId || !REGISTER_BY_ID[registerId]) return null;
  if (!Array.isArray(b.items) || b.items.length === 0 || b.items.length > 30) return null;

  const items: RequestItem[] = [];
  for (const raw of b.items) {
    if (!raw || (raw.source !== 'symbol' && raw.source !== 'keyword')) return null;
    const text = typeof raw.text === 'string' ? raw.text.trim() : '';
    if (!text || text.length > 80) return null;
    const category = raw.category && CATEGORY_BY_ID[raw.category as CategoryId] ? (raw.category as CategoryId) : undefined;
    items.push({
      source: raw.source,
      text,
      ...(typeof raw.symbol_id === 'string' ? { symbolId: raw.symbol_id } : {}),
      ...(category ? { category } : {}),
    });
  }

  const style = STYLES.includes(b.style as GenerationStyle) ? (b.style as GenerationStyle) : 'auto';
  const variant = Number.isInteger(b.variant) && (b.variant as number) >= 0 ? Math.min(b.variant as number, 50) : 0;
  return { items, register: registerId, style, variant };
}
