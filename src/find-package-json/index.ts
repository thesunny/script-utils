import fs from "fs-extra"
import { globbySync } from "globby"
import { PackageJson } from "type-fest"

/**
 * Based on code from Chat GPT! Amazingly, just add types, and it works.
 */
export function findPackagePaths(cwd: string) {
  const paths = globbySync(
    ["node_modules/*/package.json", "node_modules/@*/*/package.json"],
    { cwd }
  )
  return paths
}

type PackageEntry = [PackageJson, string]

export function findPackages(cwd: string): PackageEntry[] {
  const paths = findPackagePaths(cwd).filter((path) => {
    const parts = path.split("/")
    if (parts[1].startsWith("@")) {
      return parts.length === 4
    } else {
      return parts.length === 3
    }
  })

  return paths.map((path) => {
    const text = fs.readFileSync(path, "utf-8")
    const pkg: PackageJson = JSON.parse(text)
    return [pkg, path] as [PackageJson, string]
  })
}
