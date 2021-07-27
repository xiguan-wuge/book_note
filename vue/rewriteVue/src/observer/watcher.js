import {pushTarget, popTarget} from './dep.js'
import {queueWatcher} from './scheduler.js'
import {isObject} from '../util/index.js'
// 全局变量id, 每次new Watcher 都会自增
let id = 0

export default class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.cb = cb; // 回调函数，比如在watcher 更新之前可以执行beforebeforeUpdate方法
    this.options = options; // 额外选项，true 代表渲染watcher
    this.id = id++; // watcher的唯一标识
    this.deps= []; // 存放dep的容器
    this.depsId = new Set(); // depId收集，去重

    this.user = options.user // 标识用户watcher

    this.lazy = options.lazy // 标识计算属性watcher
    this.dirty = this.lazy // 表示计算属性watcher是否需要重新计算，默认true 

    // 如果表达式是一个函数
    if(typeof exprOrFn === 'function') {
      this.getter = exprOrFn
    } else {
      this.getter = function() {
        // 用户传过来的可能是一个字符串：a.a.a.a (vue 不支持a[1].a, 不提供根据数组下标做响应式)
        const path = exprOrFn.split('.')
        let obj = vm
        for(let i = 0; i < path.length; i++) {
          obj=obj[path[i]]  // vm.a.a.a.a
        }
        return obj
      }
    }
    // // 实例化默认调用get方法
    // this.get()

    // 用户watcher改写
    // 实例化就是进行一次取值的操作
    // this.value = this.get()

    // computed改写
    this.value = this.lazy ? undefined : this.get()
  }

  get() {
    // 在调用方法之前，先把当前的watcher实例推到全局的Dep.target上
    pushTarget(this)

    // 如果watcher实例是渲染watcher，就相当于执行 vm._update(vm._render())
    // 这个_render方法在执行的时候会取值，从而实现依赖收集
    // this.getter()

    // 计算属性改写
    // 计算属性在这里执行用户自定义的get函数，访问计算属性依赖项，从而把自身的计算watcher添加到依赖想dep中
    const res = this.getter.call(this.vm)

    // 在调用方法之后，把当前watcher实例从全局Dep.targtet中移除
    popTarget()

    return res
  }

  // 把dep实例添加到deps中， 
  // 同时保证同一个dep只会被保存到watcher中一次，
  // 同一个watcher也只会保存同一个dep一次
  addDep(dep) {
    let id = dep.id
    if(!this.depsId.has(id)) {
      this.depsId.add(id)
      this.deps.push(dep)
      // 直接调用dep的addSub方法，把自己（watcher实例）添加到dep.subs中
      dep.addSub(this)
    }
  }

  // 简单执行下get方法，模拟派发更新，之后涉及到计算属性就不一样了
  update() {
    // this.get()

    if(this.lazy) {
      // 计算属性依赖项的值发生了变化，只需要把dirty值设置为true,下次访问到了再重新计算
      this.dirty = true
    } else {
      // 每次watcher进行更新时，先缓存起来，之后再一起调用
      // 异步队列机制
      queueWatcher(this)
    }
  }

  run() {
    // 真正的触发更新

    const newVal = this.get() // 新值
    const oldVal = this.value // 旧值
    this.value = newVal // 现在的新值将成为下一次变化的旧值

    if(this.user) {
      // 如果两次的值不同，或者值是引用类型，因为引用类型的新旧值相等，指向同一块引用地址
      if(newVal !== oldVal || isObject(newVal)) {
        this.cb.call(this.vm, newVal, oldVal)
      }
    } else {
      // 渲染watcher
      this.cb.call(this.vm)
    }
  }

  // 计算属性重新计算，并且计算完成后把dirty值设置为false
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }

  depend() {
    // 计算属性watcher存储了依赖项
    let i = this.deps.length
    while(i--) {
      this.deps[i].depend() // 调用依赖想dep去收集渲染watcher
    }
  }
}