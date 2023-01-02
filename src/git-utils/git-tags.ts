import { pass, skip, task } from ".."
import { exec } from "../process"
import { assertGitClean } from "./git-clean"

/**
 * Add a git tag with the given message to the repo at the current commit.
 *
 * Make sure the repo is clean unless `skipCheck` is true
 */
export function addGitTag(
  tag: string,
  message: string,
  { skipCheck = false }: { skipCheck?: boolean } = {}
) {
  if (!skipCheck) {
    assertGitClean()
  }
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

/**
 * Remove a git tag from the repo.
 *
 * Make sure the repo is clean unless `skipCheck` is true
 */
export function removeGitTag(
  tag: string,
  {
    skipCheck = false,
    silentNotFound = false,
  }: { skipCheck?: boolean; silentNotFound?: boolean } = {}
): boolean {
  if (!skipCheck) {
    assertGitClean()
  }
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

/**
 * List all the tags in the repository returned as an array of string.
 */
export function getAllGitTags(): string[] {
  return exec("git tag").split("\n")
}

/**
 * In Git, a tag is a label that is used to identify a specific version of a
 * repository. The git tag command allows you to create, list, delete, or verify
 * tags. The --points-at option allows you to specify a commit that a tag should
 * point to.
 *
 * So, if you run git tag --points-at HEAD, it will create a new tag that points
 * to the commit that is currently checked out (i.e., the commit that is at the
 * "HEAD" of the repository). This can be useful if you want to mark a specific
 * version of the repository, for example, to indicate a release version.
 *
 * Note that this command will not create a tag if a tag with the same name
 * already exists. If you want to overwrite an existing tag, you can use the -f
 * option. For example, git tag -f mytag --points-at HEAD will create a new tag
 * called "mytag" that points to the current commit, overwriting any existing
 * tag with the same name.
 */
export function getGitHeadTags(): string[] {
  return exec("git tag --points-at HEAD").split("\n")
}
