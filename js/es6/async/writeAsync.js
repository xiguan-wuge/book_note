/**
 * 结合generator和promise 实现async 
 */

// 例子：
const getData = (val) => new Promise((resolve)=> {
  setTimeout(() => {
    resolve(val)
  }, 1000);
})

async function test() {
  const data = await getData('data1')
  console.log('data', data)
  const data2 = await getData(data)
  console.log('data2',data2)
  return 'success'
}



// test().then(res => console.log('res',res))
// 采用generator 实现

function* testInG() {
  const data = yield getData('genTest')
  console.log('data', data)
  const data2 = yield getData(data)
  console.log('data2', data2)
  return 'success'
}
// return;
// 同步输出，data值为undefined
// const gen = testInG()
// const dataPromsie =  gen.next()
// console.log('dataPromise',dataPromsie) 
// const dataP2 = gen.next()
// console.log('dataP2', dataP2)
// const dataP3 = gen.next()
// console.log('dataP3', dataP3)

// 实现异步输出
// const gen = testInG()
// const dataPromise = gen.next() // {value: promise, done:false}
// console.log('dataPromise', dataPromise)
// dataPromise.value.then(value1 => {
//   const dataP2 = gen.next(value1)
//   dataP2.value.then(value2 => {
//     gen.next(value2)
//   })
// })

// 模拟实现
// const testG = asyncToGenerator(testInG)
function asyncToGen(genFn) {
  // 返回一个新函数
  return function() {
    // 调用gen 生成迭代器
    const gen = genFn.apply(this, [...arguments])
    // async 返回一个promise
    return new Promise((resolve, reject) => {
      // step 模拟自执行器
      function step(key, arg) {
        let genResult
        // 对可能出错的处理
        try {
          genResult = gen[key](arg)
        } catch (e) {
          return reject(e)
        }
        const { value, done } = genResult
        // console.log('--value', value)
        // console.log('--done', done)

        if(done) {
          // 异步操作已经完成
          return resolve(value)
        } else {
          // 未执行完，继续执行gen.next()
          // 递归
          return Promise.resolve(value).then(res => {
            step('next', res)
          }, err => {
            step('throw', err)
          })
        }
      }
      step('next')
    })
  }
}
// 测试
const asyncFn = asyncToGen(testInG)
asyncFn().then(res => {
  console.log('res',res)
})

