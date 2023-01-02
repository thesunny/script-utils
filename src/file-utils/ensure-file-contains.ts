import { fail, pass, stringify, task } from "../log-utils"
import { readFile } from "./read-file"

/**
 * Task:
 *
 * Reads a file at the given path and looks for the given `find` value which can
 * be a `string` or `RegExp`. If it is found, then the task passes. If the
 * string is not found, the task fails.
 */

export function ensureFileContains(path: string, find: string | RegExp): void {
  task(`Confirm file ${stringify(path)}\n  contains ${stringify(find)}`)
  const text = readFile(path)
  let includes: boolean
  if (typeof find === "string") {
    includes = text.includes(find)
  } else {
    includes = text.match(find) != null
  }
  if (includes) {
    pass(`Confirmed`)
  } else {
    fail(`File does not contain text!`)
  }
}
