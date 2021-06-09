// class 继承

// class 是构造函数的语法糖，
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }
}

// toString() 是定义在prototype 上的方法
// 实际上，类的所有方法都是定义在类的prototype属性上的
// 类内部定义的所有方法都是不可枚举的，和构造函数不一样的地方

// 取值函数（getter）和 存值函数（setter）
// 与es5一样，在“类”的内部使用get、set关键字，对某个属性设置存值函数和取值函数，拦截该属性的存取行为
class MyClass {
  constructor() {
    // ...
  }
  get prop() {
    return 'getter';
  }
  set prop(value) {
    console.log('setter: '+value);
  }
}

let inst = new MyClass();

inst.prop = 123;
// setter: 123

inst.prop
// 'getter'
// 类的注意点
// 1.类和模块的内部，默认就是严格模式
// 2.不存在变量提升
new Foo(); // ReferenceError
class Foo {}
// 3.name属性
// 4.generator 方法
// 5.this的指向，类的方法内部如果含有this,它默认指向类的实例，
// 可以在构造函数中绑定this,或者使用箭头函数，又或者是使用proxy，获取方法的时候自动绑定this
// （1）构造函数中绑定this
class Logger {
  constructor() {
    this.printName = this.printName.bind(this);
  }
  // ...
}
// ----- （2）箭头函数
class Obj {
  constructor() {
    this.getThis = () => this;
  }
}

const myObj = new Obj();
myObj.getThis() === myObj // true

// （3）proxy
function selfish (target) {
  const cache = new WeakMap();
  const handler = {
    get (target, key) {
      const value = Reflect.get(target, key);
      if (typeof value !== 'function') {
        return value;
      }
      if (!cache.has(value)) {
        cache.set(value, value.bind(target));
      }
      return cache.get(value);
    }
  };
  const proxy = new Proxy(target, handler);
  return proxy;
}

const logger = selfish(new Logger());

// 类的静态方法。在方法前添加static关键字，表示该方法是类的方法，可以通过类调用，该方法不会被实例所继承
class Foo {
  static classMethod() {
    return 'hello';
  }
}

Foo.classMethod() // 'hello'

var foo = new Foo();
foo.classMethod()
// TypeError: foo.classMethod is not a function

// 静态属性，类的属性，不会被实例所继承
class Foo {
}

Foo.prop = 1;
Foo.prop // 1



