/**
 * promise 的执行流程
 * 1.一个Promise构造函数，该函数最终会执行他的参数resolve｜reject；
 * 2.声明的then方法会通过handle方法，将onFullfilled 和 onRejected 方法保存起来；
 * 3.在外部调用resolve或者reject的时候，执行handle(), 执行onFullfilled 或者 onRejected
 * 4.回到then回调中
 * 
 * 定义state状态
 * 0 - pengding,等待中，表示当前的promise实例是初始化状态
 * 1 - fullfill with _value, 一成功处理promise并返回值
 * 2 - rejected with _value, promise 处理失败
 * 3 - 接受了另一promise实例的状态
 * 
 * 一旦状态被修改，在当前promise实例中，状态就不能再被改变
 */
import asap from './asap_raw'
// 抽离变量
var LAST_ERROR = null
var IS_ERROR = {}

// 定义一个空函数
function noop() {}

// 定义获取then方法的函数
function getThen(obj) {
  try {
    return obj.then
  } catch(e) {
    LAST_ERROR = e
    return IS_ERROR // ?为什么要返回 
  }
}

// 接受函数和一个参数，执行函数，取得返回结果
function tryCallOne(fn, a) {
  try {
    return fn(a)
  } catch(e) {
    LAST_ERROR = e
    return IS_ERROR
  }
}
// 接受一个函数和两个参数，执行函数，返回结果
function tryCallTwo(fn, a, b) {
  try {
    return fn(a, b)
  } catch(e) {
    LAST_ERROR = e
    return IS_ERROR
  }
}

function Promise(fn) {
  // 必须通过new初始化Promise
  if(typeof this !== 'object') {
    throw new TypeError('Promise must be constrcuted via new')
  }
  if(typeof fn !== 'function') {
    throw new TypeError('Promise constrctor\'s argument is not a function')
  }
  this._deferredState = 0 // 延迟的状态
  this._state = 0
  this._value = null
  this._deferreds = null
  if(fn === noop) return 
  doResolve(fn, this)
}
Promise._onHandle = null
Promise._onReject = null
Promise._noop = noop

Promise.prototype.then = function(onFullfilled, onRejected) {
  if(this.constructor !== Promise) {
    return saveThen(this, onFullfilled, onRejected)
  }
  var res = new Promise(noop)
  handle(this, new Handle(onFullfilled, onRejected, res))
  return res
}

function saveThen(self, onFullfilled, onRejected) {
  return new self.constructor(function(resolve, reject) {
    var res = new Promise(noop)
    res.then(resolve, reject)
    handle(self, new Handle(onFullfilled, onRejected, res))
  })
}

function handle(self, deferred) {
  while(self._state === 3) {
    // 接收上一个promise实例的情况
    self = self._value
  }
  if(Promise._onHandle) {
    Promise._onHandle(self)
  }
  if(self._state === 0) {
    if(self._deferredState === 0) {
      self._deferredState = 1
      self._deferreds = deferred 
      return
    }
    if(self._deferredState === 1) {
      self._deferredState = 2
      self._deferreds = deferred
      return
    }
    self._deferreds.push(deferred)
    return
  }
  handleResolved(self, deferred)
}

// 处理成功返回
function handleResolved(self, deferred) {
  asap(function() {
    var cb = self._state === 1 ? deferred.onFullfilled : deferred.onRejected
    if(cb === null) {
      if(self._state === 1) {
        resolve(deferred.promise, self._value)
      } else {
        reject(deferred.promise, self._value)
      }
      return
    } 
    var ret = tryCallOne(cb, self._value)
    if(ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR)
    } else {
      resolve(deferred.promise, ret)
    }
  })

}
/**
 * 执行函数，确保onFullfilled 和 onRejected 只执行一次
 * 不能保证是异步
 */
function doResolve(fn, promise) {
  var done = false
  var res = tryCallTwo(fn, function(value) {
    if(done) return;
    done = true
    // 将一个当前promise和promise成功执行后的结果返回
    resolve(promise, value)
  }, function(reason) {
    if(done) return
    done = true
    reject(promise, reason)
  })
  // 异常情况考虑
  if(!done && res === IS_ERROR) {
    done = true
    reject(promise, LAST_ERROR)
  }
}

function resolve(self, newValue) {
  if(newValue === self) {
    return reject(
      self, 
      new TypeError('A promise cannot be resolved with itself. ')
    )
  }
  // 上一个promise实例的返回值是一个对象或者函数时
  if(newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')){
    var then = getThen(newValue)
    if(then === IS_ERROR) {
      return reject(self, LAST_ERROR)
    }
    // 返回值的then和自身promise的then相同，且都是promise实例
    // 修改当前实例的状态和成功值，执行finale方法
    if(then === self.then && newValue instanceof Promsie) {
      self._state = 3
      self._value = newValue
      finale(self)
      return
    } else if(typeof then === 'function') {
      // then不是自身promise的then方法，或者不是promise实例时
      // 转为promise实例，继续执行
      doResolve(then.bind(newValue), self)
      return
    }
  }
  // 非上诉情况，修改状态和值
  self._state = 1
  self._value = newValue
  finale(self)
}

