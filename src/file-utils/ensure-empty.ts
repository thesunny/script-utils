import { fail, pass, stringify, task } from "../log-utils"
import { isEmpty } from "./is-empty"

/**
 * Task:
 *
 * Ensure path is empty which means that all of the following are true
 *
 * - no file exists at path
 * - no dir exists at path or if a dir exists it has no files or subdirectories
 *   in it
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
