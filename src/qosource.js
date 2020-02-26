import { pako } from './pako.js'
import { encodeURLx64, decodeURLx64, testURLx64 } from './lib/x64url.js'

const { location, URL, URLSearchParams, HTMLFormElement, FormData } = window


/**
 * Сжатие json-объекта для использования в URL,
 *  использует только разрешенный для URL символы.
 *
 * @param {object} json
 * @returns {string}
 */
function deflateJSONURL(json) {
  const text = JSON.stringify(json)
  const deflateRaw = pako.deflateRaw(text)
  const deflate = encodeURLx64(deflateRaw)

  return deflate
}


/**
 * Распаковка сжатого json-объекта из URL.
 * Обратный метод для deflateJSONURL.
 *
 * @param {string} text
 * @returns {object}
 */
function inflateJSONURL(text) {
  const inflate = decodeURLx64(text)
  const inflateRaw = pako.inflateRaw(inflate, { to: 'string' })
  const json = JSON.parse(inflateRaw)

  return json
}


/**
 * Получение и обработка данных для формирования заказа
 */
class QOData {

  /** @type {{string:string}} */
  static propsMap = {
    a: 'api', //    URL сервиса для работы с заказами (Api url)
    s: 'seller', // Название продавца (Seller name)
    i: 'id', //     Уникальный идентификатор товара (unique product Id)
    n: 'name', //   Название товара (product Name)
    p: 'price', //  Цена товара (product Price)
    u: 'number' //  Количество единиц продукции (number of product Units)
  }

  /** @type {Array<string>} */
  static propsSeller = ['api', 'seller']

  /** @type {{string:string}} */
  static propsMapShort = Object.entries(this.propsMap)
    .reduce((short, [key, value]) => (short[value] = key) && short, {})

  /**
   * @typedef QODataOptions
   * @property {string} [url=location.origin]
   * @property {string} [host]
   * @property {boolean} [deflate]
   */
  /**
   * @typedef QODataRaw
   * @property {string} [api]
   * @property {string} [seller]
   * @property {string} [id]
   * @property {string} [name]
   * @property {string} [price]
   * @property {number} [number]
   */
  /**
   * @param {URL|URLSearchParams|FormData} data
   * @param {QODataOptions} [options={}]
   * @returns {QOData}
   */
  constructor(data, options = {}) {
    /** @type {QODataOptions} */
    options = Object.assign({
      url: location.origin
    }, options)

    /** @type {string} */
    this.baseURL = new URL(options.url, location.origin)
    this.baseURL = new URL(this.baseURL.origin + this.baseURL.pathname)
    if (options.host) {
      this.baseURL.host = options.host
    }
    /** @type {boolean} */
    this.deflate = options.deflate

    /** @type {QODataRaw} */
    this.raw = {}
    /** @type {Boolean|null} */
    this.valid = null
    /** @type {Boolean|null} */
    this.seller = null
    /** @type {Boolean|null} */
    this.product = null
    /** @type {Error|null} */
    this.error = null
    /** @type {Array<Error>} */
    this.errors = []

    this.update(data)
  }

  /**
   * Обновление данных о заказе из url адреса или dom-формы
   *
   * @param {URL|URLSearchParams|FormData} data
   */
  update(data) {
    try {
      if (typeof data === 'string') {
        QOData.applyURLSearchParams(this.raw, new URL(data).searchParams)
      } else if (data instanceof URL) {
        QOData.applyURLSearchParams(this.raw, data.searchParams)
      } else if (data instanceof URLSearchParams) {
        QOData.applyURLSearchParams(this.raw, data)
      } else if (data instanceof HTMLFormElement) {
        QOData.setRawFields(this.raw, new FormData(data).entries())
      } else if (data instanceof FormData) {
        QOData.setRawFields(this.raw, data.entries())
      } else if (data instanceof Object) {
        QOData.setRawFields(this.raw, Object.entries(data))
      }
      [this.valid, this.seller, this.product] = QOData.validate(this.raw)
    } catch (error) {
      [, this.seller, this.product] = QOData.validate(this.raw)
      this.valid = false
      this.error = error
      this.errors.push(error)
    }
  }

  /**
   * Преобразует данные в URL для хранение в виде ссылка на сайт
   *
   * @returns {String}
   */
  stringify() {
    const result = new URL('', this.baseURL)
    const search = result.searchParams
    const deflateData = {}

    for (const [key, value] of Object.entries(this.raw)) {
      if (this.deflate === false || (this.deflate !== true && testURLx64(key + value))) {
        search.set(QOData.propsMapShort[key] || key, value)
      } else {
        deflateData[QOData.propsMapShort[key] || key] = value
      }
    }
    if (Object.keys(deflateData).length) {
      search.set(deflateJSONURL(deflateData), '')

      return result.href.replace(/=$/, '')
    }

    return result.href
  }

  /**
   * Получение данных товара без данных поставщика
   *
   * @returns {QODataRaw}
   */
  get productData() {
    const keys = Object.keys(this.raw)
      .filter(key => !QOData.propsSeller.includes(key))
    const data = {}

    for (const key of keys) {
      data[key] = this.raw[key]
    }

    return data
  }

