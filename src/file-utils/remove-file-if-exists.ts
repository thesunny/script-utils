import fs from "fs-extra"

import { fail, pass, stringify, task } from "../log-utils"

/**
 * Task:
 *
 * Remove file if it exists.
 */

export function removeFileIfExists(path: string): void {
  task(`Remove file ${stringify(path)}`)
  if (!fs.pathExistsSync(path)) {
    pass(`File does not exist. Okay to continue.`)
    return
  }
  const stats = fs.statSync(path)
  if (!stats.isFile()) {
    fail(`Path ${stringify(path)} exists but is not a file`)
  }
  fs.rmSync(path)
  pass(`Removed`)
}
