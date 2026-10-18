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
  if (!claimFileRun(batch.filename, batch.section, text)) return diagnostics

  const lineStarts = computeLineStarts(text)
  const section = stockSection(context, text)
  for (const [options, rules] of batch.rules) {
    // A fatal error belongs to no rule, so it is reported through the first one to stay visible.
    const [firstRuleId] = rules.keys()
    for (const message of runEslint(context, batch.filename, text, options, rules)) {
      const ruleId = message.fatal === true ? firstRuleId : message.ruleId
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

// Each `<script>` section of a partially loaded file is a separate oxlint call; only the first one
// of a run lints the whole file.
const fileRuns = new Map<string, { text: string; sections: Set<string> }>()
// A file's sections run back to back on one oxlint thread, so only files in flight need an entry.
const MAX_FILE_RUNS = 256

function claimFileRun(filename: string, section: string, text: string): boolean {
  const run = fileRuns.get(filename)
  if (run !== undefined && run.text === text && !run.sections.has(section)) {
    run.sections.add(section)
    return false
  }

  fileRuns.delete(filename)
  fileRuns.set(filename, { text, sections: new Set([section]) })
  const oldest = fileRuns.keys().next().value
  if (fileRuns.size > MAX_FILE_RUNS && oldest !== undefined) fileRuns.delete(oldest)
  return true
}

function runEslint(
  context: Context,
  filename: string,
  text: string,
  options: EsinoxOptions,
  rules: Map<string, RuleOptions>,
): Linter.LintMessage[] {
  const ruleEntries: Linter.RulesRecord = {}
  for (const [ruleId, ruleOptions] of rules) {
    ruleEntries[ruleId] = ['error', ...ruleOptions]
  }

  const linter = new Linter({ cwd: eslintCwd(context.cwd, filename) })
  return linter.verify(
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
}

// ESLint matches no config for a file outside its cwd, and oxlint lints one when given its
// absolute path.
function eslintCwd(cwd: string, filename: string): string {
  const path = relative(cwd, filename)
  return path.startsWith(`..${sep}`) || isAbsolute(path) ? dirname(filename) : cwd
}

// `actualText` and `actualRange` both come from the Norbiros/oxc build, so without `actualText`
// diagnostics have to be placed within the section.
function stockSection(context: Context, text: string): Section | undefined {
  const { sourceCode } = context
  if ('actualText' in sourceCode) return undefined
  // The file on disk can differ from the buffer the language server lints; then nothing is inside.
  const start = text.indexOf(sourceCode.text)
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
