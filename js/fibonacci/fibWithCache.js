// 在使用斐波那契计算时，会有很多重复的计算，增加运算时间，
// 倘若添加缓存，则可以大大减少运算时间

// 测试性能
function testFunctionTime(fn, label) {
  console.time(label);
  if (fn) fn();
  console.timeEnd(label);
}
// 封装缓存机制
function useCache(fn) {
  var cache = {};
  return function(){
      var key = arguments.length + Array.prototype.join.call(arguments, ",");
      if (key in cache) return cache[key];
      else return cache[key] = fn.apply(this, arguments);
  }
}
// 斐波那契数列
function fn1() {
  var count = 0;
  var fib = function(n) {
      count++;
      if(n === 0 || n === 1) return 1;
      return fib(n - 1) + fib(n - 2);
  };
  console.log(fib(40), count,'count1');
}
function fn2() {
  var count = 0;
  var fib = useCache(function(n) {
      count++;
      if(n === 0 || n === 1) return 1;
      return fib(n - 1) + fib(n - 2);
  });
  console.log(fib(40), count,'count2');
}

testFunctionTime(fn1, '无缓存');
testFunctionTime(fn2, '有缓存');

// 165580141 331160281 count1
// 无缓存: 1873.409ms
// 165580141 41 count2
// 有缓存: 0.352ms