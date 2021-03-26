// 参考链接：https://segmentfault.com/a/1190000016278115#comment-area

// console.log(1);

// setTimeout(() => {
//   console.log(2);
//   Promise.resolve().then(() => {
//     console.log(3)
//   });
// });

// new Promise((resolve, reject) => {
//   console.log(4)
//   resolve(5)
// }).then((data) => {
//   console.log(data);
  
//   Promise.resolve().then(() => {
//     console.log(6)
//   }).then(() => {
//     console.log(7)
    
//     setTimeout(() => {
//       console.log(8)
//     }, 0);
//   });
// })

// setTimeout(() => {
//   console.log(9);
// })
// console.log(10);
// 输出结果： 1 4 10 5 6 7 2 3 9 8

// console.log('1');

// setTimeout(function () {
//   console.log('2');
//   process.nextTick(function () {
//     console.log('3');
//   })
//   new Promise(function (resolve) {
//     console.log('4');
//     resolve();
//   }).then(function () {
//     console.log('5')
//   })
// })

// new Promise(function (resolve) {
//   console.log('7');
//   resolve();
// }).then(function () {
//   console.log('8')
// })
// process.nextTick(function () {
//   console.log('6');
// })

// setTimeout(function () {
//   console.log('9');
//   process.nextTick(function () {
//     console.log('10');
//   })
//   new Promise(function (resolve) {
//     console.log('11');
//     resolve();
//   }).then(function () {
//     console.log('12')
//   })
// })

// 输出结果：
// 1
// 7
// 6
// 8
// 2
// 4
// 3
// 5
// 9
// 11
// 10
// 12

// 测试promise嵌套
Promise.resolve().then(() => {
  console.log('mm');
  Promise.resolve().then(() => {
    console.log('xx');
  }).then(() => {
    console.log('yy');
  }).then(() => {
    console.log('zz')
  })
  console.log(22)
}).then(() => {
  console.log('nn');
});

// 输出结果： 
// mm
// 22
// xx
// nn
// yy
// zz