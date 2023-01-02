import fs from "fs-extra"

import { fileExists } from "./file-exists"

/**
 * Check path is empty (no file exists, no dir exists or dir exists but is empty)
 */

export function isEmpty(path: string): boolean {
  if (!fileExists(path)) {
    return true
  }
  return fs.readdirSync(path).length === 0
}
