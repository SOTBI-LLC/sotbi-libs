export default {
  extends: ['@sotbi/stylelint-config'],
  overrides: [
    { files: ['src/styles/tokens.css'], rules: { 'color-no-hex': null } },
  ],
};
