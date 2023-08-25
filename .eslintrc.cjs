module.exports = {
  root: true,
  // env: {
  //   browser: true
  // },
  // overrides: [{
  //   files: [ 'src/*.ts' ]
  // }],
  ignorePatterns: ['dist/*', 'bundles/*', 'webpack.config.js'],
  plugins: [ '@typescript-eslint' ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json'
    // project: true,
    // tsconfigRootDir: __dirname
  },
  extends: [
    'eslint:recommended',
    // 'plugin:@typescript-eslint/recommended'
    'plugin:@typescript-eslint/recommended-type-checked'
  ],
  rules: {
    indent: [ 'error', 2 ],
    'max-len': [ 'error', {
      code: 80,
      tabWidth: 2
    }],
  }
}
