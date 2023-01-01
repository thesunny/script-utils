import UnitLogger from "unit-logger"

/**
 * We create an instance of `UnitLogger` which we use in script-utils.
 *
 * This is useful so that we can:
 *
 * - unit test our own code without dumping our scripting output to the
 *   unit test runner
 * - allows us to do things like silence or collect the logs of script-utils
 *   when script-utils is used as part of another package.
 */
export const logger = UnitLogger()
