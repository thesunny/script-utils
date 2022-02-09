import { spawnSync, execSync } from "child_process"

/**
 * Spawn a command to execute.
 *
 * Returns a stream for `stdout` and `stderr`. Allow for putting data into
 * it from `{ value }` in options.
 */
export function spawn(
  cmd: string,
  args: string[],
  { value = "" }: { value?: string } = { value: "" }
): { stdout: string; stderr: string } {
  const result = spawnSync(cmd, args, {
    input: value,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  })
  if (result.status !== 0) {
    throw new Error(result.stderr)
  }
  return result
}

var escapeShell = function (s: string) {
  return '"' + s.replace(/(["'$`\\])/g, "\\$1") + '"'
}

/**
 * Executes a command.
 *
 * Uses a simpler calling method than `spawn`.
 *
 * trim the result for consistency.
 */
export function exec(cmd: string) {
  return execSync(cmd, {
    encoding: "utf8",
  }).trim()
}
