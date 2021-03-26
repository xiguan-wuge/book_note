// vue3 使用proxy 来代替Object.defineProperty

// 实现一个简易版的 watch

let onWatch = (obj, setBind, getLogger) => {
  let handler = {
    get(target, property, recevier) {
      getLogger(target, property)
      return Reflect.get(target, property, recevier)
    },
    set(target, property, value, recevier) {
      setBind(value, property)
      return Reflect.set(target, property, value)
    } 
  }
  return new Proxy(obj, handler)
}

let obj = {a: 1, b: '22'}
let p = onWatch(
  obj,
  (value, property) => {
    console.log(`监听到属性${property}改变为${value}`)
  },
  (target, property,value) => {
    console.log('value',value)
    console.log('target',target)
    console.log(`${property} = ${target[property]}`)
  }
)
p.a = 2;
p.a

// vue3中使用proxy代替Object.defineProperty的原因：
// 1. proxy无需一层层递归为每个属性添加代理，一次即可完成以上操作，性能上更好；
// 2. 原本的实现上一些数据更新监听不到，但是Proxy可以监听到任何数据的改变
// 缺点：浏览器对proxy的兼容性不好