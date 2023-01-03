import fs from "fs-extra"

import * as utils from "~/src"
import { logger } from "~/src"

import { $, resetDir } from "../test-utils"

describe("removeFileIfExists", () => {
  const dir = resetDir(__filename)

  it("should pass if file doesn't exist", async () => {
    const PATH = `${dir}/src/file-we-cant-remove-because-it-does-not-exist.txt`
    const chunks = logger.collect(() => {
      utils.removeFileIfExists(PATH)
    })
    expect(chunks).toEqual([$("Remove file"), $("File does not exist")])
  })

  it("should remove a file if it exists", async () => {
    const PATH = `${dir}/src/remove-file-that-exists.txt`
    utils.writeFile(PATH, "hello", { silent: true })

    const chunks = logger.collect(() => {
      utils.removeFileIfExists(PATH)
    })
    expect(chunks).toEqual([$(/remove file/i), $(/removed/i)])
  })

  it("should fail if its a directory", async () => {
    const DIR = `${dir}/src/dir-that-exists`
    fs.ensureDirSync(DIR)
    const chunks = logger.collect(() => {
      expect(() => utils.removeFileIfExists(DIR)).toThrow(/not a file/i)
    })
    expect(chunks).toEqual([$(/remove file/i), $(/not a file/i)])
  })
})
