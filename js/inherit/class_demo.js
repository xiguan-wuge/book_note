class Parent1 {
  constructor(name) {
    this.name = name
  }
  getName1() {
    console.log('getName', this.name)
    return this.name
  }
}

class Child1 extends Parent1{
  constructor(name, age) {
    super(name)
    this.age = age
  }
  getAge() {
    console.log('getAge',this.age)
    return this.age
  }
}

const child1 = new Child1('zhangsan', 18)
const parent1 = new Parent1('lisi')

console.log('child1', child1)
console.log('parent1', parent1)
console.log('------------------------------')