import { pako } from './pako.js'
import { encodeURLx64, decodeURLx64 } from './lib/x64url.js'

const { location, URL, URLSearchParams } = window


/**
 * Сжатие параметров поиска URL для использования в ссылке,
 *  использует только разрешенный для URL символы.
 *
 * @param {string} text
 * @returns {string}
 */
function deflateURLSearchParams(text) {
  const deflateRaw = pako.deflateRaw(text)
  const deflate = encodeURLx64(deflateRaw)

  return deflate
}


/**
 * Распаковка сжатых параметров поиска URL.
 * Обратный метод для deflateURLSearchParams.
 *
 * @param {string} text
 * @returns {string}
 */
function inflateURLSearchParams(text) {
  const inflate = decodeURLx64(text)
  const inflateRaw = pako.inflateRaw(inflate, { to: 'string' })

  return inflateRaw
}


/**
 * Получение и обработка данных для формирования заказа
 */
class QOData {

  /**
   * @typedef QODataOptions
   * @property {string} [url=location.origin]
   * @property {string} [host]
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
    this.options = Object.assign({
      url: location.origin
    }, options)

    /** @type {QODataRaw} */
    this.raw = {}
    this.update(data)
  }

  /**
   * @param {URL|URLSearchParams|FormData} data
   */
  update(data) {
    if (typeof data === 'string') {
      data = new URL(data).searchParams
    }
    if (data instanceof URL) {
      data = data.searchParams
    }
    if (data instanceof URLSearchParams) {
      QOData.applyURLSearchParams(this.raw, data)
    } else if (data instanceof Object) {
      QOData.setRawFields(this.raw, Object.entries(data))
    }
  }

  /**
   * @param {QODataRaw} raw
   * @param {URLSearchParams} searchParams
   */
  static applyURLSearchParams(raw, searchParams) {
    for (const [key, value] of searchParams.entries()) {
      if (key && !value) {
        const json = JSON.parse(inflateURLSearchParams(key))

        this.setRawFields(raw, Object.entries(json))
      } else if (key && value) {
        this.setRawFields(raw, [[key, value]])
      }
    }
  }

  /**
   * @param {QODataRaw} raw
   * @param {Array<Array<string,string>>} fields
   */
  static setRawFields(raw, fields) {
    for (const [key, value] of fields) {
      raw[key] = value
    }
  }

}


export {
  deflateURLSearchParams,
  inflateURLSearchParams,
  QOData
}
