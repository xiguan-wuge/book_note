import { extend } from "../../../../../vue/vue@2x/vue-router-dev/src/util/misc"
import { resolvePath } from "../../../../../vue/vue@2x/vue-router-dev/src/util/path"

export function normalizeLocation(
  raw,
  current,
  append,
  router
) {
  let next = typeof raw === 'string' ? {path: raw} : raw
  // name target 
  if(next._normalized) {
    return next
  } else if(next.name) {
    // 暂时理解为继承
    return extend({}, raw)
  }

  // relative params(相关的参数)
  if(!next.path && next.params && current) {
    next = extend({}, next)
    next._normalized = true
    const params = extend(extend({}, current.params), next.params)
    if(current.name) {
      next.name = current.name
      next.params = params
    } else if(current.matched.length) {
      // 存在匹配的项
      const rawPath = current.matched[current.matched.length -1].path
      next.path = fillParams(rawPath, params, `path ${current.path}`)
    } else if(Process.env.NODE_ENV !== 'production') {
      console.warn('ralative params navigation requires a current route')
    }
    return next
  } 

  const parsedPath = parsePath(next.path || '')
  const basePath = (current && current.path) || ''
  const path = parsedPath.path
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    :basePath

  const query = resolveQuery(
    parsedPath.query,
    next.query,
    router && router.options.parseQuery
  )

  let hash = next.hash || parsedPath.hash
  if(hash && hash.charAt(0) !== '#') {
    hash = `#${hash}`
  }

  return {
    _normalized: true,
    path, 
    query,
    hash
  }
}