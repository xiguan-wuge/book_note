const items = new Set([1,2,3,4,5,5])
console.log('items',items) // Set { 1, 2, 3, 4, 5 }
const array = Array.from(items)
console.log(array) // [ 1, 2, 3, 4, 5 ]