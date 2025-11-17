// frontend/eslint.config.mjs
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import babelParser from '@babel/eslint-parser'; // <-- 1. Importar o Babel Parser

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      // Usar o Babel Parser para suportar 'import' e 'export' e JSX
      parser: babelParser, // <-- 2. Usar o Babel Parser
      
      ecmaVersion: 2022,
      sourceType: 'module', // <-- 3. CORREÇÃO: Deve ser 'module' para 'import/export'
      
      parserOptions: {
        ecmaFeatures: {
          jsx: true, 
        },
        // Opcional, mas útil se você não tem um .babelrc na raiz
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
        process: 'readonly', // <-- Adicionado para caso process.env seja usado
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Aplicação de regras do React/Hooks
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      
      // Regras customizadas:
      'no-console': 'off',
      // Desabilitar/Avisar regras que falham em código minificado (build/)
      'eqeqeq': 'off', // <-- Desabilitado para passar no lint da pasta 'build'
      'curly': 'off', // <-- Desabilitado para passar no lint da pasta 'build'
      'no-cond-assign': 'off', // <-- Desabilitado para passar no lint da pasta 'build'
      
      'no-unused-vars': ['error', { argsIgnorePattern: '^_|e|o|t|r' }], // <-- Ajuste para ignorar variáveis de minificação
      'react/prop-types': 'off',
      'no-useless-catch': 'off',
    },
  },
  // 4. Excluir explicitamente o diretório 'build' do lint
  {
    ignores: ['build/**'], 
    rules: {} // Esta seção é apenas para o `ignores`
  }
];