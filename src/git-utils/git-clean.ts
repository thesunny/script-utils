import { fail,pass, task } from ".."
import { exec } from "../process"

/**
 * Returns true if the current git repository is clean (i.e. there are no
 * outstanding changes or uncommitted but added changes)
 */

export function isGitClean() {
  /**
   * --porcelain returns the git status in a format that is easy to parse.
   *
   * It's empty when things are clean.
   *
   * https://git-scm.com/docs/git-status#Documentation/git-status.txt---porcelainltversiongt
   */
  const porcelain = exec("git status --porcelain")
  return porcelain.length === 0
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
