import type { Diagnostic, FixFn, LineColumn, Range } from '@oxlint/plugins'
import type { Linter, Rule } from 'eslint'

// FIXME: `actualRange` comes from oxc#20501, which oxlint has not merged yet (#5).
export type ActualRangeDiagnostic = Diagnostic & { actualRange: Range }

// The part of the file oxlint is linting, a `<script>` block or the whole file, located in the full text.
export interface Section {
  start: number
  end: number
  toLineColumn: (offset: number) => LineColumn
}

export function computeLineStarts(text: string): number[] {
  const starts = [0]
  for (const match of text.matchAll(/\r\n|[\n\r\u2028\u2029]/g)) {
    starts.push(match.index + match[0].length)
  }
  return starts
}

export function toDiagnostic(
  message: Linter.LintMessage,
  lineStarts: number[],
): ActualRangeDiagnostic {
  return {
    message: message.message,
    // Required by the types; ignored when `actualRange` is supported.
    loc: { line: 1, column: 0 },
    actualRange: toRange(message, lineStarts),
    fix: message.fix && toFixFunction(message.fix),
    suggest: message.suggestions?.map((suggestion) => ({
      desc: suggestion.desc,
      fix: toFixFunction(suggestion.fix),
    })),
  }
}

// Without `actualRange`, oxlint reads `loc` and fix ranges relative to the linted section, so a
// diagnostic outside it is anchored at the section start, with its position in the message.
export function toSectionDiagnostic(
  message: Linter.LintMessage,
  lineStarts: number[],
  section: Section,
): Diagnostic {
  const [start, end] = toRange(message, lineStarts)
  if (!isInside([start, end], section)) {
    return {
      message: `${message.message} (${message.line}:${message.column})`,
      loc: { line: 1, column: 0 },
    }
  }

  return {
    message: message.message,
    loc: {
      start: section.toLineColumn(start - section.start),
      end: section.toLineColumn(end - section.start),
    },
    fix:
      message.fix && isInside(message.fix.range, section)
        ? toFixFunction(message.fix, section.start)
        : undefined,
    suggest: message.suggestions
      ?.filter((suggestion) => isInside(suggestion.fix.range, section))
      .map((suggestion) => ({
        desc: suggestion.desc,
        fix: toFixFunction(suggestion.fix, section.start),
      })),
  }
}

function toRange(message: Linter.LintMessage, lineStarts: number[]): Range {
  return [
    toOffset(lineStarts, message.line, message.column),
    toOffset(lineStarts, message.endLine ?? message.line, message.endColumn ?? message.column),
  ]
}

function isInside([start, end]: Range, section: Section): boolean {
  return start >= section.start && end <= section.end
}

function toFixFunction({ range, text }: Rule.Fix, shift = 0): FixFn {
  return (fixer) => fixer.replaceTextRange([range[0] - shift, range[1] - shift], text)
}

// Some rules report before the first column, and oxlint rejects the whole file on a negative offset.
function toOffset(lineStarts: number[], line: number, column: number): number {
  return Math.max(0, (lineStarts[line - 1] ?? 0) + column - 1)
}
