/**
 * jest-junit configuration
 * This file configures the JUnit XML reporter for CI/CD integration
 */
module.exports = {
  outputDirectory: './test-results',
  outputName: 'junit.xml',
  ancestorSeparator: ' › ',
  uniqueOutputName: 'false',
  suiteNameTemplate: '{filepath}',
  classNameTemplate: '{classname}',
  titleTemplate: '{title}',
};
