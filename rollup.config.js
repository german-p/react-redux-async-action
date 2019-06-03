import babel from 'rollup-plugin-babel';

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'esm',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: ['@babel/env'],
    }),
  ],
};
