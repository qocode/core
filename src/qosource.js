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
    n: 'name', //   Название товара (product Name)
    p: 'price' //   Цена товара (product Price)
  }

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
   * @property {string} [name]
   * @property {string} [price]
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
    /** @type {Error|null} */
    this.error = null
    /** @type {Array<Error>} */
    this.errors = []
    /** @type {Boolean|null} */
    this.valid = null
    /** @type {Boolean|null} */
    this.seller = null
    /** @type {Boolean|null} */
    this.product = null
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
    const product = 'name' in data && 'price' in data
    const valid = seller || product

    return [valid, seller, product]
  }

}


export {
  deflateJSONURL,
  inflateJSONURL,
  QOData
}
