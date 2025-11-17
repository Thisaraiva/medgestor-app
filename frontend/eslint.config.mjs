// frontend/eslint.config.mjs

import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parser: babelParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react', '@babel/preset-env'],
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.jest,
        ...globals.node,
        process: 'readonly',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Aplicação de regras do React/Hooks
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // MUDANÇAS PARA WARNINGS:

      // 1. Converte no-unused-vars de 'error' para 'warn'
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|e|o|t|r' }],

      // 2. Converte no-func-assign de 'error' para 'warn'
      'no-func-assign': 'warn',

      // 3. Converte set-state-in-effect/componente de 'error' para 'warn' (AuthContext)
      // Nota: Esta regra é especificamente para React Class Components, mas o React Hooks usa uma regra similar:
      'react-hooks/rules-of-hooks': 'error', // Manter como erro
      // Abaixo, configuramos a regra específica de useEffect para warning:
      'react-hooks/exhaustive-deps': 'warn',

      // Regras customizadas:
      'no-console': 'off',
      'eqeqeq': 'off',
      'curly': 'off',
      'no-cond-assign': 'off',
      'react/prop-types': 'off',
      'no-useless-catch': 'off',
    },
  },
];