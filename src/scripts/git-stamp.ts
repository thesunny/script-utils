#!/usr/bin/env node
import { gitStamp } from ".."
import { fail,pass, task } from "../log-utils"

const [, , prefix] = process.argv as (string | undefined)[]

task("Check for git stamp prefix")
if (prefix === undefined) {
  fail(`Prefix was not specified`, { throwError: false })
} else {
  pass(`Done`)
}

gitStamp(prefix)
