// js继承-原型式继承

// 思想：不借助构造函数，借助现有的一个对象，对其做浅拷贝，得到一个新的对象（instance）,再对instance做想要的修改
// 问题： 和原型链继承一样，引用类型的属性值称为共享属性，一处修改，会影响其他obj属性值
// （js引用类型特性，参数是内存中的地址，指向同一块内存）

var person = {
  name: 'zhangsan',
  frends: ['lisi', 'wanger']
}
// 自己创建一个函数
function object (o) {
  function F(){}
  F.prototype = o
  return new F()
}

var anotherPerson = object(person)
console.log('anotherPerson',anotherPerson); // {}
console.log('anotherPerson.prototype', anotherPerson.prototype);// undefind,
// 实例无prototype属性，实例通过__proto__属性指向其原型

anotherPerson.name = 'dashan'
anotherPerson.frends.push('xiaoming') // 修改了__proto__中的friends

var yetAnotherPerson = object(person)
yetAnotherPerson.name = 'xiaohong'
yetAnotherPerson.frends.push('xiaolan')

console.log('anotherPerson', anotherPerson); //{ name: 'dashan' }
console.log('yetAnotherPerson', yetAnotherPerson); { name: 'xiaohong' }
console.log('person', person);
// {
//  name: 'zhangsan',
//  frends: [ 'lisi', 'wanger', 'xiaoming', 'xiaolan' ]
// }

// var person1 = Object.create(person)
// // person1.name = 'dashan'
// // person1.frends.push('xiaoming')
// console.log(person); //  name: 'zhangsan', frends: [ 'lisi', 'wanger' ] }
// console.log(person1); // {} ????????? 当前实例对象是自有属性是空，但是他有_prototype 属性，指向其原型对象



// js继承-寄生式继承（parasitic）
// 思路： 创建一个仅用于封装继承过程的函数，该函数在内部以某种方式来增强对象，最后返回对象
function createAnother(original) {
  var clone = object(original)
  clone.sayHi = function() {
    console.log('hi');
  }
  return clone;
}

var animal = {
  name: 'cat',
  frends: ['pig', 'dog']
}
var anotherAnimal = createAnother(animal)
console.log('anotherAnimal', anotherAnimal); // { sayHi: [Function] }
anotherAnimal.sayHi() // hi

// 寄生式继承的作用于： 考虑对象而不是自定义类型和构造函数的情况下
// 问题： 不能做到函数复用，与借助构造函数模式类似
// sayHi函数无法复用