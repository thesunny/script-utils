import { exec } from "./process"
import { stringify, task, pass, fail } from "."

/**
 * Returns name of current git branch
 */
export function getGitBranch() {
  return exec("git branch --show-current")
}

/**
 * Returns true if the current git repository is clean (i.e. there are no
 * outstanding changes or uncommitted but added changes)
 */
export function isGitClean() {
  return exec("git status --porcelain").length === 0
}

/**
 * Run a task that asserts that we are on a specific branch like `main` or `master`
 */
export function assertBranch(expectedBranch: string) {
  task(`Make sure we are on git branch ${stringify(expectedBranch)}`)
  const currentBranch = getGitBranch()
  if (currentBranch !== expectedBranch) {
    fail(`On wrong branch ${stringify(currentBranch)}`)
  } else {
    pass(`Done`)
  }
}

/**
 * Run a task that assert that the git repo is clean using `isGitClean`.
 */
export function assertGitClean() {
  task(`Make sure git repo is clean`)
  if (isGitClean()) {
    pass(`Done`)
  } else {
    fail(`git repo is not clean`)
  }
}

/**
 * Takes a left branch and a right branch and returns an array of how many
 * commits are in each branch that do not exist in the other branch.
 */
function revListCount(
  leftBranch: string,
  rightBranch: string
): [number, number] {
  const [leftCommitCount, rightCommitCount] = exec(
    `git rev-list --left-right --count ${leftBranch}...${rightBranch}`
  )
    .split("\t")
    .map((s) => parseInt(s))
  return [leftCommitCount, rightCommitCount]
}

/**
 * Takes two branches and if the branch on the right can be fast forwarded
 * from the one on the left, return true.
 */
export function canFastForwardToRight(leftBranch: string, rightBranch: string) {
  const [leftCount, rightCount] = revListCount(leftBranch, rightBranch)
  return rightCount === 0
}

/**
 * Returns true if `aBranch` is strictly ahead of `bBranch`.
 *
 * This means that there aren't any commits in `bBranch`
 */
export function isGitFastForward(aBranch: string, bBranch: string) {
  const [leftCount, rightCount] = revListCount(aBranch, bBranch)
  if (rightCount === 0) {
    return true
  } else {
    return false
  }
}
