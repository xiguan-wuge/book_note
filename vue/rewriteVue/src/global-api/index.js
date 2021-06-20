import {initExtend} from './initExtend'
import initAssetsRegisters from './assets'
const ASSETS_TYPE = ['component', 'directive', 'filter']
export function initGlobalApi(Vue) {
  Vue.options = {} // 全局的组件，指令，过滤器
  ASSETS_TYPE.forEach(type => {
    Vue.options[type + 's'] = {}
  })
  Vue.options._base = Vue // _base 指向Vue

  initExtend(Vue) // extend方法的定义
  initAssetsRegisters(Vue) //assets注册方法，包含组件，指令和过滤器
}