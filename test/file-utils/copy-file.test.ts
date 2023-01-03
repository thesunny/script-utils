/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as utils from "~/src"
import { logger, prompt as __prompt__ } from "~/src"

import { $, resetDir } from "../test-utils"

/**
 * Mock `prompt-sync`
 *
 * https://stackoverflow.com/questions/61950048/how-to-test-a-linear-node-script-with-jest
 */
jest.mock("prompt-sync", () => {
  const prompt = jest.fn()
  return jest.fn(() => prompt)
})

/**
 * Gives us typing on mocked objects
 *
 * https://jestjs.io/docs/mock-function-api/#jestmockedsource-options
 */
const prompt = jest.mocked(__prompt__)

describe("copyFile", () => {
  resetDir(".test/copy-file")

  describe("overwrite=fail (default)", () => {
    it("should copyFile", async () => {
      const SRC_PATH = ".test/copy-file/copyFile/a/1.txt"
      const DEST_PATH = ".test/copy-file/copyFile/b/1.txt"
      utils.writeFile(SRC_PATH, "lorem", { silent: true })
      expect(utils.fileExists(SRC_PATH)).toEqual(true)
      const chunks = logger.collect(() => {
        utils.copyFile(SRC_PATH, DEST_PATH)
        expect(utils.fileExists(DEST_PATH)).toEqual(true)
      })
      expect(chunks).toEqual([$("Copy file"), $("Completed")])
    })

    it("should fail copyFile if dest exists and exists=fail", async () => {
      const SRC_PATH = ".test/copy-file/copy-file-exists/a/1.txt"
      const DEST_PATH = ".test/copy-file/copy-file-exists/b/1.txt"
      utils.writeFile(SRC_PATH, "src", { silent: true })
      utils.writeFile(DEST_PATH, "dest", { silent: true })
      const chunks = logger.collect(() => {
        expect(() => utils.copyFile(SRC_PATH, DEST_PATH)).toThrow("Copy failed")
      })
      expect(chunks).toEqual([$("Copy file "), $("Copy failed")])
      expect(utils.readFile(DEST_PATH)).toEqual("dest")
    })
  })

  describe("exists=overwrite", () => {
    it("should overwrite copyFile if dest exists and exists=overwrite", async () => {
      const SRC_PATH = ".test/copy-file/copy-file-exists/a/1.txt"
      const DEST_PATH = ".test/copy-file/copy-file-exists/b/1.txt"
      utils.writeFile(SRC_PATH, "src", { silent: true })
      utils.writeFile(DEST_PATH, "dest", { silent: true })
      const chunks = logger.collect(() => {
        utils.copyFile(SRC_PATH, DEST_PATH, { exists: "overwrite" })
      })
      expect(chunks).toEqual([$("Copy file "), $("Overwriting")])
      expect(utils.readFile(DEST_PATH)).toEqual("src")
    })
  })

  describe("exists=skip", () => {
    it("should skip copyFile if dest exists and exists=skip", async () => {
      const SRC_PATH = ".test/copy-file/copy-file-exists/a/1.txt"
      const DEST_PATH = ".test/copy-file/copy-file-exists/b/1.txt"
      utils.writeFile(SRC_PATH, "src", { silent: true })
      utils.writeFile(DEST_PATH, "dest", { silent: true })
      const chunks = logger.collect(() => {
        utils.copyFile(SRC_PATH, DEST_PATH, { exists: "skip" })
      })
      expect(chunks).toEqual([$("Copy file "), $("Skipped it")])
      expect(utils.readFile(DEST_PATH)).toEqual("dest")
    })
  })

  describe("exists=ask", () => {
    afterEach(() => {
      /**
       * Clears the mock.calls, mock.instances, mock.contexts and mock.results
       * properties of all mocks.
       */
      jest.clearAllMocks()
    })
    afterAll(() => {
      /**
       * Resets the state of all mocks.
       *
       * Clears all information stored in the mockFn.mock.calls,
       * mockFn.mock.instances, mockFn.mock.contexts and mockFn.mock.results
       * arrays. Often this is useful when you want to clean up a mocks usage
       * data between two assertions. Removes any mocked return values or
       * implementations.
       *
       * This is useful when you want to completely reset a mock back to its
       * initial state. (Note that resetting a spy will result in a function
       * with no return value).
       */
      jest.resetAllMocks()
    })

    it("should ask if dest exists and exists=ask y overwrite", async () => {
      const SRC_PATH = ".test/copy-file/copy-file-exists/a/1.txt"
      const DEST_PATH = ".test/copy-file/copy-file-exists/b/1.txt"
      utils.writeFile(SRC_PATH, "src", { silent: true })
      utils.writeFile(DEST_PATH, "dest", { silent: true })
      prompt.mockReturnValueOnce("y")
      const chunks = logger.collect(() => {
        utils.copyFile(SRC_PATH, DEST_PATH, { exists: "ask" })
      })
      expect(chunks).toEqual([
        $("Copy file "),
        $("Showing diff"),
        $(/Expected/),
        $(/Overwriting/),
      ])
      expect(utils.readFile(DEST_PATH)).toEqual("src")
    })

    it("should ask if dest exists and exists=ask n skip", async () => {
      const SRC_PATH = ".test/copy-file/copy-file-exists/a/1.txt"
      const DEST_PATH = ".test/copy-file/copy-file-exists/b/1.txt"
      utils.writeFile(SRC_PATH, "src", { silent: true })
      utils.writeFile(DEST_PATH, "dest", { silent: true })
      prompt.mockReturnValueOnce("n")
      const chunks = logger.collect(() => {
        utils.copyFile(SRC_PATH, DEST_PATH, { exists: "ask" })
      })
      expect(chunks).toEqual([
        $("Copy file "),
        $("Showing diff"),
        $(/Expected/),
        $(/Skipping/),
      ])
      expect(utils.readFile(DEST_PATH)).toEqual("dest")
    })

    it("should ask if dest exists and exists=ask n skip", async () => {
      const SRC_PATH = ".test/copy-file/copy-file-exists/a/1.txt"
      const DEST_PATH = ".test/copy-file/copy-file-exists/b/1.txt"
      utils.writeFile(SRC_PATH, "src", { silent: true })
      utils.writeFile(DEST_PATH, "dest", { silent: true })
      prompt.mockReturnValueOnce("q")
      const chunks = logger.collect(() => {
        expect(() =>
          utils.copyFile(SRC_PATH, DEST_PATH, { exists: "ask" })
        ).toThrow("Did not answer y or n")
      })
      expect(chunks.length).toEqual(4)
      expect(chunks).toEqual([
        $("Copy file "),
        $("Destination exists."),
        $("Expected"),
        $("Did not answer y or n"),
      ])
    })
  })
})
