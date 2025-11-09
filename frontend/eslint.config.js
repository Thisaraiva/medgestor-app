// frontend/eslint.config.js
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        browser: true,
        es2021: true,
        jest: true,
        node: true,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-console': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'eqeqeq': 'error',
      'curly': 'error',
      'react/prop-types': 'off',
    },
  },
];