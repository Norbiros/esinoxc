import { defineConfig } from 'vite-plus'

const fixtureInputs = ['tests/fixtures/*/{input,output}/*']

export default defineConfig({
  pack: {
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
  test: { include: ['tests/**/*.test.ts'], globalSetup: ['tests/global-setup.ts'] },
  staged: {
    '*': 'vp check --fix',
  },
})
