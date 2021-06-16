import {patch} from './vdom/patch'

export function mountComponet(vm, el) {
  // 在上一步模版编译中，解析生成了render函数
  // 下一步就是执行vm._render()方法，调用生成人render方法，生成虚拟dom
  // 最后使用vm._update()方法，把虚拟dom 渲染到页面

  // 真实的el选项赋值给实例的$el属性，为之后的虚拟dom的产生和新老虚拟dom的替换做铺垫
  vm.$el = el
  // _update 方法和_render方法都是挂载在Vue原型上，类似与_init方法
  // vm._update(vm._render())

  // 引入watcher的概念，注册一个渲染watcher，执行vm._update(vm._render()), 渲染视图
  let updateComponent = () => {
    console.log('刷新页面')
    vm._update(vm._render())
  }
  new Watcher(vm, updateComponent, null, true)
}

export function lifecycleMixins(Vue) {
  // 把_update挂载到Vue的原型上
  Vue.prototype._update = function(vnode) {
    const vm = this;
    // patch就是渲染vnode为真实dom的核心
    patch(vm.$el, vnode)
  }
}