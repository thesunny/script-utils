import promptSync from "prompt-sync"

/**
 * Exposes a `prompt-sync` prompt which executes synchronously where the return
 * value is a `string` that as typed in response to the prompt.
 *
 * The `sigint` option here represents that the user can choose to exit the
 * script by typing `CTRL+C`.
 */
export const prompt = promptSync({ sigint: true })

/**
 * Exit the script immediately.
 *
 * Add a blank line to make output cleaner.
 *
 * NOTE:
 *
 * We elect to exit with `process.exit(1)` which displays an ugly error
 * in order to communicate that the code has exited in a state we don't want.
 *
 * Even though we show the error messages, the ugliness of the different colors
 * is a nice visual indicator that we need to pay attention.
 */
export function exit(): never {
  console.log("")
  process.exit(1)
}
