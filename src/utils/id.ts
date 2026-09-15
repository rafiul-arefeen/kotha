let counter = 0;

/** Locally unique id; no crypto needed for on-device records. */
export function makeId(prefix: string): string {
  counter = (counter + 1) % 1_000_000;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
