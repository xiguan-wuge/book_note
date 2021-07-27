import {initState} from './state.js'
import {compileToFunction} from './compiler/index.js'
import {mountComponent, callHook} from './lifecycle.js'
import {mergeOptions} from './util/index.js'
export function initMixins(Vue) {
  Vue.prototype._init = function(options) {
    // 这里的this代表调用_init方法的对象（Vue实例）
    const vm = this
    vm.$options = mergeOptions(vm.constructor.options, options) // ？ vm.constructor 是什么 
    callHook(vm, 'beforeCreate')
    //  初始化数据
    initState(vm)
    callHook(vm, 'created')
    // 存在el属性，进行模版转换
    if(vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  // $mount 原本是放在entry-runtime-with-compiler.js中，需要和runtime-only版本区分开

  // Vue的compiler功能
  Vue.prototype.$mount = function(el) {
    const vm = this
    const options = vm.$options
    // 源码里，这个el 需要判断传入的是node节点还是字符串
    el = el && document.querySelector(el)

    // 不存在render方法时
    if(!options.render) {
      let template = options.template

      if(!template && el) {
        // 若不存在template,直接将模版复制为el的外层html结构（el本身并不是父元素，可递归）
        template = el.outerHTML
      }

      // 转换成render函数
      if(template) {
        const render = compileToFunction(template)
        options.render = render
      }
    }

    // 将当前组件实例挂载到真实的el节点上面
    return mountComponent(vm, el)
  }
  // 添加Vue.use方法
  Vue.use = function(plugin) {
    // 先判断该插件是否已经插入
    const  installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if(installedPlugins.indexOf(plugin) > -1) {
      return this
    }
    // 获取参数
    const args = Array.prototype.slice.call(arguments, 1)
    // ? 为什么要在头部插入this  (this即Vue, 确保函数执行时接收的第一个参数时Vue, 不需要再import Vue)
    args.unshift(this)
    if(typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if(typeof plugin === 'function') {
      plugin.apply(null, this)
    }
    // 添加到已插入数组中
    installedPlugins.push(plugin)
    return this // ?为什么要返回this
    
  }
}