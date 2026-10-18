import type { Linter } from 'eslint'
import vue from 'eslint-plugin-vue'
import { createEsinoxPlugin } from '../index.ts'

export default createEsinoxPlugin({
  name: 'vue-eslint',
  plugin: vue,
  config: [...vue.configs['flat/base'], ...(await typescriptConfig())],
})

// `<script lang="ts">` needs `@typescript-eslint/parser`, an optional peer.
async function typescriptConfig(): Promise<Linter.Config[]> {
  try {
    const { default: parser } = await import('@typescript-eslint/parser')
    return [{ files: ['**/*.vue'], languageOptions: { parserOptions: { parser } } }]
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ERR_MODULE_NOT_FOUND')
      return []
    throw error
  }
}
