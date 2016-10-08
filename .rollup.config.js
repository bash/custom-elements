import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

const isRelease = process.env[ 'BUILD_ENV' ] === 'release'
const plugins = [ babel() ]

if (isRelease) {
  plugins.push(uglify())
}

export default {
  plugins: plugins,
  sourceMap: !isRelease,
  format: 'iife'
}
