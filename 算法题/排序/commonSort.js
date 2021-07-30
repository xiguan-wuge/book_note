// 九大常规排序的实现（目前只有部分）
// 冒泡实现数组由小到大排列
// 冒泡排序
// 原理： 从左到右，当前元素依次与后面的元素比较，大于则交换位置
let source = [1, 7, 2, 9, 0]
function bubbleSort(arr = []) {
  const len = arr.length
  if (len === 0) return arr
  for (let i = 0; i < len - 1; i++) {
    for (let j = i + 1; j < len; j++) {
      if (arr[i] > arr[j]) {
        const temp = arr[j]
        arr[j] = arr[i]
        arr[i] = temp
      }
    }
  }
  return arr
}

// console.log(bubbleSort(source))
// 时间复杂度 O(n^2)
// 空间复杂度 O(1)

// 选择排序
// 原理：从未排序的序列中，找到最小的，放在已排序的末尾，重复该操作
// 时间复杂度 O(n^2)
// 空间复杂度O(1)
function selectionSort(arr = []) {
  let len = arr.length, midIndex = 0
  for(let i = 0; i < len - 1; i++) {
    midIndex = i
    for(let j = i + 1; j < len; j++) {
      if(arr[j] < arr[midIndex]) {
        midIndex = j
      }
    }
    if(i !== midIndex) {
      const temp = arr[i]
      arr[i] = arr[midIndex]
      arr[midIndex] = temp
    }
  }
  return arr
}
// console.log('selectionSort', selectionSort(source))

// 归并排序
// 原理：分治策略，将数组不断拆分成两个数组，直到被拆分的数组中只有一个元素，，再不断合并数组
// 时间复杂度O(nlogn)
// 空间复杂度O(n)
function mergeSort(arr = []) {
  let len = arr.length
  if(len < 2) {
    // 只有一项或者无时返回自身
    return arr
  }
  let middleIndex = Math.floor(len / 2),
      leftArr = arr.slice(0, middleIndex),
      rightArr = arr.slice(middleIndex)
  return merge(mergeSort(leftArr), mergeSort(rightArr))
}
function merge(leftArr, rightArr) {
  let res = []
      leftLen = leftArr.length,
      rightLen = rightArr.length,
      leftIndex = 0,
      rightIndex = 0
  while(leftIndex < leftLen && rightIndex < rightLen) {
    if(leftArr[leftIndex] < rightArr[rightIndex]) {
      res.push(leftArr[leftIndex])
      leftIndex++
    } else {
      res.push(rightArr[rightIndex])
      rightIndex++
    }
  }
  // 两个数组比较完，只剩下一个数组的情况
  while(leftIndex < leftLen) {
    res.push(leftArr[leftIndex])
    leftIndex++
  }
  while(rightIndex < rightLen) {
    res.push(rightArr[rightIndex])
    rightIndex++
  }
  return res
}
// console.log('source',source)
// console.log('mergeSort', mergeSort(source))

// 快速排序，同样是采用分治的思想,
// 思路：
// 1.先取中间下标，以及对应的值，将当前数组的每一项依次和当前值比较大小，分成两个数组
// 2.将小于中间值得数组，中间值，大于中间值得数组，合并成一个新数组
// 时间复杂度O(nlogn) ~ O(n^2)
// 空间复杂度O(nlogn)

function quicklySort(arr) {
  const len = arr.length
  if(len < 2) {
    return arr
  }
  const midIndex = Math.floor(len / 2)
  const midValue = arr.splice(midIndex, 1)[0]
  let left = [],
      right = []
  for(let i = 0; i < arr.length; i++ ) {
    if(arr[i] < midValue) {
      left.push(arr[i])
    } else {
      right.push(arr[i])
    }
  }
  return [].concat(quicklySort(left), [midValue], quicklySort(right))
}
// console.log('quickly', quicklySort(source))

// 插入排序
// 原理：类似于玩扑克牌里的插牌
// 原理： 
// 遍历，先将当前值缓存起来，依次将之前的值和当前值作比较，若之前的值有大于当前值得，则位置后移
// 时间复杂度O(n^2)
// 空间复杂度O(1)
function insertSort(arr) {
  for(let i = 1; i < arr.length; i++) {
    const current = arr[i]
    let prevIndex = i - 1
    while(prevIndex > -1 && arr[prevIndex] > current) { // 当前值左边的值大于当前值
      arr[prevIndex+1] = arr[prevIndex] // 大于当前值得值位置后移
      prevIndex-- // 继续比较前一项
    }
    // 将当前值设置回去（未存在移动或者已经移动）
    arr[prevIndex+1] = current 
  }
  return arr
}
// console.log('insertSort', insertSort(source))

// 希尔排序
// 原理： 
// 先将数组拆成多个小数组进行插入排序
// 待整个数组基本有序（拆分的每一个小数组都是有序的，并且不可再拆分成更小的数组了），再对整个大数组进行插入排序
function shellSort(arr = []) {
  const len = arr.length
  for(let gap = Math.floor(len / 2); gap > 0; gap = Math.floor(gap / 2)) {
    // 进行插入排序（存在gap变化）
    for(let i = gap; i < len; i++) {
      let current = arr[i],
          prevIndex =  i - gap
      while(prevIndex >= 0 && arr[prevIndex] > current) {
        arr[prevIndex + gap] = arr[prevIndex]
        prevIndex = prevIndex - gap // 前一项下标前移
      }
      arr[prevIndex + gap] = current
    }
  }
  return arr
} 
console.log('shellSort', shellSort(source))