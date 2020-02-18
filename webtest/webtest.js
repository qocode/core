import {
  deflateJSONURL, inflateJSONURL,
  QOData
} from './build/qosource.js'


console.log(deflateJSONURL('!deflateJSONURL!'))

console.log(inflateJSONURL(deflateJSONURL('!inflateJSONURL!')))


const { URL } = window
const param1 = deflateJSONURL(JSON.stringify({ api: 'qcos.ru' }))
const param2 = deflateJSONURL(JSON.stringify({ price: 100 }))
const url = `http://qcos.ru/?name=title&${param1}&${param2}`
const qodata = new QOData(url)


qodata.update(new URL('http://qcos.ru/?name=title1&='))
qodata.update({ price: 1000 })
console.log(qodata.raw)
