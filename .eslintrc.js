module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 0,
    'linebreak-style': 0,
    'no-continue': 0,
    'no-await-in-loop': 0,
    'no-restricted-syntax': 0,
  },
};
