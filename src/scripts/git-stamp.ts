#!/usr/bin/env node
import { task, pass, fail } from "../log"
import { gitStamp } from ".."

const [, , prefix] = process.argv as (string | undefined)[]

task("Check for git stamp prefix")
if (prefix === undefined) {
  fail(`Prefix was not specified`, { throwError: false })
} else {
  pass(`Done`)
}

gitStamp(prefix)
