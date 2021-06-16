import {arrayMethod} from './array'
import Dep from './dep'

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
      value.__proto__ = arrayMethod
      
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

