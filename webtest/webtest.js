import {
  deflateJSONURL, inflateJSONURL,
  QOData
} from './build/qosource.js'


console.log(deflateJSONURL({ test: 'test' }))

console.log(inflateJSONURL(deflateJSONURL({ test: 'test' })))


const { URL } = window
const param1 = deflateJSONURL({ api: 'qcos.ru' })
const param2 = deflateJSONURL({ price: 100 })
const url = `http://qcos.ru/?name=title&${param1}&${param2}`
const qodata = new QOData(url)


qodata.update(new URL('http://qcos.ru/?name=title1&='))
qodata.update({ price: 1000 })
console.log(qodata.raw)
console.log(qodata.stringify())
