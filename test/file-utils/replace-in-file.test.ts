import * as utils from "~/src"
import { logger } from "~/src"

import { $, resetDir } from "../test-utils"

describe("replaceInFile", () => {
  const dir = resetDir(".temp/replace-in-file")

  it("should replaceInFile", async () => {
    const SRC = `${dir}/replace-in-file/src.txt`
    const DEST = `${dir}/replace-in-file/dest.txt`
    const TEXT = `lorem ipsum dolar\nsit amet\nconsecteteur\nlorem ipsum dolar\nsit amet\nconsecteteur`
    const REPLACED_TEXT = `lorem IPSUM dolar\nsit amet\nconsecteteur\nlorem IPSUM dolar\nsit amet\nconsecteteur`
    utils.writeFile(SRC, TEXT, { silent: true })
    const chunks = logger.collect(() => {
      utils.replaceInFile({
        src: SRC,
        dest: DEST,
        find: /(ipsum)/,
        replace(matchData) {
          return matchData[0].toUpperCase()
        },
        count: 2,
      })
    })
    expect(chunks).toEqual([$("Replace"), $("Completed")])
    logger.silence(() => {
      utils.ensureFileContains(DEST, REPLACED_TEXT)
    })
  })

  it("should replaceInFile with find a string", async () => {
    const SRC = `${dir}/replace-in-file-find-string/src.txt`
    const DEST = `${dir}/replace-in-file-find-string/dest.txt`
    const TEXT = `lorem ipsum dolar\nsit amet\nconsecteteur\nlorem ipsum dolar\nsit amet\nconsecteteur`
    const REPLACED_TEXT = `lorem IPSUM dolar\nsit amet\nconsecteteur\nlorem IPSUM dolar\nsit amet\nconsecteteur`
    utils.writeFile(SRC, TEXT, { silent: true })
    const chunks = logger.collect(() => {
      utils.replaceInFile({
        src: SRC,
        dest: DEST,
        find: "ipsum",
        replace(matchData) {
          return matchData[0].toUpperCase()
        },
        count: 2,
      })
    })
    expect(chunks).toEqual([$("Replace"), $("Completed")])
    logger.silence(() => {
      utils.ensureFileContains(DEST, REPLACED_TEXT)
    })
  })

  it("should replaceInFile with find a string", async () => {
    const SRC = `${dir}/replace-in-file-replace-string/src.txt`
    const DEST = `${dir}/replace-in-file-replace-string/dest.txt`
    const TEXT = `lorem ipsum dolar\nsit amet\nconsecteteur\nlorem ipsum dolar\nsit amet\nconsecteteur`
    const REPLACED_TEXT = `lorem IPSUM dolar\nsit amet\nconsecteteur\nlorem IPSUM dolar\nsit amet\nconsecteteur`
    utils.writeFile(SRC, TEXT, { silent: true })
    const chunks = logger.collect(() => {
      utils.replaceInFile({
        src: SRC,
        dest: DEST,
        find: /(ipsum)/,
        replace: "IPSUM",
        count: 2,
      })
    })
    expect(chunks).toEqual([$("Replace"), $("Completed")])
    logger.silence(() => {
      utils.ensureFileContains(DEST, REPLACED_TEXT)
    })
  })
})
