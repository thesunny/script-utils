import { exec } from "../process"

/**
 * TODO:
 *
 * This needs a unit test.
 */

/**
 * Takes a left branch and a right branch and returns an array of how many
 * commits are in each branch that do not exist in the other branch.
 *
 * Used as part of `canFastForwardToRight`
 *
 * Note to be exported.
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
 *
 * Returns true if `rightBranch` is strictly ahead of `leftBranch`.
 */

export function canFastForwardToRight(leftBranch: string, rightBranch: string) {
  const [, rightCount] = revListCount(leftBranch, rightBranch)
  return rightCount === 0
}
/**
 * Returns true if `aBranch` is strictly ahead of `bBranch`.
 *
 * This means that there aren't any commits in `bBranch`
 */

export function isGitFastForward() {
  throw new Error("Sorry, this is old. Use canFastForwardToRight instead.")
}
