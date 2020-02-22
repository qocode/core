import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import { terser } from 'rollup-plugin-terser'

export default [{
  input: 'src/external.js',
  output: { file: 'build/external.js', format: 'esm', compact: true },
  plugins: [
    resolve({ browser: true, preferBuiltins: false }),
    commonjs({ include: 'node_modules/**' }),
    cleanup({ comments: 'none' }),
    terser()
  ]
}, {
  input: 'src/pako.js',
  output: { file: 'build/tmp/pako.js', format: 'esm', compact: true },
  plugins: [
    resolve({ browser: true, preferBuiltins: false }),
    commonjs({ include: 'node_modules/**' }),
    cleanup({ comments: 'none' }),
    terser()
  ]
}, {
  input: 'src/qosource.js',
  external: ['./pako.js'],
  output: { file: 'build/tmp/qosource.js', format: 'esm' },
  plugins: [babel({ plugins: ['@babel/plugin-proposal-class-properties'] })]
}, {
  input: 'build/tmp/qosource.js',
  output: { file: 'build/qosource.js', format: 'esm' },
  plugins: [cleanup({ comments: 'none' })]
}]
