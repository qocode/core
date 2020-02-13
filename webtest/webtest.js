import {
  deflateURLSearchParams, inflateURLSearchParams
} from './build/qosource.js'


console.log(deflateURLSearchParams('!deflateURLSearchParams!'))

console.log(inflateURLSearchParams(deflateURLSearchParams('!inflateURLSearchParams!')))
