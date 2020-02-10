import { Test, assert } from '@nodutilus/test'
import { QOSource } from '../src/qosource.js'

/** Тесты источника данных заказа */
export default class TestQOSource extends Test {

  /** init */
  ['init']() {
    const x = new QOSource()

    assert.equal(x.log(), undefined)
  }

}
