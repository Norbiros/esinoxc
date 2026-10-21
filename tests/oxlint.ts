import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '')

// `oxlint-stock` is upstream oxlint, without the Norbiros/oxc changes esinoxc needs (#5).
export type OxlintBuild = 'oxlint' | 'oxlint-stock'

export function runOxlint(cwd: string, args: string[] = [], build: OxlintBuild = 'oxlint'): string {
  const packageJson = createRequire(join(cwd, 'package.json')).resolve(`${build}/package.json`)
  const result = spawnSync(
    process.execPath,
    [join(dirname(packageJson), 'bin/oxlint'), '--threads', '1', ...args],
    {
      cwd,
      encoding: 'utf8',
      // oxlint switches to a terse format when it detects an AI agent (`CLAUDECODE`, `AI_AGENT`).
      env: { PATH: process.env.PATH },
    },
  )

  return [
    '# Exit code',
    String(result.status),
    '',
    '# stdout',
    fence(result.stdout),
    '',
    '# stderr',
    fence(result.stderr),
    '',
  ].join('\n')
}

function fence(output: string): string {
  const normalized = sortByFile(output)
    .replaceAll(ROOT, '<root>')
    .replace(/^Finished in .*\n?/m, '')
    .trimEnd()
  return ['```', ...(normalized ? [normalized] : []), '```'].join('\n')
}

function sortByFile(output: string): string {
  const blocks = output.split('\n\n')
  const sorted = blocks
    .filter((block) => blockFile(block) !== undefined)
    .toSorted((a, b) => blockFile(a)!.localeCompare(blockFile(b)!))
  return blocks
    .map((block) => (blockFile(block) === undefined ? block : sorted.shift()!))
    .join('\n\n')
}

function blockFile(block: string): string | undefined {
  return /,-\[(.+?):\d+:\d+\]/.exec(block)?.[1]
}
