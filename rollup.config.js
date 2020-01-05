import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import cleanup from 'rollup-plugin-cleanup'
import { terser } from 'rollup-plugin-terser'

export default [{
  input: 'src/external.js',
  output: {
    dir: '.',
    format: 'esm',
    compact: true
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    cleanup({
      comments: 'none'
    }),
    terser()
  ]
}, {
  input: 'src/qocode.js',
  external: ['./external.js'],
  output: {
    dir: '.',
    format: 'esm'
  },
  plugins: [
    cleanup({
      comments: 'none'
    })
  ]
}]
