// 定义通用函数
const inFunction = value = typeof value === 'function'

// 异步执行函数封装
let excuteAsync
if(typeof process === 'object' && process.nextTick) {
  excuteAsync = process.nextTick
} else if(typeof setImmediate === 'function') {
  excuteAsync = setImmediate
} else {
  excuteAsync = function(fn) {
    setTimeout(fn, 0);
  }
}
function callAsync(fn, arg, callback, onError) {
  excuteAsync(function() {
    try {
      callback ? callback(fn(arg)) : fn(arg)
    } catch (e) {
      onError(e)
    }
  })
}

// 定义常量
const PENDING = 'pengding'
const FULFILLED = 'fulfilled'
const RESOLVEd = 'resolved'

class Mypromise {
  constructor(handle) {
    // 判断是否是Promise实例

    this.status = PENDING
    this._value = null
    this._fulfilledQueue = []
    this._rejectedQueue = []

    // 执行传入的函数
    try {
      handle(this._resolve.bind(this), this._rejectedQueue.bind(this))
    } catch (error) {
      this._reject(error)
    }
  }

  // 处理成功的函数
  // 核心操作： 改变status状态，执行相应队列中的回调函数
  _resolve(val) {
    if(this.status !== PENDING) return
    this.status = FULFILLED

    // 依次处理成功队列中的函数
    const runFulfilled = (value) => {
      let cb
      while(cb = this._fulfilledQueue.shift()) {
        cb(value)
      }
    }

    // 依次处理失败队列中的函数
    const runRejected = (error) => {
      let cb
      while(cb = this._rejectedQueue) {
        cb(error)
      }
    }

    // resolve 的核心操作二，改变状态
    // 如果当前的resolve的参数是promise对象，需要等待该参数Promise对象状态改变后，再执行当前Promise
    if(val instanceof MyPromise) {
      val.then(value => {
        this._value = value
        runFulfilled(value)
      }, err => {
        this._value = err
        runRejected(err)
      })
    } else {
      // 正常情况，接收value，执行函数
      this._value = val
      runFulfilled(val)
    }
  }

  // 处理失败的函数
  // 操作内容：1. 修改状态，2. 接收错误消息，3. 执行当前失败队列的中回调
  _rejected(err) {
    if(!this._status !== PENDING) return
    this._status = REJECTED
    this._value = err
    let cb
    while(cb = this._rejectedQueue.shift()) {
      cb(err)
    }
  }

  // then 方法，Promise的核心
  // 内容：
  // - 封装当前的成功回调，失败回调
  // - 等待状态时：收集成功回调，添加到成功回调队列中；收集失败回调，添加到失败回调队列中
  // - 成功态时：执行当前的成功回调；失败态时：执行当前的失败回调
  // - 返回一个Promise对象，便于下一步操作
  then(onFulfilled, onRejected) {
    // 返回一个新的promise
    return new MyPromise((resolveNext, rejectNext) => {
      // 封装成功回调
      const fulfilled = (value) => {
        // 当前参数是函数： 异步执行回调，需要判断
        // 当前参数不是函数: try catch 捕获错误信息
        if(isFunction(onFulfilled)) {
          callAsync(onFulfilled, value, res => {
            if(res instanceof MyPromise) {
              res.then(resolveNext, rejectNext)
            } else {
              resolveNext(res)
            }
          }, rejectNext)
        } else {
          try {
            resolveNext(value)
          } catch (e) {
            rejectNext(e)
          }
        }
      }
      const rejected = (error) => {
        if(isFunction(onRejected)) {
          callAsync(onRejected, error, res => {
            if(res instanceof MyPromise) {
              res.then(resolveNext, rejectNext)
            } else {
              //否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
              // resolveNext(res)
              // 为保证错误信息的继续向后选播
              rejectNext(res)
            }
          }, rejectNext)
        } else {
          try {
            rejectNext(error)
          } catch (e) {
            rejectNext(e)
          }
        }
      }

      // 根据当前状态做操作
      switch(this._status) {
        case PENDING: 
          this._fulfilledQueue.push(fulfilled)
          this._rejectedQueue.push(rejected)
          break
        case FULFILLED: 
          fulfilled(this._value)
          break
        case REJECTED: 
          rejected(this._value)
          break
      }
    })
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  // 静态Resolve方法
  // 如果传入的参数是promise实例，直接返回当前参数；否则封装成promise实例，并成功返回
  static resolve(value) {
    return value instanceof MyPromise ||
      (value && isFunction(value.then)) ? value :
      new MyPromise((resolve, reject) => resolve(value))

  }
}