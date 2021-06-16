// dep 和 watcher 是多对多的关系
// 每个属性都有自己的dep

let id = 0; // dep实例的唯一标识
export default class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 存放watcher实例的容齐，依赖收集
  }
  // 把自身(dep)添加到watcher中
  depend() {
    if(Dep.target) {
      Dep.target.addDep(this); 
    }
  }

  // 依次执行subs中watcher实例的更新方法
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }

  // 把watcher添加到自身的subs
  addSub(watcher) {
    this.subs.push(watcher)
  }
} 
// Dep.target是一个全局Watcher的指向，初始状态为null
Dep.target = null

// 用栈结构来存watcher
const targetStack = []

export function pushTarget(watcher) {
  targetStack.push(watcher)
  Dep.target = watcher // Dep.target 指向当前watcher
}

export function popTarget() {
  // 当前watcher出栈，拿到上一个watcher
  targetStack.pop()
  Dep.target = targetStack[targetStack.length -1]
}