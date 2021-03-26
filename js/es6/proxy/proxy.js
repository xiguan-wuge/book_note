var obj = new Proxy ({},{
  get: function(target, propKey, recevier) {
    console.log(`getter ${propKey}`)
    return Reflect.get(target, propKey, recevier)
  },
  set: function(target, propKey, value, recevier) {
    console.log(`setter ${propKey} = ${value}`)
    return Reflect.set(target, propKey, value, recevier)
  }
})

obj.count = 1
++ obj.count
// setter count = 1
// getter count
// setter count = 2