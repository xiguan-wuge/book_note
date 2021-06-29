## eventBus的原理
#### 在用vue做SPA时，如果项目不复杂，在vue项目做跨组件通信时，我们有时会使用全局事件总线（global event bus）解决

#### 在vue官方文档中提到，我们会单独用一个vue实例，来做事件中心
```
  var bus = new Vue()
  // 或者直接在main.js中,赋值给Vue的原型,
  Vue.prototype.$eventBus = new Vue()
  // 然后在该项目的各个vue实例中可以使用该事件中心
  // a 组件监听事件
  this.$eventBus.$on('testEvent', fn)
  // b 组件触发事件
  this.$eventBus.$emit('testEvent, params)
```

#### 1. $emit 理解
##### 使用方法
```
  vm.$emit(event[,..args])
  参数：
    {string} event
    [...args]
    触发当前实例上的事件，附加参数会传给监听器回调
```

$emit源码 
```
// /src/core/instance/event.js
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
```
##### 解析$emit, $emit 会使用我们使用的$eventBus实例，在_event属性上查找是否注册过对应的事件；找到之后，会使用for循环依次调用apply方法，触发所有监听过的event事件，并将参数传递过去

#### 2. $on理解
##### 用法
```
vm.$on(event, callback)
参数：
  {string | Array<string>} event（数组只在2.2.0+中支持）
  {Function} callback
监听当前实例上的自定义事件。事件可以又$emit触发，回调函数会接收所有传入的参数
```
##### 源码
```
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
```

##### 解析：当使用$on监听事件的时候，如果监听多个自定义事件，vue会使用循环，在eventBus实例对象上的_events属性上生成一个数组，并将每个事件存放到该数组中。在$emit时，会循环触发 vm._events[event] 中的每一个回调函数，保证了 注册对应事件的的回调都会得到触发

#### 3.移除自定义事件 $off
##### 使用
```
vm.$off([event, callback])
参数：
  {string || Array<string> } event（在2.2.0+中支持数组）
  {Function} callback
用法：移除自定义事件
如果没有提供参数，则移除该实例下所有自定义事件
如果只提供事件，则移除该事件的所有回调
如果提供了事件和回调，则移除该事件下的对应回调
```
##### 源码
```
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
```

#### 4.使用一次 $once
##### 使用
```
vm.$once(event, callback)
参数：
  {string} event
  {Function} callback
用法：监听一个自定义事件，但只触发一次，在触发一次后移除对应的事件监听器
```
##### 源码
```
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
```

#### 总结
##### eventBus 其实就是通过一个vue实例vm，在vm中通过_events对象，将注册（$on）的的事件名作为key，创建一个数组，将该事件的回调函数依次存入到该数组中；在触发（$emit）时，在_events找到对应数组，依次执行其内部的回调；采用了发布订阅者模式的思想

参考文章：https://github.com/higrowth/rookie-learn-vuex/blob/master/%E3%80%90Vuex%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%E3%80%91Vue%E4%B8%ADEventBus%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86.md