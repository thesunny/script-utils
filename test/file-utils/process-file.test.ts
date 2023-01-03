import * as utils from "~/src"
import { logger } from "~/src"

import { $, resetDir } from "../test-utils"

describe("processFile", () => {
  resetDir(".test/process-file")

  it("should processFile", async () => {
    const SRC = ".test/process-file/process-file/src.txt"
    const DEST = ".test/process-file/process-file/dest.txt"
    const TEXT = `Hello World!`
    const REPLACED_TEXT = `HELLO WORLD!`
    utils.writeFile(SRC, TEXT, { silent: true })
    const chunks = logger.collect(() => {
      utils.processFile(SRC, DEST, (text) => {
        return text.toUpperCase()
      })
    })
    expect(chunks).toEqual([$("Process"), $("Completed")])
    logger.silence(() => {
      utils.ensureFileContains(DEST, REPLACED_TEXT)
    })
  })
})
