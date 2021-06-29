import { createRouteMap } from "./create-route-map"
import { normalizeLocation } from "../../../../vue/vue@2x/vue-router-dev/src/util/location"

export type Matcher = {
  match: (raw, current, redirectedFrom) => Route,
  addRoute: (routes) => void
}

// 功能：
// 1. 进行路由地址到路由对象的转换，
// 2. 路由记录的映射
// 3. 路由参数的处理
export function createMatcher (routes, router) {
  const {pathList, pathMap, nameMap} = createRouteMap


  // addRoutes 作用是动态添加路由配置，在实际开发中，有些场景下不能提前把前端路由写死，
  // 需要根据一些条件动态添加路由，所有Vue-Router提供这一接口
  function addRoutes(routes) {
    // addRoutes 的方法十分简单，再次调用 createRouteMap 即可，
    // 传入新的 routes 配置，由于 pathList、pathMap、nameMap 都是引用类型，
    // 执行 addRoutes 后会修改它们的值。
    createRouteMap(routes, pathList, pathMap, nameMap)
  }

  // 根据内部的路由映射匹配location对应的路由对象route
  function match(
    raw, // url字符串或者Location对象
    currentRoute, // 当前路径
    redirectedFrom // 和重定向相关
    ) {
    // 初始化导航
    const location = normalizeLocation(raw, currentRoute, false, router) 
    const name = location
    if(name) {
      const record = nameMap[name] // 一个RouterRecord对象
      // 若不存在，返回空路径
      if(!record) return _createRoute(null, location)
      
      // 拿到record的paramName
      const paramNames = record.regex.keys
        .filter(key => !key.optional)
        .map(key => key.name)
      
      if(typeof location.params !== 'object') {
        location.params = {}
      }
      // 把location中不存在的key但是在parmaName中存在的key，添加到location.parmas中
      if(currentRoute && typeof currentRoute.params === 'object') {
        for(const key in currentRoute.params) {
          if(!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key]
          }
        }
      }

      location.path = fillParams(record.path, location.params, `name route "${name}"`)
      return _createRoute(record, location, redirectedFrom) //  生成新路径
    } else if(location.path) {
      location.params = {}
      // 顺序遍历，所以书写路由配置的时候，要注意路径问题
      for(let i = 0; i < pathList.length; i++) {
        const path = pathList[i]
        const record = pathMap[path]
        if(matchRoute(record.regex, location.path, location.params)){
          return _createRoute(record, location, redirectedFrom)
        }
      }
    }

    // no match 
    return _createRoute(null, location)
  }

  function _createRoute(
    record,
    location,
    redirectedFrom
  ) {
    if(record && record.redirect) {
      return redirect(record, redirectedFrom || location)
    }
    if(record && record.matchAs) {
      return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom, router)
  }

  return {
    match,
    addRoutes
  }
}