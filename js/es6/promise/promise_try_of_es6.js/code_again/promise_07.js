const isFunction = v => typeof v === 'function'

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

function callAsync(fn, args, callback, onError) {
  excuteAsync(function(){
    try {
      callback ? callback(fn(args)) : fn(args)
    } catch (error) {
      onError(error)
    }
  })
}

// 定义常量
const FULLFILLED = 'fulfilled'
const REJECTED = 'rejected'
const PENDING = 'pengding'

// 定义Promise
class MyPromise {
  constructor(handle) {
    if(!isFunction(handle)) {
      return new TypeError(`Promise resolver ${handle} is not a function`)
    }
    this.status = PENDING
    this._value = null
    this._onFullfilledQueue = []
    this._onRejectedQueue = []

    // 执行传入的函数
    try {
      handle(this._resolve.bind(this), this._reject.bind(this))
    } catch (error) {
      this._reject(error)
    }
  }

  // 定义成功处理的函数
  // - 修改status的状态值，
  // - 获取value值
  // - 依次执行成功队列的函数 
  _resolve(value) {
    if(this.status !== PENDING) return
    this.status = FULLFILLED
    
    const runFulfilled = (val)=> {
      let cb
      while(cb = this._onFullfilledQueue.shift()) {
        cb(val)
      }
    }
    // 执行失败队列中的函数
    const runRejected = (err) =>{
      let cb
      while (cb = this._onRejectedQueue.shift()) {
        cb(err)
      }
    }

    // 执行函数
    // 修改value值
    if(value instanceof MyPromise) {
      // 当前参数是promise实例，需要等当前参数的promise对象状态改变后，再执行相应的回调函数
      // ? 什么情况下 value是一个promise。开发者传入的
      value.then(innerValue => {
        this._value = innerValue
        runFulfilled(innerValue)
      }, innerErr => {
        this._value = innerErr
        runRejected(innerErr)
      })
    } else {
      // 参数不是promise实例，依次执行成功队列里的函数
      this._value = value
      runFulfilled(value)
    }
  }

  // 定义处理失败队列的函数
  // - 修改status状态值
  // 修改_value值
  // 执行失败队列中的函数
  _reject(error) {
    if(this.status !== PENDING) return 
    this.status = REJECTED
    this._value = error
    let cb
    while(cb = this._onRejectedQueue.shift()){
      cb(error)
    }
  }

  // 定义then方法，promise的核心
  // - 封装当前的成功、失败回调
  // - 等待状态时，收集成功回调到成功回调队列，收集失败回调到失败回调队列中
  // - 成功状态时，执行当前的成功回调；失败状态时，执行当前封装的失败回调
  // - 返回一个新的promise对象
  then(onFullfilled, onRejcted) {
    const {_value, status} = this
    // 返回新的promise
    return new Promise((resolveNext, rejectNext) => {
      // 封装当前成功函数
      // 当前参数是函数，异步执行回调（使用之前封装的异步函数，接受当前函数作为参数），需要判断是不是promise
      // 当前参数不是函数，try catch 捕获异常信息
      const fulfilled = (value) => {
        if(isFunction(onFullfilled)) {
          callAsync(onFullfilled, value, res=> {
            if(res instanceof MyPromise) {
              res.then(resolveNext, rejectNext)
            } else {
              resolveNext(res)
            }
          }, rejectNext)
        } else {
          try {
            resolveNext(value)
          } catch (error) {
            rejectNext(error)
          }
        }
      }
      // 封装当前的失败函数
      const rejected = (error) => {
        if(isFunction(onRejcted)) {
          callAsync(onRejcted, error, res => {
            if(res instanceof MyPromise) {
              res.then(resolveNext, rejectNext)
            } else {
              rejectNext(error)
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
      // 根据状态做处理
      switch(status) {
        case PENDING:
          this._onFullfilledQueue.push(fulfilled)
          this._onRejectedQueue.push(rejected)
          break;
        case FULLFILLED:
          fulfilled(_value)
          break;
        case REJECTED: 
          rejected(_value)
          break
      }
    }) 
  }
  catch(onRejcted) {
    return this.then(null, onRejcted)
  }

  // 当前promise实例成功或失败后都会执行的函数
  // 核心，执行this.then方法
  // 该方法不接受promise的返回值，即不依赖于当前promise的执行结果
  // finally总是返回之前的值 ?
  finally(cb) {
    this.then(
      value => Promise.resolve(cb()).then(()=> value),
      error => Promsie.resolve(cb()).then(() => {throw error})
    )
  }

  // 静态resolve方法
  // 分情况处理
  static resolve(value) {
    // 1.参数是promise实例，直接返回该实例
    if(value instanceof MyPromise) return value
    // 2.参数是一个thenable对象，将这个对象转为Promise对象，然后立即执行thenable中的then方法
    if(typeof value === 'object' && typeof value.then === 'function') {
      return new MyPromise((resolve, reject) => {
        value.then(resolve, reject)
      })
    }
    // 3.参数是不具有then方法的对象，或者根本就不是对象
    // 4.不带有任何参数
    return new MyPromise(resolve => resolve(value))
  }

  // 静态reject方法
  // 返回一个新的promise实例，触发实例的reject方法
  static reject(error) {
    return MyPromise(resolveInner, rejectInner=> rejectInner(error))
  }

  // 静态all方法
  // - 创建一个新的promise实例
  // - 依次执行参数数组中的方法，同时收集执行结果
  // - 若全部执行完毕，将收集的执行结果返回
  // - 依次执行时，若有一个函数执行失败,将错误信息抛出，并不会中断当前的遍历
  // - 若数组中的项是异步操作，能保证事件的执行顺序，但是会将执行结果按传入的顺序保存
  static all(list) {
    return new MyPromise((resolve, reject) => {
      const value = []
      let count = 0
      for(let i in list) {
        // 若当前函数不是promise ，这包装成promise
        MyPromise.resolve(list[i]).then(res => {
          value[i] = res
          count++
          // 当所有项状态都变成fulfilled，执行resolve
          if(count === list.length) resolve(value)
        }, err => {
          reject(err)
        })
      }
    })
  }

  // 静态race方法
  // 只要有一个实例的状态发生改变，新的promise 的状态就随即发生改变
  static race(list) {
    return new MyPromise((resolve, reject) => {
      for(const i in list) {
        // v 操作的函数，影响对应then回调的执行时间
        MyPromise.resolve(list[i]).then(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
      }
    })
  }
}

function t1() {
  setTimeout(()=> {
    console.log('t1')
  }, 1000)
}
function t2() {
  setTimeout(()=> {
    console.log('t2')
  }, 2000)
}
function t3() {
  setTimeout(()=> {
    console.log('t3')
  }, 3000)
}
console.log('1111', MyPromise.all)
Promise.all([t1, t2, t3, 4, 5]).then(res => {
  console.log('all-res', res)
}).catch(err => {
  console.log('all-err', err)
})


