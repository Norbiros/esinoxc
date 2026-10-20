import svelte from 'eslint-plugin-svelte'
import { createEsinoxPlugin } from '../index.ts'
import { typescriptParserConfig } from '../typescript.ts'

export default createEsinoxPlugin({
  name: 'svelte-eslint',
  plugin: svelte,
  config: [
    ...svelte.configs['flat/base'],
    ...(await typescriptParserConfig(['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'])),
  ],
})
