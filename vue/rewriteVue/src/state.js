import {observe, set, del} from './observer/index.js'
import Watcher from './observer/watcher.js'
import Dep from './observer/dep.js'


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
  const computed = vm.$options.computed
  const watchers = (vm._computedWatchers = {}) // 用来存放计算watcher
  for(let k in computed) {
    const userDef = computed[k] // 获取用户自定义属性
    // 为创建计算属性watcher使用
    const getter = typeof userDef === 'function' ? userDef : userDef.get 
    // 创建计算watcher，lazy:true
    watchers[k] = new Watcher(vm, getter, ()=>{}, {lazy: true})
    defineComputed(vm, k, userDef)
  }
}

// 定义普通对象来劫持计算属性
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: ()=>{},
  set: ()=>{}
}

// 重新定义计算属性，对get、set 进行劫持
function defineComputed(target, key, userDef) {
  if(typeof userDef === 'function') {
    // 若是函数，手动赋值到get
    sharedPropertyDefinition.get = createComputedGetter(key)
  } else {  
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = userDef
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

// 重写计算属性的get方法，来判断是否需要重新进行计算
function createComputedGetter(key) {
  return function() {
    const watcher = this._computedWatchers[key]
    if(watcher) {
      if(watcher.dirty) {
        watcher.evaluate() // 计算属性取值时，如果是脏值，则重新取值
      }
      if(Dep.target) {
        // 如果Dep.target还存在，这个时候一般为渲染watcher，计算属性依赖的数据也要收集
        watcher.depend()
      }
      return watcher.value
    }
  }
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

export function stateMixins(Vue) {
  Vue.prototype.$watch = function(exprOrFn, cb, options) {
    const vm = this
    // user: true 表示这是一个用户watcher
    const watcher = new Watcher(vm, exprOrFn, cb, {...options, user: true})
    if(options.immediate) {
      // 如果有immediate属性，代表需要立即执行
      cb()
    }
  }
  Vue.prototype.$set = set
  Vue.prototype.$delete = del
}