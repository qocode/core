import './emulateDOM.js'
import { Test } from '@nodutilus/test'
import TestQOSource from './qosource.js'


/** Общий тестовый класс */
class TestQOCode extends Test {

  static TestQOSource = TestQOSource

}


Test.runOnCI(new TestQOCode())
