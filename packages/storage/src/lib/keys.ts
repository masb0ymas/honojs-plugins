/**
 * Build an object key from path segments.
 * Segments are joined with `/`; empty segments are dropped so a missing
 * directory does not produce a leading slash.
 */
export function buildKeyfile(values: string[]): string {
  return values.filter((value) => value.length > 0).join('/')
}
