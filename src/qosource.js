import { pako } from './pako.js'
import { encodeURLx64, decodeURLx64 } from './lib/x64url.js'


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


export {
  deflateURLSearchParams,
  inflateURLSearchParams
}
