export default {
  extends: ['stylelint-config-standard'],
  defaultSeverity: 'error',
  rules: {
    // Tailwind/PostCSS разворачивает строковые импорты с сохранением слоёв.
    'import-notation': 'string',
    'declaration-no-important': true,
    'color-no-hex': true,
    'color-named': 'never',
    'no-duplicate-selectors': true,
    'declaration-block-no-duplicate-properties': true,
    'selector-pseudo-element-disallowed-list': ['ng-deep'],
    // Классы в стиле BEM: block, block__element, block--modifier.
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      {
        message:
          'Класс должен быть kebab-case или BEM (block__element--modifier)',
      },
    ],
    // Angular: теги компонентов и ::ng-deep — известные конструкции; сам ::ng-deep
    // запрещён правилом выше и разрешается только комментарием с обоснованием.
    'selector-type-no-unknown': [
      true,
      { ignore: ['custom-elements'], ignoreTypes: ['markdown'] },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      { ignorePseudoElements: ['ng-deep'] },
    ],
    'at-rule-disallowed-list': ['apply'],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'theme',
          'utility',
          'variant',
          'custom-variant',
          'source',
          'use',
          'include',
          'mixin',
          'extend',
        ],
      },
    ],
  },
};
