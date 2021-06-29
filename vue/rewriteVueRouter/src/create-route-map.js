
// createRouteMap 目标是把用户的路由配置转换成一张路由映射表
// 包含三个部分：
// pathList: 存储所有的path，
// pathMap: 表示一个path到RouteRecord的映射关系，
// nameMap: 表示name到RouteRecord的映射关系
export function createRouteMap(
  routes,
  oldPathList,
  oldPathMap,
  oldNameMap
) {
  // pathList 用于控制路径匹配优先级
  const pathList = oldPathList || []
  const pathMap = oldPathMap || Object.create(null)
  const nameMap = oldNameMap || Object.create(null)

  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route)
  })

  for(let i = 0, l = pathList.length; i < l; i++) {
    if(pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0])
      l--
      i--
    }
  }

  return {
    pathList,
    pathMap,
    nameMap
  }
}