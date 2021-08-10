export function remove(arr, item) {
  if(arr.length) {
    const index = arr.indexOf(item)
    if(index > -1) {
      return arr.splice(index, 1)
    }
  }
} 

export function isRegExp(v) {
  return Object.prototype.toString.call(v) === '[object RegExp]'
}