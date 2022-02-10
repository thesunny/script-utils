import chalk from "chalk"
/**
 * For internal use. Create a Log method that uses a chalk function for styling.
 */
function Log(ch: chalk.Chalk) {
  return function (text: string) {
    console.log(ch(text))
  }
}

/**
 * Shortcut prespecified log methods with a chalk function for color.
 */
const log = {
  title: Log(chalk.yellowBright),
  heading: Log(chalk.yellowBright),
  task: Log(chalk.yellow),
  message: Log(chalk.hex("#c0c0a0")),
  alert: Log(chalk.hex("FF9010")),
  pass: Log(chalk.greenBright),
  skip: Log(chalk.hex("#006000")),
  fail: Log(chalk.redBright),
}

export function task(text: string) {
  log.task(`${chalk.hex("#606000")("∙")} ${text}`)
}

/**
 * Shortcut `pass` method with a checkmark
 */
export function pass(text: string) {
  // log.pass(`  ✓ ${text}\n`)
  log.pass(`  ✓ ${text}\n`)
}

/**
 * Shortcut `skip` method with a dimmer checkmark
 */
export function skip(text: string) {
  log.skip(`  ✓ ${text}\n`)
}

export function message(text: string) {
  log.message(`  ${text.split("\n").join("\n  ")}\n`)
}

export function alert(text: string) {
  log.alert(`🔥 ${text.split("\n").join("\n  ")}\n`)
}

export function failWithExit(value: string): never {
  log.fail(`  ✕ ${value}\n`)
  process.exit(1)
}

/**
 * Shortcut `fail` method that logs with an "x" and then throws the value to
 * stop script from continuing.
 */
export function fail(value: string | unknown): never {
  log.fail(`  ✕ ${value}\n`)
  if (typeof value === "string") {
    throw new Error(value)
  } else {
    throw value
  }
}

/**
 * Pretty Print a `string` or `RegExp` value
 */
export function stringify(value: string | RegExp) {
  if (typeof value === "string") {
    return chalk.yellowBright(JSON.stringify(value))
  } else {
    return chalk.yellowBright(`${value}`)
  }
}

/**
 * Display a section heading in the script
 */
export function title(text: string) {
  const lines = text.split("\n")
  const maxLength = Math.max(...lines.map((line) => line.length))
  log.title(
    `\n╔${"═".repeat(maxLength + 2)}╗\n${lines
      .map((line) => `║ ${line.padEnd(maxLength)} ║`)
      .join("\n")}\n╚${"═".repeat(maxLength + 2)}╝\n`
  )
}

/**
 * Display a section heading in the script
 */
export function heading(text: string) {
  log.heading(chalk.underline(`\n${text}\n`))
}
