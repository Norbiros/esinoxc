# ESinOxc

**esinoxc** (/ɛsɪnˈɒksi/) stands for [**ES**Lint](https://eslint.org) **in** [**Oxc**](https://oxc.rs)lint.

> [!IMPORTANT]
> esinoxc isn't ready for real projects yet. Linting and fixing `<template>` needs an oxlint change that isn't merged, so until [#5](https://github.com/Norbiros/esinoxc/issues/5) is resolved I don't recommend using it outside of experiments.

## Why esinoxc?

Oxlint can already run ESLint plugins as JS plugins, but **it doesn't work on templates in files** like `.vue` or `.svelte`. The Oxlint team expects to work on custom languages in 2027 ([oxc#24262](https://github.com/oxc-project/oxc/issues/24262)), so until then projects in those ecosystems are stuck with ESLint.

esinoxc is a **stepping stone** until then. It runs ESLint, with its parsers and plugins, inside an Oxlint JS plugin and reports the results back to Oxlint. Rules work exactly as they do in ESLint, so you get the same diagnostics and fixes.

Because ESLint still does the work, linting these files isn't faster yet. What you get today is a better toolchain: one linter, one config, and Oxlint for all other files (like TS). Once Oxlint supports templates natively, you will be able to easily remove esinoxc and get the rest of the speed benefits.

This means you can migrate your Vue, Svelte, Nuxt or other projects to the [Oxc](https://oxc.rs) and [Vite+](https://viteplus.dev) toolchain today.

## Installation

```bash
pnpm add -D esinoxc oxlint
```

## Usage

Moving from ESLint? See [MIGRATION.md](MIGRATION.md).

### Vue

```bash
pnpm add -D eslint-plugin-vue @typescript-eslint/parser
```

`@typescript-eslint/parser` is only needed for `<script lang="ts">`.

```ts
// oxlint.config.ts
import vueEslint from 'esinoxc/plugins/vue'
import { defineConfig } from 'oxlint'

export default defineConfig({
  jsPlugins: [{ name: 'vue-eslint', specifier: 'esinoxc/plugins/vue' }],
  extends: [vueEslint.configs['flat/recommended']],
  rules: {
    'vue-eslint/no-v-html': 'off',
  },
})
```

oxlint already has a built-in `vue` plugin, so the rules are named `vue-eslint/*`. Use the same name in disable comments: `// eslint-disable-next-line vue-eslint/no-v-html`. See [`examples/vue`](examples/vue) for a working setup.

### Other plugins

Wrap the plugin in your own module and load it in `jsPlugins` under the same `name`. If the plugin needs an ESLint config to run, such as a parser, pass it as `config`. Rules are configured in oxlint.

```js
// eslint-plugin-foo.mjs
import { createEsinoxPlugin } from 'esinoxc'
import foo from 'eslint-plugin-foo'

export default createEsinoxPlugin({ name: 'foo-eslint', plugin: foo })
```

```json
{
  "jsPlugins": [{ "name": "foo-eslint", "specifier": "./eslint-plugin-foo.mjs" }],
  "rules": { "foo-eslint/some-rule": "error" }
}
```

## Development

- Install dependencies:

```bash
vp install
```

- Run the unit tests:

```bash
vp test
```

- Build the library:

```bash
vp pack
```
