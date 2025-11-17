// frontend/eslint.config.js
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals'; // ← ADICIONADO

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
      sourceType: 'script',
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // ← OBRIGATÓRIO PARA JSX EM .js
        },
      },
      globals: {
        ...globals.browser, // ← INCLUI console, URLSearchParams, etc
        ...globals.es2021,
        ...globals.jest,
        ...globals.node,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-console': 'off', // ← PERMITE console.log
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'eqeqeq': 'error',
      'curly': 'error',
      'react/prop-types': 'off',
      'no-useless-catch': 'off', // ← DESATIVA REGRA CHATA
    },
  },
];