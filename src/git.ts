import { exec } from "./process"
import { stringify, task, pass, fail } from "."

export function getGitBranch() {
  return exec("git branch --show-current")
}

export function isGitClean() {
  return exec("git status --porcelain").length === 0
}

export function assertGitBranch(expectedBranch: string) {
  task(`Make sure we are on git branch ${stringify(expectedBranch)}`)
  const currentBranch = getGitBranch()
  if (currentBranch !== expectedBranch) {
    fail(`On wrong branch ${stringify(currentBranch)}`)
  } else {
    pass(`Done`)
  }
}

export function assertGitClean() {
  task(`Make sure git repo is clean`)
  if (isGitClean()) {
    pass(`Done`)
  } else {
    fail(`git repo is not clean`)
  }
}
