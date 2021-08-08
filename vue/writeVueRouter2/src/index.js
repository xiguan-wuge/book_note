import { AbstractHistory } from "../../../../vue/vue@2x/vue-router-dev/src/history/abstract"
import { HTML5History } from "../../../../vue/vue@2x/vue-router-dev/src/history/html5"
import { createMatcher } from './create-matcher'

export default class VueRouter {
  constructor(options = {}) {
    this.app = null //根Vue实例
    // 保存持有this.$optons.router属性的vue实例
    this.apps = []
    this.options = options
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    // 路由匹配器
    this.matcher = createMatcher(options.routers || [], this)

    // 确定当前的路由模式
    let mode = options.mode || 'hash'
    // fallback 表示在当前浏览器不支持pushState的情况下，
    // 根据传入的fallback参数，决定是否退回到hash模式
    this.fallback = 
      mode === 'history' 
      && !supportsPushState 
      && options.fallback !== false
    if(this.fallback) {
      mode = 'hash'
    }
    if(!inBrowser) {
      mode = 'abstract'
    }
    this.mode = mode
    // 确定路由history的具体实现实例，根据mode不同，实现不同
    switch(mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break;
      case 'hash':
        this.history = new HashHistroy(this, options.base, this.fallback)
        break;
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break;
      default: 
        if(process.env.NODE_ENV !== 'production') {
          console.log('invalid mode:' + mode)
        }
    }
  }

  match(raw, current, redirectedForm) {
    return this.matcher.match(raw, current, redirectedForm)
  }
  // 路由初始化函数
  init(app) {
    this.apps.push(app)

    app.$once('hook:destroyed', () => {
      // 触发销毁时，删除对应的vue实例
      const index = this.apps.indexOf(app)
      if(index > -1) this.apps.splice(index, 1)
      // 确保仍旧还有一个根Vue实例
      if(this.app = app) this.app = this.apps[0] || null

      // 不存在根Vue实例时，销毁当前history
      if(!this.app) this.history.teardown()
    })

    if(this.app) return

    this.app = app

    const history = this.history

    // 根据不同的路由模式执行不同的逻辑
    if(history instanceof HTML5History) {
      // 暂时了解hash模式
      const setupHashListener = () => {
        history.setupListeners()
      }

      history.transitionTo(
        history.getCurrentLocation(),
        setupHashListener,
        setupHashListener
      )
    }

    history.listen(route => {
      this.apps.forEach(app => {
        app._route = route
      })
    })

  }
}