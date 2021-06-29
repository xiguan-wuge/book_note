import { START } from '../util/route'

export class History {
  constructor() {
    this.current = START
    this.errorCbs = []
  }


  // 首先根据location和当前路径this.current 执行match方法，匹配到目标路径
  tansitionTo(location, onComplete, onAbort) {
    let route
    try {
      route = this.router.match(location, this.current)
    } catch (error) {
      this.errorCbs.forEach(cb => {
        cb(error)
      })
      throw error
    }
    // 拿到目标路径后做切换
    this.confirmTransition(
      route,
      () => {
        this.updateRoute(route)
        onComplete && onComplete(route)
        this.ensureURL()
        if(!this.ready) {
          this.ready = true
          this.readyCbs.forEach(cb => {
            cb(route)
          })
        }
      },
      err => {
        if(onAbort) {
          onAbort(err)
        }
        if(err && !this.ready) {
          this.ready = true
          this.readyCbs.forEach(cb => {
            cb(err)
          })
        }
      }
    )
  }
}