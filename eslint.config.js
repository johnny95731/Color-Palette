import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';


export default [
  { files: ['**/*.{js,mjs,cjs,ts,vue}'] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/strongly-recommended'],
  ...pluginVue.configs['flat/essential'],
  stylistic.configs.customize(),
  importPlugin.flatConfigs.typescript,
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    rules: {
      '@stylistic/max-len': ['error', { code: 80, ignoreComments: true }],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/indent': ['error', 2, { offsetTernaryExpressions: false }],
      '@stylistic/linebreak-style': 'off',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/func-call-spacing': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@stylistic/no-multiple-empty-lines': ['error', { max: 2, maxBOF: 0 }],
      'vue/no-multiple-template-root': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',
      'vue/valid-v-slot': [
        'error',
        {
          allowModifiers: true,
        },
      ],
      'vue/require-default-prop': 'off',
      'import/first': 'error',
      'import/newline-after-import': ['error', { count: 2 }],
      'import/order': ['error', {
        'groups': [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'object',
          'type',
        ],
        'pathGroups': [
          {
            pattern: '@/**',
            group: 'internal',
          },
        ],
        'newlines-between': 'always',
        'pathGroupsExcludedImportTypes': ['type'],
        'alphabetize': {
          order: 'asc',
          caseInsensitive: true,
        },
      }],
    },
  },
];
