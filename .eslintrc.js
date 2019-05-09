module.exports = {
  env: {
    node: true,
    mocha: true
  },
  parserOptions: {
    ecmaVersion: 8
  },
  extends: 'eslint:recommended',
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'no-console': 'off',
    'no-unused-vars': 'warn'
  }
}
