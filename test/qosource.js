import { Test, assert } from '@nodutilus/test'
import { QOSource } from '../src/qosource.js'
import {
  intToX16Pos2, intToX64, x64ToInt,
  intToX64Pos2, uint8ArrayToURLx64, testURLx64
} from '../src/lib/x64url.js'

/** Тесты источника данных заказа */
export default class TestQOSource extends Test {

  /** init */
  ['init']() {
    const x = new QOSource()

    assert.equal(x.log(), undefined)
  }

  /** Приведение к числу с основанием 16, максимум 2 знака, 0-255 */
  ['x64url - intToX16Pos2']() {
    assert.equal(intToX16Pos2(1), '01')
    assert.equal(intToX16Pos2(15), '0f')
    assert.equal(intToX16Pos2(16), '10')
    assert.equal(intToX16Pos2(255), 'ff')
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
  ['x64url - uint8ArrayToURLx64']() {
    const encoder = new TextEncoder()

    assert.equal(uint8ArrayToURLx64(encoder.encode('Тест')), 'QabgJt61Qo.2')
    assert.equal(uint8ArrayToURLx64(new Uint8Array([255, 255, 255])), '____')
    assert.equal(uint8ArrayToURLx64(new Uint8Array([1, 15, 16, 255])), '0gYg.ff')
    assert.equal(uint8ArrayToURLx64(new Uint8Array([1, 15, 16, 1])), '0gYg.1')
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

}
