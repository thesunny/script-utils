import { fail, pass, stringify,task } from "../log-utils"
import { escapeRegExp } from "./escape-reg-exp"
import { readFile } from "./read-file"
import { writeFile } from "./write-file"

/**
 * Takes a `src` file, makes some replacements and writes them to the `dest`
 * file. In the case where we are expecting a certain amount of replacements,
 * we can specify a `count` option. If the number of replacements doesn't match
 * exactly, the `replaceInFile` fails and the file is not written.
 */

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
}): void {
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
