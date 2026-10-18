import vueEslint from 'esinoxc/plugins/vue'
import { defineConfig } from 'oxlint'

export default defineConfig({
  jsPlugins: [{ name: 'vue-eslint', specifier: 'esinoxc/plugins/vue' }],
  extends: [vueEslint.configs['flat/recommended']],
})
