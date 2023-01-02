import * as utils from "~/src"
import { logger } from "~/src"
import { $ } from "../test-utils"

describe("output", () => {
  it("should show a task", async () => {
    const chunks = logger.collect(() => {
      utils.task("task")
    })
    expect(chunks).toEqual([$("task")])
  })

  it("should message", async () => {
    const chunks = logger.collect(() => {
      utils.message("message")
    })
    expect(chunks).toEqual([$("message")])
  })

  it("should pass", async () => {
    const chunks = logger.collect(() => {
      utils.pass("pass")
    })
    expect(chunks).toEqual([$("pass")])
  })

  it("should skip", async () => {
    const chunks = logger.collect(() => {
      utils.skip("skip")
    })
    expect(chunks).toEqual([$("skip")])
  })

  it("should fail", async () => {
    const chunks = logger.collect(() => {
      expect(() => utils.fail("fail")).toThrow(/fail/)
    })
    expect(chunks).toEqual([$("fail")])
  })

  it("should alert", async () => {
    const chunks = logger.collect(() => {
      utils.alert("Alerting all chickens")
    })
    expect(chunks).toEqual([$("Alerting all chickens")])
  })
})
