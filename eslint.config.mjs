import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // layout.tsx IS the global layout, so the Google Fonts <link> tags
      // there load on every page (not just one) — this rule's premise
      // doesn't apply to the App Router.
      '@next/next/no-page-custom-font': 'off',
    },
  },
]

export default eslintConfig
