import chalk from "chalk"
import fs from "fs-extra"
import Path from "path"
import { diffStringsUnified } from "jest-diff"
import promptSync from "prompt-sync"
export { exec, spawn } from "./process"
export * from "./git"

export const prompt = promptSync({ sigint: true })

function escapeRegExp(text: string) {
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
}

/**
 * For internal use. Create a Log method that uses a chalk function for styling.
 */
function Log(ch: chalk.Chalk) {
  return function (text: string) {
    console.log(ch(text))
  }
}

/**
 * Shortcut prespecified log methods with a chalk function for color.
 */
const log = {
  title: Log(chalk.yellowBright),
  heading: Log(chalk.yellowBright),
  task: Log(chalk.yellow),
  message: Log(chalk.hex("#c0c0a0")),
  alert: Log(chalk.hex("FF9010")),
  pass: Log(chalk.greenBright),
  skip: Log(chalk.hex("#006000")),
  fail: Log(chalk.redBright),
}

export function task(text: string) {
  log.task(`${chalk.hex("#606000")("∙")} ${text}`)
}

/**
 * Shortcut `pass` method with a checkmark
 */
export function pass(text: string) {
  // log.pass(`  ✓ ${text}\n`)
  log.pass(`  ✓ ${text}\n`)
}

/**
 * Shortcut `skip` method with a dimmer checkmark
 */
export function skip(text: string) {
  log.skip(`  ✓ ${text}\n`)
}

export function message(text: string) {
  log.message(`  ${text.split("\n").join("\n  ")}\n`)
}

export function alert(text: string) {
  log.alert(`🔥 ${text.split("\n").join("\n  ")}\n`)
}

/**
 * Shortcut `fail` method that logs with an "x" and then throws the value to
 * stop script from continuing.
 */
export function fail(value: string | unknown): never {
  log.fail(`  ✕ ${value}\n`)
  if (typeof value === "string") {
    throw new Error(value)
  } else {
    throw value
  }
}

/**
 * Pretty Print a `string` or `RegExp` value
 */
export function stringify(value: string | RegExp) {
  if (typeof value === "string") {
    return chalk.yellowBright(JSON.stringify(value))
  } else {
    return chalk.yellowBright(`${value}`)
  }
}

/**
 * Display a section heading in the script
 */
export function title(text: string) {
  const lines = text.split("\n")
  const maxLength = Math.max(...lines.map((line) => line.length))
  log.title(
    `\n╔${"═".repeat(maxLength + 2)}╗\n${lines
      .map((line) => `║ ${line.padEnd(maxLength)} ║`)
      .join("\n")}\n╚${"═".repeat(maxLength + 2)}╝\n`
  )
}

/**
 * Display a section heading in the script
 */
export function heading(text: string) {
  log.heading(chalk.underline(`\n${text}\n`))
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
  fs.emptyDirSync(dir)
  pass(`Completed`)
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
 */
export function copyFile(
  src: string,
  dest: string,
  { exists = "fail" }: { exists?: ExistsOptions } = { exists: "fail" }
) {
  task(`Copy file ${stringify(src)}\n  to ${stringify(dest)}`)
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
          console.log("\nDestination exists. Showing diff.\n")
          console.log(diff)
          console.log("")
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
    pass(`Completed`)
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
