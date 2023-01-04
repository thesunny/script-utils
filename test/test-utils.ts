import child_process from "child_process"
import fs from "fs-extra"
import path from "path"

/**
 * IMPORTANT!
 *
 * In order to use `mockExec` in a unit test, you need to add the line
 *
 * `jest.mock("child_process")`
 *
 * in the unit test file.
 *
 * This is required even though the command is included in this file as well.
 */

/**
 * To get the types
 */
const $child_process = jest.mocked(child_process)

/**
 * Lets you mock a command line `execSync` which some of our scripts use.
 *
 * The first argument is the command we are expecting to come in. If it doesn't
 * match we throw an error. This allows changes in implementation details to
 * throw errors in unit tests in obvious ways to make it easy to fix the unit
 * tests.
 */
export function mockExec(expectedCmd: string | null | undefined, text: string) {
  if (!("_isMockFunction" in child_process.execSync)) {
    throw new Error(
      `You are trying to use mockExec but you haven't mocked child_process at the top of your unit test file which is required. Just add 'jest.mock("child_process")' to the top of your unit test file and this will work. This is a requirement/limitation of jest mocks.`
    )
  }
  $child_process.execSync.mockImplementationOnce((incomingCmd) => {
    if (typeof expectedCmd === "string") {
      expect(expectedCmd).toEqual(incomingCmd)
    }
    return text
  })
}

/**
 * This is a helper function that is typically used with the results of
 *
 * `logger.collect`
 *
 * Here's some sample code:
 *
 * const chunks = loggger.collect(() => {
 *   // do some stuff here that logs to the logger
 * })
 *
 * expect(chunks).toEqual([$("first match"), $("second match")])
 */
export function $(s: string | RegExp) {
  return expect.stringMatching(s)
}

/**
 * Empties a working temp dir before each test is executed and once after all
 * tests are executed.
 *
 * Here's how this works:
 *
 * - Takes as it's argument, the current filename of the unit test which should
 *   be called with the value `__filename` which is replaced by the current
 *   filename.
 * - We create a `.temp` subdirectory based on that filename
 * - That directory is cleared before each test
 * - The directory is also cleared after all tests by default but this can
 *   be overriden with the `clearDirAfterTest` argument
 * - The `resetDir` must be called within the `describe` section of a unit
 *   test.
 *
 * We create individual `.temp` directories because:
 *
 * - Each test file can run in parallel with other test files and so they
 *   cannot share a directory or will step on each other
 * - Within each test file, the individual tests run sequentially so it is safe
 *   to reuse the temp directory within each `it` statement.
 */
export function resetDir(filename: string, clearDirAfterTest = true) {
  const filebasename = path.basename(filename).split(".")[0]
  const tempDir = `.temp/${filebasename}`

  beforeEach(() => {
    fs.emptyDirSync(tempDir)
  })

  afterAll(() => {
    if (clearDirAfterTest) {
      fs.emptyDirSync(tempDir)
    }
  })

  return tempDir
}
