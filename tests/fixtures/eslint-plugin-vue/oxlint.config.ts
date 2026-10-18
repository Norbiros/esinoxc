import { defineConfig } from 'oxlint'
import vueEslint from '../../../src/plugins/vue.ts'

export default defineConfig({
  categories: { correctness: 'off' },
  jsPlugins: [{ name: 'vue-eslint', specifier: '../../../src/plugins/vue.ts' }],
  extends: [vueEslint.configs['flat/recommended']],
})
