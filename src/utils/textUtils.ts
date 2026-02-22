/**
 * textUtils
 *
 * Shared text-processing utilities:
 * - normalizeText: collapse whitespace, trim
 * - tokenize: split a text block into words via regex, filtering empty tokens
 */

/** Normalize whitespace in a string */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Split text into an array of words, stripping punctuation-only tokens that
 * add no reading value (e.g. lone hyphens or pipes) while preserving
 * punctuation attached to real words.
 */
export function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && /\w/.test(w));
}
