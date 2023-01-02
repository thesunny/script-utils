import fs from "fs-extra"

/**
 * Returns whether a file at the given path exists
 */

export function fileExists(path: string): boolean {
  return fs.existsSync(path)
}
