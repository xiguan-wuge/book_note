// 定义一个异步执行的方式
let excuteAsync
if(typeof process === 'object' && process.nextTick) {
  excuteAsync = process.nextTick
} else if(typeof setImmediate === 'function') {
  excuteAsync = setImmediate
} else {
  excuteAsync = function(fn) {
    setTimeout(fn, 0)
  }
}
console.log('excuteAsync',excuteAsync);

// 异步回调
// 在当前js文件中，callback 和onError一定是函数，但仍做了是否为函数的判断
function callAsync(fn, arg, callback, onError) {
  excuteAsync(function(){
    try {
      // isFunction(callback) ? callback(fn(arg)) : fn(arg)
      callback ? callback(fn(arg)) : fn(arg)
    } catch (e) {
      // if(isFunction(onError)) 
        onError(e)
      // } else {
        // throw new Error(e)
      // }
    }
  })
}

// 判断是否为function
const isFunction = variable => typeof variable === 'function'

// 定义Promise的三种常量状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  constructor(handle) {
    if(!isFunction(handle)) {
      return new Error('MyPromise must accept a function as a parameter')
    }
    this._status = PENDING
    this._value = null
    this._fulfilledQueue = []
    this._rejectedQueue = []

    // 执行handle
    try {
      handle(this._resolve.bind(this), this._reject.bind(this))
    } catch (error) {
      this._reject(error)
    }
  }

  // 处理成功状态的函数
  _resolve(val) {
    
    if(this._status !== PENDING) return
    this._status = FULFILLED
    // 依次执行成功队列中的函数，并清空队列
    const runFulfilled = (value) => {
      let cb 
      console.log('this._fulfilledQueue',this._fulfilledQueue);
      while(cb = this._fulfilledQueue.shift()) {
        // ? 每个then方法接收的参数都是value，应该是要根据状态去改变
        // 不同的then回调接收的参数以一定相同
        cb(value) 
      }
    }

    // 依次执行失败队列中的函数，并清空队列
    const runRejected = (error) => {
      let cb 
      while(cb = this._rejectedQueue.shift()) {
        cb(error)
      }
    }

    // _resolve方法的核心操作
    // 如果当前resolve的参数是promise对象，则必须等待该Promise对象状态改变后，
    // 当前Promise的状态才会改变，且状态取决于参数Promise对象的状态
    
    if(val instanceof MyPromise) {
      val.then(value => {
        this._value = value
        runFulfilled(value)
      }, err => {
        // 遇到失败的情况，才需要处理失败回调
        this._value = err
        runRejected(err)
      })
    } else {
      console.log('normal');
      // 正常情况，在resolve方法中，处理成功的回调即可
      this._value = val
      runFulfilled(val)
    }
  }

  // 添加reject时执行的函数
  _reject(err) {
    console.log('_reject', err);
    
    if(this._status !== PENDING) return
    // 依次执行失败回调里的函数
    this._status = REJECTED
    this._value = err
    let cb
    while(cb = this._rejectedQueue.shift()) {
      cb(err)
    }
  }

  // 添加then方法 Promise的核心
  // 做了什么：
  // - 封装当前的成功回调、失败回调
  // - 等待态时；收集成功回调，添加到成功回调中；收集失败回调，添加到失败队列中
  // - 成功态时，执行当前的成功回调；失败态时，执行当前的失败回调
  // - 返回一个Promise对象，以便后续的链式Promise操作
  then(onFulfilled, onRejected) {
    console.log('then');
    
    // 返回一个新的Promise对象
    return new MyPromise((onFulfilledNext, onRejectedNext) => {
      // 封装一个成功的回调
      const fulfilled = value => {
        
        if(isFunction(onFulfilled)) {
          callAsync(onFulfilled, value, res => {
            if(res instanceof MyPromise) {
              // 如果当前回调函数返回结果是Promise对象，必须等待其状态改变后再执行下一个回调
              res.then(onFulfilledNext, onRejectedNext)
            } else {
              // 否则，会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调
              onFulfilledNext(res)
            }
          }, onRejectedNext)
        } else {
          try {
            onFulfilledNext(value)
          } catch (error) {
            // 如果函数执行出错，新的Promise对象的状态为失败
            onRejectedNext(error)
          }
        }
      }

      // 封装一个失败时执行的函数
      const rejected = error => {
        
        if(isFunction(onRejected)) {
          callAsync(onRejected, error, res => {
            if(res instanceof MyPromise) {
              res.then(onFulfilledNext, onRejectedNext)
            } else {
              //否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
              onFulfilledNext(res)
            }
          },onRejectedNext)
        } else {
          try {
            onRejectedNext(error)
          } catch(err) {
            onRejectedNext(err)
          }
        }
      }

      // 根据状态执行响应的函数
      console.log('switch',this._status);
      
      switch (this._status) {
        // 当前状态为pending时，将then方法回调函数添加到执行队列中等待执行
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

  // 添加catch方法
  catch(onRejected) {
    return this.then(null, onRejected)
  }

  // 添加静态resolve方法
  static resolve(value) {
    console.log('static resolve');
    
    // 如果参数是MyPromise实例或者thenable对象，直接返回value
    return value instanceof MyPromise || 
      (value && isFunction(value.then)) ? value :
      new MyPromise((resolve, reject) => resolve(value))
  }
  // 添加静态reject方法
  static reject(value) {
    return new MyPromise((resolve, reject) => { reject(value) })
  }

  // 添加静态all方法
  static all(list) {
    return new MyPromise((resolve, reject) => {
      let values = [], count = list.length
      for(let i in list) {
        // 数组参数如果不是MyPromise实例，点调用MyPromise.resolve 
        this.resolve(list[i]).then(res => {
          values[i] = res
          --count < 1 && resolve(values)
        }, reject)
      }
    })
  }

  // 添加静态race方法
  static race(list) {
    return new MyPromise((resolve, reject) => {
      for(let p of list) {
        // 只要有一个实例率先改变状态，新的MyPromise的状态就跟着改变
        this.resolve(p).then(res => {
          resolve(res)
        },reject)
      }
    })
  }

  // 添加finally方法
  finally(cb) {
    return this.then(
      value => MyPromise.resolve(cb()).then(() => value),
      reason => MyPromise.resolve(cb()).then(() => { throw reason})
    )
  }
}

// 测试代码
new MyPromise((resolve, reject) => {
  console.log(1);
  resolve(3);
  MyPromise.resolve().then(
    () => console.log(4)
  ).then(
    () => console.log(5)
  )
}).then(num => { 
  console.log(num) 
}).then(() => { 
  console.log(6) 
});
console.log(2)
// 依次输出：1 2 4 3 5 6