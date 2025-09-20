import { fileURLToPath } from 'node:url';
import path from 'node:path';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  ...compat.config({
    root: true,
    env: {
      browser: true,
      es2022: true,
      node: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended',
    ],
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  }),
];
