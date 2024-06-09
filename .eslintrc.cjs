/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  'root': true,
  'env': {
    'browser': true,
    'es2022': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-typescript',
  ],
  'ignorePatterns': ['vite.config.ts'],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'plugins': [
    'vue', '@typescript-eslint'
  ],
  'rules': {
    'linebreak-style': 'off',
    'quotes': ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    'semi': ['error', 'always'],
    'indent': ['error', 2],
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'func-call-spacing': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/v-on-event-hyphenation': 'off',
    'vue/valid-v-slot': ['error', {
      'allowModifiers': true,
    }],
    'vue/require-default-prop': 'off'
  },
};
