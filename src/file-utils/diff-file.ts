import { diffStringsUnified } from "jest-diff"
import { readFile } from "./read-file"

/**
 * Returns a diff of two files at the given paths.
 * Returns null if they are the same.
 */

export function diffFile(a: string, b: string): string | null {
  const aText = readFile(a)
  const bText = readFile(b)
  if (aText === bText) return null
  const diff = diffStringsUnified(aText, bText)
  return diff
}
