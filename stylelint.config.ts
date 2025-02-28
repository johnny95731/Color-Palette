import type { Config } from 'stylelint';

export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-html',
    'stylelint-config-clean-order',
  ],
  overrides: [
    {
      files: ['**/*.(scss|css|html|vue)'],
      customSyntax: 'postcss-scss'
    },
    {
      files: ['**/*.(html|vue)'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.module.scss'],
      rules: {
        // camel-cases
        'selector-class-pattern': '[a-z]+((\\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?'
      }
    },

  ],
  rules: {
    'selector-class-pattern': [
      '^[a-z]([-]?[a-z0-9]+)*(__[a-z0-9]([-]?[a-z0-9]+)*)?(--[a-z0-9]([-]?[a-z0-9]+)*)?$',
      {
        resolveNestedSelectors: true,
        message: function expected(selectorValue: string) {
          return `Expected class selector "${selectorValue}" to match BEM CSS pattern https://en.bem.info/methodology/css.`;
        },
      },
    ],
    'no-descending-specificity': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        'ignorePseudoClasses': ['global']
      }
    ],
    'at-rule-empty-line-before': [
      'always', {
        except: ['first-nested'],
        ignore: 'after-comment',
        ignoreAtRules: ['else', 'use']
      }
    ],
    'rule-empty-line-before': [
      'always', {
        except: 'first-nested',
        ignore: 'after-comment',
      }
    ],
    'scss/double-slash-comment-empty-line-before': [
      'always', { except: 'inside-block' }
    ],
    'order/order': [
      [
        'dollar-variables',
        'custom-properties',
        'declarations',
      ]
    ],
  }
} satisfies Config;
