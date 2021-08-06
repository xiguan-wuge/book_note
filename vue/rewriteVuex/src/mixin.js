export default function(Vue) {
  const version = Number(Vue.version.split('.')[0])
  if(version > 2) {
    // Vue 2.0 版本
    Vue.mixin({beforeCreate: vuexInit})
  }

  // Vuex 初始化钩子，注入到每个实例的hook列表中
  function vuexInit() {
    const options = this.$options
    // store 注入，这样每个Vue实例都能获取到$store,并且是同一个$store
    if(options.store) {
      // 存在store即代表就是Root节点，直接执行store(function时)， 或者store(非function)
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if(options.parent && options.parent.$store){
      // 获取父节点的store,保证所有组件共用一个store
      this.$store = options.parent.$store
    }
  }
}