// js继承-组合继承（伪经典继承）

// 将原型链继承和借助构造函数继承这两种技术组合，发挥二者的长处
// 思路： 使用原型链实现对原型属性和方法的继承，通过构造函数来实现对实例属性的继承
// 优点： 既通过在原型上定义方法，实现了函数复用；
// 又通过构造函数，保证每个实例都有自己的属性

function SuperType(name) {
  this.name = name
  this.colors = ['red', 'green', 'blue']
}
SuperType.prototype.sayName = function() {
  console.log(this.name)
}

function SubType(name, age) {
  SuperType.call(this, name) // 第二次调用
  this.age = age
}

SubType.prototype = new SuperType()
// 将原型中的构造函数指向回原本的子类构造函数，和原型链继承的区别
SubType.prototype.constructor = SubType 
SubType.prototype.sayAge = function() {
  console.log(this.age)
}

var instance1 = new SubType('zhangsan', 18)  // 第一次调用 SuperType()
instance1.colors.push('black')
console.log(instance1.colors); //[ 'red', 'green', 'blue', 'black' ]
instance1.sayName() //zhangsan
instance1.sayAge() // 18

var instance2 = new SubType('lisi', 20) // 第一次调用 SuperType()
console.log(instance2.colors) // [ 'red', 'green', 'blue' ]
instance2.sayName() // lisi
instance2.sayAge() // 20

// js中最常用的继承模式
// instanceof 和 isPropertyOf 也能识别

// 组合继承的问题：
// 1.无论在什么情况下，都会调用两次超类型的构造函数：
// 第一次在创建子类型原型时
// 第二次是在子类型内部构造函数中
// 2.在SubType.prototype上创建不必要、多余的属性
