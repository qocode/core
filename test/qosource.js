import { Test, assert } from '@nodutilus/test'
import {
  deflateJSONURL, inflateJSONURL,
  QOData
} from '../src/qosource.js'
import {
  intToX16Pos2, intToX16Pos3, intToX64, x64ToInt,
  intToX64Pos2, encodeURLx64, decodeURLx64, testURLx64
} from '../src/lib/x64url.js'

/** Тесты источника данных заказа */
export default class TestQOSource extends Test {

  /** Приведение к числу с основанием 16, максимум 2 знака, 0-255 */
  ['x64url - intToX16Pos2']() {
    assert.equal(intToX16Pos2(1), '01')
    assert.equal(intToX16Pos2(15), '0f')
    assert.equal(intToX16Pos2(16), '10')
    assert.equal(intToX16Pos2(255), 'ff')
  }

  /** Приведение к числу с основанием 16, максимум 3 знака, 0-4095 */
  ['x64url - intToX16Pos3']() {
    assert.equal(intToX16Pos3(1), '001')
    assert.equal(intToX16Pos3(15), '00f')
    assert.equal(intToX16Pos3(16), '010')
    assert.equal(intToX16Pos3(255), '0ff')
    assert.equal(intToX16Pos3(4095), 'fff')
  }

  /** Приведение к числу с основанием 64 */
  ['x64url - intToX64']() {
    assert.equal(intToX64(1), '1')
    assert.equal(intToX64(63), '_')
    assert.equal(intToX64(64), '10')
  }

  /** Восстановление числа с основанием 64 в 10 */
  ['x64url - x64ToInt']() {
    assert.equal(x64ToInt('1'), 1)
    assert.equal(x64ToInt('_'), 63)
    assert.equal(x64ToInt('10'), 64)
  }

  /** Приведение к числу с основанием 64, максимум 2 знака, 0-4095 */
  ['x64url - intToX64Pos2']() {
    assert.equal(intToX64Pos2(1), '01')
    assert.equal(intToX64Pos2(15), '0f')
    assert.equal(intToX64Pos2(16), '0g')
    assert.equal(intToX64Pos2(64), '10')
    assert.equal(intToX64Pos2(255), '3_')
    assert.equal(intToX64Pos2(4095), '__')
  }

  /** Проеобразуем 8-битный массив в строку */
  ['x64url - encodeURLx64']() {
    const encoder = new TextEncoder()

    assert.equal(encodeURLx64(encoder.encode('Тест')), 'QabgJt61Qo.2')
    assert.equal(encodeURLx64(encoder.encode('Тест1')), 'QabgJt61Qo8N')
    assert.equal(encodeURLx64(encoder.encode('Тест123')), 'QabgJt61Qo8Ncz.3')
    assert.equal(encodeURLx64(new Uint8Array([255, 255, 255])), '____')
    assert.equal(encodeURLx64(new Uint8Array([1, 15, 16, 255])), '0gYg.ff')
    assert.equal(encodeURLx64(new Uint8Array([1, 15, 16, 1])), '0gYg.1')
  }

  /** Проеобразуем строку в 8-битный массив */
  ['x64url - decodeURLx64']() {
    const decoder = new TextDecoder()

    assert.equal(decoder.decode(decodeURLx64('QabgJt61Qo.2')), 'Тест')
    assert.equal(decoder.decode(decodeURLx64('QabgJt61Qo8N')), 'Тест1')
    assert.equal(decoder.decode(decodeURLx64('QabgJt61Qo8Ncz.3')), 'Тест123')
    assert.deepEqual(decodeURLx64('____'), new Uint8Array([255, 255, 255]))
    assert.deepEqual(decodeURLx64('0gYg.ff'), new Uint8Array([1, 15, 16, 255]))
    assert.deepEqual(decodeURLx64('0gYg.1'), new Uint8Array([1, 15, 16, 1]))
  }

  /** Проверяет что строка содержит только разрешенные для URL символы */
  ['x64url - testURLx64']() {
    assert.equal(testURLx64('Привет'), false)
    assert.equal(testURLx64('QabgJt61Qo.2'), true)
    assert.equal(testURLx64('____'), true)
    assert.equal(testURLx64('0gYg.ff'), true)
    assert.equal(testURLx64('0gYg.1'), true)

    const x64alphabet = '0123456789' +
      'abcdefghijklmnopqrstuvwxyz' +
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
      '-_.'

    assert.equal(testURLx64(x64alphabet), true)
  }

