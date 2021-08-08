export class History {
  constructor(router, base) {

  }
  listen(cb) {
    this.cb = cb
  }

  // 切换this.current(当前路径)
  transitionTo(location, onComplete, onAbort) {
    // 匹配到目标路径
    const route = this.router.match(location, this.current)
    // 真正切换路径的操作，可能出在异步操作，所有有成功和失败的回调
    this.confirmTransition(route, ()=> {
      this.updateRoute(route)
      onComplete && onComplete(route)
      this.ensureURL()

      if(!this.ready) {
        this.ready = true
        this.readyCbs.forEach(cb => { cb(route) })
      }
    }, err => {
      if(onAbort) {
        onAbort(err)
      }
      if(err && !this.ready) {
        this.ready = true
        this.readyErrorCbs.forEach(cb => { cb(err) })
      }
    })
  }

  confirmTransition(){
    
  }
}