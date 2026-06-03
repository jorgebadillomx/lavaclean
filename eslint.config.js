const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['_bmad-output/**', '.expo/**', 'build/**', 'coverage/**', 'dist/**', 'node_modules/**'],
  },
]);
