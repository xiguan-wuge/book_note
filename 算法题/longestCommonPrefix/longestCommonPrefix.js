// 最长公共前缀
// const source = ['flower', 'flow', 'flight']
const source = ['dog', 'racecar', 'car']

var longestCommonPrefix = function(strs) {
  // 计算各字符串的最小长度
  let result = ''
  let minCount = 0
  strs.forEach((str,index) => {
      if(index === 0) {
          minCount = str.length
      } else {
          if(str.length < minCount) {
              minCount = str.length
          }
      }
  })
  if(minCount === 0) {
      return result
  }
  console.log('minCount',minCount);
  
  let currStr = ''
  let same = true
  const lastIndex = strs.length -1
  for(let j = 0; j < minCount && same; j++) {
    for(let i = 0; i < strs.length && same; i++) {
      const item = strs[i]
      if(i === 0) {
        currStr = item[j]
      }
      same = same && item[j] === currStr
      // 收集公共前缀
      if(same && i === lastIndex) {
        result += currStr
      }
    }
  }
  return result
};
var resultStr =  longestCommonPrefix(source)
console.log('resultStr',resultStr);
