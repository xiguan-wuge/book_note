// call、apply、bind的内部实现
function myCall(context) {
  if(typeof this !== 'function') {
    throw new TypeError('not a function')
  }
  context = content || window
  let mySymbol = Symbol() // 临时使用的唯一属性
  context[mySymbol] = this
  const args = [...arguments].slice(1)
   // 修改this指向，通过context.fn()这种方式执行函数，this就是context
  const result = context[mySymbol](...args)
  delete context[mySymbol]
  return result
}

function myBind(context) {
  if(typeof this !== 'function') { 
    throw new TypeError('not a function')
  }
  context = content || window
  let mySymbol = Symbol() // 临时使用的唯一属性
  context[mySymbol] = this
  const args = [...arguments].slice(1)
  return function Fn() {
    return context[mySymbol].apply(
      this instanceof Fn ? this : context,
      args.concat(...arguments)
    )
  }
}


// new 的原理是什么，通过new的方式创建对象和通过字面量创建对象有什么区别
// new 做了什么(new的过程)
// 1. 新生成一个对象
// 2. 链接到原型
// 3. 绑定this
// 4. 返回新对象

function myNew() {
  let obj = {}
  let Con = [].shift.call(arguments) // 类数组转化为数组
  obj.__proto__ = Con.prototype
  let result = Con.apply(obj, arguments) // 绑定this
  // 判断构造函数的返回值，若是返回一个对象，则结果是该对象，否则返回空对象
  return result instanceof Object ? result : obj
}