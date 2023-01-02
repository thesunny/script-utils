import fs from "fs-extra"

import { fail, pass, stringify, task } from "../log-utils"

/**
 * Task:
 *
 * Empties the given directory but to avoid the case where you accidentally
 * delete the user directory or a root directory or everything in the current
 * directory, we prevent certain types of directories from being emptied.
 *
 * Specifically, you cannot delete:
 *
 * - any directory starting with "~"
 * - any directory starting with "/"
 * - The "" directory
 * - The "./" directory
 */

export function emptyDir(dir: string): void {
  task(`Empty dir ${stringify(dir)}`)
  if (
    dir.startsWith("~") ||
    dir.startsWith("/") ||
    dir === "" ||
    dir === "./"
  ) {
    fail(
      `You cannot empty the dir ${stringify(
        dir
      )} with script-utils because it's dangerous and script-utils is designed to help you avoid footguns! You will have to empty "~", "/", "" and "./" directories manually if you need to.`
    )
  }
  fs.emptyDirSync(dir)
  pass(`Completed`)
}
