import * as utils from "~/src"
import { mockExec } from "../test-utils"

/**
 * NOTE: `test-utils` includes this, but still required in this page.
 */
jest.mock("child_process")

describe("isGitClean", () => {
  it("should indicate git is clean", async () => {
    mockExec("git status --porcelain", "")
    const isClean = utils.isGitClean()
    expect(isClean).toBe(true)
  })

  it("should indicate git is dirty", async () => {
    mockExec(
      "git status --porcelain",
      ` D src/git.ts
 M src/test/index.test.ts
?? src/git/`
    )
    const isClean = utils.isGitClean()
    expect(isClean).toBe(false)
  })
})
