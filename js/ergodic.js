// map 返回新数组
// 注意点：
// 1. map 方法处理数组元素的范围是在callback方法第一次调用前就已经确定了。
// 2. 调用map 方法后追加的元素不会被callback访问到。
// 3. 如果存在的数组元素被修改了，那么传给callback的值是map访问该元素时的值（修改后的值，不是callback第一次调用时的值了）
// 4. 在map调用后且在访问到该元素之前，该元素被删除了，则无法访问到该元素

// let arr = [0, 2, 4, 6, 8,10]
// let newArr = arr.map((value,index,array)=>{
//   console.log(`value=${value},index=${index},array=${array}`)
//   if(index === 1) {
//     array[index + 1] = 3
//   }
//   if(index === 3) {
//     array.splice(4,1)
//     array[6] = 'new'
//   }
// })
// arr[10] = 55 // map 方法后追加的元素
// console.log('arr',arr)
// console.log('newArr',newArr)

// 输出结果如下：
// value=0,index=0,array=0,2,4,6,8,10
// value=2,index=1,array=0,2,4,6,8,10
// value=3,index=2,array=0,2,3,6,8,10
// value=6,index=3,array=0,2,3,6,8,10
// value=10,index=4,array=0,2,3,6,10,,new
// arr [ 0, 2, 3, 6, 10, <1 empty item>, 'new', <3 empty items>, 55 ]
// newArr [
//   undefined,
//   undefined,
//   undefined,
//   undefined,
//   undefined,
//   <1 empty item>
// ]
// filter（过滤）


// reduce 累计操作
// reduce(callback, initValue) ,接收两个参数，回调函数和初始值

// let initArr = [1,2,3,4,5]
// let sum = initArr.reduce((count, current)=>count + current,10)
// console.log('sum',sum)

// reduce 实现map函数
let arr = [1,2,4]
let mpaArr = arr.map(item => item * 2)
let reduceArr = arr.reduce((acc, current)=>{
  acc.push(current * 2)
  return acc
},[])

console.log('mpaArr',mpaArr) // [ 2, 4, 8 ]
console.log('reduceArr',reduceArr) // [ 2, 4, 8 ]
