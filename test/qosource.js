import { Test, assert } from '@nodutilus/test'
import {
  deflateJSONURL, inflateJSONURL,
  QOData, QOCardData
} from '../src/qosource.js'
import {
  intToX16Pos2, intToX16Pos3, intToX64, x64ToInt,
  intToX64Pos2, encodeURLx64, decodeURLx64, testURLChars, decodeURISearch
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
  ['x64url - testURLChars']() {
    assert.equal(testURLChars('Привет'), false)
    assert.equal(testURLChars('QabgJt61Qo.2'), true)
    assert.equal(testURLChars('____'), true)
    assert.equal(testURLChars('0gYg.ff'), true)
    assert.equal(testURLChars('0gYg.1'), true)
    assert.equal(testURLChars('qcos.ru/test/api'), true)

    const x64alphabet = '0123456789' +
      'abcdefghijklmnopqrstuvwxyz' +
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
      '-_.'

    assert.equal(testURLChars(x64alphabet), true)
  }

  /** Проверка преобразования параметров поиска в url */
  ['x64url - decodeURISearch']() {
    const { URL } = window
    const url1 = new URL('http://qcos.ru/')
    const url2 = new URL('http://qcos.ru/')

    url1.searchParams.set('a', 'qcos.ru/api/')
    url2.searchParams.set('a', 'qcos.ru/апи#?!/')

    const url1Result = decodeURISearch(url1.href)
    const url2Result = decodeURISearch(url2.href)
    const eURI = encodeURI(decodeURIComponent(url2Result))

    assert.equal(url1Result, 'http://qcos.ru/?a=qcos.ru/api/')
    assert.equal(url2Result, 'http://qcos.ru/?a=qcos.ru/%D0%B0%D0%BF%D0%B8%23%3F%21/')
    assert.equal(eURI, 'http://qcos.ru/?a=qcos.ru/%D0%B0%D0%BF%D0%B8#?!/')
  }


  /** Проверка сжатия параметров URL */
  ['qosource - deflateJSONURL']() {
    assert.equal(deflateJSONURL({ name: 'Привет' }), 'GRraiYNdlr9iKz3_oIe57hsSntxWIkCF5w')
    assert.equal(deflateJSONURL({ api: 'qcos.ru', name: 'Привет' }),
      'GRpabcxkIB8GjcULRyIGlt9hOALcjgkan9x_Iu72zwKrbCOZSahk2M')

    const test = deflateJSONURL({ name: 'ПриветПриветПриветПривет' })

    assert.equal(testURLChars(test), true)

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

    qodata = new QOData({ api: '7', id: '8' })

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

  /** Получение ссылки на товар c простыми параметрами поиска */
  ['QOData - stringify simple']() {
    const qodata1 = new QOData({ api: 'qcos.ru', name: 'test', price: '100', ext: 'test' })
    const url = qodata1.stringify()
    const qodata2 = new QOData(url)

    assert.equal(url, 'https://qcos.ru/?a=qcos.ru&n=test&p=100&ext=test')
    assert.deepEqual(qodata2.raw, qodata1.raw)
  }

  /** Получение ссылки на товар со сжатыми данными */
  ['QOData - stringify deflate']() {
    const qodata1 = new QOData({ api: 'qcos.ru/api/', name: 'тест', price: '100р.', ext: 'тест' })
    const url = qodata1.stringify()
    const qodata2 = new QOData(url)

    assert.equal(url, 'https://qcos.ru/?a=qcos.ru/api/&GRrakX9iKJxQouL5NEJdizFa1k2KEo71NgoZ82uREwhpJxo0')
    assert.deepEqual(qodata2.raw, qodata1.raw)
  }

  /** Получение ссылки на товар c простыми и сжатыми данными */
  ['QOData - stringify simple+deflate']() {
    const qodata1 = new QOData({ api: 'qcos.ru', name: 'тест', price: '100р.', ext: 'test' })
    const url = qodata1.stringify()
    const qodata2 = new QOData(url)

    assert.equal(url, 'https://qcos.ru/?a=qcos.ru&ext=test&GRrakX9iKJxQouL5NEJdizFa1k2KEo71NgoZFlE0')
    assert.deepEqual(qodata2.raw, qodata1.raw)
  }

  /** Получение ссылки на товар без сжатия данных */
  ['QOData - stringify deflate=false']() {
    const qodata1 = new QOData({ name: 'тест', price: '100р.' }, { deflate: false })
    const url = qodata1.stringify()
    const qodata2 = new QOData(url)

    assert.equal(url, 'https://qcos.ru/?n=%D1%82%D0%B5%D1%81%D1%82&p=100%D1%80.')
    assert.equal(decodeURIComponent(url), 'https://qcos.ru/?n=тест&p=100р.')
    assert.deepEqual(qodata2.raw, qodata1.raw)
  }

  /** Получение ссылки на товар всегда со сжатием данных */
  ['QOData - stringify deflate=true']() {
    const qodata1 = new QOData({ name: 'name', price: '100' }, { deflate: true })
    const url = qodata1.stringify()
    const qodata2 = new QOData(url)

    assert.equal(url, 'https://qcos.ru/?GRrakX9iOALcjlnikiE0cwQd39hG.1')
    assert.deepEqual(qodata2.raw, qodata1.raw)
  }

  /** Получение данных товара без данных продавца */
  ['QOData - productData']() {
    const qodata = new QOData({ api: 'qcos.ru/api', seller: 'stest', name: 'test', price: '100' })

    assert.deepEqual(qodata.productData, { name: 'test', price: '100' })
  }

  /** Создание карточки заказа - свойства по умолчанию */
  ['QOCardData - init defaults']() {
    const qocarddata = new QOCardData()

    assert.equal(qocarddata.api, null)
    assert.equal(qocarddata.seller, null)
    assert.equal(qocarddata.valid, null)
    assert.equal(qocarddata.error, null)
    assert.deepEqual(qocarddata.raw, [])
    assert.deepEqual(qocarddata.errors, [])
  }

  /** Создание карточки заказа из простого объекта (QODataRaw) */
  ['QOCardData - init from object']() {
    const qocarddata = new QOCardData({ api: 'qcos.ru/api', seller: 'stest', name: 'test', price: '100' })

    assert.equal(qocarddata.api, 'https://qcos.ru/api')
    assert.equal(qocarddata.seller, 'stest')
    assert.equal(qocarddata.valid, true)
    assert.deepEqual(qocarddata.raw, [{ name: 'test', price: '100', number: 1 }])
  }

  /** Создание карточки заказа из массива товаров, с дополнением данными продавца  */
  ['QOCardData - init from array']() {
    const qocarddata = new QOCardData([{ name: 'test', price: '100' }])

    assert.equal(qocarddata.api, null)
    assert.equal(qocarddata.seller, null)
    assert.equal(qocarddata.valid, null)
    assert.deepEqual(qocarddata.raw, [{ name: 'test', price: '100', number: 1 }])

    qocarddata.update({ api: 'qcos.ru/api', seller: 'stest' })

    assert.equal(qocarddata.api, 'https://qcos.ru/api')
    assert.equal(qocarddata.seller, 'stest')
    assert.equal(qocarddata.valid, true)
  }

  /** Установка параметров продавца в карточке */
  ['QOCardData - init seller']() {
    const qodata = new QOData({ api: 'qcos.ru/api', seller: 'stest', name: 'test', price: '100' })
    const qocarddata = new QOCardData(qodata)

    assert.equal(qocarddata.api, 'https://qcos.ru/api')
    assert.equal(qocarddata.seller, 'stest')
    assert.equal(qocarddata.valid, true)
    assert.deepEqual(qocarddata.raw, [{ name: 'test', price: '100', number: 1 }])
  }

  /** Невалидная карточка без продавца */
  ['QOCardData - init without seller']() {
    const qodata = new QOData({ name: 'test', price: '100' })
    const qocarddata = new QOCardData(qodata)

    assert.equal(qocarddata.api, null)
    assert.equal(qocarddata.seller, null)
    assert.equal(qocarddata.valid, null)
    assert.equal(qocarddata.error, null)
    assert.equal(qocarddata.errors.length, 0)
  }

  /** Формирование точки отправки заказов относительно текущего сайта */
  ['QOCardData - resolveURL']() {
    const url1 = QOCardData.resolveURL('http://qcos.ru/api/')
    const url2 = QOCardData.resolveURL('qcos1.ru/api2#asd')
    const url3 = QOCardData.resolveURL('/api3/?asd')

    assert.equal(url1.href, 'http://qcos.ru/api/')
    assert.equal(url2.href, 'https://qcos1.ru/api2#asd')
    assert.equal(url3.href, 'https://qcos.ru/api3/?asd')
  }

  /** Восстановление карточки заказа по url */
  ['QOCardData - init by url']() {
    const { URL } = window
    const qocarddata1 = new QOCardData('qcos.ru/api1/')
    const qocarddata2 = new QOCardData(new URL('https://qcos.ru/api2/?name=2'))

    assert.equal(qocarddata1.api, 'https://qcos.ru/api1/')
    assert.equal(qocarddata1.seller, null)
    assert.equal(qocarddata1.valid, true)
    assert.deepEqual(qocarddata1.raw, [])

    assert.equal(qocarddata2.api, 'https://qcos.ru/api2/')
    assert.equal(qocarddata2.seller, null)
    assert.equal(qocarddata2.valid, true)
    assert.deepEqual(qocarddata2.raw, [{ id: 'name', number: '2' }])
  }

  /** Очистка списка товаров при обновлении из url */
  ['QOCardData - update by url']() {
    const { URL } = window
    const qocarddata = new QOCardData(new URL('https://qcos.ru/api/?name=2'))

    assert.equal(qocarddata.api, 'https://qcos.ru/api/')
    assert.equal(qocarddata.seller, null)
    assert.equal(qocarddata.valid, true)
    assert.deepEqual(qocarddata.raw, [{ id: 'name', number: '2' }])

    qocarddata.applyURL('qcos.ru/api1/')
    assert.equal(qocarddata.api, 'https://qcos.ru/api1/')
    assert.equal(qocarddata.seller, null)
    assert.equal(qocarddata.valid, true)
    assert.deepEqual(qocarddata.raw, [])
  }

  /** Попытка восстановление карточки заказа по невалидному url */
  ['QOCardData - init by bad url']() {
    const qocarddata = new QOCardData('https:qcos.ru/api/?id=1')

    assert.equal(qocarddata.api, null)
    assert.equal(qocarddata.seller, null)
    assert.equal(qocarddata.valid, false)
    assert.deepEqual(qocarddata.raw, [])
    assert.ok(qocarddata.error, qocarddata.errors[0])
    assert.equal(qocarddata.error.message, 'Invalid URL: https://https:qcos.ru/api/?id=1')
  }

  /** Создание карточки заказа оп URLSearchParams c доп. указанием продавца */
  ['QOCardData - init by URLSearchParams']() {
    const { URL } = window
    const qocarddata = new QOCardData(new URL('https://qcos.ru/api/?name=2&=').searchParams)

    assert.equal(qocarddata.api, null)
    assert.equal(qocarddata.seller, null)
    assert.equal(qocarddata.valid, null)
    assert.deepEqual(qocarddata.raw, [{ id: 'name', number: '2' }])

    qocarddata.update({ a: 'qcos1.ru/api2/' })

    assert.equal(qocarddata.api, 'https://qcos1.ru/api2/')
    assert.equal(qocarddata.seller, null)
    assert.equal(qocarddata.valid, true)
    assert.deepEqual(qocarddata.raw, [{ id: 'name', number: '2' }])
  }

  /** Добавление товара в карточку */
  ['QOCardData - add']() {
    const qodata = new QOData({ api: 'qcos.ru/api', seller: 'stest' })
    const qocarddata = new QOCardData(qodata)

    qocarddata.add({ name: 'test', price: '100' })
    assert.equal(qocarddata.valid, true)
    qocarddata.add({ api: 'qcos.ru/api' })
    assert.equal(qocarddata.valid, false)
    assert.deepEqual(qocarddata.raw, [{ name: 'test', price: '100', number: 1 }])
    assert.equal(qocarddata.error.message, 'Не переданы данные товара')
    assert.equal(qocarddata.errors[0].message, 'Не переданы данные товара')
  }

  /** Формирование урла заказа с товарами в виде ID */
  ['QOCardData - stringify with ids']() {
    const qodata = new QOData({ api: 'qcos.ru/api', id: 'id_1223' })
    const qocarddata = new QOCardData(qodata)

    qocarddata.add({ id: 1, number: 2 })

    const url = qocarddata.stringify()

    assert.equal(url, 'https://qcos.ru/api?id_1223=1&1=2')
  }

  /** Формирование урла заказа с товарами в виде сложных ID и количества */
  ['QOCardData - stringify with complex ids and number']() {
    const qodata = new QOData({ api: 'qcos.ru/api', id: 'тест', number: '5шт.' })
    const qocarddata = new QOCardData(qodata)

    qocarddata.add({ id: 'id_1223', number: 2 })

    const url = qocarddata.stringify()

    assert.equal(url, 'https://qcos.ru/api?id_1223=2&yWVmOANhIBaWS7hxWYn6yQRaeAFVFrB9Gkl0cteb7hurZ9hGoM.1')
  }

  /** Восстановление карточки заказа по сжатому url */
  ['QOCardData - restore by compressed url']() {
    const qocarddata1 = new QOCardData('https://qcos.ru/api?id_1223=2&yWVmOANhIBaWS7hxWYn6yQRaeAFVFrB9Gkl0cteb7hurZ9hGoM.1')

    assert.equal(qocarddata1.api, 'https://qcos.ru/api')
    assert.equal(qocarddata1.valid, true)
    assert.deepEqual(qocarddata1.raw, [{ id: 'id_1223', number: '2' }, { id: 'тест', number: '5шт.' }])
  }

}
