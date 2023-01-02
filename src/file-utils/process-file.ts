import { pass, stringify, task } from "../log-utils"
import { readFile } from "./read-file"
import { writeFile } from "./write-file"

/**
 * Task:
 *
 * Takes a file, runs it through the `process` argument which is a function,
 * then writes the return value of `process` to the dest.
 */

export function processFile(
  src: string,
  dest: string,
  process: (input: string) => string
): void {
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
