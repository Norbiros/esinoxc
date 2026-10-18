import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { ROOT, runOxlint, type OxlintBuild } from './oxlint.ts'

const FIXTURES = join(ROOT, 'tests/fixtures')
const SCRATCH = join(ROOT, 'tests/.scratch')

for (const group of readdirSync(FIXTURES)) {
  const dir = join(FIXTURES, group)

  for (const file of readdirSync(join(dir, 'input'))) {
    const input = join('input', file)
    const output = (name: string) => join(dir, 'output', name)
    const base = file.slice(0, -extname(file).length)

    test(`fixture: ${group}/${file}`, async () => {
      await expect(runOxlint(dir, [input])).toMatchFileSnapshot(output(`${base}.md`))
    })

    test(`fixture: ${group}/${file} --fix`, async () => {
      const original = readFileSync(join(dir, input), 'utf8')
      const fixed = fixUntilStable(group, input, original, '--fix')
      const suggested = fixUntilStable(group, input, original, '--fix-suggestions')

      await expectOutput(output(`${base}.fixed${extname(file)}`), fixed, original)
      await expectOutput(output(`${base}.suggested${extname(file)}`), suggested, fixed)
    })
  }
}

// oxlint also lints a file outside its cwd when given the absolute path.
test('fixture: basic/no-foo.js outside the cwd', async () => {
  const dir = join(FIXTURES, 'basic')
  const outside = runOxlint(join(dir, 'output'), [
    '-c',
    '../.oxlintrc.json',
    join(dir, 'input/no-foo.js'),
  ])
  await expect(outside).toMatchFileSnapshot(join(dir, 'output/no-foo.outside-cwd.md'))
})

// Stock oxlint can only report and fix inside the `<script>` section it is linting (#5).
test('fixture: eslint-plugin-vue/template-first.vue on stock oxlint', async () => {
  const group = 'eslint-plugin-vue'
  const input = 'input/template-first.vue'
  const output = (name: string) => join(FIXTURES, group, 'output', name)
  const original = readFileSync(join(FIXTURES, group, input), 'utf8')

  await expect(runOxlint(join(FIXTURES, group), [input], 'oxlint-stock')).toMatchFileSnapshot(
    output('template-first.stock.md'),
  )
  await expect(fixUntilStable(group, input, original, '--fix', 'oxlint-stock')).toMatchFileSnapshot(
    output('template-first.stock.fixed.vue'),
  )
})

// ESLint applies fixes in up to 10 passes, oxlint in one per run.
function fixUntilStable(
  group: string,
  input: string,
  text: string,
  flag: string,
  build?: OxlintBuild,
): string {
  for (let pass = 0; pass < 10; pass++) {
    const next = fix(group, input, text, flag, build)
    if (next === text) return text
    text = next
  }
  throw new Error(`${input} still changes after 10 runs of ${build ?? 'oxlint'} ${flag}`)
}

function fix(
  group: string,
  input: string,
  text: string,
  flag: string,
  build?: OxlintBuild,
): string {
  const dir = join(SCRATCH, group)
  rmSync(dir, { recursive: true, force: true })
  cpSync(join(FIXTURES, group), dir, { recursive: true })
  writeFileSync(join(dir, input), text)
  runOxlint(dir, [flag, input], build)
  return readFileSync(join(dir, input), 'utf8')
}

// An output is only kept when it differs from the previous step, so most fixtures have none.
async function expectOutput(path: string, text: string, previous: string): Promise<void> {
  if (text === previous) expect(existsSync(path), `${path} is stale`).toBe(false)
  else await expect(text).toMatchFileSnapshot(path)
}
