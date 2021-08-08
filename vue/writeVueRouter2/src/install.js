export let _Vue
export function install(Vue) {
  if(installed && _Vue === Vue) return // 已安装，避免重复安装
  install.installed = true
  _Vue = Vue

  const isDef = i => i !== undefined

  // 当前实例中的registerInstance方法
  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if(isDef(i) && isDef(i = i.data) && idDef(i = i.registerInstance)) {
      i(vm, callVal)
    }
  }

  // 以mixin混入的方式往每个实例添加_router 属性和注册router实例
  Vue.mixin({
    beforeCreate() {
      if(isDef(this.$options.$router)){
        // 当前实例存在router属性
        // 直接赋值
        this._routerRoot = this // 根Vue实例
        this._router = this.$options.router // VueRouter的实例
        // 初始化路由
        this._router.init(this)
        // 将_route 属性添加到当前vm实例中, _route 表示当前的路由信息，将其设为响应式
        Vue.util.defineReactive(this, '_route', this._router.history.current) 
      } else {
        // 当前VM实例不具有$router ,从上级获取
        this._router = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed() {
      registerInstance(this)
    },
  })

  // 往实例中添加$router 和 $route， 这也是为什么每个实例都能拿到$router
  Object.defineProperty(Vue.prototype, '$router', {
    get() {
      return this._routerRoot._router
    }
  })
  Object.defineProperty(Vue.prototype, '$route', {
    get() {
      return this._routerRoot._route
    }
  })

  // 全局注册路由组件
  Vue.component('RouterView',  View)
  Vue.component('RouterLink', Link)

  // 定义路由中的合并策略，和普通的钩子函数一样
  const strats = Vue.config.optionsMergeStrategies
  strats.beforeRouterEnter = strats.beforeRouterLeave = strats.beforeRouterUpdate = strats.created

}