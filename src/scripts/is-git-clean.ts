#!/usr/bin/env node
import { task, pass, fail } from "../log"
import { isGitClean } from "../git"

task("Check if git is clean")
if (isGitClean()) {
  pass("Done")
} else {
  fail("Git repo is dirty", { throwError: false })
}
