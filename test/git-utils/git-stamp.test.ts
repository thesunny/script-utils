import * as utils from "~/src"
import { logger } from "~/src"

import { $ } from "../test-utils"

describe("git", () => {
  describe("timestamp", () => {
    it("should get a named timestamp", async () => {
      const stamp = utils.getTimestamp("dev")
      expect(stamp).toMatch(/^dev[.][^.]*[.][^.]*[.][^.]*$/)
    })

    it("should get an unnamed timestamp", async () => {
      const stamp = utils.getTimestamp("")
      expect(stamp).toMatch(/^[^.]*[.][^.]*[.][^.]*$/)
    })

    it("should git stamp", async () => {
      const chunks = logger.collect(() => {
        const tag = utils.gitStamp("temp", { skipCheck: true })
        const tags = utils.getGitHeadTags()
        expect(tags).toContain(tag)
        utils.removeGitTag(tag, { skipCheck: true })
        const tags2 = utils.getGitHeadTags()
        expect(tags2).not.toContain(tag)
      })
      expect(chunks).toEqual([$("Add git tag"), $("Done"), $("Remove git tag")])
    })
  })
})
