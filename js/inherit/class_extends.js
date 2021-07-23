// 使用es5 模拟es6 extends的实现
// 采用寄生组合式继承实现
function Parent(name) {
  this.name = name
}
Parent.sayHello = function() {
  console.log('hello')
}
Parent.prototype.getName = function() {
  console.log('getName', this.name)
  return this.name
}
function Child(name, age) {
  Parent.call(this, name) // 相当于supper
  this.age = age
}

// 原型式继承
function object(o) {
  function F(){}
  F.prototype = o
  return new F()
} 

// 寄生式
function inherit(Child, Parent) {
  // 原型对象的继承
  var prototype = object(Parent.prototype)
  Child.prototype = prototype
  Child.prototype.constrctor = Child
  // 构造函数的继承
  Child.__proto__ = Parent
}

// 子类继承父类
inherit(Child, Parent)

// 添加子类的原型方法
Child.prototype.sayAge = function() {
  console.log('sayAge', this.age)
  return this.age
}

var child = new Child('zhangsan', 18)
console.log('child', child)
console.log('Child', Child)
var parent = new Parent('lisi', 40)
console.log('parent', parent)
child.sayAge()
child.getName()
parent.getName()

console.log('Child instanceof Parent', Child instanceof Parent)
// console.log('Child instanceof Parent', Child instanceof Parent)

