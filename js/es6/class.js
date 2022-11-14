// class 是 构造函数的语法糖

// es5
function Person(firstName,  lastName, age, address) {
  this.firstName = firstName
  this.lastName = lastName
  this.age = age
  this.address = address
}

Person.self = function() {
  return this
}
Person.prototype.toString = function() {
  return '[object Person]'
}

Person.prototype.getFullName = function() {
  return this.firstName + ' ' + this.lastrName
}

// es6
class Person {
  constructor(firstName, lastName, age, address) {
    this.firstName = firstName
    this.lastName = lastName
    this.age = age
    this.address = address
  }

  static self() {
    return this
  }
  toStriing() {
    return '[object Person]'
  }
  getFullName() {
    return `${this.firstName} ${this.lastName}`
  }
}

// 重写方法并从另一个类继承

// es5
function Employee (firstName, lastName, age, address, jobTitle, yearStarted) {
  Person.call(this, firstName, lastName, age, address)
  this.jobTitle = jobTitle
  this.yearStarted =  yearStarted
}

Employee.prototype = Object.create(Person.prototype)
Employee.prototype.describe = function() {
  return 'I am' + this.getFullName() + 'and have a position of' 
  + this.jobTitle + 'and I started at' + this.yearStarted
}

// es6
class Employee extends Person {
  constructor(firstName, lastName, age, address, jobTitle, yearStarted) {
    super(firstName, lastName, age, address)
    this.jobTitle = jobTitle
    this.yearStarted = yearStarted
  }

  describe() {
    return `I am ${this.getFullName()} and I have a position of ${this.jobTitle} 
    and I started at ${this.yearStarted}`
  }
  toString() {
    return `[object Employee]`
  }
}