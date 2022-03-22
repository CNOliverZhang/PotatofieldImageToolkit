const path = require('path');

module.exports = function override(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.join(__dirname, 'src'),
  };
  config.node = {
    __dirname: false,
    __filename: false,
  };
  config.target = 'electron-renderer';
  return config;
};
