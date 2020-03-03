const x64alphabet = '0123456789' +
  'abcdefghijklmnopqrstuvwxyz' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '-_'
const partDelimiter = '.'
const x64len = x64alphabet.length
const urlValidCharsRE = new RegExp(`^[${x64alphabet.replace('-', '\\-') + partDelimiter}/]+$`)


/**
 * @param {number} value
 * @returns {string}
 */
function intToX16Pos2(value) {
  return ('0' + value.toString(16)).slice(-2)
}


/**
 * @param {number} value
 * @returns {string}
 */
function intToX16Pos3(value) {
  return ('00' + value.toString(16)).slice(-3)
}


/**
 * @param {number} value
 * @returns {string}
 */
function intToX64(value) {
  let result = ''

  do {
    result = x64alphabet[value % x64len] + result
    value = value / x64len ^ 0
  } while (value > 0)

  return result
}


/**
 * @param {string} value
 * @returns {number}
 */
function x64ToInt(value) {
  let result = 0

  while (value) {
    result += x64alphabet.indexOf(value[0]) * x64len ** (value.length - 1)
    value = value.slice(1)
  }

  return result
}


/**
 * @param {number} value
 * @returns {string}
 */
function intToX64Pos2(value) {
  return ('0' + intToX64(value)).slice(-2)
}


/**
 * Преобразует 8-битный массив в строку,
 *  содержащую только разрешенные для URL символы.
 * Последовательность в кодировке c основанием 64.
 *
 * @param {Uint8Array} uint8Array
 * @returns {string}
 */
function encodeURLx64(uint8Array) {
  const x16 = uint8Array
    .reduce((data, item) => (data += intToX16Pos2(item)), '')
    .match(/.{1,3}/g)
  const last = x16[x16.length - 1].length < 3 ? x16.pop().replace(/^0+/, '') : ''
  const x64 = x16.reduce((data, item) => (data += intToX64Pos2(parseInt(item, 16))), '')

  return x64 + (last ? partDelimiter + last : '')
}


/**
 * Преобразует строку в кодировке c основанием 64,
 *  содержащую только разрешенные для URL символы, в 8-битный массив.
 * Обратный метод для encodeURLx64.
 *
 * @param {string} x64text
 * @returns {Uint8Array}
 */
function decodeURLx64(x64text) {
  const [x64, last] = x64text.split(partDelimiter)
  const x16 = x64
    .match(/.{1,2}/g)
    .reduce((data, item) => (data += intToX16Pos3(x64ToInt(item))), '') +
    (last || '')
  const uint8Array = x16.match(/.{1,2}/g)
    .map(item => parseInt(item, 16))

  return new Uint8Array(uint8Array)
}


/**
 * Проверяет что строка содержит только разрешенные для URL символы
 *
 * @param {string} text
 * @returns {boolean}
 */
function testURLChars(text) {
  const result = urlValidCharsRE.test(String(text))

  return result
}


/**
 * Декодирует спецсимволы внутри параметров поиска в url,
 *  которые корректно воспринимаются при получении данных из URLSearchParams
 *
 * @param {string} url
 * @returns {string}
 */
function decodeURISearch(url) {
  const result = url.replace(/%2F/g, '/')

  return result
}


export {
  intToX16Pos2,
  intToX16Pos3,
  intToX64,
  x64ToInt,
  intToX64Pos2,
  encodeURLx64,
  decodeURLx64,
  testURLChars,
  decodeURISearch
}
