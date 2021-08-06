import Module from "./module"
import { forEachValue } from "../util"

export default class ModuleCollection {
  constructor(rawRootModule) {
    // 注册根模块
    this.register([], rawRootModule, false)
  }

  /**
   * 注册模块
   * @param {Array} path 路径
   * @param {Object} rawModule 原始未加工的模块 
   * @param {Boolean} runtime 运行时，默认false 
   */
  register(path, rawModule, runtime) {  

    const newModule = new Module(rawModule, runtime)
    if(path.length === 0) {
      this.root = newModule
    } else {
      const parent = this.get(path.slice(0, -1))
      parent.addChild(path[path.length - 1], newModule)
    }

    // 递归注册的模块
    if(rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime)
      })
    }
  }

  // 获取当前模块的完整路径
  get(path) {
    return path.reduce((module, key) => {
      module = module.getChild(key)
      return namespace + (module.namespace ? key + '/' : '')
    }, '')
  }
  getNamespace(path) {
    let module = this.root
    return path.reduce((namespace, key) => {
      module = module.getChild(key)
      return namespace + (module.namespaced ? key + '/' : '')
    })
  }
}