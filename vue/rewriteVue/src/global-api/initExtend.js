import {mergeOptions} from '../util/index.js'
// Vue.extend核心思路：
// 使用原型继承的方式返回Vue的子类
// 利用mergeOptions 把传入组件的options 和 父类的options 合并
export default function initExtend(Vue) {
  let cid = 0; // 组件唯一标识
  // 创建子类继承父类，便于属性扩展
  Vue.extend = function(extendOptions) {
    // 创建子类的构造函数，并调用初始化方法
    const Sub = function VueComponent(options) {
      this._init(options) // 调用Vue的初始化
    }
    Sub.cid = cid++
    Sub.prototype = Object.create(this.prototype)
    Sub.prototype.constructor = Sub
    // 合并自己的options选项和父选项
    Sub.options = mergeOptions(this.options, extendOptions)
    return Sub
  }
}