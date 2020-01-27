import { pako } from './pako.js'

/**
 *
 */
export class QOSource {

  /**
   *
   */
  log() {
    console.log(pako.deflateRaw)
    console.log(pako.inflateRaw)
  }

}
