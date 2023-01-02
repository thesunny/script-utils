import fs from "fs-extra"
import Path from "path"
import { task, pass, fail, stringify } from "../log-utils"

/**
 * Copy dir from src to dest creating the dest dir if required
 *
 * If files exist in the destination directory that also exist in the source
 * directory (i.e. there would be an overwrite) we throw an error.
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
