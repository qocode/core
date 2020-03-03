import {
  deflateJSONURL, inflateJSONURL,
  QOData
} from './build/qosource.js'
import { QRCode } from './build/external.js'

console.log(deflateJSONURL({ test: 'test' }))

console.log(inflateJSONURL(deflateJSONURL({ test: 'test' })))


const { URL } = window
const param1 = deflateJSONURL({ api: 'qcos.ru' })
const param2 = deflateJSONURL({ price: 100 })
const url = `http://qcos.ru/?name=title&${param1}&${param2}`
const qodata = new QOData(url)


qodata.update(new URL('http://qcos.ru/?name=тест&='))
qodata.update({ price: 1000 })
console.log(qodata.raw)
console.log(qodata.stringify())


qodata.update('http://qcos.ru/?a=qcos.ru/api/&s=тест')
console.log(qodata.stringify())


const conf1 = { color: { light: '#ffffff00' }, errorCorrectionLevel: 'H', margin: 4, scale: 1 }
const conf2 = { color: { light: '#ffffff00' }, errorCorrectionLevel: 'H', margin: 3, scale: 2 }
const conf3 = { color: { light: '#ffffff00' }, errorCorrectionLevel: 'H', margin: 2, scale: 3 }


QRCode.toCanvas(document.getElementById('canvas_1'), 'qcos.ru', conf1,
  error => { if (error) console.error(error) })
QRCode.toCanvas(document.getElementById('canvas_2'), 'qcos.ru', conf2,
  error => { if (error) console.error(error) })
QRCode.toCanvas(document.getElementById('canvas_3'), 'qcos.ru', conf3,
  error => { if (error) console.error(error) })

QRCode.toCanvas(document.getElementById('canvas_4'), 'http://qcos.ru', conf1,
  error => { if (error) console.error(error) })
QRCode.toCanvas(document.getElementById('canvas_5'), 'http://qcos.ru', conf2,
  error => { if (error) console.error(error) })
QRCode.toCanvas(document.getElementById('canvas_6'), 'http://qcos.ru', conf3,
  error => { if (error) console.error(error) })

QRCode.toCanvas(document.getElementById('canvas_7'), 'https://qcos.ru', conf1,
  error => { if (error) console.error(error) })
QRCode.toCanvas(document.getElementById('canvas_8'), 'https://qcos.ru', conf2,
  error => { if (error) console.error(error) })
QRCode.toCanvas(document.getElementById('canvas_9'), 'https://qcos.ru', conf3,
  error => { if (error) console.error(error) })

QRCode.toCanvas(document.getElementById('canvas_10'), 'qcos.ru/?a=qcos.ru/api/', conf3,
  error => { if (error) console.error(error) })
QRCode.toCanvas(document.getElementById('canvas_11'), 'https://qcos.ru/?n=тест&p=100р.', conf3,
  error => { if (error) console.error(error) })
QRCode.toCanvas(document.getElementById('canvas_12'), 'https://qcos.ru/?n=%D1%82%D0%B5%D1%81%D1%82&p=100%D1%80.', conf3,
  error => { if (error) console.error(error) })
QRCode.toCanvas(document.getElementById('canvas_13'), 'https://qcos.ru/?!n=qwe&!x=qwe', conf3,
  error => { if (error) console.error(error) })


const customParams = new URL('http://qcos.ru/?!n=qwe&!x=123')
const customqodata = new QOData(customParams, { deflate: false })

customParams.searchParams.set('!a', 'aaa')
console.log(customParams.href)
console.log(customqodata.raw)
console.log(customqodata.stringify())
