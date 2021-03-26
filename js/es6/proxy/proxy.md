## proxy（代理） 笔记
### proxy用于修改某些默认的操作行为，等同于在语言层面做修改
### proxy可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问都必须经过该拦截。因此提供了一种机制，可以对外界的访问进行过滤和改写。
```
var obj = new Proxy ({},{
  get: function(target, propKey, recevier) {
    console.log(`getter ${propKey}`)
    return Reflect.get(target, propKey, recevier)
  },
  set: function(target, propKey, value, recevier) {
    console.log(`setter ${propKey} = ${value}`)
    return Reflect.set(target, propKey, value, recevier)
  }
})

obj.count = 1
++ obj.count

// setter count = 1
// getter count
// setter count = 2
```

### ES6 原生提供 Proxy 构造函数，用来生成 Proxy 实例。

```
var proxy = new Proxy(target, handler)
```
- target: 所要拦截的目标对象
- handler: 一个对象，用于定制拦截行为