  /** Проверка сжатия параметров URL */
  ['qosource - deflateJSONURL']() {
    assert.equal(deflateJSONURL({ name: 'Привет' }), 'GRraiYNdlr9iKz3_oIe57hsSntxWIkCF5w')
    assert.equal(deflateJSONURL({ api: 'qcos.ru', name: 'Привет' }),
      'GRpabcxkIB8GjcULRyIGlt9hOALcjgkan9x_Iu72zwKrbCOZSahk2M')

    const test = deflateJSONURL({ name: 'ПриветПриветПриветПривет' })

    assert.equal(testURLx64(test), true)

    const { URL, location } = window
    const url = new URL('/', location.href)

    url.search = deflateJSONURL({ api: 'qcos.ru', name: 'Привет' })
    assert.equal(url.href, 'https://qcos.ru/?GRpabcxkIB8GjcULRyIGlt9hOALcjgkan9x_Iu72zwKrbCOZSahk2M')
  }

  /** Проверка распаковки параметров URL */
  ['qosource - inflateJSONURL']() {
    assert.deepEqual(inflateJSONURL('GRraiYNdlr9iKz3_oIe57hsSntxWIkCF5w'), { name: 'Привет' })
    assert.deepEqual(inflateJSONURL('GRpabcxkIB8GjcULRyIGlt9hOALcjgkan9x_Iu72zwKrbCOZSahk2M'),
      { api: 'qcos.ru', name: 'Привет' })

    assert.deepEqual(inflateJSONURL(deflateJSONURL({ x: 'ПриветПривет' })), { x: 'ПриветПривет' })
    assert.deepEqual(inflateJSONURL(deflateJSONURL({})), {})

    const json = {
      api: 'qcos.ru',
      name: 'Имя 1',
      price: 100
    }

    assert.deepEqual(inflateJSONURL(deflateJSONURL(json)), json)
  }

  /** Проверка опций по умолчанию для QOData */
  ['QOData - init options']() {
    const qodata1 = new QOData()
    const qodata2 = new QOData(null, { url: 'http://qcos.ru' })
    const qodata3 = new QOData(null, { host: 'example.com' })
    const qodata4 = new QOData(null, { url: 'http://qcos.ru/test/api?a=1#b=2' })
    const qodata5 = new QOData(null, {
      host: 'example.com',
      url: 'http://qcos.ru/test/api/?a=1#b=2'
    })
    const qodata6 = new QOData(null, { host: 'example.com', url: '/test/api/' })

    assert.equal(qodata1.baseURL.href, 'https://qcos.ru/')
    assert.equal(qodata2.baseURL.href, 'http://qcos.ru/')
    assert.equal(qodata3.baseURL.href, 'https://example.com/')
    assert.equal(qodata4.baseURL.href, 'http://qcos.ru/test/api')
    assert.deepEqual(qodata4.raw, {})
    assert.equal(qodata5.baseURL.href, 'http://example.com/test/api/')
    assert.deepEqual(qodata5.raw, {})
    assert.equal(qodata6.baseURL.href, 'https://example.com/test/api/')
  }

  /** QOData - парсинг данных из url и searchParams в формате deflate-json и объекта */
  ['QOData - parse string url']() {
    const { URL } = window
    const param1 = deflateJSONURL({ api: 'qcos.ru' })
    const param2 = deflateJSONURL({ price: 100 })
    const url = `http://qcos.ru/?name=title&${param1}&${param2}`
    const qodata = new QOData(url)

    assert.deepEqual(qodata.raw, { api: 'qcos.ru', name: 'title', price: 100 })

    qodata.update(new URL('http://qcos.ru/?name=title1&='))
    assert.deepEqual(qodata.raw, { api: 'qcos.ru', name: 'title1', price: 100 })

    qodata.update(new URL('http://qcos.ru/?api=qcos1.ru&=').searchParams)
    assert.deepEqual(qodata.raw, { api: 'qcos1.ru', name: 'title1', price: 100 })

    qodata.update({ price: 1000 })
    qodata.update()
    qodata.update(null)
    qodata.update(123)
    assert.deepEqual(qodata.raw, { api: 'qcos1.ru', name: 'title1', price: 1000 })
  }

