import type { Linter } from 'eslint'

// `<script lang="ts">` needs `@typescript-eslint/parser`, an optional peer.
export async function typescriptParserConfig(files: string[]): Promise<Linter.Config[]> {
  try {
    const { default: parser } = await import('@typescript-eslint/parser')
    return [{ files, languageOptions: { parserOptions: { parser } } }]
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ERR_MODULE_NOT_FOUND')
      return []
    throw error
  }
}
