import promptSync from "prompt-sync"

/**
 * Exposes a `prompt-sync` prompt which executes synchronously where the return
 * value is a `string` that as typed in response to the prompt.
 *
 * The `sigint` option here represents that the user can choose to exit the
 * script by typing `CTRL+C`.
 */
export const prompt = promptSync({ sigint: true })
