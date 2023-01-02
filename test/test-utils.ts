import child_process from "child_process"
import fs from "fs-extra"

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
const $child_process = jest.mocked(child_process, true)

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
 * Empty the working dir before each test is executed and once after all
 * tests are executed.
 *
 * IMPORTANT!
 *
 * Because all the individual tests share a directory, we need to run all of
 * our tests sequentially.
 *
 * To do this, we have set our unit tests to run in `package.json` with the
 * the option `--runInBand` which forces each test file to finish before
 * running the next one. This slows execution down and eventually, we may
 * wish to migrate so each test file executes in its own directory.
 */
export function resetDir(dir = ".test", clearDirAfterTest = true) {
  beforeEach(() => {
    fs.emptyDirSync(dir)
  })

  afterAll(() => {
    if (clearDirAfterTest) {
      fs.emptyDirSync(dir)
    }
  })
}
