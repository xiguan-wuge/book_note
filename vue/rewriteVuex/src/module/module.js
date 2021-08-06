import { forEachValue } from "../util"

// store 的模块，基本的数据结构，包含一些属性和方法
export default class Module {
  constrctor(rawModule, runtime) {
    this.runtime = runtime
    this._children = Object.create(null)
    this._rawModule = rawModule
    const rawState = rawModule.rawState

    // 缓存根模块的数据
    this.state = (typeof rawState === 'function' ? rawModule() : rawState) || {}
  }

  addChild(key, module) {
    this._children[key] = module
  }
  removeChild(key) {
    delete this._children[key]
  }
  getChild(key) {
    return this._children[key]
  }
  hasChild(key) {
    return key in this._children
  }
  update(rawModule) {
    this._rawModule.namespaced = rawModule.namespaced
    if(rawModule.actions) {
      this._rawModule.actions = rawModule.actions
    }
    if(rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations
    }
    if(rawModule.getters) {
      this._rawModule.getters = rawModule.getters
    }
  }
  forEachChild(fn) {
    forEachValue(this._chidren, fn)
  }
  forEachGetter(fn) {
    if(this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn)
    }
  }
  forEachAction(fn) {
    if(this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn)
    }
  }
  forEachMutation(fn) {
    if(this._rawModule.mitations) {
      forEachValue(this._rawModule.mutations, fn)
    }
  }
}