import {observe} from './observer/index'


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
function initWatch(vm) {

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