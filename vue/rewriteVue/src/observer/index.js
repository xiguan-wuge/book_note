import {arrayMethod} from './array'

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
  observe(value)

  Object.defineProperty(data, key, {
    get() {
      console.log('get', value)
      return value
    },
    set(newValue) {
      if(value === newValue) return 
      console.log('set', newValue)
      value = newValue
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

