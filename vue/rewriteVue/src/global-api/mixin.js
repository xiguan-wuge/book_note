import {mergeOptions} from '../util/index.js'
export default function initMixin(Vue) {
  Vue.mixin = function(mixin) {
    this.options = mergeOptions(this.options, mixin)
  }
}