import View from './components/view'
import Link from './components/link'

export let _Vue
export function install(Vue) {
  // installed 标志位，表示该插件已经安装过了，不会再重复安装
  if(install.installed && (_Vue === Vue)) return  

  // 插件内部对Vue有依赖，又不想import Vue，（减小包体积），所以以参数传入的方式拿到
  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode // 获取父节点的虚拟dom
    if(isDef(i) && isDef(i = i.data) &&isDef(i = i.registerRouteInstance)) {
      // 若存在registerRouteInstance函数
      i(vm, callVal)
    }
  }

  // install 核心，混入钩子
  Vue.mixin({
    beforeCreate() {
      if(isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        // 初始化
        this._router._init(this)


        Vue.util.defineReactive(this, '_route', this._router.history.current) // ?
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      // 执行注册路由实例
      registerInstance(this,this)
    },
    destroyed() {
      registerInstance(this)
    }
  })

  // 将 $router 和 $route 变为响应式，便于this.$router this.$route 访问到
  Object.defineProperty(this, '$outer', {
    get() {
      return this._routerRoot._router
    }
  })
  Object.defineProperty(this, '$route', {
    get() {
      return this._router._route
    }
  })

  Vue.components('RouterLink', Link)
  Vue.components('RouterView', View)

  // 定义路由钩子的合并策略，和普通的钩子函数一样
  const strats = Vue.config.optionMergeStrategies
  strats.beforeRouterEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created // ???
}

export default class VueRouter {
  
  // ...一些常量

  constructor(options) {
    this.app = null // 整个Vue实例
    this.apps = []
    this.options = options // 传入的路由配置
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    this.matcher = createMatcher(options.routes || [], this) // 匹配路由器

    // 判断当前的路由模式
    let mode = options.mode || 'hash'
    // 是否降级到hash模式
    this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
    if(this.fallback) {
      mode = 'hash'
    }
    if(!inBrowser) {
      mode = 'abstract'
    }
    this.mode = mode
    switch(mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      case 'hash': 
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract': 
        this.history = new AbstractHistory(this, options.base)
      default: 
        if(process.env.NODE_ENV !== 'production') {
          console.log(`invalid mode: ${mode}`)
        }
    }
  }

  match(raw, current, redirectedFrom) {
    return this.matcher.match(raw, current, redirectedFrom)
  }
  get currentRoute() {
    return this.history && this.history.current
  }

  init(app) { // app： vue组件实例
    this.apps.push(app)

    app.$once('hook:destroyed', ()=> {
      // 删除当前实例
      const index = this.apps.indexOf(app)
      if(index > -1) this.apps.splice(index, 1)

      if(this.app = app) this.app = this.app[0] || null

      if(!this.app) this.history.teardown()
    })

    // 不需要初始化时，则return
    if(this.app) {
      return 
    }

    this.app = app
    const history = this.history
    // 根据不同类型执行不同逻辑
    if(history instanceof HTML5History) {
      history.transitionTo(history.getCurrentLocation())
    } else if(history instanceof HashHistory) {
      const setHashListener = () => {
        history.setupListener()
      }
      history.transitionTo(
        history.getCurrentLocation(),
        setupHashListener,
        setupHashListener
      )
    }

    history.listen(route => {
      this.apps.forEach(app => {
        // app._route 当前跳转的路由
        app._route = route
      })
    })
  }
}