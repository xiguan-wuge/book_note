import _class from "../../../../../vue/vue@2x/vueSourceCode/vue/src/platforms/web/compiler/modules/class"

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配花括号 {{ }}, 捕获花括号里的内容

function gen(node) {
  // 判断节点类型
  // 主要包含处理文本核心
  // 源码这块包含了复杂的处理逻辑 如v-once， v-for, v-if  自定义指令slot等
  // 这里目前只考虑普通文本和变量表达式{{}}的处理

  // 如果是元素类型
  if(node.type === 1) {
    // 递归创建
    return generate(node)
  } else {
    // 如果是文本
    let text = node.text
    if(!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    }

    // 正则是全局模式，每次需要充值正则的lastIndex属性，不然会引发匹配bug
    let lastIndex = (defaultTagRE.lastIndex = 0)
    let tokens = []
    let macth, index;

    while((match = defaultTagRE.exec(text))) {
      // index 代表匹配到的位置
      index = macth.index
      if(index > lastIndex) {
        // 匹配到{{的位置，在tokens里面放入普通文本
        tokens.push(JSON.stringify(text.slice(lastIndex,index)))
      }
      // 放入捕获到的变量内容
      tokens.push(`_s(${match[1].trim()})`)
      // 匹配指针后移
      lastIndex = index + match[0].length
    }

    // 如果匹配完了花括号，text里面还有剩余的普通文本，那么继续push
    if(lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    // _v 表示创建文本
    return `_v(${tokens.join('+')})`
  }
}

// 处理attrs属性
function genProps(attrs) {
  let str = ''
  for(let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    // 对attrs里面的style做处理
    if(attr.name === 'style') {
      let obj = {}
      attr.value.split(';').forEach(item => {
        let [key, value] = item.split(':')
        obj[key] = value
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)}`
  }
  return `{${str.slice(0, -1)}}`
}

// 生成子节点，调用gen函数进行递归创建
function genChildren(el) {
  const children = el.children
  if(children) {
    return `${children.map(c => gen(c)).join(',')}`
  }
}

// 递归生成code
// 拿到ast后，需要将ast转化成类似 _c('div',{id: 'app'},_c('div',undefined,_v('hello'+_s(name)),_c('span',undefined,_v('world'))的字符串
export function generate(el) {
  let children = genChildren(el)
  let code = `_c('${el.tag}',${
    el.attrs.length ? `${genProps(el.attrs)}` : 'undefined'
  }${children ? `,${children}`: ''})`
  return code
}