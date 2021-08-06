import ModuleCollection from '../../../../vue/vue@2x/vuex-dev/src/module/module-collection';
import devtoolPlugin from './plugins/devtool';
import appluMixin from './mixin'
import { forEachValue, isObject, isPromise } from '../../../../vue/vue@2x/vuex-dev/src/util';

let Vue; // 用于判断当前vuex插件是否已经安装
class Store {
  constructor(options = {}) {
    // 安装Vuex
    if(!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.vue)
    }

    // 获取options参数
    const {
      plugins = [],
      strict = false
    } = options

    // 定义内部状态
    this._committing = false
    // 存放用户自定义的actions
    this._actions = Obejct.create(null)
    // 存放actions订阅者
    this._actionSubscribers = []
    // 存放用户自定义mutations
    this._mutations = Object.create(null)
    // 存放用户自定义getters
    this._wrappedGetters = Object.create(null)
    // 模块收集器，构建模块树形结构
    this._modules = new ModuleCollection(options)
    // 用户存储模块命名空间的关系
    this._modulesNamespaceMap = Object.create(null)
    // 订阅者
    this._subscribers = []
    // 使用$watcher 观测getters
    this._watcherVM = new Vue()
    // 用于存放生成的本地getters的缓存
    this._makeLocalGetterCache = Object.create(null)

    // 将commit和dispathch内部的this绑定到当前实例
    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit(type, payload) {
      return commit.call(store, type, payload)
    }

    // 严格模式，
    this.strict = strict || false

    // 根模块的state
    const state = this._modules.root.state

    // 初始化根模块
    // 递归注册子模块
    // 同时收集所有模块的getters放入到 this._wrappedGetters中
    installModule(this, state, [], this._modules.root)

    // 初始化store实例，实现state响应式
    // 同时将用户自定义的getters按computed属性的方式注册
    resetStoreVM(this, state)

    // 注册插件
    plugins.forEach(plugin => plugins(this))

    // 初始化vue-devtool插件
    const useDevtools = options.devtools !== undefined ? options.devtools : Vue.config.devtools
    if(useDevtools) {
      devtoolPlugin(this)
    }
  }

  commit(_type, _payload, _options) {
    // 统一成对象风格（用户触发commit提交的方式可以是函数式，也可以是对象式）
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options)

    const mutation = { type, payload }
    // 取出对应的mutation方法
    const entry = this._mutations[type]
    if(!entry) {
      console.error(`[vuex] unknown mutation type: ${type}`)
      return
    }
    // 遍历执行
    this._widthCommit(() => {
      entry.forEach(function commitIterator(handle){
        handler(payload)
      })
    })

    // 通知订阅者更新
    this._subscribers
    .slice() // 浅拷贝，防止订阅者同步调用unsubscribe时迭代器失效
    .forEach(sub => sub(mutation, this.state))
  }

  dispatch(_type, _payload) {
    const {
      type,
      payload
    } = unifyObjectStyle(_type, _payload)

    const action = { type, payload }
    const entry = this._actions[type]
    if(!entry) {
      console.error(`[vuex] unknown action type: ${type}`)
      return
    }

    try {
      this._actionSubscribers
        .slice()
        .filter(sub => sub.before)
        .forEach(sub => sub.before(action, this.state))
    } catch (error) {
      
    }

    const result = entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)

    return new Promise((resolve, reject) => {
      result.then(res => {
        try {
          this._actionSubscribers
            .filter(sub => sub.after)
            .forEach(sub => sub.after(action, this.state))
        } catch (error) {
          
        }
        resolve(res)
      }, err => {
        try {
          this._actionSubscribers
            .filter(sub => sub.error)
            .forEach(sub => sub.error(action, this.state, err))
        } catch (error) {
          
        }
        reject(err)
      })
    })
  }

  // 替换store的根状态，仅用于状态合并或者时光旅行
  replaceState(state) {
    this._withCommit(() => {
      this._vm._data.$$state = state
    })
  }

  // 响应式得侦听fn的返回值，当值改变时调用回调函数
  watch(getter, cb, options) {
    return this._watcherVM.$watch(() => getter(this.state, this.getters), cb, options)
  }

  // 订阅store的mutation
  subscribe(fn) {
    return genericSubscribe(fn, this._subscribers, options)
  }

  // 订阅store的action
  subscribeAction(fn) {
    const subs = typeof fn === 'function' ? { before: fn } : fn
    return genericSubscribe(subs, this._actionSubscribers)
  }

  // 注册一个模快（也是Store的三个核心操作）
  registerModule(path, rawModule, options = {}) {
    if(typeof path === 'string') path = [path]

    // 手动调用模块注册的方法
    this._modules.register(path, rawModule)
    // 初始化该模块，递归注册子模块，收集getters
    install(this, this.state, path, this._modules.get(path), options.preserveState)
    // 设置响应式
    resetStoreVM(this, this.state)
  }

  // 卸载一个动态模块
  unregisterModule(path) {
    if(typeof path === 'string') path = [path]

    // 手动调用模块注销
    this._mudules.unregister(path)
    this._withCommit(()=> {
      // 注销这个模块
      const parentState = getNestedState(this.state, path.slice(0, -1))
      Vue.delete(parentState, path[path.length - 1])
    })
    // 重置store
    resetStore(this)
  }

  // 热替换action 和 mutation
  hotUpdate(newOptions) {
    // 调用的是模块的ModuleCollection的update方法，最终调用的是对应的每个模块的update
    this._modules.update(newOptions)
    // 重置store
    resetStore(this, true)
  }
}

