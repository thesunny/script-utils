import { findPackagePaths, findPackages } from ".."

describe("findPackageJson", () => {
  it("should find all the package.json files", async () => {
    const packagePaths = findPackagePaths(".")
    /**
     * Should find over 400 node_modules packages
     */
    expect(packagePaths.length > 400).toBe(true)
    expect(packagePaths[0]).toMatch(/^node_modules[/]/)
  })

  it("should load and filter package.json", async () => {
    const packages = findPackages(".")
    const modulePackagePaths = packages
      .filter(([pkg]) => {
        return pkg.type === "module"
      })
      .map(([, path]) => path)
    expect(modulePackagePaths.length < 50).toBe(true)
  })
})
