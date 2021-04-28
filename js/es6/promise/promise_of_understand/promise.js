// promise 简单版
const PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED';

class Promise1 {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;

    this.onResolveCallbacks = [];
    this.onRejectedCallbacks = [];

    // 定义一个promise成功（失败）时执行的一系列操作
    // 改变当前promise状态
    // 执行相应的成功（失败）回调
    const resolve = (value) => {
      if (this.status === PENDING) {
        console.log('resolve-');
        
        this.status = FULFILLED;
        this.value = value;
        // 发布
        console.log('resolve-callbacks',this.onResolveCallbacks);
        
        this.onResolveCallbacks.forEach((fn) => fn());
      }
    }

    const reject = (reason) => {
      if (this.status === PENDING) {
        console.log('reject-');
        this.status = REJECTED;
        this.reason = reason;
        // 发布
        console.log('reject-callbacks', this.onRejectedCallbacks);
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    }

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    if (this.status === FULFILLED) {
      console.log('then-resolve');
      
      onFulfilled(this.value);
    }

    if (this.status === REJECTED) {
      console.log('then-reject');
      
      onRejected(this.reason);
    }

    if (this.status === PENDING) {
      console.log('then pending');
      
      // 订阅
      this.onResolveCallbacks.push(() => {
        onFulfilled(this.value);
      });
      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason);
      });
    }
  }
}

// test

var p1 = new Promise1((resolve, reject)=> {
  console.log('begin');
  setTimeout(() => {
    console.log('after timeout');
    resolve(111)
  },1500)
}).then(value => {
  console.log('this is value', value);
}, reason => {
  console.log('this is reason',reason);
})
// 输出结果
// begin
// then pending
// after timeout
// resolve-
// resolve-callbacks [ [Function] ]
// this is value 111
// module.exports = Promise1;