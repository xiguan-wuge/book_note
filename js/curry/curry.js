// 函数柯里化
// 含义： 柯里化是一种将使用多个参数的一个函数转换成一系列使用一个参数的函数的技术。

// 第一版
var curry = function(fn) {
  var args = [].slice.call(arguments, 1)
  console.log('args',args);
  return function() {
    var innerArgs = [].slice.call(arguments)
    console.log('innerArgs', innerArgs);
    var newArgs = args.concat(innerArgs)
    console.log('newArgs',newArgs);
    return fn.apply(this, newArgs)
  }
} 

function add (a, b) {
  return a + b
}
// var addCurry = curry(add, 1, 2)
// console.log('addCurry',addCurry());

// var addCurry = curry(add, 1)
// console.log('addCurry', addCurry(11));

// var addCurry = curry(add)
// console.log('addCurry', addCurry(5, 6));


