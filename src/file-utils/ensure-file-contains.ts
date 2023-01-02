import { fail, pass, stringify, task } from "../log-utils"
import { readFile } from "./read-file"

/**
 * Task to read a file and confirm that it contains a specific string or matches a specific RegExp.
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
