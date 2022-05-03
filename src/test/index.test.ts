import * as util from ".."
import fs from "fs-extra"
import { assertGitBranch, assertGitClean, prompt, removeGitTag } from ".."
import { logger } from "../logger"

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

function $(s: string | RegExp) {
  return expect.stringMatching(s)
}

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
  beforeEach(() => {
    fs.emptyDirSync(".test")
  })

  afterAll(() => {
    if (EMPTY_DIR_AFTER_ALL) fs.emptyDirSync(".test")
  })

  describe("titles and headings", () => {
    it("should show a multi-line title", async () => {
      const chunks = logger.collect(() => {
        util.title(
          "Start unit testing script-utils\nLibrary for build scripts and more"
        )
      })

      expect(chunks).toEqual([$(/║ Start unit testing script-utils[ ]+║/)])
    })

    it("should show a heading", async () => {
      const chunks = logger.collect(() => {
        util.heading("example")
      })
      expect(chunks).toEqual([$("example")])
    })
  })

  describe("output", () => {
    it("should show a task", async () => {
      const chunks = logger.collect(() => {
        util.task("task")
      })
      expect(chunks).toEqual([$("task")])
    })

    it("should message", async () => {
      const chunks = logger.collect(() => {
        util.message("message")
      })
      expect(chunks).toEqual([$("message")])
    })

    it("should pass", async () => {
      const chunks = logger.collect(() => {
        util.pass("pass")
      })
      expect(chunks).toEqual([$("pass")])
    })

    it("should skip", async () => {
      const chunks = logger.collect(() => {
        util.skip("skip")
      })
      expect(chunks).toEqual([$("skip")])
    })

    it("should fail", async () => {
      const chunks = logger.collect(() => {
        expect(() => util.fail("fail")).toThrow(/fail/)
      })
      expect(chunks).toEqual([$("fail")])
    })

    it("should alert", async () => {
      const chunks = logger.collect(() => {
        util.alert("Alerting all chickens")
      })
      expect(chunks).toEqual([$("Alerting all chickens")])
    })
  })

  describe("write, check and read files", () => {
    it("should writeFile, check fileExists, readFile", async () => {
      const PATH = ".test/write-file/alphabet.txt"
      const ALPHABET = "abcdefghijklmnopqrstuvwxyz"

      const beforeFileExists = util.fileExists(PATH)
      expect(beforeFileExists).toEqual(false)

      const chunks = logger.collect(() => {
        util.writeFile(PATH, ALPHABET)
      })
      expect(chunks).toEqual([$("Write file"), $("Completed")])

      const afterFileExists = util.fileExists(PATH)
      expect(afterFileExists).toEqual(true)

      const text = util.readFile(PATH)
      expect(text).toEqual(ALPHABET)
    })

    it("should fail writeFile if file exists", async () => {
      const PATH = ".test/write-file/alphabet.txt"
      const ALPHABET = "abcdefghijklmnopqrstuvwxyz"

      const chunks = logger.collect(() => {
        util.writeFile(PATH, ALPHABET)
      })
      expect(chunks).toEqual([$("Write file"), $("Completed")])
      const chunks2 = logger.collect(() => {
        expect(() => util.writeFile(PATH, ALPHABET)).toThrow(/file exists/)
      })
      expect(chunks2).toEqual([$("Write file"), $("file exists")])
    })
  })

  describe("removeFileIfExists", () => {
    it("should pass if file doesn't exist", async () => {
      const PATH = ".test/src/file-we-cant-remove-because-it-does-not-exist.txt"
      const chunks = logger.collect(() => {
        util.removeFileIfExists(PATH)
      })
      expect(chunks).toEqual([$("Remove file"), $("File does not exist")])
    })

    it("should remove a file if it exists", async () => {
      const PATH = ".test/src/remove-file-that-exists.txt"
      util.writeFile(PATH, "hello", { silent: true })

      const chunks = logger.collect(() => {
        util.removeFileIfExists(PATH)
      })
      expect(chunks).toEqual([$(/remove file/i), $(/removed/i)])
    })

    it("should fail if its a directory", async () => {
      const DIR = ".test/src/dir-that-exists"
      fs.ensureDirSync(DIR)
      const chunks = logger.collect(() => {
        expect(() => util.removeFileIfExists(DIR)).toThrow(/not a file/i)
      })
      expect(chunks).toEqual([$(/remove file/i), $(/not a file/i)])
    })
  })

  describe("ensureFileExists and ensureFileContains", () => {
    it("should fail ensureFileExists", async () => {
      const PATH = ".test/src/should-fail-ensureFileExists.txt"
      const chunks = logger.collect(() => {
        expect(() => util.ensureFileExists(PATH)).toThrow(/File does not exist/)
      })
      expect(chunks).toEqual([
        $(/Ensure file exists/),
        $(/File does not exist/),
      ])
    })

    it("should pass ensureFileExists", async () => {
      const PATH = ".test/src/should-pass-ensureFileExists.txt"
      util.writeFile(PATH, "abc", { silent: true })

      const chunks = logger.collect(() => {
        util.ensureFileExists(PATH)
      })
      expect(chunks).toEqual([$(/Ensure file exists/), $(/Confirmed/)])
    })

    it("should fail ensureFileContains", async () => {
      const PATH = ".test/src/alphabet.txt"
      const ALPHABET = "abcdefghijklmnopqrstuvwxyz"
      util.writeFile(PATH, ALPHABET, { silent: true })
      const chunks = logger.collect(() => {
        expect(() => util.ensureFileContains(PATH, "hello")).toThrow(
          "File does not contain text"
        )
      })
      expect(chunks).toEqual([$(/C/), $(/File does not contain/)])
    })

    it("should pass ensureFileContains with string and RegExp", async () => {
      const PATH = ".test/src/alphabet.txt"
      const ALPHABET = "abcdefghijklmnopqrstuvwxyz"
      util.writeFile(PATH, ALPHABET, { silent: true })

      const chunks = logger.collect(() => {
        util.ensureFileContains(PATH, ALPHABET)
      })
      expect(chunks).toEqual([$(/Confirm file/), $(/Confirmed/)])

      const chunks2 = logger.collect(() => {
        util.ensureFileContains(PATH, /a.*z/)
      })
      expect(chunks2).toEqual([$(/Confirm file/), $(/Confirmed/)])
    })
  })

  describe("emptyDir", () => {
    it("should emptyDir", async () => {
      const DIR = ".test/a"
      const PATH_1 = ".test/a/1.txt"
      const PATH_2 = ".test/a/2.txt"
      logger.silence(() => {
        util.writeFile(PATH_1, "lorem")
        util.writeFile(PATH_2, "lorem")
        expect(util.fileExists(PATH_1)).toEqual(true)
        expect(util.fileExists(PATH_2)).toEqual(true)
        util.emptyDir(DIR)
        expect(util.fileExists(PATH_1)).toEqual(false)
        expect(util.fileExists(PATH_2)).toEqual(false)
      })
    })
  })

  describe("isEmpty", () => {
    it("should return true if path doesn't exist", async () => {
      const empty = util.isEmpty("does-not-exist")
      expect(empty).toEqual(true)
    })

    it("should return true if dir exists but is empty", async () => {
      fs.mkdirSync(".test/empty")
      const exists = util.fileExists(".test/empty")
      expect(exists).toEqual(true)
      expect(util.isEmpty(".test/empty")).toEqual(true)
    })

    it("should return false if dir exists has content", async () => {
      fs.mkdirSync(".test/not-empty")
      util.writeFile(".test/not-empty/a.txt", "a", { silent: true })
      expect(util.isEmpty(".test/not-empty")).toEqual(false)
    })
  })

  describe("ensureEmpty", () => {
    it("should ensureEmpty pass", async () => {
      fs.mkdirSync(".test/ensure-empty")
      const chunks = logger.collect(() => {
        util.ensureEmpty(".test/ensure-empty")
      })
      expect(chunks).toEqual([$(/ensure path.*is empty/i), $("Confirmed")])
    })

    it("should ensureEmpty fail", async () => {
      fs.mkdirSync(".test/ensure-empty-fail")
      util.writeFile(".test/ensure-empty-fail/a.txt", "a", { silent: true })
      const chunks = logger.collect(() => {
        expect(() => util.ensureEmpty(".test/ensure-empty-fail")).toThrow(
          /path is not empty/i
        )
      })
      expect(chunks).toEqual([
        $(/ensure path.*is empty/i),
        $(/path is not empty/i),
      ])
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
      const chunks = logger.collect(() => {
        util.copyDir(SRC_DIR, DEST_DIR)
        expect(util.fileExists(DEST_PATH_1)).toEqual(true)
        expect(util.fileExists(DEST_PATH_2)).toEqual(true)
      })
      expect(chunks).toEqual([$("Copy dir"), $("Completed")])
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
      const chunks = logger.collect(() => {
        expect(() => util.copyDir(SRC_DIR, DEST_DIR)).toThrow("already exists")
      })
      expect(chunks).toEqual([$("Copy dir"), $("already exists")])
    })
  })

  describe("copyFile", () => {
    describe("overwrite=fail (default)", () => {
      it("should copyFile", async () => {
        const SRC_PATH = ".test/copyFile/a/1.txt"
        const DEST_PATH = ".test/copyFile/b/1.txt"
        util.writeFile(SRC_PATH, "lorem", { silent: true })
        expect(util.fileExists(SRC_PATH)).toEqual(true)
        const chunks = logger.collect(() => {
          util.copyFile(SRC_PATH, DEST_PATH)
          expect(util.fileExists(DEST_PATH)).toEqual(true)
        })
        expect(chunks).toEqual([$("Copy file"), $("Completed")])
      })

      it("should fail copyFile if dest exists and exists=fail", async () => {
        const SRC_PATH = ".test/copy-file-exists/a/1.txt"
        const DEST_PATH = ".test/copy-file-exists/b/1.txt"
        util.writeFile(SRC_PATH, "src", { silent: true })
        util.writeFile(DEST_PATH, "dest", { silent: true })
        const chunks = logger.collect(() => {
          expect(() => util.copyFile(SRC_PATH, DEST_PATH)).toThrow(
            "Copy failed"
          )
        })
        expect(chunks).toEqual([$("Copy file "), $("Copy failed")])
        expect(util.readFile(DEST_PATH)).toEqual("dest")
      })
    })

    describe("exists=overwrite", () => {
      it("should overwrite copyFile if dest exists and exists=overwrite", async () => {
        const SRC_PATH = ".test/copy-file-exists/a/1.txt"
        const DEST_PATH = ".test/copy-file-exists/b/1.txt"
        util.writeFile(SRC_PATH, "src", { silent: true })
        util.writeFile(DEST_PATH, "dest", { silent: true })
        const chunks = logger.collect(() => {
          util.copyFile(SRC_PATH, DEST_PATH, { exists: "overwrite" })
        })
        expect(chunks).toEqual([$("Copy file "), $("Overwriting")])
        expect(util.readFile(DEST_PATH)).toEqual("src")
      })
    })

    describe("exists=skip", () => {
      it("should skip copyFile if dest exists and exists=skip", async () => {
        const SRC_PATH = ".test/copy-file-exists/a/1.txt"
        const DEST_PATH = ".test/copy-file-exists/b/1.txt"
        util.writeFile(SRC_PATH, "src", { silent: true })
        util.writeFile(DEST_PATH, "dest", { silent: true })
        const chunks = logger.collect(() => {
          util.copyFile(SRC_PATH, DEST_PATH, { exists: "skip" })
        })
        expect(chunks).toEqual([$("Copy file "), $("Skipped it")])
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
        const chunks = logger.collect(() => {
          util.copyFile(SRC_PATH, DEST_PATH, { exists: "ask" })
        })
        expect(chunks).toEqual([
          $("Copy file "),
          $("Showing diff"),
          $(/Expected/),
          $(/Overwriting/),
        ])
        expect(util.readFile(DEST_PATH)).toEqual("src")
      })

      it("should ask if dest exists and exists=ask n skip", async () => {
        const SRC_PATH = ".test/copy-file-exists/a/1.txt"
        const DEST_PATH = ".test/copy-file-exists/b/1.txt"
        util.writeFile(SRC_PATH, "src", { silent: true })
        util.writeFile(DEST_PATH, "dest", { silent: true })
        // @ts-ignore because the type doesn't contain the mock methods
        prompt.mockReturnValueOnce("n")
        const chunks = logger.collect(() => {
          util.copyFile(SRC_PATH, DEST_PATH, { exists: "ask" })
        })
        expect(chunks).toEqual([
          $("Copy file "),
          $("Showing diff"),
          $(/Expected/),
          $(/Skipping/),
        ])
        expect(util.readFile(DEST_PATH)).toEqual("dest")
      })

      it("should ask if dest exists and exists=ask n skip", async () => {
        const SRC_PATH = ".test/copy-file-exists/a/1.txt"
        const DEST_PATH = ".test/copy-file-exists/b/1.txt"
        util.writeFile(SRC_PATH, "src", { silent: true })
        util.writeFile(DEST_PATH, "dest", { silent: true })
        // @ts-ignore because the type doesn't contain the mock methods
        prompt.mockReturnValueOnce("q")
        const chunks = logger.collect(() => {
          expect(() =>
            util.copyFile(SRC_PATH, DEST_PATH, { exists: "ask" })
          ).toThrow("Did not answer y or n")
        })
        expect(chunks.length).toEqual(4)
        expect(chunks).toEqual([
          $("Copy file "),
          $("Destination exists."),
          $("Expected"),
          $("Did not answer y or n"),
        ])
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
      const chunks = logger.collect(() => {
        const x = util.replaceInFile({
          src: SRC,
          dest: DEST,
          find: /(ipsum)/,
          replace(matchData) {
            return matchData[0].toUpperCase()
          },
          count: 2,
        })
      })
      expect(chunks).toEqual([$("Replace"), $("Completed")])
      logger.silence(() => {
        util.ensureFileContains(DEST, REPLACED_TEXT)
      })
    })

    it("should replaceInFile with find a string", async () => {
      const SRC = ".test/replace-in-file-find-string/src.txt"
      const DEST = ".test/replace-in-file-find-string/dest.txt"
      const TEXT = `lorem ipsum dolar\nsit amet\nconsecteteur\nlorem ipsum dolar\nsit amet\nconsecteteur`
      const REPLACED_TEXT = `lorem IPSUM dolar\nsit amet\nconsecteteur\nlorem IPSUM dolar\nsit amet\nconsecteteur`
      util.writeFile(SRC, TEXT, { silent: true })
      const chunks = logger.collect(() => {
        const x = util.replaceInFile({
          src: SRC,
          dest: DEST,
          find: "ipsum",
          replace(matchData) {
            return matchData[0].toUpperCase()
          },
          count: 2,
        })
      })
      expect(chunks).toEqual([$("Replace"), $("Completed")])
      logger.silence(() => {
        util.ensureFileContains(DEST, REPLACED_TEXT)
      })
    })

    it("should replaceInFile with find a string", async () => {
      const SRC = ".test/replace-in-file-replace-string/src.txt"
      const DEST = ".test/replace-in-file-replace-string/dest.txt"
      const TEXT = `lorem ipsum dolar\nsit amet\nconsecteteur\nlorem ipsum dolar\nsit amet\nconsecteteur`
      const REPLACED_TEXT = `lorem IPSUM dolar\nsit amet\nconsecteteur\nlorem IPSUM dolar\nsit amet\nconsecteteur`
      util.writeFile(SRC, TEXT, { silent: true })
      const chunks = logger.collect(() => {
        const x = util.replaceInFile({
          src: SRC,
          dest: DEST,
          find: /(ipsum)/,
          replace: "IPSUM",
          count: 2,
        })
      })
      expect(chunks).toEqual([$("Replace"), $("Completed")])
      logger.silence(() => {
        util.ensureFileContains(DEST, REPLACED_TEXT)
      })
    })
  })

  describe("processFile", () => {
    it("should processFile", async () => {
      const SRC = ".test/process-file/src.txt"
      const DEST = ".test/process-file/dest.txt"
      const TEXT = `Hello World!`
      const REPLACED_TEXT = `HELLO WORLD!`
      util.writeFile(SRC, TEXT, { silent: true })
      const chunks = logger.collect(() => {
        util.processFile(SRC, DEST, (text) => {
          return text.toUpperCase()
        })
      })
      expect(chunks).toEqual([$("Process"), $("Completed")])
      logger.silence(() => {
        util.ensureFileContains(DEST, REPLACED_TEXT)
      })
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

  describe("git", () => {
    it("should get branch", async () => {
      const branch = util.getGitBranch()
      expect(typeof branch).toEqual("string")
    })

    it("should know if git is clean", async () => {
      expect(typeof util.isGitClean()).toEqual("boolean")
    })
  })

  /**
   * NOTE:
   *
   * These tests are a little wonky because they are running on self and
   * will only pass if we are on the `main` branch.
   */
  describe("git on this git repo", () => {
    it("should either complete successfully or throw that it's on the wrong branch", async () => {
      try {
        const chunks = logger.collect(() => {
          assertGitBranch("main")
        })
        expect(chunks).toEqual([
          $(/make sure we are on git branch/i),
          $(/done/i),
        ])
      } catch (e) {
        expect(`${e}`).toMatch(/on wrong branch/i)
      }
    })
  })

  describe("git tags", () => {
    it("should get, add and remove git tags", async () => {
      const tempTag = "temp-git-tag-for-testing"
      util.removeGitTag(tempTag, { silentNotFound: true })
      util.addGitTag(tempTag, "Temporary git tag for testing")
      const tags = util.getGitHeadTags()
      expect(tags).toContain(tempTag)

      util.removeGitTag(tempTag)
      const tags2 = util.getGitHeadTags()
      expect(tags2).not.toContain(tempTag)

      // expect(() => util.removeGitTag(tempTag)).toThrow("not found")
    })

    it("should get a timestamp", async () => {
      const stamp = util.getTimestamp("dev")
      expect(stamp).toMatch(/^dev[.].*[.].*[.].*$/)
    })

    it("should git stamp", async () => {
      const tag = util.gitStamp("temp")
      const tags = util.getGitHeadTags()
      expect(tags).toContain(tag)
      util.removeGitTag(tag)
      const tags2 = util.getGitHeadTags()
      expect(tags2).not.toContain(tag)
    })
  })
})
