import {initMixins} from './init.js'

function Vue(options) {
  // _init方法是挂载在Vue原型上方法
  this._init(options)
}

initMixins(Vue)
export default Vue