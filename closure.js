// function f1 () {
//   var n = 999;
//   function f2() {
//     console.log(n)
//   }
//   return f2
// }
// console.log('n', n) // 即使n变量没用var 声明 其作用域是f1函数作用域内，不是全局
// var result = f1()
// result() // 999


// function f3(){
//   console.log('f3')
// }
// f3() // f3

// 闭包（closure）概念：
//   - 能够读取其他函数内部变量的函数，
//   - 因为js中，只有函数（成为函数A）内部的子函数才能A函数的局部变量，因此可以简单得将闭包理解为“定义在一个函数内部的函数”
//   - 本质上： 闭包就是将函数内部和函数外部连接起来的一座桥梁

// 闭包的用途： 
//   - 读取函数内部的变量
//   - 让这些变量的值始终保存在内存中
//   - 封装私有属性

// function f4() {
//   let n = 999;
//   // 不用var 声明变量，默认为全局变量
//   // 函数的作用域是由其诞生的环境决定，所以函数add的作用域是f4
//   nAdd= function add() { 
//     n += 1
//   }
//   function f5() {
//     console.log(n)
//   }
//   return f5
// }
// var result = f4()
// result()
// nAdd()
// result()
// nAdd()
// result()
// console.log(nAdd)
// console.log('n',n)

// 闭包的优点：
//   - 全局变量可能会造成命名冲突，闭包没有这个问题，闭包是私有化，加强了封装性，这样可以保护变量的安全
// 闭包的缺点： 
//   - 由于闭包会常驻内存，会增大内存的使用量，使用不当会容易造成内存泄漏，降低程序的性能，但这并不是闭包本身的错误决定的，
//     而是由于我们自身使用不当。

// 闭包使用优点的例子：
// - 计数器：
// function createIncrementor(start) {
//   return function(){
//     return start ++
//   }
// }
// var inc = createIncrementor(0)
// console.log(inc()) // 0
// console.log(inc()) // 1
// console.log(inc()) // 2
// 原因： inc始终在内存中，而Inc的存在依赖于createIncrementor, 因此也始终在内存中，不会在调用结束后，被垃圾回收机制回收

// - 封装对象的私有属性和方法
// function Person(name) {
//   var _age;
//   function setAge(n) {
//     _age = n
//   }
//   function getAge() {
//     return _age
//   }
//   return {
//     name: name,
//     setAge: setAge,
//     getAge: getAge
//   }
// }
// var p1 = Person('jack')
// p1.setAge(18)
// p1.getAge()
// console.log('p1.age',p1.getAge()) // 18

// var p2 = Person('rose')
// p2.setAge(17)
// console.log('p2.age', p2.getAge()) // 17

// console.log('p1',p1)
// console.log('p2', p2)

// 闭包的经典例子：
// - 下列代码想要延时输出0、1、2、3、4，结果输出5、5、5、5、5、，原因？如何修改以得到期望结果
// for (var i = 0; i < 5; i++) {
//   setTimeout(function () {
//     console.log(i)
//   }, 500)
// }
// 原因： js执行顺序，将setTimeout添加到宏任务队列等到本轮循环结束（for循环结束了，i =5）,时再一次调用setTimeout，所以输出5个5

// 修改： 将setTimeout放入立即执行函数中，将i值作为参数传递给包裹函数，创建新闭包
// for (var i = 0; i < 5; i++) {
//   (function (i) {
//     setTimeout(function () {
//       console.log(i)
//     }, 500)
//   })(i)
// }
// 结果： 0、1、2、3、4
// 立即执行函数：定义函数后立即调用该函数。
// JavaScript 引擎规定，如果function关键字出现在行首，一律解释成语句。
// 因此，JavaScript 引擎看到行首是function关键字之后，认为这一段都是函数的定义，不应该以圆括号结尾，所以就报错了
// 解决方法就是不要让function出现在行首，让引擎将其理解成一个表达式。
// 最简单的处理，就是将其放在一个圆括号里面。
// (function(){ /* code */ }());
// // 或者
// (function(){ /* code */ })();
// 上面两种写法最后的分号都是必须的。如果省略分号，遇到连着两个 IIFE，可能就会报错。
// 通常情况下，只对匿名函数使用这种“立即执行的函数表达式”。它的目的有两个：
// 一是不必为函数命名，避免了污染全局变量；
// 二是 IIFE 内部形成了一个单独的作用域，可以封装一些外部无法读取的私有变量。
// 写法一
// var tmp = newData;
// processData(tmp);
// storeData(tmp);

// // 写法二
// (function () {
//   var tmp = newData;
//   processData(tmp);
//   storeData(tmp);
// }());

