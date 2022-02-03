import * as utils from "../src"

utils.title("Copy File Example")

utils.heading("Scaffold")
utils.emptyDir(".examples")
utils.writeFile(".examples/copy-file/a.txt", "alpha")
utils.writeFile(".examples/copy-file/a1.txt", "alpha")
utils.writeFile(".examples/copy-file/b.txt", "bravo")
utils.writeFile(".examples/copy-file/abc.txt", "alpha\nbravo\ncharlie")

utils.heading("Copy should fail")
try {
  utils.copyFile(".examples/copy-file/a.txt", ".examples/copy-file/b.txt")
  utils.fail("Did not throw error but should have")
} catch (e) {
  if (`${e}`.includes("dest path exists")) {
    utils.pass("Successfully threw an error!")
  } else {
    utils.fail(`Threw the wrong error: ${e}`)
  }
}

utils.heading("Copy and overwrite")
utils.copyFile(".examples/copy-file/a.txt", ".examples/copy-file/b.txt", {
  exists: "overwrite",
})

utils.heading("Copy but they are the same so do nothing")
utils.copyFile(".examples/copy-file/a.txt", ".examples/copy-file/b.txt", {
  exists: "ask",
})

utils.heading("Copy but they differ so ask")
utils.copyFile(".examples/copy-file/a.txt", ".examples/copy-file/abc.txt", {
  exists: "ask",
})
