import { fail, pass, stringify, task } from ".."
import { exec } from "../process"

/**
 * Returns name of current git branch
 */

export function getGitBranch() {
  return exec("git branch --show-current")
}
/**
 * Run a task that asserts that we are on a specific branch like `main`
 */

export function assertGitBranch(expectedBranch: string) {
  task(`Make sure we are on git branch ${stringify(expectedBranch)}`)
  const currentBranch = getGitBranch()
  if (currentBranch !== expectedBranch) {
    fail(`On wrong branch ${stringify(currentBranch)}`)
  } else {
    pass(`Done`)
  }
}
