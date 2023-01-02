import fs from "fs-extra"

/**
 * Read a file and return its text
 */

export function readFile(path: string): string {
  return fs.readFileSync(path, "utf-8")
}
