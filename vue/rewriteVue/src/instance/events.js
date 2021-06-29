
export function eventsMixin() {
  Vue.prototype.$emit = function(event) {
    const vm = this
    // cbs是一个数组或者undefind
    let cbs = vm._events[event]
    if(cbs) {
      cbs = cbs.length > 1 ? [].slice.call(vm) : cbs
      const args = [].slice.call(vm, 1) // 请求参数（类似数组的对象）转化成数组，去除参数中的第一个（事件名）
      for(let i = 0, len = abs.length; i < len; i++) {
        try {
          // 触发对应事件的回调执行
          cbs[i].apply(vm, args)
        } catch (e) {
          console.log(`event handler for ${event}`)
        }
      }
      return vm
    }
  }

  const hookRE = /^hook:/
  Vue.prototype.$on = function(event, callback) {
    const vm = this
    if(Array.isArray(event)) {
      for(let i = 0, len = event.length; i < len; i++) {
        this.$on(event[i], callback)
      }
    } else {
      // 在当前实例中的_events属性中创建对应事件数组，并添加事件
      (vm._events[event] || (vm._events[event] = [])).push(callback)
      if(hookRE.test(event)) {
        vm._hasHookEvent = true
      }
    }
  }

  Vue.prototype.$off = function(event, callback) {
    const vm = this
    // clear all
    if(!arguments.length) {
      vm._events = Object.create(null)
    }
    // array of event
    if(Array.isArray(event)) {
      for(let i = 0, len = event.length; i < len; i++) {
        this.$off(event[i], callback)
      }
    }
    // specific event
    const cbs = vm._events[event]
    if(!cbs) return vm
    if(!callback) {
      vm._events[event] = null
      return vm
    }
    if(callback) {
      // specific handler
      let cb
      let i = cbs.length
      // 从后往前遍历，防止因删除数组元素造成下标变化，进而删除错误项
      while(i--) {
        cb = cbs[i]
        if(cb === callback || cb.fn === callback) {
          cbs.splice(i,1)
          break
        }
      }
    }
    return vm
  }

  Vue.prototype.$once = function(event, fn) {
    const vm = this
    // 为了实现一次的效果，对回调函数做处理，用一个函数包装，函数内部添加移除该事件的操作
    function on() {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn
    vm.$on(event, on)
    return vm
  }
}
