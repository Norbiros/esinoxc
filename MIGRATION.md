# Migrating from ESLint

This guide moves a project that lints `.vue` or `.svelte` files with ESLint to oxlint with
esinoxc. You can link your agent to this file, so it can do the migration for you.

esinoxc ships ready-made entries for these plugins. Any other ESLint plugin can be wrapped with
`createEsinoxPlugin`, see the [README](README.md#other-plugins).

| ESLint plugin          | esinoxc entry            | rule prefix      |
| ---------------------- | ------------------------ | ---------------- |
| `eslint-plugin-vue`    | `esinoxc/plugins/vue`    | `vue-eslint/`    |
| `eslint-plugin-svelte` | `esinoxc/plugins/svelte` | `svelte-eslint/` |

## 1. Install

```bash
pnpm add -D esinoxc oxlint @typescript-eslint/parser
```

Keep the ESLint plugin you already have installed: esinoxc runs it. `@typescript-eslint/parser`
is only needed for `<script lang="ts">` and must be 8.57 or newer.

Linting templates needs oxlint changes that aren't released yet. See
[#5](https://github.com/Norbiros/esinoxc/issues/5) for how to get them today.

## 2. Move the config

Every rule runs through esinoxc under the new prefix, so rename `vue/x` to `vue-eslint/x` (or
`svelte/x` to `svelte-eslint/x`) and keep the options as they are.

Before:

```js
// eslint.config.js
import vue from 'eslint-plugin-vue'

export default [
  ...vue.configs['flat/recommended'],
  {
    rules: {
      'vue/no-v-html': 'off',
      'vue/max-attributes-per-line': ['error', { singleline: 3 }],
    },
  },
]
```

After:

```ts
// oxlint.config.ts
import vueEslint from 'esinoxc/plugins/vue'
import { defineConfig } from 'oxlint'

export default defineConfig({
  jsPlugins: [{ name: 'vue-eslint', specifier: 'esinoxc/plugins/vue' }],
  extends: [vueEslint.configs['flat/recommended']],
  rules: {
    'vue-eslint/no-v-html': 'off',
    'vue-eslint/max-attributes-per-line': ['error', { singleline: 3 }],
  },
})
```

For Svelte, swap `vue` for `svelte` in the names above.

Don't add `vue` to oxlint's `plugins`. oxlint's built-in `vue` plugin implements some of the
same rules, and with both enabled they report twice.

## 3. Rewrite disable comments

Comments that name a rule must use the new prefix, or they no longer suppress anything:

```diff
- // eslint-disable-next-line vue/no-v-html
+ // eslint-disable-next-line vue-eslint/no-v-html
- <!-- eslint-disable-next-line vue/max-attributes-per-line -->
+ <!-- eslint-disable-next-line vue-eslint/max-attributes-per-line -->
```

This rewrites every `eslint-disable` and `eslint-enable` comment in tracked files and leaves the
rest of the code alone:

```bash
git ls-files '*.vue' '*.svelte' '*.js' '*.ts' '*.jsx' '*.tsx' '*.mjs' '*.mts' | xargs perl -pi -e \
  's{(eslint-(?:disable|enable)\S*)(.*?)(?=--|\*/|$)}{my ($d, $r) = ($1, $2); $d . $r =~ s#(?<![\w@/-])(vue|svelte)/#$1-eslint/#gr}ge'
```

Keep the `eslint-` spelling in template comments. In `<script>`, oxlint also accepts
`oxlint-disable`, but in the template only `eslint-disable` works.

## 4. Remove ESLint

Delete `eslint.config.*` and uninstall `eslint` and any configs or plugins you no longer use. Keep
the ESLint plugins you moved to esinoxc and `@typescript-eslint/parser`: esinoxc runs them.

## Known limitations

- `oxlint --fix` applies one pass per run and ESLint up to 10, so it may take a few runs to
  reach the same output ([oxc#16118](https://github.com/oxc-project/oxc/issues/16118)). This is
  not an esinoxc issue.
- Don't enable an oxlint built-in plugin together with the same ESLint plugin through esinoxc
  (e.g. `vue` and `vue-eslint`), or the rules both implement will report twice.
