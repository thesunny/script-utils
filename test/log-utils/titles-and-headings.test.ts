import * as utils from "~/src"
import { logger } from "~/src"

import { $ } from "../test-utils"

describe("titles and headings", () => {
  it("should show a multi-line title", async () => {
    const chunks = logger.collect(() => {
      utils.title(
        "Start unit testing script-utils\nLibrary for build scripts and more"
      )
    })

    expect(chunks).toEqual([$(/║ Start unit testing script-utils[ ]+║/)])
  })

  it("should show a heading", async () => {
    const chunks = logger.collect(() => {
      utils.heading("example")
    })
    expect(chunks).toEqual([$("example")])
  })
})