  /**
   * Получение данных о заказе из url адреса.
   * С учетом данных сжатых в формате URLx64,
   *  использующем только допустимые символы URL
   *
   * @param {QODataRaw} raw
   * @param {URLSearchParams} searchParams
   */
  static applyURLSearchParams(raw, searchParams) {
    for (const [key, value] of searchParams.entries()) {
      if (key && !value) {
        const json = inflateJSONURL(key)

        this.setRawFields(raw, Object.entries(json))
      } else if (key && value) {
        this.setRawFields(raw, [[key, value]])
      }
    }
  }

  /**
   * Общий метод записи данных о заказе в формате "entries"
   *
   * @param {QODataRaw} raw
   * @param {Array<Array<string,string>>} fields
   */
  static setRawFields(raw, fields) {
    for (const [key, value] of fields) {
      if (key && value && typeof key === 'string') {
        if (key in QOData.propsMap) {
          raw[QOData.propsMap[key]] = value
        } else {
          raw[key] = value
        }
      }
    }
  }

  /**
   * Проверка корректности формата данных для заказа
   *
   * @param {QODataRaw} data
   * @returns {Array<Boolean>}
   */
  static validate(data) {
    const seller = 'api' in data
    const product = ('name' in data && 'price' in data) || 'id' in data
    const valid = seller || product

    return [valid, seller, product]
  }

}


/**
 * Данные зказа
 */
class QOCardData {

  /**
   * @typedef {Array<QODataRaw>} QOCardDataRaw
   */
  /**
   * @param {URL|URLSearchParams|QOData|QOCardDataRaw} card
   */
  constructor(card) {
    /** @type {QOCardDataRaw} */
    this.raw = []
    /** @type {string|null} */
    this.api = null
    /** @type {string|null} */
    this.seller = null
    /** @type {Boolean} */
    this.valid = null
    /** @type {Error|null} */
    this.error = null
    /** @type {Array<Error>} */
    this.errors = []

    this.update(card)
  }

  /**
   * Обновление позиций заказа из url адреса или списка товаров.
   * Очищает ранее добавленные записи.
   *
   * @param {URL|URLSearchParams|QOData|QOCardDataRaw} card
   */
  update(card) {
    try {
      if (typeof card === 'string') {
        this.applyURL(new URL(card, location.origin))
      } else if (card instanceof QOData) {
        this.applyQOData(card)
      } else if (card instanceof URL) {
        this.applyURL(card)
      } else if (card instanceof URLSearchParams) {
        this.applyURLSearchParams(card)
      } else if (card instanceof Array) {
        for (const item of card) {
          this.add(item)
        }
      } else if (card instanceof Object) {
        this.applyQOData(new QOData(card))
      }
    } catch (error) {
      this.valid = false
      this.error = error
      this.errors.push(error)
    }
  }

  /**
   * Обновление сведений карточки их экземпляра класса с данными о товаре
   *
   * @param {QOData} qodata
   */
  applyQOData(qodata) {
    if (qodata.seller) {
      this.api = qodata.raw.api
      this.seller = qodata.raw.seller
    }
    if (!this.api) {
      this.valid = false
      this.error = new Error('Не переданы данные продавца')
      this.errors.push(this.error)
    } else if (!this.error) {
      this.valid = true
    }
    if (qodata.product) {
      this.raw = []
      this.add(qodata)
    }
  }

  /**
   *
   * @param {URL} card
   */
  applyURL(card) {
    this.api = card.host + card.pathname
    if (this.api && !this.error) {
      this.valid = true
    }
    this.applyURLSearchParams(card.searchParams)
  }

  /**
   * Обновляет данные о покупках из параметров запроса URL
   *
   * @param {URLSearchParams} card
   */
  applyURLSearchParams(card) {

  }

  /**
   * Добавление позиции в данные заказа
   *
   * @param {QOData} data
   */
  add(data) {
    const qodata = data instanceof QOData ? data : new QOData(data)

    if (qodata.product) {
      const { productData } = qodata

      productData.number = productData.number || 1

      this.raw.push(productData)
    } else {
      this.valid = false
      this.error = new Error('Не переданы данные товара')
      this.errors.push(this.error)
    }
  }

  /**
   * Преобразует данные в URL для перехода на оформление заказа
   *
   * @returns {String}
   */
  stringify() {
    const result = new URL(this.api, location.origin)
    const search = result.searchParams
    const deflateData = []

    for (const item of this.raw) {
      if ('id' in item && testURLx64('' + item.id + item.number)) {
        search.set(item.id, item.number)
      } else {
        deflateData.push(item)
      }
    }
    if (deflateData.length) {
      search.set(deflateJSONURL(deflateData), '')

      return result.href.replace(/=$/, '')
    }

    return result.href
  }

}


export {
  deflateJSONURL,
  inflateJSONURL,
  QOData,
  QOCardData
}
