// 测试 promise then方法中存在一个reject状态，那么他的后一个then 的状态是？
new Promise((resolve, reject) => {
  console.log('begin promise')
  // resolve(1)
  reject(2)
}).then(value => {
  console.log('then1', value)
  if(value !== 1) {
    // resolve('ok')
    return 'ok'
  } else {
    // rejec
    return error
  }
}).then(val => {
  console.log('then2',val)
}).catch(err => {
  console.log('catch', err)
})