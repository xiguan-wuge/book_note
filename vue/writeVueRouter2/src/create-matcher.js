import { createRouteMap } from "../../../../vue/vue@2x/vue-router/src/create-route-map"
import { createRoute } from "../../../../vue/vue@2x/vue-router/src/util/route"

export function createMather(routes, router) {
  // 创建路由映射表
  const { pathList, pathMap, nameMap } = createRouteMap(routes)

  // 用于动态添加路由配置，实际开发中有些情况下不会提前把路由写死，需要根据场景动态添加
  // 其内部操作 再次调用创建路由记录的方法
  function addRoutes(routes) {
    createRouteMap(routes, pathList, pathMap)
  }

  // 根据传入的raw 和 当前的路径 currentRoute,计算出一个新的路径返回
  function match(raw, currentRoute, redirectedForm) {
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name } = location

    if(name) {
      const record = nameMap[name]
      if(!record) return _createRoute(null, location)

      const paramNames = record.regex.keys
        .filter(key => !key.optional)
        .map(key => key.name)

      if(typeof location.params !== 'object') {
        location.params = {}
      }
    }
    // ... 
    return _createRoute(null, location)
  }

  // ...
  // 最终返回一个对象,对外暴露两个方法
  return {
    match,
    addRoutes
  }
}