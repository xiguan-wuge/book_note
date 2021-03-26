// 手动实现array的原生方法

// Array.prototype.map
// map方法创建一个新数组，其结果是该数组中的每一个元素都调用一个提供的函数后返回的结果

function _map(arr, mapCallback) {
  // 检查参数
  if(!Array.isArray(arr) || !arr.length || typeof(mapCallback) !== 'function') {
    return []
  } else {
    let result = []
    for(let i = 0, len = arr.length; i < len; i += 1) {
      result.push(mapCallback(arr[i], i, arr))
    }
    return result
  }
}

// Array.prototype.filter
// 创建一个新数组，其包含通过所有提供函数测试的所有元素
function _fillter(arr, fillterCallback) {
  // 检查参数
  if(!Array.isArray(arr) || !arr.length || typeof(fillterCallback) !== 'function') {
    return []
  } else {
    let result = []
    for(let i = 0, len = arr.length; i < len; i += 1) {
      if(fillterCallback(arr[i], i, arr)){
        result.push(arr[i])
      }
    }
    return result
  }
}

// Array.prototype.reduce
// 对数组的每一个元素执行一个提供的reducer函数（升序执行），将其结果汇总为单个返回值
function _reduce(arr, reduceCallback, initValue) {
  if(!Array.isArray(arr) || !arr.length || typeof(reduceCallback) !== 'function') {
    return []
  } else {
    // 如果没有将initValue传入，将数组的第一项作为initValue
    let hasInitValue = initValue !== undefined
    let value = hasInitValue ? initValue : arr[0]
    // 如果有传递initValue，索引从0开始，否则从1开始
    for(let i = hasInitValue ? 0 : 1, len = arr.length; i < len; i += 1) {
      value = reduceCallback(value, arr[i], i, arr)
    }
    return value
  }
}