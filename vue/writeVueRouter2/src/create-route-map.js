import { cleanPath } from "../../../../vue/vue@2x/vue-router/src/util/path"

export function createRouteMap(routes, oldPathList, oldPathMap, oldNameMap) {
  // 所有的path
  const pathList = oldPathList || []
  // path 到 routeRecored 的映射
  const pathMap = oldPathMap || Object.create(null)
  // name 到 routeRecord 的映射关系
  const nameMap = oldNameMap || Object.create(null)

  // 添加路由记录
  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route)
  })

  // 确保通配符路由始终在pathList数组的最后
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

// 生成路由记录
function addRouteRecord(
  pathList,
  pathMap,
  nameMap,
  route,
  parent,
  matchAs
) {
  const { path, name } = route
  // 将path转成正则配置项
  const pathToRegexpOptions = route.pathToRegexpOptions || {}
  const normalizedPath = normalizedPath(
    path,
    parent,
    pathToRegexpOptions.strict
  )

  if(typeof route.caseSensitive === 'boolean') {
    pathToRegexpOptions.sensitive = route.caseSensitive
  }

  // RouteRecord
  const record = {
    // 规范后的路径，根据parent的path做计算
    path: normalizedPath,
    // 正则表达式扩展，利用 path-to-regexp 这个库，把path解析成一个正则表达式扩展，
    // 例子：
    // var keys = []
    // var re = pathToRegexp('/foo/:bar', keys)
    // re = /^\/foo\/([^\/+?])\/?$/i
    // keys = [{name: 'bar', prefix: '/', delimeiter: '/', optional: false, repeat: false, patten: '[^\\/]+?'}]
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.components || { default: route.component },
    // 组件的实例
    instances: {},
    name,
    parent, // 父组件的routeRecord
    matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props: route.props == null
      ? {}
      : route.components
        ? route.props
        : { default: route.props }
  }

  if(route.children) {
    // 非生产环境处理代码 省略

    // 为子路由添加路由记录，便于拿到一个完整的route记录
    route.children.forEach(child => {
      const childMatchAs = matchAs
        ? cleanPath(`${matchAs}/${child.path}`)
        : undefined
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
    })
  }

  if(route.alias !== undefined) {
    const aliases = Array.isArray(route.alias)
      ? route.alias
      : [route.alias]

    aliases.forEach(alias => {
      const aliasRoute = {
        path: alias,
        children: route.children
      }
      addRouteRecord(
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        recored.path || '/'
      )
    })
  }

  // 给pathMap 和 nameMap 各添加一条记录  
  if(!pathMap[record.path]){
    pathList.push(record.path)
    pathMap[record.path] = record
  }

  if(name) {
    // 将路由name添加到nameMap中
    if(!nameMap[name]) {
      nameMap[name] = record
    } else {
      // warning
    }
  }
}