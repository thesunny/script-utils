# @thesunny/script-utils

A number of useful methods and command line scripts for use in scripting utilities like:

- File and directory manipulation
- Logging title, tasks, pass and fail
- Working with git to check branch, if git is clean and adding a git stamp

## Table of Contents

- [Usage](#usage)
- [General Methods](#general-methods)
- [Task Methods](#task-methods)
- [Process Methods](#process-methods)
- [Log Methods](#log-methods)

## Usage

```ts
import * as utils from "@thesunny/script-utils"

utils.readFile("hello.txt")
```

## Helper Methods

This library is designed specifically to avoid footguns and maybe is more akin to providing foot protectors. As such, the defaults and also the fact that all commands run synchronous instead of async are designed for that purpose.

### `writeFile(path: string, text: string): void`

Writes a text file at the given path

### `readFile(path: string): string`

Reads a file at the given path and returns its text

### `fileExists(path: string): boolean`

Returns whether a file at the given path exists

### `isEmpty(path: string): boolean`

Check path is empty (no file exists, no dir exists or dir exists but is empty)

## Task Methods

Tasks are expected to either pass or fail. If they fail, they exit the script execution immediately.

### `ensureFileContains(path: string, find: string | RegExp)`

Task to read a file and confirm that it contains a specific string or matches a specific RegExp.

### `emptyDir(dir: string): void`

Empties the given dir.

### `ensureEmpty(path: string): void`

Ensure path is empty (no file exists, no dir exists or dir exists but is empty)

### `removeFileIfExists(path: string): void`

Remove file if it exists.

### `diffFile(a: string, b: string): string | null`

Returns a diff of two files at the given paths. Returns null if they are the same.

### `copyFile(src: string, dest: string, options: Options): void`

Copy file from src to dest creating the dest dir if required.

If `dest` exists, we throw an error. We do this because we want our scripts to be clean. We should take explicit steps to remove any file existing at the destination in another part of the script. If we don't, it's easy to end up in a situation where the `copyFile` never executed but we don't know that because overwriting it happens without doing so explicitly.

Can be called with a `silent` option which will supress logging of only the `task` and `pass`. We may later want to suppress others like `overwrite` but we'll leave it for now.

#### Options

- `exists`: `"fail" | "skip" | "overwrite" | "ask"`
- `silent`: `boolean`

### `copyDir(src: string, dest: string): void`

Copy dir from src to dest creating the dest dir if required

If files exist in the destination directory that also exist in the source directory (i.e. there would be an overwrite) we throw an error.

### `replaceInFile(options: Options): void`

```ts
type Options = {
  src: string
  dest: string
  find: RegExp | string
  replace: string | ((match: RegExpMatchArray) => string)
  count?: number | null
})
```

Takes a `src` file, makes some replacements and writes them to the `dest` file. In the case where we are expecting a certain amount of replacements, we can specify a `count` option. If the number of replacements doesn't match exactly, the `replaceInFile` fails and the file is not written.

### `processFile(src: string, dest: string, process: (input: string) => string): void`

Takes a file, runs it through the `process` argument, then writes it to the dest.

### `exit(): never`

Exit the script immediately.

We elect to exit with `process.exit(1)` which displays an ugly error in order to communicate that the code has exited in a state we don't want.

Even though we show the error messages, the ugliness of the different colors is a nice visual indicator that we need to pay attention.

## Process Methods

NOTE: These two methods are similar but have different calling conventions and different features. They closely mimic, but are simplified from the similarly named methods in Node's `child_process`

### `spawn(cmd: string, args: string[], { value = "" }: { value?: string } = { value: "" }: { stdout: string; stderr: string }`

Spawn a command to execute.

Returns a stream for `stdout` and `stderr`. Allow for putting data into
it from `{ value }` in options.

### `exec(cmd: string, { silent = false }: { silent?: boolean } = { silent: false }): string`

Executes a command.

Uses a simpler calling method than `spawn`.

trim the result for consistency.

`silent` option makes it so that the command does not output to the console.

## Log Methods

- Titles and Headings
  - `title(text: string)`: Draw a title box
  - `heading(text: string)`: Show a heading
- Tasks
  - `task(text: string)`: Show start of a task
  - `pass(text: string)`: Show a passing task
  - `fail(text: string)`: Show a failing task
  - `skip(text: string)`: Show skiping a task
  - `progress(text: string)`: Show progress in a task
  - `message(text: string)`: Show message
  - `alert(text: string)`: Show an alert (with fire emoji)
- Utility
  - `stringify(x: string | RegExp)`: Pretty print a string or RegExp, usually used inside one of the above methods.
- `log`: You can use the `log` object to output without the associated emojis and indentation.
  - `log.title(text: string)`
  - `log.heading(text: string)`
  - `log.progress(text: string)`
  - `log.task(text: string)`
  - `log.message(text: string)`
  - `log.alert(text: string)`
  - `log.pass(text: string)`
  - `log.skip(text: string)`
  - `log.fail(text: string)`
