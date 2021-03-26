// 深浅拷贝
// 浅拷贝：
//   1. 扩展运算符（...）；
//   2. Object.assign(), 是将一个对象的属性拷贝下来，原始属性拷贝的是值，对象属性，则拷贝的是地址
//   3. JSON.parse(JSON.stringify(targetObj)),遇到值为undefined，symbol，function时，无法序列化

// 深拷贝
// 实现深拷贝是很苦难的，需要考虑很多边界值的情况，这里实现一个简易版的，推荐使用lodash的深拷贝函数

function deepClone(obj) {
  function isObject(o) {
    return (typeof o === 'object' || typeof o === 'function') && o !== null
  }
  if(!isObject(obj)) {
    return new Error('not object')
  }
  let isArray = Array.isArray(obj)
  let newObj = isArray ? [...obj] : {...obj}
  Reflect.ownKeys(newObj).forEach((key) => {
    newObj[key] = isObject(obj[key]) ? deepClone(obj[key]) : obj[key]
  })
  return newObj
}

let sourceObj = {
  name: 'zhangsanfeng',
  age: 99,
  apprentice: ['songyuanqiao','zhangcuisan','yudaiyan'],
  isMarried: false,
  sectMsg: {
    name: 'wudang',
    localtion: 'China',
  }
}
let targteObj = deepClone(sourceObj)
console.log('targetObj',targteObj)

let JSONParseObj = JSON.parse(JSON.stringify(targteObj))
console.log('JSONParseObj',JSONParseObj)