import * as utils from "~/src"
import { logger } from "~/src"
import { $ } from "../test-utils"

// jest.mock("child_process")

describe("git tags", () => {
  it("should get, add and remove git tags", async () => {
    const tempTag = "temp-git-tag-for-testing"
    const chunks = logger.collect(() => {
      utils.removeGitTag(tempTag, { skipCheck: true, silentNotFound: true })
      utils.addGitTag(tempTag, "Temporary git tag for testing", {
        skipCheck: true,
      })
      const tags = utils.getGitHeadTags()
      expect(tags).toContain(tempTag)

      utils.removeGitTag(tempTag, { skipCheck: true })
      const tags2 = utils.getGitHeadTags()
      expect(tags2).not.toContain(tempTag)
    })
    expect(chunks).toEqual([
      $("Remove git tag"),
      $(""),
      $("Add git tag"),
      $("Done"),
      $("Remove git tag"),
    ])
  })
})
