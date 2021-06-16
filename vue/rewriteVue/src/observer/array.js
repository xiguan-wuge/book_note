
// 先保留数组原型对象
const arrayProto = Array.prototype
// 然后将arrayMehods 继承自数组原型，
// 这是面向切片编程思想(AOP) --- 在不破坏封装的情况下，动态的扩展功能
export const arrayMethods = Object.create(arrayProto)

let methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'reverse',
  'sort'
]

methodsToPatch.forEach(method => {
  // 往arrayMethods中添加相应的数组方法，当数组新增，删除，触发数据响应
  arrayMethods[method] = function(...args) {
    // 保留原型方法的执行结果 
    const result = arrayProto[method].apply(this,args)
    // this代表数据本身
    // __ob__,代表已经是被响应式劫持的数据
    const ob = this.__ob__ 
    
    // inserted 表示数组有新增操作
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2) // arr.splice(fromIndex, endIndex, insertedItem...), args中下标为2 开始的项就是新插入的项
        break;
      default:
        break;
    }

    // inserted被修改后，就是一个数组，若是数组，就调用调用Observer实例的方法，对新增的数据进行观测
    if(inserted) {
      ob.obserArray(inserted)
    }
    return result
  }
}) 