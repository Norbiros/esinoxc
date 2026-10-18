import type { Plugin } from '@oxlint/plugins'
import type { ESLint, Linter } from 'eslint'

export interface EsinoxPlugin<P extends ESLint.Plugin = ESLint.Plugin> extends Plugin {
  /** The wrapped plugin's flat configs, with its rules renamed to `name`, for oxlint's `extends`. */
  configs: { [K in FlatConfigName<P>]: OxlintRulesConfig } & {
    // Presets typed as eslintrc configs exist only when they use no eslintrc features.
    [K in Exclude<keyof ConfigsOf<P>, FlatConfigName<P>>]?: OxlintRulesConfig
  }
}

export interface OxlintRulesConfig {
  rules: Linter.RulesRecord
}

type ConfigsOf<P extends ESLint.Plugin> = NonNullable<P['configs']>

type FlatConfigName<P extends ESLint.Plugin> = string extends keyof ConfigsOf<P>
  ? string
  : {
      [K in keyof ConfigsOf<P>]: ConfigsOf<P>[K] extends Linter.Config | Linter.Config[] ? K : never
    }[keyof ConfigsOf<P>]

export function toOxlintConfigs<P extends ESLint.Plugin>(
  name: string,
  plugin: P,
  baseConfig: Linter.Config[],
): EsinoxPlugin<P>['configs'] {
  const presets = Object.entries(plugin.configs ?? {})
    .map(([configName, config]) => [configName, [config].flat()] as const)
    .filter(([, configs]) => configs.every(isMappableConfig))
  // Some presets, like eslint-plugin-vue's `no-layout-rules`, do not register the plugin themselves.
  const prefixes = pluginPrefixes(plugin, [
    ...baseConfig,
    ...presets.flatMap(([, configs]) => configs),
  ])
  // Base config rules already run inside ESLint, so enabling them under the alias runs them twice.
  const baseRules = new Set(Object.keys(toAliasedRules(name, prefixes, baseConfig)))
  const configs: Record<string, OxlintRulesConfig> = {}

  for (const [configName, presetConfigs] of presets) {
    const rules = Object.entries(toAliasedRules(name, prefixes, presetConfigs))
    configs[configName] = {
      rules: Object.fromEntries(rules.filter(([ruleId]) => !baseRules.has(ruleId))),
    }
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return configs as EsinoxPlugin<P>['configs']
}

// Plugins may keep non-config values in `configs`, and rules nested in eslintrc
// `extends` or `overrides` cannot be mapped.
function isMappableConfig(config: unknown): boolean {
  return (
    typeof config === 'object' &&
    config !== null &&
    !('extends' in config) &&
    !('overrides' in config) &&
    !('plugins' in config && Array.isArray(config.plugins))
  )
}

function toAliasedRules(
  name: string,
  prefixes: Set<string>,
  configs: Array<Linter.Config | Linter.LegacyConfig>,
): Linter.RulesRecord {
  const rules: Linter.RulesRecord = {}

  for (const config of configs) {
    for (const [ruleId, entry] of Object.entries(config.rules ?? {})) {
      const slash = ruleId.lastIndexOf('/')
      if (entry !== undefined && prefixes.has(ruleId.slice(0, slash))) {
        rules[`${name}/${ruleId.slice(slash + 1)}`] = entry
      }
    }
  }
  return rules
}

function pluginPrefixes(
  plugin: ESLint.Plugin,
  configs: Array<Linter.Config | Linter.LegacyConfig>,
): Set<string> {
  return new Set(
    configs.flatMap((config) =>
      Object.entries(config.plugins ?? {})
        .filter(([, registered]) => registered === plugin)
        .map(([prefix]) => prefix),
    ),
  )
}
