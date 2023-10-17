const {
  override,
  addExternalBabelPlugin,
  removeModuleScopePlugin,
} = require('customize-cra');

module.exports = override(
  addExternalBabelPlugin([
    '@babel/plugin-proposal-class-properties',
    {
      loose: true,
    },
  ]),
  removeModuleScopePlugin(),
);
