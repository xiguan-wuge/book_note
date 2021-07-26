// 函数柯里化
// 含义： 柯里化是一种将使用多个参数的一个函数转换成一系列使用一个参数的函数的技术。

// 第一版
// var curry = function(fn) {
//   var args = [].slice.call(arguments, 1)
//   console.log('args',args);
//   return function() {
//     var innerArgs = [].slice.call(arguments)
//     console.log('innerArgs', innerArgs);
//     var newArgs = args.concat(innerArgs)
//     console.log('newArgs',newArgs);
//     return fn.apply(this, newArgs)
//   }
// } 

// function add (a, b) {
//   return a + b
// }
// var addCurry = curry(add, 1, 2)
// console.log('addCurry',addCurry());

// var addCurry = curry(add, 1)
// console.log('addCurry', addCurry(11));

// var addCurry = curry(add)
// console.log('addCurry', addCurry(5, 6));

// 终版
function subCurry(fn) {
  const args = [...arguments].slice(1)
  // 关键点，返回一个匿名函数
  return function() {
    const innerArgs = [...args, [...arguments]]
    return fn.apply(this, innerArgs)
  }
}
function curry(fn, length) {
  length = length || fn.length
  return function() {
    // 该函数是curry返回的函数，判断该匿名函数的参数，用于参数数量是否满足要求
    if(arguments.length < length) {
      const combined = [fn, ...arguments]
      // 封装成新的fn参数，继续递归执行curry
      return curry(subCurry.apply(this, combined), length - arguments.length)
    } else {
      return fn.apply(this, [...arguments])
    }
  }
}

function add(a, b, c) {
  return a + b + c
}
const addCurry = curry(add)
console.log('addCurry', addCurry(1,2,3,4)) // 6

