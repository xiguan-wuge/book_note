### 9 中常见的设计模式
1. 外观模式（facade Patton)  
外观模式是最常见的设计模式之一 ，它为子系统中的一组接口提供给一个统一的高层接口，是子系统更容易使用，简而言之，**外观设计模式就是把多个子系统中复杂逻辑进行抽象，从而提供一个更统一、更简洁、更易用的API**。很多我们常见的框架和库基本都遵循类外观设计模式，比如JQuery就是把复杂的原生DOM操作进行了抽象和封装，并消除了浏览器之间的兼容问题，从而提供了一个更高级更易用的版本。
日常使用中的例子：
-  兼容浏览器事件绑定
```
let addMyEvent = function(el, ev, fn) {
  if(el.addEventListener) {
    el.addEventListener(ev, fn, false)
  } else if(el.attachEvent) {
    el.attachEvent('on' + ev, fn)
  } else {
    el['on' + ev] = fn
  }
}
```
- 封装接口
```
let myEvent = {
  //...
  stop: e => {
    e.preventDefault()
    e.sttopPropagation()
  }
}
```
#### 使用场景  
- 设计初期，应该要有意识的将不同的两个层分离，比如经典的三层结构，在数据访问层和业务

#### 优点
- 减少系统的相互依赖
- 提高灵活性
- 提高了安全性

#### 缺点
- 不符合开闭原则，如果要修改东西很麻烦，继承重写都不合适

2. 代理模式（Proxy Patton）
#### 场景
- HTML元素事件代理
```
<ul id='ul'>
  <li>1</li>
  <li>2</li>
  <li>3</li>
</ul>
<script>
  let ul = document.querySelector('#ul')
  ul.addEventListener('click', event => {
    console.log('target', event.target)
  })
</script>
```
- ES6的proxy [阮一峰proxy](https://es6.ruanyifeng.com/#docs/proxy)
- jQuery.proxy() 方法

#### 优点
- 代理模式能将代理对象与被调用对象分离，降低了系统的耦合度。代理模式在客户端和目标对象之间起到一个中介作用，这样可以起到保护目标的作用。
- 代理对象可以扩展目标对象的功能，通过修改代理对象就可以，符合开闭原则
#### 缺点
- 处理请求速度可能有差别，非直接访问，存在开销

3. 工厂模式（Factory Pattern）  
工厂模式定义一个用于创建对象的接口，这个接口由子类决定实例化哪一个类。该模式使一个类的实例话延迟到子类。而子类可以重写接口方法以便创建的时候指定自己的对象类型

```
class Product {
  constructor(name) {
    this.name = name
  }
  init() {
    console.log('init')
  }
  fun() {
    console.log('fun')
  }
}
class Factory() {
  create(name) {
    return new Product(name)
  }
}

// use
let factory = new Factory()
let p = factory.create('p1')
p.init()
p.fun()
```

#### 场景
- 如果你不想让某个子系统与较大的那个对象之间形成强耦合，而是想运行时从多个子系统中进行挑选的话，那个工厂模式是一个理想的选择
- 将new操作简单封装，遇到new的时候就应该考虑是否使用工厂模式
- 需要依赖具体环境创建不同实例，这些实例都有相同的行为，这个时候我们就可以使用工厂模式，简化实现的过程。同时也可以减少每种对象所需要的代码量，有利于消除对象间的耦合，提供更大的灵活性

#### 优点
- 创建对象的过程可鞥很复杂，但我们只需要关心创建的结果
- 构造函数和创建者分离，符合“开闭原则”
- 一个调用者想要创建一个对象，只要知道其名称就可以
- 扩展性高，如果想增加一个产品，只要扩展一个工厂类就可以

#### 缺点
- 添加新产品时，需要编写新的具体的产品类，一定程度上增加了系统的复杂度
- 考虑到系统的扩展性，需要引入抽象层，在客户端代码中均使用抽象层进行定义，增加了系统抽象性和理解难度
