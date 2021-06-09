const { spawn } = require("child_process")

// async 实现睡眠的效果(间隔多少时间执行一个操作)
function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(resolve, interval)
  })
}

// 用法
async function one2FiveInAsync() {
  for(let i = 1; i <= 5; i += 1) {
    console.log(i)
    await sleep(2000)
  }
}
one2FiveInAsync()


// async 函数的实现原理
// 就是将Generator函数和自动执行器,包装在一个函数里
async function fn(args) {
  // ...
}
// 等同于
function fn(args) {
  return spawn(function* (){
    // ...
  })
}

// spawn函数的实现，自动执行器
function spawn(genF) {
  return new Promise(function(resolve, reject) {
    const gen = genF();
    // 递归函数
    function step(nextF) {
      let next;
      try {
        next = nextF()
      } catch(e) {
        return reject(e)
      }
      // 递归退出条件
      if(next.done) {
        return resolve(next.value)
      }
      Promise.resolve(next.value).then(function(v) {
        step(function() {
          return gen.next(v)
        })
      }, function(err) {
        step(function() {
          return gen.throw(err)
        })
      })
    }
    // 执行
    step(function() {
      return gen.next(undefined)
    })

  })
}