function reject(self, newValue) {
  self._state = 2
  self._value = newValue
  if(promise._onReject) {
    // 执行reject回调
    promise._onReject(self, newValue)
  } 
  finale(self)
}

// 结局函数
function finale(self) {
  if(self._deferredState === 1) {
    handle(self, self._deferreds)
    self._deferreds = null
  }
  if(self._deferredStated === 2) {
    for(var i = 0; i < self._deferreds.length; i += 1) {
      handle(self, self._deferreds[i])
    }
    self._deferreds = null
  }
}

function Handle(onFullfilled, onRejected, promise) {
  this.onFullfilled = typeof onFullfilled === 'function' ? onFullfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.promise = promise
}

// 其他扩展方法

// resolve方法，将一个非promise的数据转换为promise对象
var TRUE = valuePromise(true)
var FALSE = valuePromise(false)
var NULL = valuePromise(null)
var UNDEFINED = valuePromise(undefined)
var ZERO = valuePromise(0)
var EMPTYSTRING = valuePromise('')

// 包装成promise（核心逻辑）
function valuePromise(value) {
  var p = new Promise(Promise._noop)
  p._state = 1
  p._value = value
  return p
}

Promise.resolve = function (value) {
  // 已经是promise实例，无需转化
  if(value instanceof Promise) return value

  // 对部分基本数据类型做处理
  if(value === null) return NULL
  if(value === undefined) return UNDEFINED
  if(value === true) return TRUE
  if(value === false) return FALSE
  if(value === 0) return ZERO
  if(value === '') return EMPTYSTRING

  if(typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if(typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch(e) {
      return new Promise(function(resole, reject) {
        reject(e)
      })
    }
  }

  // 将异常临界值情况考虑完，其余的就正常包装称promise即可
  return valuePromise(value)
}

// reject方法
// 转化成promise，再执行reject
Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value)
  })
}

// all方法
// 同样是返回一个promise，内部的所有项执行完毕后返回promise
// 内部有一个记录所有promise个数的变量remainingLength, 没当一个promise执行完，就会减1
// 当所有的promise执行完毕，就会执行all自身的resolve
Promise.all = function(arr) {
  // 深拷贝数组
  var args = Array.prototype.slice.call(arr)
  return new Promise(function(resolve, reject) {
    if(args.length === 0) return resolve([])
    var remainingLength = args.length
    // 定义 将数组的每一项转化称promise并执行其then方法的方法
    function res(i, val) {
      if(val && (typeof val === 'object' || typeof val === 'function')) {
        if(val instanceof Promise && val.then === Promise.prototype.then) {
          while(val._state === 3) {
            val = val._state
          }
          if(val._state === 1) return res(i, val._state)
          if(val._state === 2) return reject(val._value)
          // 当state的状态为0时，走下面的then方法
          val.then(function(val) {
            res(i, val)
          }, reject)
          return;
        } else {
          // 非promise实例，转化成promise实例
          var then = val.then
          if(typeof then === 'function') {
            var p = new Promise(then.bind(val))
            p.then(function(val) {
              // 转化后再执行res
              res(i, val)
            }, reject)
            return
          }
        }
        // 修改原数组中对应下标的元素
        args[i] = val // ？ 为什么赋值是val,这一步的意义是
        // 原数组中的每一项都执行完毕，触发resolve对应的回调
        if(--remainingLength === 0) {
          resolve(args)
        }
      }
    }

    // 依次执行原数组中的每一项
    for(var i = 0; i < args.lelngth; i += 1) {
      res(i, args[i])
    }
  })
}

// race方法，依次执行内部的所有方法，只要有一个promise成功返回，即调用race自身的返回
Promise.race = function(values) {
  return new Promise(function(resolve, reject) {
    values.forEach(function(value) {
      // 当前项resolve了，即执行race自身的resolve
      // 若每一项都rejected, 触发race自身的reject方法
      Promise.resolve(value).then(resolve, reject)
    })
  })
}


// 原型链上的方法
// done方法
Promise.prototype.done = function(onFullfilled, onRejected) {
  // 是否传入回调函数，有则执行done
  var self = arguments.length ? this.then.apply(this, arguments) : this
  // 执行then方法
  self.then(null, function(err) {
    setTimeout(function() {
      throw err
    }, 0)
  })
}

// catch 方法
Promise.prototype.catch = function(onRejected) {
  // catch的本质，就是then(null, callback)
  return this.then(null, onRejected)
}

// finally方法，
// 执行onFullfilled或者onRejected中的一个，触发callback回调
// 返回一个promise
Promise.prototype.finally = function(f) {
  return this.then(function(value) {
    return Promise.resolve(f).then(function() {
      return value
    }, function(err) {
      return Promise.resolve(f).then(function() {
        throw err
      })
    })
  })
}
module.exports = Promise