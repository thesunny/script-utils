/* eslint-disable no-secrets/no-secrets */
import * as utils from "~/src"
import { logger } from "~/src"

import { $, resetDir } from "../test-utils"

describe("ensureFileExists and ensureFileContains", () => {
  resetDir(".test/ensure")
  it("should fail ensureFileExists", async () => {
    const PATH = ".test/ensure/src/should-fail-ensureFileExists.txt"
    const chunks = logger.collect(() => {
      expect(() => utils.ensureFileExists(PATH)).toThrow(/File does not exist/)
    })
    expect(chunks).toEqual([$(/Ensure file exists/), $(/File does not exist/)])
  })

  it("should pass ensureFileExists", async () => {
    const PATH = ".test/ensure/src/should-pass-ensureFileExists.txt"
    utils.writeFile(PATH, "abc", { silent: true })

    const chunks = logger.collect(() => {
      utils.ensureFileExists(PATH)
    })
    expect(chunks).toEqual([$(/Ensure file exists/), $(/Confirmed/)])
  })

  it("should fail ensureFileContains", async () => {
    const PATH = ".test/ensure/src/alphabet.txt"
    const ALPHABET = "abcdefghijklmnopqrstuvwxyz"
    utils.writeFile(PATH, ALPHABET, { silent: true })
    const chunks = logger.collect(() => {
      expect(() => utils.ensureFileContains(PATH, "hello")).toThrow(
        "File does not contain text"
      )
    })
    expect(chunks).toEqual([$(/C/), $(/File does not contain/)])
  })

  it("should pass ensureFileContains with string and RegExp", async () => {
    const PATH = ".test/ensure/src/alphabet.txt"
    const ALPHABET = "abcdefghijklmnopqrstuvwxyz"
    utils.writeFile(PATH, ALPHABET, { silent: true })

    const chunks = logger.collect(() => {
      utils.ensureFileContains(PATH, ALPHABET)
    })
    expect(chunks).toEqual([$(/Confirm file/), $(/Confirmed/)])

    const chunks2 = logger.collect(() => {
      utils.ensureFileContains(PATH, /a.*z/)
    })
    expect(chunks2).toEqual([$(/Confirm file/), $(/Confirmed/)])
  })
})
