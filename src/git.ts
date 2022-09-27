import { exec } from "./process"
import { stringify, task, pass, skip, fail } from "."

/**
 * Returns name of current git branch
 */
export function getGitBranch() {
  return exec("git branch --show-current")
}

export function addGitTag(tag: string, message: string) {
  assertGitClean()
  task(`Add git tag ${tag}`)
  /**
   * Tag name constraints
   * https://stackoverflow.com/questions/26382234/what-names-are-valid-git-tags
   */
  if (tag.includes('"')) throw new Error(`Tag must not contain a double quote`)
  if (tag.endsWith(".")) throw new Error(`Tag must not end in a .`)
  exec(`git tag -a "${tag}" -m "${message}"`)
  pass(`Done`)
}

export function removeGitTag(
  tag: string,
  { silentNotFound = false }: { silentNotFound: boolean } = {
    silentNotFound: false,
  }
): boolean {
  task(`Remove git tag ${tag}`)
  if (silentNotFound) {
    try {
      exec(`git tag -d "${tag}"`, { silent: true })
      pass("Done")
      return true
    } catch (e) {
      if (`${e}`.includes("not found")) {
        skip(`Tag not found skipping`)
        return false
      } else {
        throw e
      }
    }
  } else {
    exec(`git tag -d "${tag}"`)
    return true
  }
}

export function getGitHeadTags() {
  return exec("git tag --points-at HEAD").split("\n")
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
export function assertGitBranch(expectedBranch: string) {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_leftCount, rightCount] = revListCount(leftBranch, rightBranch)
  return rightCount === 0
}

/**
 * Returns true if `aBranch` is strictly ahead of `bBranch`.
 *
 * This means that there aren't any commits in `bBranch`
 */
export function isGitFastForward(aBranch: string, bBranch: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_leftCount, rightCount] = revListCount(aBranch, bBranch)
  if (rightCount === 0) {
    return true
  } else {
    return false
  }
}

export function getTimestamp(s: string) {
  const at = new Date()

  // const date = at.toLocaleString("en-US", {
  //   year: "numeric",
  //   month: "2-digit",
  //   day: "2-digit",
  // })
  // const time = at.toLocaleTimeString("en-US", {
  //   hour12: false,
  //   hour: "2-digit",
  //   minute: "2-digit",
  //   second: "2-digit",
  //   timeZoneName: "short",
  // })
  const month = `0${at.getMonth()}`.slice(-2)
  const day = `0${at.getDate()}`.slice(-2)
  const hours = `0${at.getHours()}`.slice(-2)
  const minutes = `0${at.getMinutes()}`.slice(-2)
  const seconds = `0${at.getHours()}`.slice(-2)

  const timezone = new Date()
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .split(" ")[2]

  const prefix = s.length == 0 ? "" : `${s}.`

  return `${prefix}${at.getFullYear()}-${month}-${day}.${hours}-${minutes}-${seconds}.${timezone}`
}

export function gitStamp(s: string) {
  const tag = getTimestamp(s)
  addGitTag(tag, tag)
  return tag
}
