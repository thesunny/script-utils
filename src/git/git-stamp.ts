import { addGitTag } from "./git-tags"

/**
 * Takes in an argument that lets us name the timestamp with a prefix, and
 * then returns a timestamp in a format like this:
 *
 * `something.2022-11-31.17-03-17.PST`
 *
 * You can also set the argument to an empty string in which case it returns a
 * timestamp like this:
 *
 * `2022-11-31.17-03-17.PST`
 *
 * We require the argument so that we have to be explicit that we want an
 * unnamed timestamp. This is to encourage the best practice that a timestamp
 * for a while should carry a prefix because it helps us disambiguate this
 * timestamp against potentially other timestamps that already exist or may
 * come in the future.
 */

export function getTimestamp(s: string) {
  const at = new Date()
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

export function gitStamp(s: string, options?: Parameters<typeof addGitTag>[2]) {
  const tag = getTimestamp(s)
  addGitTag(tag, tag, options)
  return tag
}
