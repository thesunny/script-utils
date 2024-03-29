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
