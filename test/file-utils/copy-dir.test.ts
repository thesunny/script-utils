import * as utils from "~/src"
import { logger } from "~/src"

import { $, resetDir } from "../test-utils"

describe("copyDir", () => {
  resetDir()
  // resetDir(".test/copy-dir")
  // resetDir(".test/copy-dir-no-overwrite")

  it("should copyDir", async () => {
    const SRC_DIR = ".test/copy-dir/a"
    const DEST_DIR = ".test/copy-dir/b"
    const SRC_PATH_1 = ".test/copy-dir/a/1.txt"
    const SRC_PATH_2 = ".test/copy-dir/a/2.txt"
    const DEST_PATH_1 = ".test/copy-dir/b/1.txt"
    const DEST_PATH_2 = ".test/copy-dir/b/2.txt"
    utils.writeFile(SRC_PATH_1, "lorem", { silent: true })
    utils.writeFile(SRC_PATH_2, "lorem", { silent: true })
    const chunks = logger.collect(() => {
      utils.copyDir(SRC_DIR, DEST_DIR)
      expect(utils.fileExists(DEST_PATH_1)).toEqual(true)
      expect(utils.fileExists(DEST_PATH_2)).toEqual(true)
    })
    expect(chunks).toEqual([$("Copy dir"), $("Completed")])
  })

  it("should not overwrite on copyDir", async () => {
    const SRC_DIR = ".test/copy-dir-no-overwrite/a"
    const DEST_DIR = ".test/copy-dir-no-overwrite/b"
    const SRC_PATH_1 = ".test/copy-dir-no-overwrite/a/1.txt"
    const SRC_PATH_2 = ".test/copy-dir-no-overwrite/a/2.txt"
    const DEST_PATH_1 = ".test/copy-dir-no-overwrite/b/1.txt"
    utils.writeFile(SRC_PATH_1, "lorem", { silent: true })
    utils.writeFile(SRC_PATH_2, "lorem", { silent: true })
    utils.writeFile(DEST_PATH_1, "lorem", { silent: true })
    const chunks = logger.collect(() => {
      expect(() => utils.copyDir(SRC_DIR, DEST_DIR)).toThrow("already exists")
    })
    expect(chunks).toEqual([$("Copy dir"), $("already exists")])
  })
})
