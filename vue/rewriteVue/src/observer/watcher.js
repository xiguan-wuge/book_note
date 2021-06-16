import {pushTarget, popTarget} from './dep'
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

    // 如果表达式是一个函数
    if(typeof exprOrFn === 'function') {
      this.getter = exprOrFn
    }
    // 实例化默认调用get方法
    this.get()
  }

  get() {
    // 在调用方法之前，先把当前的watcher实例推到全局的Dep.target上
    pushTarget(this)

    // 如果watcher实例是渲染watcher，就相当于执行 vm._update(vm._render())
    // 这个_render方法在执行的时候会取值，从而实现依赖收集
    this.getter()

    // 在调用方法之后，把当前watcher实例从全局Dep.targtet中移除
    popTargtet()
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
    this.get()
  }
}