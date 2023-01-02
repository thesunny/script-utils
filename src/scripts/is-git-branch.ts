#!/usr/bin/env node
import { stringify, task, pass, fail } from "../log-utils"
import { getGitBranch } from ".."

const [, , expectedBranch] = process.argv as (string | undefined)[]

if (expectedBranch === undefined) {
  fail(`git branch was not specified`, { throwError: false })
}

task(`Check git branch is ${stringify(expectedBranch)}`)

const currentBranch = getGitBranch()
if (currentBranch === expectedBranch) {
  pass("Done")
} else {
  fail(`Git branch is not ${expectedBranch}`, { throwError: false })
}
