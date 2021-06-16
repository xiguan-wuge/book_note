import {nextTick} from '../util/next-tick'
let queue = []
let has = {}
function flushSchedulerQueue() {
  for(let index = 0; index < queue.length; i++) {
    queue[index].run()
  }

  // 执行完毕之后，清空队列
  queue = []
  has = {}
}

// 实现异步队列机制
export function queueWatcher(watcher) {
  const id = watcher.id
  // watcher 去重
  if(has[id] === undefined) {
    // 同步代码执行，把全部的watcher都放到队列中去
    queue.push(watcher)
    has[id] = true

    // 进行异步调用
    nextTick(flushSchedulerQueue)
  }
}