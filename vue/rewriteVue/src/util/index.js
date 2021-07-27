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
LIFECYCLE_HOOKS.forEach(hook => {
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
    if(parent && !parent.hasOwnProperty(key)) {
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

// 组件、指令、过滤器的合并策略
const ASSETS_TYPE = ['components', 'directive', 'filter']
function mergeAssets(parentVal, childVal) {
  const res = Object.create(parentVal) 
  if(childVal) {
    for(let k in childVal) {
      res[k] = childVal[k]
    }
  }
}

ASSETS_TYPE.forEach(type => {
  strats[type+'s'] = mergeAssets
})

// 判断是否是对象类型
export function isObject(data) {
  if(typeof data !== 'object' || data === null) {
    return false
  }
  return true
}

// 判断是不是常规html标签
export function isReservedTag(strName) {
  // 定义常规标签
  const str = `html,body,base,head,link,meta,style,title,
    address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,
    div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,
    a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,
    s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,
    embed,object,param,source,canvas,script,noscript,del,ins,
    caption,col,colgroup,table,thead,tbody,td,th,tr,
    button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,
    output,progress,select,textarea,
    details,dialog,menu,menuitem,summary,
    content,element,shadow,template,blockquote,iframe,tfoot`
  let obj = {}
  str.split(',').forEach(tag => {
    obj[tag] = true
  })
  return obj[strName]
}

