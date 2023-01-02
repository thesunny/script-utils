#!/usr/bin/env node
import { isGitClean } from ".."
import { fail, pass, task } from "../log-utils"

task("Check if git is clean")
if (isGitClean()) {
  pass("Done")
} else {
  fail("Git repo is dirty", { throwError: false })
}
