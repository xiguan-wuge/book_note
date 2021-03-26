class Logger {
  values = 'value2'
  constructor() {
    // this.value = 'value'
  }
  get value() {
    return this.values
  }
}
const logger = new Logger()
console.log(logger.value) // value value2