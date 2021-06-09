// 利用 Generator 函数和for...of循环，实现斐波那契数列的例子。
function* fibonacci() {
  let [prev, curr] = [0, 1]
  for(;;) {
    yield curr
    [prev, curr] = [curr, prev + curr]
  }
}
for(let n of fibonacci()) {
  if(n > 10) break
  console.log(n)
}