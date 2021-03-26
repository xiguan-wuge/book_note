// 闭包的实例
// 1. 计时器

function waitSomeTime(msg, time) {
  setTimeout(function() {
    console.log('msg', msg)
  }, time)
}

waitSomeTime('hello', 1000)

// 2 计数器
function a(){
  var n = 0;
  function add(){
     n++;
     console.log(n);
  }
  return add;
}
var a1 = a()
// a1() // 1
// a1() // 2
// a1() // 3

// 3for循环输出值
for(var i = 0; i < 4; i++) {
  setTimeout(function(){
    console.log('i', i)
  },10)
}
// 4 4 4 4
var fnArr = []
for(var i = 0; i < 4; i++) {
  fnArr[i] = function() {
    return i
  }
}
console.log('i', i) // 4
console.log('fnArr[2]', fnArr[2]()) // 4
// 解析： fnArr[2]  = function(){return i},这是赋值的过程
// 当走到fnArr[2](), 执行函数时，匿名函数内部没有找到i的值，沿着作用域向上查找，
// 在全局for循环中找到i， 此时i经过for循环自加，i 已经 为4,所以输出4

// 延伸：让i 在每次迭代中都产生一个私有的作用域
// 在这个私有的作用域中保存当前i的值

var fnArr = []
for(var i = 0; i < 4; i++) {
  // 将每次迭代中的i作为实参传递给自执行函数，参数是按值传递
  // 自执行函数用变量去接收输出值
  fnArr[i] = (function(j){
    return function() {
      return j
    }
  })(i)
}


