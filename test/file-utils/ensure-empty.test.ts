import fs from "fs-extra"

import * as utils from "~/src"
import { logger } from "~/src"

import { $, resetDir } from "../test-utils"

describe("ensureEmpty", () => {
  resetDir(".test/ensure-empty")
  it("should ensureEmpty pass", async () => {
    fs.mkdirSync(".test/ensure-empty/ensure-empty")
    const chunks = logger.collect(() => {
      utils.ensureEmpty(".test/ensure-empty/ensure-empty")
    })
    expect(chunks).toEqual([$(/ensure path.*is empty/i), $("Confirmed")])
  })

  it("should ensureEmpty fail", async () => {
    fs.mkdirSync(".test/ensure-empty/ensure-empty-fail")
    utils.writeFile(".test/ensure-empty/ensure-empty-fail/a.txt", "a", {
      silent: true,
    })
    const chunks = logger.collect(() => {
      expect(() =>
        utils.ensureEmpty(".test/ensure-empty/ensure-empty-fail")
      ).toThrow(/path is not empty/i)
    })
    expect(chunks).toEqual([
      $(/ensure path.*is empty/i),
      $(/path is not empty/i),
    ])
  })
})
