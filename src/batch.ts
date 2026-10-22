import type { Context, Diagnostic } from '@oxlint/plugins'
import { readFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, sep } from 'node:path'
import { Linter } from 'eslint'
import {
  computeLineStarts,
  toDiagnostic,
  toSectionDiagnostic,
  type Section,
} from './diagnostics.ts'
import type { EsinoxOptions } from './index.ts'

// Part of ESLint's documented Node.js API, but missing from its types.
declare module 'eslint' {
  interface Linter {
    getSuppressedMessages(): Linter.SuppressedLintMessage[]
  }
}

type RuleOptions = Context['options']

// Running ESLint once per rule would parse the file again for every rule, so all rules enabled
// for a file are batched and run in a single ESLint call.
export interface Batch {
  filename: string
  section: string
  rules: Map<EsinoxOptions, Map<string, RuleOptions>>
  diagnostics?: Map<string, Diagnostic[]>
}

let currentBatch: Batch | undefined

export function joinBatch(context: Context, options: EsinoxOptions, ruleId: string): Batch {
  const filename = context.physicalFilename
  const section = context.sourceCode.text
  if (currentBatch === undefined || !canJoin(currentBatch, filename, section, options, ruleId)) {
    currentBatch = { filename, section, rules: new Map() }
  }

  const rules = currentBatch.rules.get(options) ?? new Map<string, RuleOptions>()
  rules.set(ruleId, context.options)
  currentBatch.rules.set(options, rules)
  return currentBatch
}

export function batchDiagnostics(context: Context, batch: Batch, ruleId: string): Diagnostic[] {
  batch.diagnostics ??= lintBatch(context, batch)
  return batch.diagnostics.get(ruleId) ?? []
}

function canJoin(
  batch: Batch,
  filename: string,
  section: string,
  options: EsinoxOptions,
  ruleId: string,
): boolean {
  return (
    batch.diagnostics === undefined &&
    batch.filename === filename &&
    batch.section === section &&
    batch.rules.get(options)?.has(ruleId) !== true
  )
}

function lintBatch(context: Context, batch: Batch): Map<string, Diagnostic[]> {
  const diagnostics = new Map<string, Diagnostic[]>()
  const text = readFullText(context)
  const { run, isFirstSection } = claimFileRun(batch.filename, batch.section, text)

  const lineStarts = computeLineStarts(text)
  const sectionStart = text.indexOf(context.sourceCode.text)
  const isInSection = (message: Linter.LintMessage) => {
    const offset = (lineStarts[message.line - 1] ?? 0) + message.column - 1
    return (
      sectionStart !== -1 &&
      offset >= sectionStart &&
      offset < sectionStart + context.sourceCode.text.length
    )
  }
  const section = stockSection(context, sectionStart)
  for (const [options, rules] of batch.rules) {
    if (isFirstSection)
      run.results.set(options, runEslint(context, batch.filename, text, options, rules))
    const result = run.results.get(options)
    if (result === undefined) continue

    // oxlint reads the disable directives of the section itself and treats one as unused when
    // nothing reached it, so diagnostics ESLint suppressed there are handed back to oxlint.
    const messages = [
      ...(isFirstSection ? result.messages : []),
      ...result.suppressed.filter(isInSection),
    ]
    for (const message of messages) {
      const ruleId = message.ruleId
      if (ruleId === null || ruleId === undefined) continue
      const list = diagnostics.get(ruleId) ?? []
      list.push(
        section === undefined
          ? toDiagnostic(message, lineStarts)
          : toSectionDiagnostic(message, lineStarts, section),
      )
      diagnostics.set(ruleId, list)
    }
  }
  return diagnostics
}

interface EslintResult {
  messages: Linter.LintMessage[]
  suppressed: Linter.SuppressedLintMessage[]
}

interface FileRun {
  text: string
  sections: Set<string>
  results: Map<EsinoxOptions, EslintResult>
}

