// 核心： 发布订阅者模式 + Object.defineProperty

// 把对象的每一项变为可观测的对象
function observable(obj) {
  if(!obj || typeof(obj) !== 'object'){
    return
  }
  let keys = Object.keys(obj)
  keys.forEach((key) => {
    defineReactive(obj,key, obj[key])
  })
  return obj
}

// 使一个对象转为可观测的对象
function defineReactive(obj,key,val) {
  let dep = new Dep()
  Object.defineProperty(obj,key,{
    get() {
      console.log(`${key}属性被读取了`)
      dep.depend()
      return val;
    },
    set(newVal) {
      console.log(`${key}属性改为${newVal}`)
      val = newVal
      dep.notify()
    }
  })
}

// 订阅者
class Dep {
  constructor() {
    this.subs = []
  }
  // 添加订阅者
  addSub(sub) {
    this.subs.push(sub)
  }
  // 判断是否添加订阅者
  depend() {
    if(Dep.target) {
      this.addSub(Dep.target)
    }
  }
  // 通知订阅者更新
  notify() {
    this.subs.forEach(sub =>{
      sub.update()
    })
  }
}



Dep.target = null
// 监听数据更新
class Watcher {
  constructor(vm,express,cb) {
    this.vm = vm
    this.express = express
    this.cb = cb
    this.value = this.get()
  }
  // 更新视图数据
  update() {
    let value = this.vm.data[this.express]
    let oldVal = this.value
    if(value !== oldVal) {
      this.cb.call(this.vm,value,oldVal,this.express)
    }
  }
  get() {
    Dep.target = this; // 缓存自身
    let value = this.vm.data[this.express]
    Dep.target = null; // 释放自身
    return value
  }
}

// let car = obserable({
//   brand: 'BWM',
//   price: 300000
// })
// car.brand
// car.price = 1000000
// console.log('car',JSON.stringify(car))