// 生成本地的dispatch, commit, getters, state
// 如果未使用namespace，则使用根模块
function makeLocalContext(store, namespace, path) {
  const noNamespace = namespace === ''

  const local = {
    dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if(!options || !options.root) {
        type = namespace + type
        if(!store._actions[type]) {
          console.error(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
          return
        }
      }

      return store.dispatch(type, payload)
    },
    commit: noNamespace ? store.commit: (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args
      if(!options.root) {
        type = namespace + key
        if(!store._mutations[type]){
          console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
          return
        }
      }

      store.commit(type, payload, options)
    }
  }

  // getters和state 必须是只读的，因为他们会被改变当实例更新时
  Object.definePropertys(local, {
    getters: {
      get: noNamespace 
        ? () => store.getters
        : () => makeLocalGetters(store, namespace)
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })
}
/**
 * 注册模块
 * 递归注册子模块
 * 收集所有的getter,actions,mutations
 * @param {*} store 
 * @param {*} rootState 
 * @param {*} path 
 * @param {*} module 
 * @param {*} hot 
 */
function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length
  const namespace = store._modules.getNamespace(path)

  // 在namespaceMap 中注册
  if(module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  // 通过vue的响应式功能将state数据变为可响应
  if(!isRoot && !hot) { // 非根模块 且 不是热重载
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]

    store._withCommit(() => {
      Vue.set(parentState, moduleName, module.state)
    })
  }

  const local = module.context = makeLocalContext(store, namespace, path)
  // 便利注册mutation
  module.forEachMutation((module,key) => {
    const namesapcedType = namespace + key
    registerMutation(store, namesapcedType, mutation, local)
  })
  // 便利注册actions
  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })
  // 便利注册getter
  module.forEachGetter((action, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })
  // 递归注册子模块
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })

}

// 注册mutation
function registerMutation(store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[key] = [])
  entry.push(function wrapperMutationHandler(payload) {
    // call方法改变this指向，将state作为第一个参数传入
    handler.call(store, local.state, payload)
  })
}

// 注册action 
function registerAction(store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrapperActionHandler(payload) {
    let res = handler.call(store, {
      dispatch:local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    })
  }, payload)
  // 封装成异步操作
  if(!isPromise(res)) {
    res = Promise.resolve(res)
  }

  if(store.devtoolHook) {
    // 向 vue-devtool传递错误
    return res.catch(err => {
      store._devtoolHook.emit('vuex:error', err)
    })
  } else {
    return res
  }
}

function getNestedState(state, path) {
  return path.reduce((state, key) => state[key], state)
}

function unifyObjectStyle(type, payload, options) {
  if(isObject(type) && type.type) {
    options = payload
    payload = type
    type = type.type
  }
}
// 注册getter
function registerGetter(store, type, rawGetter, local) {
  // 类型如果已经存在，报错：已经存在, 同理类比为computed中数据不能重复
  if(store._wrappedGetters[type]) {
    console.error(`[vuex] duplicate getter key: ${type}`)
    return
  }
  store._wrappedGetters[type] = function wrapperGetter(store) {
    return rawGetter(
      local.state,
      local.getters,
      local.state,
      store.getters
    )
  }
}

// 重置store
function resetStore (store, hot) {
  store._actions = Object.create(null)
  store._mutations = Object.create(null)
  store._wrappedGetters = Object.create(null)
  store._modulesNamespaceMap = Object.create(null)
  const state = store.state
  // init all modules
  installModule(store, state, [], store._modules.root, true)
  // reset vm
  resetStoreVM(store, state, hot)
}

// 初始化store.vm 响应式的
// 并注册_wrapperGetters 作为computed属性
function resetStoreVM(store, state, hot) {
  const oldVm = store.vm 
  
  store.getter = {}
  // 重置本地的getters 缓存
  store._makeLocalGetterCache = Object.create(null)、
  // 收集用户自定义的getters
  const wrapperGetters = store._wrapperdGetters
  const computed = {}
  forEachValue(wrapperGetters, (fn, key) => {
    computed[key] = partical(fn, store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true, // 可以枚举，对于本地getters 的处理,
    })
  })
  
  // 使用一个Vue实例对象存储state树
  // 组织警告 用户添加的一些全局mixin
  // 声明一个slient变量 存储用户设置的静默模式配置
  const slient = Vue.config.slient
  Vue.config.slient = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed,
  })
  Vue.config.slient = slient

  // 对新的Vue实例启用严格模式
  // 使用$watch 观测state， 只能使用mutation方法修改state，也就是使用_withCommith函数
  if(store.strict) {
    enableStrictMode(store)
  }

  // 如果存在老的实例，将数据变为初始化状态，然后销毁老的实例
  if(oldVm) {
    if(hot) {
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}

// 订阅收集者
function genericSubscribe(fn, subs) {
  if(subs.indexOf(fn) < 0) {
    subs.push(fn)
  }
  // 返回一个删除收集者的匿名函数
  return () => {
    const i = subs.indexOf(fn)
    if(i > -1) {
      subs.splice(i, 1)
    }
  }
}
export function install(_Vue) {
  if(Vue && _vue === Vue) {
    return; // 防止重复安装
  }
  Vue = _Vue
  applyMixin(Vue)
}