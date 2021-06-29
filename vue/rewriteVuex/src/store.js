import ModuleCollection from "../../../../vue/vue@2x/vuex-dev/src/module/module-collection"
import devtoolPlugin from './plugins/devtool'
import { forEachValue } from "./util"
import { isPromise, isPromise } from "../../../../vue/vue@2x/vuex-dev/src/util"
const __DEV__ = process.env.NODE_ENV !== 'production'
let Vue // 接收传过来的Vue,用于标识Vuex已经安装

export class Store {
  constructor(options = {}) {
    if(!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.vue)
    }

    const {
      /**
       * 一个数组，包含应用store上的插件。
       * 接收store作为唯一参数，可以监听mutation或者提交mutation
       */
      plugin = [],
      /**
       * 使Vuex.Store进入严格模式，任何mutation处理函数以外函数修改 state 都会抛出错误
       */
      strict = false
    } = options

    let {
      state = {}
    } = options
    if(typeof state === 'function') {
      state = state()
    }

    // store internal state
    // 判断在严格模式下，是否用mutation修改state
    this._committing = false
    this._actions = Object.create(null)
    this._mutations = Object.create(null)
    // 存放getters
    this._wrapperGetters = Object.create(null)
    // 模块收集器
    this._modles = new ModuleCollection(options)
    // 根据namespace存放module
    this._modulesNamespaceMap = Object.create(null)
    // 存放订阅者
    this._subscribers = []
    // 用于实现watcher的vue实例
    this._watcherVM = new Vue()

    // 绑定dispatch 和 commit的this
    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit(type, payload) {
      return commit.call(store, type, payload, options)
    }

    // strict mode
    this.strict = strict
    // 初始化module,递归注册所有子module
    // 收集子module中的getter到this._wapperGetters
    installModule(this, state, [], this._modles.root)

    // store响应式
    resetStoreVM(this, state)

    // 调用插件
    plugins.forEach(plugin => plugin(this))

    // devtool插件
    if(Vue.comfig.devtools) {
      devtoolsPlugin(this)
    }
  }

  _withCommit(fn) {
    // 调用withCommit修改state时会将store的committing设置为true,
    // 内部会有断言检查该值
    // 在严格模式下，只允许mutations来修改state中的值
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }

  // 触发mutation方法修改state
  commit(_type, _payload, _options) {
    // 检查commit
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options)

    const mutation  = { type, payload}
    // 对应的mutation方法
    // 若没有namespace，commit 会触发所有module中的对应type的mutation方法
    const entry = this._mutations[type] 
    if(!entry) {
      if(__DEV__) {
        console.error(`[vuex] unknow mutation type: ${type}`  )
      }
      return
    }
    
    // 执行mutation语句
    this._withCommit(() => {
      entry.forEach(function commitIterator(handler) {
        handler(payload)
      })
    })
    
    // 通知订阅者更新
    this._subscribers
    .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
    .forEach(sub => sub(mutation, this.state))

    if(
      __DEV__ &&
      options && options.slient
    ) {
      console.warn(`[vuex] mutation type: ${type}. Slient options hans been removed.` +
      'Use the filter functionality in the vue-devtools')
    }
  }

  // 调用action的dispatch方法
  dispatch(_type, _payload) {
    const {
      type,
      payload,
    } = unifyObjectStyle(_type, _payload)

    // 去除对应的action方法
    const entry = this._actions[type]
    if(!entry) {
      if(__DEV__) {
        console.error(`[vuex] unkonw action type: ${type}`)
      }
      return
    }

    // 如果是数组且数组长度大于1，则包装成Promise，形成一个新的Promise
    // 只有一个，则直接返回第1个（下标为0）
    return entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)
  }

  // 注册一个订阅函数，返回取消订阅的函数
  subscribe(fn) {
    const subs = this._subscribers
    if(subs.indexOf(fn) < 0) {
      subs.push(fn)
    }
    return () => {
      const i = subs.indexOf(fn)
      if(i > -1) {
        subs.splice(i, 1)
      }
    }
  }

  watch(getter, cb, options) {
    return this._watcherVM.$watch(()=> getter(this.state,this.getters),cb, options)
  }

  replaceState(state) {
    this._withCommit(() => {
      this._vm._data.$$state = state
    })
  }

  // 注册一个动态module,当业务进行异步加载时，可以通过该接口进行注册动态module
  registerModule(path, rawModule, options = {}) {
    if(typeof path === 'string') path = [path]

    // 省略断言...

    this._modules.register(path, rawModule)
    installModule(this, this.state, path, this._modules.get(path), options.preserveState)
    // reset store to update getters...
    resetStoreVM(this, this.state)
  }

  // 注销一个动态module
  // 实现：先从store中删除模块，然后用resetStore来重置store
  unregisterModule(path) {
    if(typeof path === 'string') path = [path]
    // 省略断言

    // 注销
    this._modules.unregister(path)
    this._withCommit(() => {
      const parentState = getNestedState(this.state, path.slice(0, -1))
      // 从父级中删除
      Vue.delete(parentState, path[path.length - 1])
    })
    // 重置store
    resetStore(this)
  }

}

