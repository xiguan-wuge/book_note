const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

function MyPromise (fn) {
  const that = this
  const state = PENDING
  const value = null
  // 保存then中的回调（当执行完Promise时，状态可能还在等待中，这个时候应把then中的回调保存起来，用于状态改变时使用）
  const resolvedCallbacks = []
  const rejectedCallbacks = []

  function resolve(value) {
    // if(that.state === PENDING) {
    //   that.state = RESOLVED
    //   that.value = value
    //   // 继续执行下一步的异步操作
    //   that.resolvedCallbacks.map(cb =>cb(that.value))
    // }
    if(value instanceof(MyPromise)) {
      return value.then(resolve,reject)
    }
    setTimeout(() => {
      if(that.state === PENDING) {
        that.state = RESOLVED
        that.value = value
        // 继续执行下一步的异步操作
        that.resolvedCallbacks.map(cb =>cb(that.value))
      }
    },0)
  }

  function reject(value) {
    setTimeout(() => {
      if(that.state  === PENDING) {
        that.state = REJECTED
        that.value = value
        that.rejectedCallbacks.map(cb => cb(that.value))
      }
    })
    
  }
  // 执行promise中传入的函数
  try{
    fn(resolve,reject)
  } catch (e){
    reject(e)
  }
}

MyPromise.prototype.then = function(onFullfilled,onRejected) {
  const that = this
  let promise2 = null
  onFullfilled = typeof(onFullfilled) === 'function' ? onFullfilled : v => v
  onRejected = typeof(onRejected) === 'function' ? onRejected : r => { throw r}
  if(that.state === PENDING) {
    // that.resolvedCallbacks.push(onFullfilled)
    // that.rejectedCallbacks.push(onRejected)
    return(promise2  = new MyPromise((resolve,reject) =>{
      that.resolvedCallbacks.push(() => {
        try {
          const x = onFullfilled(that.value)
          resolutionProcedure(promise2,x,resolve,reject)
        } catch (r) {
          reject(r)
        }
      })

      that.rejectedCallbacks.push(()=>{
        try {
          const x = onRejected(that.value)
          resolutionProcedure(promise2,x,resolve,reject)
        } catch(r) {
          reject(r)
        }
      })
    }))

    
  }
  if(that.state === RESOLVED) {
    // onFullfilled(that.value)
    return (promise2 = new MyPromise((resolve,reject) =>{
      setTimeout(() => {
        try {
          const x = onFullfilled(that.value)
          resolutionProcedure(promise2,x,resolve,reject)
        } catch(reason) {
          reject(reason)
        }
      },0)
    })

    )
  }
  if(that.state === REJECTED) {
    setTimeout(() => {
      onRejected(that.value)
    },0)
  }
  // 兼容多中promise
  function resolutionProcedure(promise2,x,resolve,reject) {
    if(promise2 === x) {
      return reject(new TypeError('Error'))
    }
    if(x instanceof MyPromise) {
      x.then(value => {
        resolutionProcedure(promise2,value,resolve,reject)
      },reject)
    }
    let called = false
    if(x !== null && (typeof x === 'object' || typeof x === 'function')) {
      try {
        let then = x.then
        if(typeof then === 'function') {
          then.call(
            x,
            y => {
              if(called) return
              called = true
              resolutionProcedure(promise2,y,resolve,reject)
            },
            e => {
              if(called) return
              called = true
              reject(e)
            }
          )
        } else {
          resolve(x)
        }
      } catch (e) {
        if(called) return
        called = true
        reject(e)
      }
    } else {
      resolve(x)
    }
  }
}

// promise/A+ 规范
// 详解链接： https://www.cnblogs.com/qq666666/p/7476292.html
// 规范出现的原因
// 1. 不知道异步什么时候有结果，所以需要回调函数，但是在某些情况下，需要知道异步结果什么时候返回，然后进行一些处理
// 2. 当在异步回调中的操作还是异步回调时，就形成了异步回调的嵌套

// 规范的内容：
// 1. 不管什么操作都返回promise对象，这个对象里会有一个属性和方法（类似jquery里中的链式调用，返回自己本身）
// 2. promise有三种状态： pengding(等待中)，fullfilled(已完成)，rejected（失败、拒绝）
// 3. 这个promise对象通过then方法进行的回调
