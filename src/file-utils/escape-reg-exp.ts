/**
 * Nice utility function to create an exact text match RegExp string.
 *
 * Especially useful if you need an exact text match, like from an argument in
 * a function, inside a more dynamic RegExp, like say one that needs to match
 * multiple directories.
 */

export function escapeRegExp(text: string): string {
  return text.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
}
