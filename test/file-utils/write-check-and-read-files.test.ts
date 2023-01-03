/* eslint-disable no-secrets/no-secrets */
import * as utils from "~/src"
import { logger } from "~/src"

import { $, resetDir } from "../test-utils"

describe("write, check and read files", () => {
  const dir = resetDir("${dir}")

  it("should writeFile, check fileExists, readFile", async () => {
    const PATH = `${dir}/alphabet.txt`
    const ALPHABET = "abcdefghijklmnopqrstuvwxyz"

    const beforeFileExists = utils.fileExists(PATH)
    expect(beforeFileExists).toEqual(false)

    const chunks = logger.collect(() => {
      utils.writeFile(PATH, ALPHABET)
    })
    expect(chunks).toEqual([$("Write file"), $("Completed")])

    const afterFileExists = utils.fileExists(PATH)
    expect(afterFileExists).toEqual(true)

    const text = utils.readFile(PATH)
    expect(text).toEqual(ALPHABET)
  })

  it("should fail writeFile if file exists", async () => {
    const PATH = `${dir}/alphabet.txt`
    const ALPHABET = "abcdefghijklmnopqrstuvwxyz"

    const chunks = logger.collect(() => {
      utils.writeFile(PATH, ALPHABET)
    })
    expect(chunks).toEqual([$("Write file"), $("Completed")])
    const chunks2 = logger.collect(() => {
      expect(() => utils.writeFile(PATH, ALPHABET)).toThrow(/file exists/)
    })
    expect(chunks2).toEqual([$("Write file"), $("file exists")])
  })
})
