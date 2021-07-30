import {patch} from './vdom/patch.js'

export function mountComponent(vm, el) {
  // 在上一步模版编译中，解析生成了render函数
  // 下一步就是执行vm._render()方法，调用生成人render方法，生成虚拟dom
  // 最后使用vm._update()方法，把虚拟dom 渲染到页面

  // 真实的el选项赋值给实例的$el属性，为之后的虚拟dom的产生和新老虚拟dom的替换做铺垫
  vm.$el = el
  // _update 方法和_render方法都是挂载在Vue原型上，类似与_init方法
  // vm._update(vm._render())

  callHook(vm, "beforeMount"); //初始渲染之前

  // 引入watcher的概念，注册一个渲染watcher，执行vm._update(vm._render()), 渲染视图
  let updateComponent = () => {
    console.log('刷新页面')
    vm._update(vm._render())
    
  }
  new Watcher(vm, updateComponent, ()=> {
    callHook(vm, 'beforeUpdate')
  }, true)
  callHook(vm, 'mounted')
}

export function lifecycleMixins(Vue) {
  // 把_update挂载到Vue的原型上
  // patch就是渲染vnode为真实dom的核心

  Vue.prototype._update = function(vnode) {
    const vm = this;
    const prevVnode = vm._vnode // 保留上一次的vnode
    vm._vnode = vnode
    if(!prevVnode) {
      // 初始渲染时，vm._vnode肯定不存在
      vm.$el = patch(vm.$el, vnode)
    } else {
      // 更新，把上一次的vnode 和 这次更新的vnode进行diff
      vm.$el = patch(vm.$el, vnode)
    }
  }
}

export function callHook(vm, hook) {
  // 依次执行生命周期里对应的方法
  const handlers = vm.$options[hook]
  if(handlers) {
    for(let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm) // 生命周期里this指向当前实例
    }
  }
}