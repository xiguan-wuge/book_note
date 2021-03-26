var obj = {
  foo: function() {
    console.log(this.bar)
  },
  bar: 1
}

var foo = obj.foo
var bar = 2

obj.foo()
foo()
