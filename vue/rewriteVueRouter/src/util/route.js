export function createRoute(record, location, redirectedFrom, router) {
  const stringifyQuery = router && router.options.stringifyQuery
  let query = location.query || {}
  try {
    query = clone(query)
  } catch(e) {}

  const route = {
    name: location.name || (record && record.name),
    meta: (record && record.mata) || {},
    path: location.path || '',
    hash: location.hash || '',
    query,
    params: location.params || {},
    fullPath: getFullPath(location,stringifyQuery),
    matched: record ? formatMatch(record) : []
  }
  if(redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
  }
  return Object.freeze(route) // 不可以被外部修改
}

function formatMatch(record) {
  const res = []
  while(record) {
    res.unshift(record)
    record = record.parent
  }
  return res
}
// the starting route that represents the initial state
export const START = createRoute(null, {
  path: '/'
})