# Vue example

`eslint-plugin-vue` template rules running inside oxlint through esinoxc. `oxlint.config.ts` loads the ready-made `esinoxc/plugins/vue` entry under the `vue-eslint/` alias and enables its `flat/recommended` preset.

```sh
pnpm lint
```

`output.md` is the expected output, checked by `tests/examples.test.ts`.
