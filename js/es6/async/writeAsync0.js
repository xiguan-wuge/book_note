const getData = () => new Promise(resolve => setTimeout(() => resolve("data"), 1000))

function* testG() {
  // await被编译成了yield
  const data = yield getData()
  console.log('data: ', data);
  const data2 = yield getData()
  console.log('data2: ', data2);
  return 'success'
}

var gen = testG()

var dataPromise = gen.next()

dataPromise.then((value1) => {
  // data1的value被拿到了 继续调用next并且传递给data
  var data2Promise = gen.next(value1)

  // console.log('data: ', data);
  // 此时就会打印出data

  data2Promise.then((value2) => {
    // data2的value拿到了 继续调用next并且传递value2
    gen.next(value2)

    // console.log('data2: ', data2);
    // 此时就会打印出data2
  })
})