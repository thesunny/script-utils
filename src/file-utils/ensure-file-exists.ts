import { task, pass, fail, stringify } from "../log-utils"
import { fileExists } from "./file-exists"

/**
 * Ensures a file at the given path exists.
 *
 * If the file does not exist, the task fails.
 */

export function ensureFileExists(path: string) {
  task(`Ensure file exists ${stringify(path)}`)
  const exists = fileExists(path)
  if (exists) {
    pass(`Confirmed`)
  } else {
    fail(`File does not exist!`)
  }
}
