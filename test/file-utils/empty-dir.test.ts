import fs from "fs-extra"

import * as utils from "~/src"
import { logger } from "~/src"

import { resetDir } from "../test-utils"

describe("empty-dir", () => {
  const dir = resetDir(__filename)

  describe("emptyDir", () => {
    it("should emptyDir", async () => {
      const DIR = `${dir}/a`
      const PATH_1 = `${dir}/a/1.txt`
      const PATH_2 = `${dir}/a/2.txt`
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
      fs.mkdirSync(`${dir}/empty`)
      const exists = utils.fileExists(`${dir}/empty`)
      expect(exists).toEqual(true)
      expect(utils.isEmpty(`${dir}/empty`)).toEqual(true)
    })

    it("should return false if dir exists has content", async () => {
      fs.mkdirSync(`${dir}/not-empty`)
      utils.writeFile(`${dir}/not-empty/a.txt`, "a", { silent: true })
      expect(utils.isEmpty(`${dir}/not-empty`)).toEqual(false)
    })
  })
})
