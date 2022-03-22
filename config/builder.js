module.exports = {
  asar: false,
  extends: null,
  publish: {
    provider: 'generic',
    url: '',
  },
  files: [
    {
      from: './build',
      to: './build',
    },
    {
      from: './.electron-main',
      to: './electron',
    },
    {},
    '!node_modules',
    'package.json',
  ],
};
