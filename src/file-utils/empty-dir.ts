import fs from "fs-extra"

import { fail, pass, stringify,task } from "../log-utils"

/**
 * Empties the given dir
 */

export function emptyDir(dir: string): void {
  task(`Empty dir ${stringify(dir)}`)
  if (
    dir.startsWith("~") ||
    dir.startsWith("/") ||
    dir === "" ||
    dir === "./"
  ) {
    fail(`You cannot empty the dir ${stringify(dir)}`)
  }
  fs.emptyDirSync(dir)
  pass(`Completed`)
}
