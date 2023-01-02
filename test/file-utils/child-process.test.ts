import * as utils from "~/src"

describe("process", () => {
  it("should spawn a command", async () => {
    const result = utils.spawn("echo", ["hello", "world"])
    expect(result.stdout).toEqual("hello world\n")
  })

  it("should exec a command", async () => {
    const result = utils.exec("echo hello world")
    expect(result).toEqual("hello world")
  })
})
