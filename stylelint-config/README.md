# @sotbi/stylelint-config

Общие строгие правила Stylelint17 для Tailwind4 и Angular.

```js
export default {
  extends: ['@sotbi/stylelint-config'],
  overrides: [
    { files: ['src/styles/tokens.css'], rules: { 'color-no-hex': null } },
  ],
};
```

Токены конкретного потребителя, customSyntax для SCSS и обоснованные локальные исключения настраиваются в потребителе. Нарушения по умолчанию — error, включая новые домены. Сборка: `yarn nx build stylelint-config`, проверка: `yarn nx test stylelint-config`.
