#!/usr/bin/env node
import { stringify, task, pass, fail } from "../log"
import { getGitBranch } from "../git"

const [, , expectedBranch] = process.argv as (string | undefined)[]

if (expectedBranch === undefined) {
  fail(`git branch was not specified`, { error: false })
}

task(`Check git branch is ${stringify(expectedBranch)}`)

const currentBranch = getGitBranch()
if (currentBranch === expectedBranch) {
  pass("Done")
} else {
  fail(`Git branch is not ${expectedBranch}`, { error: false })
}
