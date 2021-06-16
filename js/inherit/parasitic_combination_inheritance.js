// 寄生组合式继承

function object(o) {
    function F(){}
    F.prototype = 0
    return new F()
}
// 寄生组合式继承最简单形式
function parasticCombinationInherit(subType, superType) {
    var prototype = object(superType.prototype) // 创建子类原型对象
    prototype.constructor = subType // 增强对象（指定子类原型的构造函数）
    subType.prototype = prototype // 指定子类构造函数的原型对象
}

// 例子
function SuperType(name) {
    this.name = name
    this.colors = ['red', 'blue', 'green']
}
SuperType.prototype.sayName = function() {
    console.log('sayName', this.name)
}

function SubType(name, age) {
    SuperType.call(this,name)
    this.age = age
}

parasticCombinationInherit(SubType, SuperType)

SubType.prototype.sayAge = function() {
    console.log('sayAge', this.age)
}

var tempColor = new SubType('xiaohua', 20)
console.log('tempColor', tempColor);
// tempColor.sayName() // 浏览器上可执行
tempColor.sayAge()
console.log('tempColor.__proto__', tempColor.__proto__)
tempColor.__proto__.sayColor = false

var tempAnotherColor = new SubType('xiaohong', 22)
console.log('tempAnotherColor',tempAnotherColor);
// tempAnotherColor.sayName()
tempAnotherColor.sayAge()
console.log('tempAnotherColor.__proto__', tempAnotherColor.__proto__)


// 总结：
// 寄生组合式继承的含义： 借助构造函数来继承属性（实例属性），通过原型链的混成形式来继承方法
// 基本思路：不必为了指定子类的原型而调用超类的构造函数，因为我们所需要的就是超类原型的副本。
// 本质：使用寄生式继承来继承超类的原型，将结果（超类型的原型副本）指定给子类的原型

// 实现步骤：（如上述代码中的parasticCombinationInherit函数）
// 1. 创建超类型原型的一个副本
// 2. 为副本添加constructor属性，以弥补重写原型而失去默认的constructor属性
// 3. 将副本对象赋值给子类的原型

// 优点：
// 1.高效率性（相比于组合继承而言），只调用了一次构造函数，避免了在SubType.prototype上创建不必要、多余的属性
// 2.原型链保持不变
// 3.普遍认为最理想的继承范式