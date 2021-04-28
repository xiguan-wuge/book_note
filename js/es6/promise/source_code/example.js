
// promise 会吃掉错误，promise内部的错误不会影响到promise外部的代码
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2);
  });
};

someAsyncThing().then(function() {
  console.log('everything is great');
});

setTimeout(() => { console.log(123) }, 2000);
// Uncaught (in promise) ReferenceError: x is not defined
// 123
process.on('unhandledRejection', function(err, p) {
  console.log('err', err)
  console.log('p', p) // 可以看到在代码哪一行报错，但无法确定是哪一个promise报错
})
