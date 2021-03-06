import fs from "fs-extra"
import Path from "path"
import { diffStringsUnified } from "jest-diff"
import promptSync from "prompt-sync"
import { task, pass, fail, skip, stringify } from "./log"
export { exec, spawn } from "./process"
export * from "./git"
export * from "./log"
export * from "./logger"
import { logger } from "./logger"
export { logger } from "./logger"

export const prompt = promptSync({ sigint: true })

function escapeRegExp(text: string) {
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
}

/**
 * Create a file with the given text
 */
export function writeFile(
  path: string,
  text: string,
  { silent = false }: { silent?: boolean } = {}
) {
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

/**
 * Read a file and return its text
 */
export function readFile(path: string) {
  return fs.readFileSync(path, "utf-8")
}

export function ensureFileContains(path: string, find: string | RegExp) {
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

/**
 * Returns whether a file at the given path exists
 */
export function fileExists(path: string) {
  return fs.existsSync(path)
}

/**
 * Ensures a file at the given path exists
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

/**
 * Empties the given dir
 */
export function emptyDir(dir: string) {
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

/**
 * Check path is empty (no file exists, no dir exists or dir exists but is empty)
 */
export function isEmpty(path: string) {
  if (!fileExists(path)) {
    return true
  }
  return fs.readdirSync(path).length === 0
}

/**
 * Ensure path is empty (no file exists, no dir exists or dir exists but is empty)
 */
export function ensureEmpty(path: string) {
  task(`Ensure path ${stringify(path)} is empty`)
  const empty = isEmpty(path)
  if (empty) {
    pass(`Confirmed`)
  } else {
    fail(`Path is not empty`)
  }
}

/**
 * Remove file if it exists.
 */
export function removeFileIfExists(path: string) {
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

export type ExistsOptions = "fail" | "skip" | "overwrite" | "ask"

export function diffFile(a: string, b: string): string | null {
  const aText = readFile(a)
  const bText = readFile(b)
  if (aText === bText) return null
  const diff = diffStringsUnified(aText, bText)
  return diff
}

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
) {
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
      case "ask":
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
  } else {
    fs.copyFileSync(src, dest)
    if (!silent) {
      pass(`Completed`)
    }
  }
}

/**
 * Copy dir from src to dest creating the dest dir if required
 *
 * If files exist in the destination directory that also exist in the source
 * directory (i.e. there would be an overwrite) we throw an error.
 */
export function copyDir(src: string, dest: string) {
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

/**
 * Takes a file and replaces some text in the file in place.
 */
// export function replaceInFile({
//   src,
//   dest,
//   find,
//   replace,
// }: {
//   src: string
//   dest: string
//   find: string //| RegExp,
//   replace: string //| ((text: string) => string)
// }) {
//   log.message(
//     `Replace
//   src: ${stringify(src)}
//   dest: ${stringify(dest)}
//   find: ${stringify(find)}
//   replace: ${stringify(replace)}`
//   )
//   const text = readFile(src)
//   const replacedText = text.replace(find, replace)

//   fs.writeFileSync(dest, replacedText, "utf-8")
//   pass(`Completed`)
// }
// export function replaceInFile({
//   src,
//   dest,
//   find,
//   replace,
// }: {
//   src: string
//   dest: string
//   find: string | RegExp
//   replace: string //| ((text: string) => string)
// }) {
//   log.message(
//     `Replace
//   src: ${stringify(src)}
//   dest: ${stringify(dest)}
//   find: ${stringify(find)}
//   replace: ${stringify(replace)}`
//   )
//   const findRegExp: RegExp =
//     typeof find === "string" ? new RegExp(escapeRegExp(find)) : find
//   const text = readFile(src)

//   const match = findRegExp.exec(text)
//   console.log("match", match)

//   // const replacedText = text.replace(find, replace)

//   // fs.writeFileSync(dest, replacedText, "utf-8")
//   pass(`Completed`)
// }

export function replaceInFile({
  src,
  dest,
  find,
  replace,
  count = 1,
}: {
  src: string
  dest: string
  find: RegExp | string
  replace: string | ((match: RegExpMatchArray) => string)
  count?: number | null
}) {
  task(
    `Replace in ${stringify(src)}
  to ${stringify(dest)}
  replacing ${stringify(find)} ${count} times`
  )
  const text = readFile(src)
  const globalFind = new RegExp(
    typeof find === "string" ? escapeRegExp(find) : find,
    "g"
  )
  const replaceFn = typeof replace === "function" ? replace : () => replace
  const matches = [...text.matchAll(globalFind)]
  const parts: string[] = []
  if (typeof count === "number") {
    if (count !== matches.length) {
      fail(`Expected ${count} replacement(s) but got ${matches.length}`)
    }
  }
  let lastIndex = 0
  for (const match of matches) {
    if (typeof match.index !== "number") {
      throw new Error(
        `We expect match.index to return a number but it did not.`
      )
    }
    parts.push(text.slice(lastIndex, match.index))
    parts.push(replaceFn(match))
    lastIndex = match.index + match[0].length
  }
  parts.push(text.slice(lastIndex))
  const replacedText = parts.join("")
  writeFile(dest, replacedText, { silent: true })
  pass(`Completed`)
}

/**
 * Takes a file and replaces some text in the file in place.
 */
export function processFile(
  src: string,
  dest: string,
  process: (input: string) => string
) {
  task(
    `Process
  src: ${stringify(src)}
  dest: ${stringify(dest)}`
  )
  const text = readFile(src)
  const processedText = process(text)

  writeFile(dest, processedText, { silent: true })
  pass(`Completed`)
}

/**
 * Add a blank line to make output cleaner.
 *
 * NOTE:
 *
 * We elect to exit with `process.exit(1)` which displays an ugly error
 * in order to communicate that the code has exited in a state we don't want.
 *
 * Even though we show the error messages, the ugliness of the different colors
 * is a nice visual indicator that we need to pay attention.
 */
export function exit() {
  console.log("")
  process.exit(1)
}
