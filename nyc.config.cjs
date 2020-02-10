const config = require('@nodutilus/nyc-config')

config.exclude.push('test/index.js')

module.exports = Object.assign({}, config, {
  'include': [
    'src',
    'test'
  ],
  'temp-dir': './build/nyc_output',
  'report-dir': './build/coverage'
})
