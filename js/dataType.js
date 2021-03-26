// 数据类型
// function test(person) {
//   person.age = 26
//   person = {
//     name: 'zhangsan',
//     age: 18
//   }
//   return person
// }
// const p1 = {
//   name: 'lisi',
//   age: 20
// }
// const p2 = test(p1)
// console.log('p1',p1) // {name: 'lisi',age: 26}
// console.log('p2',p2) // {name: 'zhangsan',age: 18}

let a = {}
let fn = function () { console.log(this) }
fn.bind().bind(a)() // => ?