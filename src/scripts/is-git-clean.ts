#!/usr/bin/env node
import { task, pass, failWithExit } from "../log"
import { isGitClean } from "../git"

task("Check if git is clean")
if (isGitClean()) {
  pass("Done")
} else {
  failWithExit("Git repo is dirty")
}
