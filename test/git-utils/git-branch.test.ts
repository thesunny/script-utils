import * as utils from "~/src"
import { logger } from "~/src"

import { $, mockExec } from "../test-utils"

/**
 * NOTE: `test-utils` includes this, but still required in this page.
 */
jest.mock("child_process")

describe("git-branch", () => {
  describe("getGitBranch", () => {
    it("should get the current git branch", async () => {
      mockExec("git branch --show-current", "main")
      const branch = utils.getGitBranch()
      expect(branch).toEqual("main")
    })
  })

  describe("assertGitBranch", () => {
    it("should complete successfully when on the correct branch", async () => {
      mockExec("git branch --show-current", "main")
      const chunks = logger.collect(() => {
        utils.assertGitBranch("main")
      })
      expect(chunks).toEqual([$(/make sure we are on git branch/i), $(/done/i)])
    })

    it("should throw if we are on the wrong branch", async () => {
      mockExec("git branch --show-current", "wrong-branch")
      const chunks = logger.collect(() => {
        expect(() => utils.assertGitBranch("main")).toThrow(/on wrong branch/i)
      })
      expect(chunks).toEqual([
        $(/make sure we are on git branch/i),
        $(/on wrong branch/i),
      ])
    })
  })
})
