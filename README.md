# ESinOxc

**esinoxc** (/ɛs ɪn ɒks/) stands for [**ES**Lint](https://eslint.org) **in** [**Oxc**](https://oxc.rs)lint.

> [!IMPORTANT]
> esinoxc isn't ready for real projects yet. Linting and fixing `<template>` needs an oxlint change that isn't merged, so until [#5](https://github.com/Norbiros/esinoxc/issues/5) is resolved I don't recommend using it outside of experiments.

## Why esinoxc?

If you found this repo, you probably already know Oxlint but can't migrate to it yet. Oxlint can run ESLint plugins as JS plugins, but not on templates in files like `.vue` or `.astro`, so until now you had to keep ESLint next to it, which makes your toolchain more complex.

esinoxc is a **stepping stone** until Oxlint supports templates and custom languages natively. It doesn't make linting much faster, but it lets you migrate to Oxlint today, and once it does, you can easily remove esinoxc and keep the rest of your config.

This means you can _almost_ migrate your Vue, Nuxt or other projects to the [Oxc](https://oxc.rs) and [Vite+](https://viteplus.dev) toolchain today.

## Installation

```bash
pnpm add -D esinoxc oxlint
```

## Usage

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

## Limitations

- oxlint applies fixes in one pass per run, ESLint in up to 10, so `--fix` may need a few runs ([oxc#16118](https://github.com/oxc-project/oxc/issues/16118)).
- Don't enable an oxlint built-in plugin together with the same ESLint plugin through esinoxc (e.g. `vue` and `vue-eslint`), or the rules both implement will report twice.

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
