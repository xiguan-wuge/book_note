let p = new Promise((resolve, reject)=> {
  console.log('promise start')
  resolve(1)
}).then(res => {
  console.log('then-res',res)
}).finally((a)=> {
  console.log('finally',a)
  return '00000'
}).then((ff)=> {
  console.log('finally-then', ff)
})