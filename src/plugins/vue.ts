import vue from 'eslint-plugin-vue'
import { createEsinoxPlugin } from '../index.ts'
import { typescriptParserConfig } from '../typescript.ts'

export default createEsinoxPlugin({
  name: 'vue-eslint',
  plugin: vue,
  config: [
    ...vue.configs['flat/base'],
    ...(await typescriptParserConfig(['**/*.vue'])),
    { files: ['**/*.vue'], languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  ],
})
