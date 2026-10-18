import { defineConfig } from 'vite-plus'

const fixtureInputs = ['tests/fixtures/*/{input,output}/*']

export default defineConfig({
  pack: {
    entry: ['src/index.ts', 'src/plugins/*.ts'],
    dts: true,
    exports: true,
    publint: true,
    attw: true,
    failOnWarn: true,
  },
  lint: {
    ignorePatterns: ['examples/**', ...fixtureInputs],
    categories: { correctness: 'error', suspicious: 'error', perf: 'error' },
    options: { typeAware: true, typeCheck: true, denyWarnings: true },
  },
  fmt: {
    singleQuote: true,
    semi: false,
    ignorePatterns: ['examples/*/output.md', ...fixtureInputs],
  },
  test: {
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/global-setup.ts'],
    // Fixture tests run oxlint several times, about a second each on CI.
    testTimeout: 30_000,
  },
  staged: {
    '*': 'vp check --fix',
  },
})
