import { fail, pass, stringify,task } from "../log-utils"
import { isEmpty } from "./is-empty"

/**
 * Ensure path is empty (no file exists, no dir exists or dir exists but is empty)
 */

export function ensureEmpty(path: string): void {
  task(`Ensure path ${stringify(path)} is empty`)
  const empty = isEmpty(path)
  if (empty) {
    pass(`Confirmed`)
  } else {
    fail(`Path is not empty`)
  }
}
