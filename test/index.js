import jsdom from 'jsdom'
import { Test } from '@nodutilus/test'
import { Application } from '@nodutilus/ci-cd'
import TestQOSource from './qosource.js'

const { JSDOM } = jsdom
const { window } = new JSDOM('', { url: 'https://qcos.ru/' })


global.window = window


/** Общий тестовый класс */
class TestQOCode extends Test {

  /**
   * Логирование результатов теста
   *
   * @param {{path:Array<string>, name:string, result:{success:boolean, error:Error}}} options
   */
  [Test.afterEachDeep]({ path, name, result: { success, error } }) {
    const result = success ? 'success:' : 'failure:'

    console.log(result, path.join(','), '->', name)
    if (error) { console.error(error.stack) }
  }

  static TestQOSource = TestQOSource

}


new Application(() => Test.run(new TestQOCode())).redy()
