import svelteEslint from 'esinoxc/plugins/svelte'
import { defineConfig } from 'oxlint'

export default defineConfig({
  jsPlugins: [{ name: 'svelte-eslint', specifier: 'esinoxc/plugins/svelte' }],
  extends: [svelteEslint.configs['flat/recommended']],
})
