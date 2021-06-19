// 定义生命周期
export const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed'
]

// 合并策略
const strats = {}

// 生命周期合并策略
function mergeHook(parentVal, childVal) {
  if(childVal) {
    if(parentVal) {
      return parentVal.concat(childVal)
    } else {
      return [childVal]
    }
  } else {
    return parentVal
  }
}

// 为生命周期添加合并策略
LIFECTYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

// 为生命周期添加合并策略
export function mergeOptions(parent, child) {
  const options = {}
  
  // 遍历父亲
  for(let key in parent) {
    mergeFiled(key)
  }

  // 父亲没有，儿子有的选项
  for(let key in child) {
    if(!parent.hasOwnProperty(key)) {
      mergeFiled(key)
    }
  }

  function mergeFiled(key) {
    if(strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else {
      // 默认策略
      options[key] = child[key] || parent[key]
    }
  }
  return options
}