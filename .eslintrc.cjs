/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  'root': true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'google',
    '@vue/eslint-config-typescript',
  ],
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'ecmaVersion': 'latest',
  },
  'rules': {
    'linebreak-style': 'off',
    'semi': 'error',
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'func-call-spacing': 'off',
  },
};
