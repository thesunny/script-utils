import { spawnSync, execSync } from "child_process"

/**
 * Executes a command.
 *
 * Uses a simpler calling method than `spawn`.
 *
 * trim the result for consistency.
 *
 * `silent` option makes it so that the command does not output to the console.
 */
export function exec(
  cmd: string,
  { silent = false }: { silent?: boolean } = { silent: false }
): string {
  /**
   * NOTE: Add 'utf8' to encoding so that `execSync` return type is a string
   */
  const options: Parameters<typeof execSync>[1] & { encoding: "utf8" } = {
    encoding: "utf8",
  }
  if (silent) {
    options.stdio = "pipe"
  }
  return execSync(cmd, options).trim()
}

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
