import fs from "fs-extra"
import Path from "path"

import { fail, pass, stringify, task } from "../log-utils"
import { fileExists } from "./file-exists"

/**
 * Create a file with the given text
 */

export function writeFile(
  path: string,
  text: string,
  { silent = false }: { silent?: boolean } = {}
): void {
  if (!silent) {
    task(`Write file ${stringify(path)}`)
  }
  const dir = Path.dirname(path)
  fs.ensureDirSync(dir)
  if (fileExists(path)) {
    fail(`Failed because file exists`)
  }
  fs.writeFileSync(path, text, "utf-8")
  if (!silent) {
    pass(`Completed`)
  }
}
