import {createElement, createTextNode} from './vdom/index'
import {nextTick} from './util/next-tick'

export function renderMixins(Vue) {
  // render 函数转化成虚拟 dom 核心方法 _render
  Vue.prototye._render = function() {
    const vm = this
    // 获取编译模版生成的render方法
    const {render} = vm.$options
    // 生成vnode--虚拟dom
    const vnode = render.call(vm)
    return vnnode
  }

  // render 函数里的_c, _v, _s, 方法需要定义
  Vue.prototye._c = function(...args) {
    // 创建虚拟dom元素
    return createElement(...args)
  }

  Vue.prototye._v = function(text) {
    return createTextNode(text)
  }

  Vue.prototye._s = function(val) {
    // 如果模板里面的一个对象，需要JSON.stringify
    return val === null 
      ? ''
      : typeof val === 'object' 
      ? JSON.stringify(val)
      : val;
  }

  // 挂载原型上的nextTick方法，可供用户手动调用
  Vue.prototye.$nextTick = nextTick
}