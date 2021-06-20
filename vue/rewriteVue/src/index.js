import {initMixins} from './init.js'
import { renderMixins } from './render.js'
import { lifecycleMixins } from './lifecycle.js'
import {stateMixins} from './state'

function Vue(options) {
  // _init方法是挂载在Vue原型上方法
  this._init(options)
}

initMixins(Vue)

stateMixins(Vue)
// 混入_render
renderMixins(Vue)

// 混入_update
lifecycleMixins(Vue)
export default Vue