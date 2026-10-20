# Vue example

A small Vue app linted by oxlint with `eslint-plugin-vue`'s `flat/recommended` rules, including the ones for `<template>`.

- `oxlint.config.ts` loads `esinoxc/plugins/vue` as `vue-eslint` and extends its preset.
- `src/` has a few components with issues for the rules to report, e.g. `v-for` without a key and `v-html`.

Run `vpr lint` to see the report. `output.md` is the expected output, checked by `tests/examples.test.ts`.
