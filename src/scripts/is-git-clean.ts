#!/usr/bin/env node
import * as utils from ".."

utils.task("Check if git is clean")
if (utils.isGitClean()) {
  utils.pass("Done")
} else {
  utils.fail("Git repo is dirty")
}
