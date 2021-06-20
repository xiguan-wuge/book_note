import {observe} from './observer/index'
import Watcher from './observer/watcher'


// 主要关注：
// - initData中的observe(data)，是响应式数据的核心，
// - proxy代理数据
export function initState(vm) {
  const opts = vm.$options
  // 注意数据的初始化顺序：props > methods > data > computed > watch
  if(opts.props) {
    initProps(vm)
  }
  if(opts.methods) {
    initMethod(vm)
  }
  if(opts.data) {
    initData(vm)
  }
  if(opts.computed) {
    initComputed(vm)
  }
  if(opts.watch) {
    initWatch(vm)
  }
}
function initProps(vm) {
  
}
function initMethod(vm) {

}

function initComputed(vm) {

}


// 初始化watch
function initWatch(vm) {
  let watch = vm.$options.watch
  for(let k in watch) {
    const handler = watch[k] // 用户自定义的watch可能是数组、对象、字符串、自定义函数
    if(Array.isArray(handler)) {
      handler.forEach(handle => {
        createWatcher(vm, k, handle)
      })
    } else {
      createWatcher(vm, k, handler)
    }
  }
}
// 创建watch的核心
function createWatcher(vm, exprOrFn, handler, options={}) {
  if(typeof handler === 'object') {
    options = handler // 保存用户传入的对象
    handler = options.handler // 用户传入的的函数
  }
  if(typeof handler === 'string') {
    // 代表传入的是定义好的methods
    hadnler = vm[handler]
  }
  // 如果是传入的是函数，则无需转换处理

  // 调用vm.$watch创建用户watcher
  return vm.$watch(exprOrFn, handler, options)
}

// 初始化data数据
function initData(vm) {
  let data = vm.$options.data
  // 实例的_data 就是传入的data
  // vue中data为函数，防止在不同组件实例中 数据污染，为了数据隔离
  data = vm._data = typeof  data === 'function' ? data.call(vm) : data  || {}

  // 把data数据代理到vm（vue 实例）上，  以便可以用this.a 来访问this._data.a
  for(let key in data) {
    proxy(vm, '_data', key)
  }

  // 对数据进行观测，响应式数据的核心
  observe(data)
}

// 数据代理
function proxy(object, sourceKey, key) {
  Object.defineProperty(object, key, {
    get(){
      return object[sourceKey][key]
    },
    set(newValue) {
      object[sourceKey][key] = newValue
    }
  })
}

export function stateMixin(Vue) {
  Vue.proptotye.$watch = function(exprOrFn, cb, options) {
    const vm = this
    // user: true 表示这是一个用户watcher
    const watcher = new Watcher(vm, exprOrFn, cb, {...options, user: true})
    if(options.immediate) {
      // 如果有immediate属性，代表需要立即执行
      cb()
    }
  }
}