// js继承- 原型链继承

// 原型、构造函数、实例之间的关系：
  // 每一个原型对象中包含一个指向构造函数的指针，
  // 每一个构造函数都有一个原型对象，
  // 实例都包含一个指向原型对象的内部指针

// 原型链继承的基本思想：利用原型，让一个引用类型继承另一个引用类型的属性和方法
// 代码实现：
function SuperType() {
  this.superProperty = true
}
SuperType.prototype.getSuperProperty = function() {
  return this.superProperty
}

function SubType() {
  this.subProperty = false
}
SubType.prototype = new SuperType() // 子类原型为超类的实例

var instance = new SubType()
console.log(instance.getSuperProperty()) // true
console.log(instance.superProperty) // true
console.log(instance.subProperty) // false

// 解析：SubType的原型，是SuperType的实例，所以SubType.prototype中包含SuperType的属性和方法
// instance.__proto__.constructor（实例原型的构造函数）现在指的是SuperType,
// 因为SubType的prototype指向另一个对象（SuperType.prototype）,而SuperType的constructor属性指向SuperType

// 如何确定实例和原型的关系： instanceof 和isPropertyOf
console.log(instance instanceof Object); // true
console.log(instance instanceof SuperType); // true
console.log(instance instanceof SubType); // true

console.log(Object.prototype.isPrototypeOf(instance)); // true
console.log(SuperType.prototype.isPrototypeOf(instance)); // true
console.log(SubType.prototype.isPrototypeOf(instance)); // true

// 添加自定义方法： 给原型添加的自定义方法一定要在替换原型的代码之后
// 不用使用对象字面量创建原型方法，因为这样做会重写原型链，
// 使用对象字面量创建的对象是Object的实例，

// 原型链的问题：
// 1. 引用类型的值的原型属性会被所有实例所共享，（在实例内修改一个继承的引用类型的原型属性，会影响到同原型下其他实例对应的原型属性）；
// 2. 自类型的实例不能向超类型的构造函数中传递参数

// 综上：实践中很少单独使用原型链继承





