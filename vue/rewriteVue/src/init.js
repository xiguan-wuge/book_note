import {initState} from 'state'

export function initMixins(Vue) {
  Vue.prototype._init = function(options) {
    // 这里的this代表调用_init方法的对象（Vue实例）
    const vm = this
    vm.$options = options
    //  初始化数据
    initState(vm)
  }
}