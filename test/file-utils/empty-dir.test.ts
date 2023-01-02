import { resetDir } from "../test-utils"
import * as utils from "~/src"
import { logger } from "~/src"
import fs from "fs-extra"

describe("empty-dir", () => {
  resetDir()

  describe("emptyDir", () => {
    it("should emptyDir", async () => {
      const DIR = ".test/a"
      const PATH_1 = ".test/a/1.txt"
      const PATH_2 = ".test/a/2.txt"
      logger.silence(() => {
        utils.writeFile(PATH_1, "lorem")
        utils.writeFile(PATH_2, "lorem")
        expect(utils.fileExists(PATH_1)).toEqual(true)
        expect(utils.fileExists(PATH_2)).toEqual(true)
        utils.emptyDir(DIR)
        expect(utils.fileExists(PATH_1)).toEqual(false)
        expect(utils.fileExists(PATH_2)).toEqual(false)
      })
    })
  })

  describe("isEmpty", () => {
    it("should return true if path doesn't exist", async () => {
      const empty = utils.isEmpty("does-not-exist")
      expect(empty).toEqual(true)
    })

    it("should return true if dir exists but is empty", async () => {
      fs.mkdirSync(".test/empty")
      const exists = utils.fileExists(".test/empty")
      expect(exists).toEqual(true)
      expect(utils.isEmpty(".test/empty")).toEqual(true)
    })

    it("should return false if dir exists has content", async () => {
      fs.mkdirSync(".test/not-empty")
      utils.writeFile(".test/not-empty/a.txt", "a", { silent: true })
      expect(utils.isEmpty(".test/not-empty")).toEqual(false)
    })
  })
})
