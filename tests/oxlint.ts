import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '')

export function runOxlint(cwd: string, args: string[] = []): string {
  const packageJson = createRequire(join(cwd, 'package.json')).resolve('oxlint/package.json')
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
  const normalized = output
    .replaceAll(ROOT, '<root>')
    .replace(/^Finished in .*\n?/m, '')
    .trimEnd()
  return ['```', ...(normalized ? [normalized] : []), '```'].join('\n')
}
