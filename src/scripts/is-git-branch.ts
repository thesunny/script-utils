#!/usr/bin/env node
import { stringify, task, pass, failWithExit } from "../log"
import { getGitBranch } from "../git"

const [, , expectedBranch] = process.argv as (string | undefined)[]

if (expectedBranch === undefined) {
  failWithExit(`git branch was not specified`)
}

task(`Check git branch is ${stringify(expectedBranch)}`)

const currentBranch = getGitBranch()
if (currentBranch === expectedBranch) {
  pass("Done")
} else {
  failWithExit(`Git branch is not ${expectedBranch}`)
}
