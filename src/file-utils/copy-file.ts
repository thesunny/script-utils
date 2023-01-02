import fs from "fs-extra"
import Path from "path"

import { prompt } from ".."
import { fail, pass, skip, stringify, task } from "../log-utils"
import { logger } from "../logger"
import { diffFile } from "./diff-file"

export type ExistsOptions = "fail" | "skip" | "overwrite" | "ask"
/**
 * Copy file from src to dest creating the dest dir if required.
 *
 * If `dest` exists, we throw an error. We do this because we want our
 * scripts to be clean. We should take explicit steps to remove any file
 * existing at the destination in another part of the script. If we don't,
 * it's easy to end up in a situation where the `copyFile` never executed but
 * we don't know that because overwriting it happens without doing so
 * explicitly.
 *
 * Can be called with a `silent` option which will supress logging of only the
 * `task` and `pass`. We may later want to suppress others like `overwrite`
 * but we'll leave it for now.
 */

export function copyFile(
  src: string,
  dest: string,
  {
    exists = "fail",
    silent = false,
  }: { exists?: ExistsOptions; silent?: boolean } = {
    exists: "fail",
    silent: false,
  }
): void {
  if (!silent) {
    task(`Copy file ${stringify(src)}\n  to ${stringify(dest)}`)
  }
  const dir = Path.dirname(dest)
  fs.ensureDirSync(dir)
  if (fs.existsSync(dest)) {
    switch (exists) {
      case "skip":
        skip(`File exists. Skipped it (ok to skip this file)`)
        break
      case "fail":
        fail(`Copy failed because dest path exists`)
        break
      case "overwrite":
        fs.copyFileSync(src, dest)
        pass(`File exists. Overwriting it`)
        break
      case "ask": {
        const diff = diffFile(src, dest)
        if (diff === null) {
          fs.copyFileSync(src, dest)
          skip(`File exists but they match so leave it alone`)
        } else {
          logger.log("\nDestination exists. Showing diff.\n")
          logger.log(`${diff}\n`)
          const answer = prompt("Overwrite the existing file? [y/n] ")
          if (answer === "y") {
            fs.copyFileSync(src, dest)
            pass(`Overwriting`)
          } else if (answer === "n") {
            pass(`Skipping`)
          } else {
            fail("Did not answer y or n")
          }
        }
        break
      }
    }
  } else {
    fs.copyFileSync(src, dest)
    if (!silent) {
      pass(`Completed`)
    }
  }
}