/**
 * 作用：
 * 为module加上namespace命名空间（若设置了命名空间），
 * 注册mutation，action，以及getter,
 * 递归注册子module
 */
function installModule(store, rootState, path, module, hot) {
  const isRoot = !path.length // 是否是根module
  // 获取module的namespace
  const namespace = store._modules.getNamespace(path)
  // 在namespace map 中注册
  if(module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  // 设置state
  if(!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length -1]
    store._withCommit(() => {
      // 子模块设置为响应式
      Vue.set(parentState, moduleName, module.state)
    })
  }

  const local = module.context = makeLocalContext(store, namespace, path)
  // 遍历注册mutation
  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  // 遍历注册action
  module.forEachAction((action, key) => {
    const namespacedType = namespace + key
    registerAction(store, namespacedType, action, local) 
  })

  // 遍历注册getter
  module.forEachGetter((getter, key) => {
    const namespacedType = getter + key
    registerGetter(store, namespacedType, getter, local) 
  })

  // 递归安装module
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}

// 重置store
function resetStore(store, hot) {
  store._actions = Object.create(null)
  store._mutations = Object.create(null)
  store._wrappedGetters = Object.create(null)
  store._modulesNamespaceMap = Object.create(null)
  const state = store.state
  installModule(store, state, [], store._modules.root, true)
  resetStoreVM(store, state, hot)
}

/**
 * 通过vm重设store, 新建vue实例对象，使用Vue内部的响应式注册state以及computed
 * @param {object} store 
 * @param {Object} state 
 * @param {Boolean} hot 
 */
function resetStoreVM(store, state, hot) {
  // 存放之前的vm对象
  const oldVm = store._vm

  store.getter = {}
  const wrapperGetters = store._wrapperGetters
  const computed = {}
  // 通过Object.defineProperty为每个getter方法设置get方法
  // 比如：获取 this.$store.getters.test 的时候，获取的是 store._vm.test
  // 也就是Vue对象的computed属性
  forEachValue(wrapperGetters, (fn, key) => {
    computed[key] = partical(fn, store)
    Object.defineProperty(store.getters, key, {
      get: ()=> store._vm[key],
      enumerable: true // for local getter
    })
  })

  // use a Vue instance to store the state tree
  // supperss warning just in case the user has added
  // some funky global mixin
  const slient = Vue.config.slient
  Vue.config.slient = true
  // 一个Vue实例，运用Vue内部的响应式注册state以及computed
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.slient = slient

  // 严格模式下，保证修改state只能通过mutation
  if(store.strict) {
    enableStrictMode(store)
  }

  if(oldVm){
    // 解除旧的vm的state的引用，以及销毁旧的Vue对象
    if(hot) {
      // dispatch change in all subscribered（订阅者） watchers
      // to force getter re-evaluation(重新计算) for hot reloading
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }

} 

// 确保严格模式下 只能通过mutation方法修改state
function enableStrictMode(store) {
  store._vm.$watch(
    function(){
      return this._data.$$state
    },
    () => {
      if(process.env.NODE_ENV !== 'production') {
        console.log('do not mutate vuex state outside mutation handlers.')
      }
    },
    { deep: true, sync: true}
  )
}

// 获取嵌套的状态
function getNestedState(state, path) {
  return path.reduce(
    (state, key) => {
      return state[key]
    },
    state
  )
}

// 注册action
function registerAction(store, type, handler, local) {
  const entry = store._actions[type] || (store._actions = [])
  entry.push(function wrappedActionHandler(payload) {
    let res = handler.call(store, {
      dispatch: location.dispatch,
      commit: local.commit,
      getters: local.gettters,
      state: local.state,
      rootGetters: store.rootGetters,
      rootState: store.$$state
    }, payload)
    if(!isPromise(res)){
      res = Promise.resolve(res)
    }
    if(store._devtoolHook) {
      return res.catch(err => {
        store.devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}


export function install(_Vue) {
  if(Vue && _Vue === Vue) {
    console.error('[vuex] already installed. Vue.use(Vuex should be called on once')
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}