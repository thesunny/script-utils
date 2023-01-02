import fs from "fs-extra"
import Path from "path"

import { fail, pass, stringify, task } from "../log-utils"

/**
 * Task:
 *
 * Copy dir from src to dest creating the dest dir if required
 *
 * If files exist in the destination directory that also exist in the source
 * directory (i.e. there would be an overwrite) we throw an error.
 *
 * This is to prevent accidentally overwriting a file when you didn't mean to.
 *
 * If you DO want to overwrite a destination file, you should do this explicitly
 * by deleting the file first. This is preferable because you usually don't want
 * to be overwriting files without being explicit about it and when you add the
 * file deletions into the source code, it is clear from the code that you
 * intended the file you are overwriting to indeed by delete. This creates a
 * form of documentation in the code and also shows the intention when the task
 * to delete the file is displayed to the user.
 */
export function copyDir(src: string, dest: string): void {
  task(`Copy dir ${stringify(src)}\n  to ${stringify(dest)}`)
  const dir = Path.dirname(dest)
  fs.ensureDirSync(dir)
  try {
    fs.copySync(src, dest, { overwrite: false, errorOnExist: true })
    pass(`Completed`)
  } catch (e) {
    fail(e)
  }
}
