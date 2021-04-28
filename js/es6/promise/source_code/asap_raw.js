var domain;
var hasSetImmidiate = typeof setImmediate === 'function'
// 使用尽可能快的方法在自己的回合中执行任务，并
// 优先于其他事件，包括在Node.js中地网络IO事件.
//
// 任务引发的异常将永久中断后续任务。
// 较高级别的“asap”函数确保任务引发异常，任务队列将继续尽可能快地刷新，
// 但如果您直接使用“rawAsap”，您有责任先确保任务中没有抛出异常，
// 或者在抛出异常时，手动调用`rawAsap.requestFlus`方法。

module.exports = rawAsap;
function rawAsap(task) {
  if(!queue.length) {
    requestFlush()
    flushing = true
  }
  // 避免函数调用
  queue[queue.length] = task
}
var queue = []
var index =  0
var capacity = 1024

function flush() {
  while(index < queue.length) {
    index = index + 1
    queue[currentIndex].call()
    if(index >capacity) {
      for(var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
        queue[scan] = queue[scan + index]
      }
      queue.length -= index
      index = 0
    }
  }
  queue.length = 0
  index = 0
  flushing = false
}
rawAsap.requestFlush = requestFlush;
function requestFlush() {
  var parentDomain = process.domain
  if(parentDomain) {
    if(!domain) {
      domain = require('domain')
    }
    domain.active = process.domain = null
  }

  if(flushing && hasSetImmidiate) {
    setImmediate(flush)
  } else {
    process.nextTick(flush)
  }

  if(parentDomain) {
    domain.active = process.domain = parentDomain
  }
}