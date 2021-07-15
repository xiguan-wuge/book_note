// js继承-借助构造函数继承


// 为解决原型链继承的问题，开发人员开始使用“借助构造函数”的技术
// 基本思想：在子类的构造函数内部调用超类型构造函数，因此可以通过apply() 和 call()方法在（将来）新创建的对象上执行构造函数

// 代码实现：

function SuperType(name) {
  this.name = name
}
function SubType(name) {
  SuperType.call(this, name)
  this.age = 18
}

var instance = new SubType('zhangsan')
console.log(instance.name); // zhangsan
console.log(instance.age); // 18

// 借助构造函数继承的问题：
// 1. 函数无法复用。（方法都定义在构造函数中，初始化后成了实例的单独方法）
// 2. 在超类中定义的方法，在子类型中是不可见的

// 综上： 借助构造函数的技术很少 单独 使用

