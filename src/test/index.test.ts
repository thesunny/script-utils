import * as util from ".."
import fs from "fs-extra"
import { assertGitBranch, assertGitClean, prompt } from ".."

/**
 * Mock `prompt-sync`
 *
 * https://stackoverflow.com/questions/61950048/how-to-test-a-linear-node-script-with-jest
 */
jest.mock(
  "prompt-sync",
  () => {
    const prompt = jest.fn()
    return jest.fn(() => prompt)
  },
  { virtual: true }
)

/**
 * DEVELOPER HINTS:
 *
 * - Set `SHOW_CONSOLE` to `true` when developing to see the console output
 * - Set `EMPTY_DIR_AFTER_ALL` to `false` if you are diving into a specific
 *   test and see what's in the directory after running that one test. By
 *   setting it to false, we don't clear the last test result. NOTE: This only
 *   works if you are running one test because we still empty each directory
 *   after starting each test.
 */
const SHOW_CONSOLE = true // default `false`
const EMPTY_DIR_AFTER_ALL = true // default `true`

describe("script-utils", () => {
  /**
   * Replace `console` from jest which includes a small stack trace with the
   * default console.
   *
   * https://stackoverflow.com/questions/56448749/how-can-i-stop-jest-wrapping-console-log-in-test-output
   */
  const jestConsole = console

  let spy: jest.SpyInstance
  let logIndex: number

  beforeAll(() => {
    global.console = require("console")
  })

  beforeEach(() => {
    spy = jest.spyOn(console, "log")
    if (!SHOW_CONSOLE) {
      spy.mockImplementation()
    }
    fs.emptyDirSync(".test")
    logIndex = 0
  })

  afterEach(() => {
    spy.mockRestore()
  })

  afterAll(() => {
    if (EMPTY_DIR_AFTER_ALL) fs.emptyDirSync(".test")
    global.console = jestConsole
  })

  function getLog(index: number = logIndex++) {
    return spy.mock.calls[index][0]
  }

  function getLogs() {
    return spy.mock.calls.map((args) => args[0])
  }

  describe("titles and headings", () => {
    it("should show a multi-line title", async () => {
      util.title(
        "Start unit testing script-utils\nLibrary for build scripts and more"
      )
      const text = getLog()
      expect(text).toMatch(/═/)
      expect(text).toMatch(/║ Start unit testing script-utils[ ]+║/)
      expect(text).toMatch(/║ Library for build scripts and more[ ]+║/)
    })

    it("should show a heading", async () => {
      util.heading("example")
      expect(getLog(0)).toMatch("example")
    })
  })

  describe("output", () => {
    it("should task", async () => {
      util.task("task")
      expect(getLog(0)).toMatch("task")
    })

    it("should message", async () => {
      util.message("message")
      expect(getLog(0)).toMatch("message")
    })

    it("should pass", async () => {
      util.pass("pass")
      expect(getLog(0)).toMatch("pass")
    })

    it("should skip", async () => {
      util.skip("skip")
      expect(getLog(0)).toMatch("skip")
    })

    it("should fail", async () => {
      expect(() => util.fail("fail")).toThrow(/fail/)
    })

    it("should alert", async () => {
      util.alert("Alerting all chickens")
    })
  })

  describe("write, check and read files", () => {
    it("should writeFile, check fileExists, readFile", async () => {
      const PATH = ".test/write-file/alphabet.txt"
      const ALPHABET = "abcdefghijklmnopqrstuvwxyz"

      const beforeFileExists = util.fileExists(PATH)
      expect(beforeFileExists).toEqual(false)

      util.writeFile(PATH, ALPHABET)
      const afterFileExists = util.fileExists(PATH)
      expect(afterFileExists).toEqual(true)
      expect(getLog()).toMatch(/Write file/)
      expect(getLog()).toMatch(/Completed/)

      const text = util.readFile(PATH)
      expect(text).toEqual(ALPHABET)
    })

    it("should fail writeFile if file exists", async () => {
      const PATH = ".test/write-file/alphabet.txt"
      const ALPHABET = "abcdefghijklmnopqrstuvwxyz"

      util.writeFile(PATH, ALPHABET)
      expect(() => util.writeFile(PATH, ALPHABET)).toThrow(/file exists/)
      expect(getLog()).toMatch(/Write file/)
      expect(getLog()).toMatch(/Completed/)
      expect(getLog()).toMatch(/Write file/)
      expect(getLog()).toMatch(/file exists/)
    })
  })

  describe("removeFileIfExists", () => {
    it("should pass if file doesn't exist", async () => {
      const PATH = ".test/src/file-we-cant-remove-because-it-does-not-exist.txt"
      util.removeFileIfExists(PATH)
      expect(getLog()).toMatch(/remove file/i)
      expect(getLog()).toMatch(/file does not exist/i)
    })

    it("should remove a file if it exists", async () => {
      const PATH = ".test/src/remove-file-that-exists.txt"
      util.writeFile(PATH, "hello", { silent: true })
      util.removeFileIfExists(PATH)
      expect(getLog()).toMatch(/remove file/i)
      expect(getLog()).toMatch(/removed/i)
    })

    it("should fail if its a directory", async () => {
      const DIR = ".test/src/dir-that-exists"
      fs.ensureDirSync(DIR)
      expect(() => util.removeFileIfExists(DIR)).toThrow(/not a file/i)
      expect(getLog()).toMatch(/remove file/i)
      expect(getLog()).toMatch(/not a file/i)
    })
  })

  describe("ensureFileExists and ensureFileContains", () => {
    it("should fail ensureFileExists", async () => {
      const PATH = ".test/src/should-fail-ensureFileExists.txt"
      expect(() => util.ensureFileExists(PATH)).toThrow(/File does not exist/)
      expect(getLog()).toMatch(/Ensure file exists/)
      expect(getLog()).toMatch(/File does not exist/)
    })

    it("should pass ensureFileExists", async () => {
      const PATH = ".test/src/should-pass-ensureFileExists.txt"
      util.writeFile(PATH, "abc", { silent: true })
      util.ensureFileExists(PATH)
      expect(getLog()).toMatch(/Ensure file exists/)
      expect(getLog()).toMatch(/Confirmed/)
    })

    it("should fail ensureFileContains", async () => {
      const PATH = ".test/src/alphabet.txt"
      const ALPHABET = "abcdefghijklmnopqrstuvwxyz"
      util.writeFile(PATH, ALPHABET, { silent: true })
      expect(() => util.ensureFileContains(PATH, "hello")).toThrow(
        "File does not contain text"
      )
      expect(getLog()).toMatch(/C/)
      expect(getLog()).toMatch(/File does not contain/)
    })

    it("should pass ensureFileContains with string and RegExp", async () => {
      const PATH = ".test/src/alphabet.txt"
      const ALPHABET = "abcdefghijklmnopqrstuvwxyz"
      util.writeFile(PATH, ALPHABET, { silent: true })

      util.ensureFileContains(PATH, ALPHABET)
      expect(getLog()).toMatch(/Confirm file/)
      expect(getLog()).toMatch(/Confirmed/)

      util.ensureFileContains(PATH, /a.*z/)
      expect(getLog()).toMatch(/Confirm file/)
      expect(getLog()).toMatch(/Confirmed/)
    })
  })

  describe("emptyDir", () => {
    it("should emptyDir", async () => {
      const DIR = ".test/a"
      const PATH_1 = ".test/a/1.txt"
      const PATH_2 = ".test/a/2.txt"
      util.writeFile(PATH_1, "lorem")
      util.writeFile(PATH_2, "lorem")
      expect(util.fileExists(PATH_1)).toEqual(true)
      expect(util.fileExists(PATH_2)).toEqual(true)
      util.emptyDir(DIR)
      expect(util.fileExists(PATH_1)).toEqual(false)
      expect(util.fileExists(PATH_2)).toEqual(false)
    })
  })

  describe("copyDir", () => {
    it("should copyDir", async () => {
      const SRC_DIR = ".test/copy-dir/a"
      const DEST_DIR = ".test/copy-dir/b"
      const SRC_PATH_1 = ".test/copy-dir/a/1.txt"
      const SRC_PATH_2 = ".test/copy-dir/a/2.txt"
      const DEST_PATH_1 = ".test/copy-dir/b/1.txt"
      const DEST_PATH_2 = ".test/copy-dir/b/2.txt"
      util.writeFile(SRC_PATH_1, "lorem", { silent: true })
      util.writeFile(SRC_PATH_2, "lorem", { silent: true })
      util.copyDir(SRC_DIR, DEST_DIR)
      expect(util.fileExists(DEST_PATH_1)).toEqual(true)
      expect(util.fileExists(DEST_PATH_2)).toEqual(true)
      expect(getLog()).toContain(`Copy dir`)
      expect(getLog()).toContain(`Completed`)
    })

    it("should not overwrite on copyDir", async () => {
      const SRC_DIR = ".test/copy-dir-no-overwrite/a"
      const DEST_DIR = ".test/copy-dir-no-overwrite/b"
      const SRC_PATH_1 = ".test/copy-dir-no-overwrite/a/1.txt"
      const SRC_PATH_2 = ".test/copy-dir-no-overwrite/a/2.txt"
      const DEST_PATH_1 = ".test/copy-dir-no-overwrite/b/1.txt"
      util.writeFile(SRC_PATH_1, "lorem", { silent: true })
      util.writeFile(SRC_PATH_2, "lorem", { silent: true })
      util.writeFile(DEST_PATH_1, "lorem", { silent: true })
      expect(() => util.copyDir(SRC_DIR, DEST_DIR)).toThrow("already exists")
      expect(getLog()).toContain(`Copy dir`)
      expect(getLog()).toContain(`already exists`)
    })
  })

  describe("copyFile", () => {
    describe("overwrite=fail (default)", () => {
      it("should copyFile", async () => {
        const SRC_PATH = ".test/copyFile/a/1.txt"
        const DEST_PATH = ".test/copyFile/b/1.txt"
        util.writeFile(SRC_PATH, "lorem", { silent: true })
        expect(util.fileExists(SRC_PATH)).toEqual(true)
        util.copyFile(SRC_PATH, DEST_PATH)
        expect(util.fileExists(DEST_PATH)).toEqual(true)
        expect(getLog()).toContain(`Copy file`)
        expect(getLog()).toContain(`Completed`)
      })

      it("should fail copyFile if dest exists and exists=fail", async () => {
        const SRC_PATH = ".test/copy-file-exists/a/1.txt"
        const DEST_PATH = ".test/copy-file-exists/b/1.txt"
        util.writeFile(SRC_PATH, "src", { silent: true })
        util.writeFile(DEST_PATH, "dest", { silent: true })
        expect(() => util.copyFile(SRC_PATH, DEST_PATH)).toThrow("Copy failed")
        expect(getLog()).toContain(`Copy file `)
        expect(getLog()).toContain(`Copy failed`)
        expect(util.readFile(DEST_PATH)).toEqual("dest")
      })
    })

    describe("exists=overwrite", () => {
      it("should overwrite copyFile if dest exists and exists=overwrite", async () => {
        const SRC_PATH = ".test/copy-file-exists/a/1.txt"
        const DEST_PATH = ".test/copy-file-exists/b/1.txt"
        util.writeFile(SRC_PATH, "src", { silent: true })
        util.writeFile(DEST_PATH, "dest", { silent: true })
        util.copyFile(SRC_PATH, DEST_PATH, { exists: "overwrite" })
        expect(getLog()).toContain(`Copy file `)
        expect(getLog()).toContain(`Overwriting`)
        expect(util.readFile(DEST_PATH)).toEqual("src")
      })
    })

    describe("exists=skip", () => {
      it("should skip copyFile if dest exists and exists=skip", async () => {
        const SRC_PATH = ".test/copy-file-exists/a/1.txt"
        const DEST_PATH = ".test/copy-file-exists/b/1.txt"
        util.writeFile(SRC_PATH, "src", { silent: true })
        util.writeFile(DEST_PATH, "dest", { silent: true })
        util.copyFile(SRC_PATH, DEST_PATH, { exists: "skip" })
        expect(getLog()).toContain(`Copy file `)
        expect(getLog()).toContain(`Skipped it`)
        expect(util.readFile(DEST_PATH)).toEqual("dest")
      })
    })

    describe("exists=ask", () => {
      afterEach(() => {
        jest.clearAllMocks()
        jest.restoreAllMocks()
      })
      afterAll(() => {
        jest.resetAllMocks()
      })

      it("should ask if dest exists and exists=ask y overwrite", async () => {
        const SRC_PATH = ".test/copy-file-exists/a/1.txt"
        const DEST_PATH = ".test/copy-file-exists/b/1.txt"
        util.writeFile(SRC_PATH, "src", { silent: true })
        util.writeFile(DEST_PATH, "dest", { silent: true })
        // @ts-ignore because the type doesn't contain the mock methods
        prompt.mockReturnValueOnce("y")
        util.copyFile(SRC_PATH, DEST_PATH, { exists: "ask" })
        expect(getLog()).toContain(`Copy file `)
        expect(getLog()).toContain(`Showing diff`)
        expect(util.readFile(DEST_PATH)).toEqual("src")
      })

      it("should ask if dest exists and exists=ask n skip", async () => {
        const SRC_PATH = ".test/copy-file-exists/a/1.txt"
        const DEST_PATH = ".test/copy-file-exists/b/1.txt"
        util.writeFile(SRC_PATH, "src", { silent: true })
        util.writeFile(DEST_PATH, "dest", { silent: true })
        // @ts-ignore because the type doesn't contain the mock methods
        prompt.mockReturnValueOnce("n")
        util.copyFile(SRC_PATH, DEST_PATH, { exists: "ask" })
        expect(getLog()).toContain(`Copy file `)
        expect(getLog()).toContain(`Showing diff`)
        expect(util.readFile(DEST_PATH)).toEqual("dest")
      })

      it("should ask if dest exists and exists=ask n skip", async () => {
        const SRC_PATH = ".test/copy-file-exists/a/1.txt"
        const DEST_PATH = ".test/copy-file-exists/b/1.txt"
        util.writeFile(SRC_PATH, "src", { silent: true })
        util.writeFile(DEST_PATH, "dest", { silent: true })
        // @ts-ignore because the type doesn't contain the mock methods
        prompt.mockReturnValueOnce("q")
        expect(() =>
          util.copyFile(SRC_PATH, DEST_PATH, { exists: "ask" })
        ).toThrow("Did not answer y or n")
      })
    })
  })

  describe("replaceInFile", () => {
    it("should replaceInFile", async () => {
      const SRC = ".test/replace-in-file/src.txt"
      const DEST = ".test/replace-in-file/dest.txt"
      const TEXT = `lorem ipsum dolar\nsit amet\nconsecteteur\nlorem ipsum dolar\nsit amet\nconsecteteur`
      const REPLACED_TEXT = `lorem IPSUM dolar\nsit amet\nconsecteteur\nlorem IPSUM dolar\nsit amet\nconsecteteur`
      util.writeFile(SRC, TEXT, { silent: true })
      const x = util.replaceInFile({
        src: SRC,
        dest: DEST,
        find: /(ipsum)/,
        replace(matchData) {
          return matchData[0].toUpperCase()
        },
        count: 2,
      })
      util.ensureFileContains(DEST, REPLACED_TEXT)
      expect(getLog()).toContain(`Replace`)
      expect(getLog()).toContain(`Completed`)
    })

    it("should replaceInFile with find a string", async () => {
      const SRC = ".test/replace-in-file-find-string/src.txt"
      const DEST = ".test/replace-in-file-find-string/dest.txt"
      const TEXT = `lorem ipsum dolar\nsit amet\nconsecteteur\nlorem ipsum dolar\nsit amet\nconsecteteur`
      const REPLACED_TEXT = `lorem IPSUM dolar\nsit amet\nconsecteteur\nlorem IPSUM dolar\nsit amet\nconsecteteur`
      util.writeFile(SRC, TEXT, { silent: true })
      const x = util.replaceInFile({
        src: SRC,
        dest: DEST,
        find: "ipsum",
        replace(matchData) {
          return matchData[0].toUpperCase()
        },
        count: 2,
      })
      util.ensureFileContains(DEST, REPLACED_TEXT)
      expect(getLog()).toContain(`Replace`)
      expect(getLog()).toContain(`Completed`)
    })

    it("should replaceInFile with find a string", async () => {
      const SRC = ".test/replace-in-file-replace-string/src.txt"
      const DEST = ".test/replace-in-file-replace-string/dest.txt"
      const TEXT = `lorem ipsum dolar\nsit amet\nconsecteteur\nlorem ipsum dolar\nsit amet\nconsecteteur`
      const REPLACED_TEXT = `lorem IPSUM dolar\nsit amet\nconsecteteur\nlorem IPSUM dolar\nsit amet\nconsecteteur`
      util.writeFile(SRC, TEXT, { silent: true })
      const x = util.replaceInFile({
        src: SRC,
        dest: DEST,
        find: /(ipsum)/,
        replace: "IPSUM",
        count: 2,
      })
      util.ensureFileContains(DEST, REPLACED_TEXT)
      expect(getLog()).toContain(`Replace`)
      expect(getLog()).toContain(`Completed`)
    })
  })

  describe("processFile", () => {
    it("should processFile", async () => {
      const SRC = ".test/process-file/src.txt"
      const DEST = ".test/process-file/dest.txt"
      const TEXT = `Hello World!`
      const REPLACED_TEXT = `HELLO WORLD!`
      util.writeFile(SRC, TEXT, { silent: true })
      util.processFile(SRC, DEST, (text) => {
        return text.toUpperCase()
      })
      util.ensureFileContains(DEST, REPLACED_TEXT)
      expect(getLog()).toContain(`Process`)
      expect(getLog()).toContain(`Completed`)
    })
  })

  describe("process", () => {
    it("should spawn a command", async () => {
      const result = util.spawn("echo", ["hello", "world"])
      expect(result.stdout).toEqual("hello world\n")
    })

    it("should exec a command", async () => {
      const result = util.exec("echo hello world")
      expect(result).toEqual("hello world")
    })
  })

  describe.only("git", () => {
    it("should get branch", async () => {
      const branch = util.getGitBranch()
      expect(typeof branch).toEqual("string")
      assertGitBranch("main")
      assertGitClean()
    })
  })
})