// Each `<script>` section of a partially loaded file is a separate oxlint call; only the first one
// of a run lints the whole file.
const fileRuns = new Map<string, FileRun>()
// A file's sections run back to back on one oxlint thread, so only files in flight need an entry.
const MAX_FILE_RUNS = 256

function claimFileRun(
  filename: string,
  section: string,
  text: string,
): { run: FileRun; isFirstSection: boolean } {
  const run = fileRuns.get(filename)
  if (run !== undefined && run.text === text && !run.sections.has(section)) {
    run.sections.add(section)
    return { run, isFirstSection: false }
  }

  const newRun: FileRun = { text, sections: new Set([section]), results: new Map() }
  fileRuns.delete(filename)
  fileRuns.set(filename, newRun)
  const oldest = fileRuns.keys().next().value
  if (fileRuns.size > MAX_FILE_RUNS && oldest !== undefined) fileRuns.delete(oldest)
  return { run: newRun, isFirstSection: true }
}

function runEslint(
  context: Context,
  filename: string,
  text: string,
  options: EsinoxOptions,
  rules: Map<string, RuleOptions>,
): EslintResult {
  const ruleEntries: Linter.RulesRecord = {}
  for (const [ruleId, ruleOptions] of rules) {
    ruleEntries[ruleId] = ['error', ...ruleOptions]
  }

  const linter = getLinter(eslintCwd(context.cwd, filename))
  const messages = linter.verify(
    text,
    [
      ...(options.config ?? []),
      {
        plugins: { [options.name]: options.plugin },
        languageOptions: { globals: context.languageOptions.globals },
        settings: context.settings,
        // Most disable directives target oxlint's own rules, which this pass never runs.
        linterOptions: { reportUnusedDisableDirectives: false },
        rules: ruleEntries,
      },
    ],
    filename,
  )

  const fatal = messages.find((message) => message.fatal === true)
  if (fatal !== undefined) throw new ParseError(options.name, fatal)
  return { messages, suppressed: linter.getSuppressedMessages() }
}

// A JS plugin can only report through a rule the user enabled, but oxlint turns a thrown error into
// an error for the file, like ESLint does with a fatal message.
class ParseError extends Error {
  constructor(pluginName: string, message: Linter.LintMessage) {
    super(`${pluginName}: ${message.message} (${message.line}:${message.column})`)
    // oxlint prints the stack, which points into esinoxc instead of the parsed file.
    this.stack = this.message
  }
}

const linters = new Map<string, Linter>()

function getLinter(cwd: string): Linter {
  let linter = linters.get(cwd)
  if (linter === undefined) {
    linter = new Linter({ cwd })
    linters.set(cwd, linter)
  }
  return linter
}

// ESLint matches no config for a file outside its cwd, and oxlint lints one when given its
// absolute path.
function eslintCwd(cwd: string, filename: string): string {
  const path = relative(cwd, filename)
  return path.startsWith(`..${sep}`) || isAbsolute(path) ? dirname(filename) : cwd
}

// `actualText` and `actualRange` both come from the Norbiros/oxc build, so without `actualText`
// diagnostics have to be placed within the section.
function stockSection(context: Context, start: number): Section | undefined {
  const { sourceCode } = context
  if ('actualText' in sourceCode) return undefined
  // The file on disk can differ from the buffer the language server lints; then nothing is inside.
  return {
    start,
    end: start === -1 ? -1 : start + sourceCode.text.length,
    toLineColumn: (offset) => sourceCode.getLocFromIndex(offset),
  }
}

// `actualText` is the editor buffer, exposed by the Norbiros/oxc build. oxlint offsets exclude a BOM.
function readFullText(context: Context): string {
  const { sourceCode } = context
  if ('actualText' in sourceCode && typeof sourceCode.actualText === 'string')
    return sourceCode.actualText
  return readFileSync(context.physicalFilename, 'utf8').replace(/^\uFEFF/, '')
}
