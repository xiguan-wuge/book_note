
let callbacks = []
let pengding = false

function flushCallbacks() {
  pengding = false // 把标志还原回false
  // 一次执行回调
  for(let i = 0; i < callbacks.length; i++) {
    callbacks[i]()
  }
}

let timeFunc // 定义异步方法，采用优雅降级
if(typeof Promsie !== undefined) {
  // 如果支持promise
  const p = Promise.resolve()
  timeFunc = () => {
    p.then(flushCallbacks)
  }
} else if(typeof MutationObserver !== undefined) {
  // MutationObserver 主要监听dom变化，也是一个异步方法
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timeFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
} else if(typeof setImmediate !== undefined) {
  timeFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // 最后采用setTimeout
  timeFun = () => {
    setTimeout(flushCallbacks, 0);
  }
}

// 主要思路就是采用微任务优先的方式调用异步方法去执行 nextTick 包装的方法
export function nextTick(cb) {
  // 除了渲染watcher，用户手动调用的nextTick，会一起收集到数组
  callbacks.push(cb)
  if(!pending) {
    // 如果多次调用nextTick, 只会执行一次异步，等异步队列清空之后，再把标志变为false
    pending = true
    timeFunc()
  }
}