// js继承

// 组合继承
function Parent(value) {
  this.value = value
}
Parent.prototype.getValue = function() {
  console.log('value',this.value)
  return this.value
}
function Child(value) {
  Parent.call(this,value)
} 
Child.prototype = new Parent()
const child = new Child('zhangsan')
child.getValue()
console.log('flag', child instanceof Parent)

// 核心： 在子类的构造函数中通过 Parent.call(this) 继承父类的属性，然后改变子类的原型为 new Paren() 来继承父类的方法
// 优点： 构造函数可以传参，不会与父类引用属性共享，可以复用父类的函数
// 缺点： 继承父类函数的时候调用来父类构造函数，导致子类的原型上多了不需要的父类属性，造成内存上的浪费

// 寄生组合式继承
function Parent(value) {
  this.value = value
} 
Parent.prototype.getValue = function() {
  console.log('value',this.value)
  return this.value
}
function Child(value) {
  Parent.call(this,value)
}
// 在组合继承上做优化，不调用父类的构造函数
Child.prototype = Object.assign(Parent.prototype, {
  constructor: {
    value: Child,
    enumerable:  false,
    writable: true,
    configurable: true
  }
})
const child = new Child('lisi')
console.log('child',child)
child.getValue()
console.log('flag',child instanceof Parent)

// 核心： 将父类的原型赋值给子类，并将构造函数设置为子类
// 优点： 既解决来无用的父类属性问题，又能正确的找到子类的构造函数

// class 继承

class Parent {
  constructor(value) {
    this.value = value
  }
  getValue() {
    console.log('value',this.value)
    return this.value
  }
}

class Child extends Parent {
  constructor(value) {
    super(value)
  }
}

let child = new Child('wanger')
child.getValue()
console.log('flag',child instanceof Parent)

console.log('prpto',{}.__prpto__)