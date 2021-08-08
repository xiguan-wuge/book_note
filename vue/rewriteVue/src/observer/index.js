import {arrayMethods} from './array.js'
import Dep from './dep.js'

class Observer {
  constructor(value) {
    
    // __ob__ 对数组很关键：
    //   - 首先可以根据这个属性来防止已经被观测的数组被重复观测  
    //   - 其次，响应式数据可以根据__ob__来获取Observer实例的相关方法 
    Object.defineProperty(value, '__ob__', {
      value: this, // Observer实例
      enumerable: false, // 不可枚举
      writable: true,
      configurable: true
    })

    if(Array.isArray(value)) {
      // 通过重写数组原型方法来对数组的七种方法进行拦截
      value.__proto__ = arrayMethods
      
      // 递归判断内部数据
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  observeArray(items) {
    for(let i = 0; i < items.length; i++) {
      observe(items[i])
    }
  }
  // 观测对象中的数据
  walk(data) {
    let keys = Object.keys(data)
    for(let i = 0, len = keys.length; i < len; i++) {
      let key = keys[i]
      let value = data[key]
      defineReactive(data, key, value)
    }
  }
}

  // 数据劫持
function defineReactive(data, key, value) { 
  // 若velue 是对象，则递归
  // 思考：如果数据嵌套层级过深，则性能会受到一定的影响

  // 递归观测子数据，同时为数组方法做铺垫
  let childObj = observe(value) // childObj 就是Observer实例
  
  // 为每个属性实例化一个dep
  let dep = new Dep()

  Object.defineProperty(data, key, {
    get() {
      // 页面取值时，可以把watcher收集到dep里面---依赖收集
      if(Dep.target) {
        // 如果有watcher,dep就会保存watcher, 同时watcher也会保存dep
        dep.depend()
        if(childObj) {
          // 属性的值依然是一个对象（object和array）
          // childObj指代的是Observer实例，对里面的dep进行依赖收集
          // 比如：{a:[1,2,3]}, 属性a对应的是一个数组，观测数组的返回值，就是对应数组的Observer实例
          childObj.dep.depend()
          if(Array.isArray(value)) {
            // 如果内部是数组
            // 如果数据结构类似{a:[1,2, [3, 4, [5,6]]]},这种多重嵌套，数组包含数组的情况
            // 那我们访问a时，只是对第一层的数组做了依赖收集，里面的数组因为没有访问到，没有进行依赖收集
            // 需要递归进行依赖收集
            dependArray(value)
          }
        }
      }
      return value
    },
    set(newValue) {
      if(value === newValue) return 
      // 如果赋值的新值是一个对象，需要观测
      observe(newValue)
      value = newValue

      dep.notify(); // 通知渲染watcher去更新---派发更新
    }
  })

  // 思考：
  // 1. 这种数据劫持的方式对数组的影响？
  //   解： 虽然a[1], a[2], a[3]...，可以根据数组下表作修改，但若数组长度过大，有上千项，给每个数据修改set,get方法，
  //     性能消耗过大，不易负担。所以，该数据劫持方法，只适用于对象；
  // 2. Object.defineProperty的缺点：
  //   解： 对象新增或者删除的属性，无法被set监听到，只有对象传入时本身存在的属性才会被劫持
}

export function observe(value) {
  if(Object.prototype.toString.call(value) === '[object Object]' ||
    Array.isArray(value)
  ) {
    return new Observer(value)
  }
}

// 递归收集数组依赖
function dependArray(value) {
  for(let e, i = 0, len = value.length; i < len; i++) {
    e = value[i]
    // e.__ob__ 表示e已经响应式观测过了，但是没有进行依赖收集
    e && e.__ob__ && e.__ob__.dep.depend()
    if(Array.isArray(e)) {
      dependArray(e) // 递归，数组依赖收集
    }
  }
}

// 使对象变成响应式
export function set(target, key, val) {
  // 如果使数组，则直接调用vue重写的splice方法（会触发响应式更新）
  if(Array.isArray(target) && isValidArrayIndex(key)) { 
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }

  // 如果是对象本身的属性，直接添加即可(该对象本身已经被响应式了)
  if(key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }

  const ob = target.__ob__ // __ob__ 用来表示某数据是否已经被响应式了
  // 如果某对象本身不是响应式，就不需要将其定义为响应式
  if(!ob) {
    target[key] = val
    return val
  }
  // 核心：使用定义好的响应式函数，将数据变为响应式
  defineReactive(ob.value, key, val)
  ob.dep.notify() // 通知视图更新 (若是同没有改变值，在前面的逻辑中就return了)
  return val
}

// 删除响应式数据
export function del(target, key) {
  // 如果是数组，依旧调用splice方法
  if(Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return;
  }

  const ob = target.__ob__
  // 如果对象本身就没有这个属性，则什么也不做
  if(!hasOwn(target, key)) {
    return;
  }
  // 直接使用delete 删除这个属性
  delete target[key]
  // 如果对象本身不是响应式，直接返回
  if(!ob) {
    return;
  }
  ob.dep.notify() // 通知视图更新
} 

/**
 * Check if val is a valid array index.
 */
// src/shared-util
export function isValidArrayIndex (val) {
  const n = parseFloat(String(val))
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}
/**
 * Check whether an object has the property.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

// 数据响应式（依赖收集的过程）：
// 在initState时，通过defineProperty将数据变成响应式对象，其中getter部分是依赖收集

// 初始化数据后，会走mount的过程，会实例化watcher，然后会调用this.get()方法，
// ```
//   // 存在el属性，进行模版转换
//   if(vm.$options.el) {
//     vm.$mount(vm.$options.el)
//   }
// ```
// get中pushTarget方法会将全局的Dep.target 赋值为当前的watcher实例（）

// const res = this.getter.call(this.vm) 会执行render方法，触发数据对象的getter,此时Dep.target已经有值了，就会往下进行依赖收集
// Watcher.addDep => dep.addSub(),将当前watcher添加到当前dep中的subs中，便于后期数据修改时通知依赖更新
// 不断赋值Dep.target,不断收集依赖

// 所以在 vm._render() 过程中，会触发所有数据的 getter，这样便已经完成了一个依赖收集的过程。