  /** QOData - парсинг данных из FormData */
  ['QOData - parse form']() {
    const { document, FormData } = window
    const form = document.createElement('form')
    const qodata = new QOData()

    form.innerHTML =
      '<input type="text" name="api" value="qcos.ru"/>' +
      '<input type="text" name="name" value="title"/>'
    qodata.update(form)
    assert.deepEqual(qodata.raw, { api: 'qcos.ru', name: 'title' })

    form.innerHTML =
      '<input type="text" name="api" value="qcos1.ru"/>' +
      '<input type="text" name="name" value="title1"/>'
    qodata.update(new FormData(form))
    assert.deepEqual(qodata.raw, { api: 'qcos1.ru', name: 'title1' })
  }

  /** Проверка перехвата ошибок парсинга входных данных */
  ['QOData - parse errors']() {
    const qodata = new QOData()

    assert.equal(qodata.error, null)
    assert.deepEqual(qodata.errors, [])
    assert.equal(qodata.valid, false)

    qodata.update({ api: '', name: '', price: '' })
    assert.equal(qodata.error, null)
    assert.deepEqual(qodata.errors, [])
    assert.deepEqual(qodata.raw, {})
    assert.equal(qodata.valid, false)

    qodata.update('http://qcos.ru/?qwe')
    assert.ok(qodata.error, qodata.errors[0])
    assert.equal(qodata.error.message, 'Unexpected token   in JSON at position 0')
    assert.equal(qodata.valid, false)

    qodata.update('http://qcos.ru/?_')
    assert.ok(qodata.error, qodata.errors[1])
    assert.equal(qodata.error.message, 'Unexpected end of JSON input')
    assert.equal(qodata.valid, false)

    qodata.update('http://qcos.ru/?_GRraiYNdlr9iKz3_oIe57hsSntxWIkCF5w')
    assert.ok(qodata.error, qodata.errors[2])
    assert.equal(qodata.error, 'invalid block type')
    assert.equal(qodata.valid, false)

    qodata.update('http://qcos.ru/?rtgyw45yw45yse5yjs45uyek56uj')
    assert.ok(qodata.error, qodata.errors[3])
    assert.equal(qodata.error, 'invalid code lengths set')
    assert.equal(qodata.valid, false)
  }

  /** Проверка корректности формата данных для заказа */
  ['QOData - validate']() {
    let qodata = new QOData()

    assert.deepEqual([qodata.valid, qodata.seller, qodata.product], [false, false, false])

    qodata.update({ api: '1' })
    assert.deepEqual([qodata.valid, qodata.seller, qodata.product], [true, true, false])

    qodata.update({ name: '2' })
    assert.deepEqual([qodata.valid, qodata.seller, qodata.product], [true, true, false])

    qodata.update({ price: '3' })
    assert.deepEqual([qodata.valid, qodata.seller, qodata.product], [true, true, true])

    qodata = new QOData({ name: '4', price: '5' })

    assert.deepEqual([qodata.valid, qodata.seller, qodata.product], [true, false, true])

    qodata.update({ api: '6' })
    assert.deepEqual([qodata.valid, qodata.seller, qodata.product], [true, true, true])
  }

  /** Запись полей: встроенные, краткие, кастомные, невалидные */
  ['QOData - setRawFields']() {
    const raw = {}

    QOData.setRawFields(raw, [
      ['a', 'a'], ['name', 'n'], ['p', 1], ['test', '1'], [1, '2'], [null, '1'], [undefined, '1']
    ])

    assert.deepEqual(raw, { api: 'a', name: 'n', price: 1, test: '1' })
  }

  /** Получение ссылка на товар c простыми параметрами поиска */
  ['QOData - stringify simple']() {
    const qodata = new QOData({ api: 'qcos.ru', name: 'test', price: 100, ext: 'test' })
    const url = qodata.stringify()

    assert.equal(url, 'https://qcos.ru/?a=qcos.ru&n=test&p=100&ext=test')
  }

}
