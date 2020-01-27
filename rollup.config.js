import alias from '@rollup/plugin-alias'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import cleanup from 'rollup-plugin-cleanup'
import { terser } from 'rollup-plugin-terser'

export default [{
  input: 'src/pako.js',
  output: {
    dir: 'build',
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
  input: 'src/qosource.js',
  external: ['./external.js'],
  output: {
    dir: 'build',
    format: 'esm'
  },
  plugins: [
    alias({
      entries: [
        { find: './pako.js', replacement: './build/pako.js' }
      ]
    }),
    cleanup({
      comments: 'none'
    })
  ]
}]
