# Svelte example

A small Svelte app linted by oxlint with `eslint-plugin-svelte`'s `flat/recommended` rules, including the ones for markup.

- `oxlint.config.ts` loads `esinoxc/plugins/svelte` as `svelte-eslint` and extends its preset.
- `src/` has a few components with issues for the rules to report, e.g. `{#each}` without a key and `{@html}`.

Run `vpr lint` to see the report. `output.md` is the expected output, checked by `tests/examples.test.ts`.
