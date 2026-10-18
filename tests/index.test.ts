import type { ESLint, Linter } from 'eslint'
import { expect, test } from 'vite-plus/test'
import { createEsinoxPlugin } from '../src/index.ts'

const plugin: ESLint.Plugin = {
  rules: {
    'no-foo': {
      meta: { type: 'problem', schema: [], messages: { foo: 'No foo.' } },
      create: () => ({}),
    },
    'no-bar': {
      meta: { type: 'suggestion', schema: [{ type: 'string' }] },
      create: () => ({}),
    },
  },
}

test('exposes every rule of the wrapped plugin under the given name', () => {
  const wrapped = createEsinoxPlugin({ name: 'wrapped', plugin })

  expect(wrapped.meta?.name).toBe('wrapped')
  expect(Object.keys(wrapped.rules)).toEqual(['no-foo', 'no-bar'])
})

test('renames the rules of flat configs to the given name', () => {
  const other: ESLint.Plugin = { rules: {} }
  const original: ESLint.Plugin = { ...plugin }
  const base: Linter.Config[] = [{ plugins: { original }, rules: { 'original/no-foo': 'error' } }]
  original.configs = {
    base,
    recommended: [
      ...base,
      { plugins: { other } },
      { rules: { 'original/no-bar': ['warn', 'baz'], 'other/rule': 'error' } },
    ],
    layout: { rules: { 'original/no-bar': 'off' } },
    legacy: { plugins: ['original'], rules: { 'original/no-bar': 'error' } },
    overrides: { overrides: [{ files: ['*.js'], rules: { 'original/no-bar': 'off' } }] },
  }
  Object.assign(original.configs, { version: '1.0.0' })

  const wrapped = createEsinoxPlugin({ name: 'wrapped', plugin: original, config: base })

  expect(wrapped.configs).toEqual({
    base: { rules: {} },
    recommended: { rules: { 'wrapped/no-bar': ['warn', 'baz'] } },
    layout: { rules: { 'wrapped/no-bar': 'off' } },
  })
})
