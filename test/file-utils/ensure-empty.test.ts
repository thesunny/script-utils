import fs from "fs-extra"

import * as utils from "~/src"
import { logger } from "~/src"

import { $, resetDir } from "../test-utils"

describe("ensureEmpty", () => {
  const dir = resetDir(__filename)
  it("should ensureEmpty pass", async () => {
    fs.mkdirSync(`${dir}/ensure-empty`)
    const chunks = logger.collect(() => {
      utils.ensureEmpty(`${dir}/ensure-empty`)
    })
    expect(chunks).toEqual([$(/ensure path.*is empty/i), $("Confirmed")])
  })

  it("should ensureEmpty fail", async () => {
    fs.mkdirSync(`${dir}/ensure-empty-fail`)
    utils.writeFile(`${dir}/ensure-empty-fail/a.txt`, "a", {
      silent: true,
    })
    const chunks = logger.collect(() => {
      expect(() => utils.ensureEmpty(`${dir}/ensure-empty-fail`)).toThrow(
        /path is not empty/i
      )
    })
    expect(chunks).toEqual([
      $(/ensure path.*is empty/i),
      $(/path is not empty/i),
    ])
  })
})
