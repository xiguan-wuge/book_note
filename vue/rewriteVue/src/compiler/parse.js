const ncname = `[a-zA-z_][\\-\\.0-9_a-zA-Z]` // 匹配标签名，如abc-123
const qnameCapture = `((?:${ncname}\\:)?${name})` // 匹配特殊标签 如abc:123 前面的abc: 可有可无
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 匹配标签开始 如<abc-123 捕获里面的标签名
const startTagClose = /^\s*(\/?)>/  // 匹配标签结束
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配标签结束 如</abc-123> 捕获里面的标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性 如 id = 'app'

let root, currentParent; // 代表跟节点和当前父节点

let stack = [] // 栈结构，用来表示开始和结束标签

// 标识元素和文本类型
const ELEMENT_TYPE = 1
const TEXT_TYPE = 3

// 生成ast的方法
function createASTElement(tagName, attrs) {
  return {
    tag: tagName,
    type: ELEMENT_TYPE,
    children: [],
    attrs,
    parent: null
  }
}

// 对开始标签进行处理
function handleStartTag({tagName, attrs}) {
  let element = createASTElement(tagName, attrs)
  if(!root) {
    root = element
  }
  currentParent = element
  stack.push(element)
}

// 对结束标签进行处理
function handleEndTag(tagName) {
  // 栈结构
  // 比如<div><span></span></div>
  // 当遇到第一个结束标签</span>时，会匹配到栈顶的<span>元素对应的ast，并取出来
  let element = stack.pop()
  // 当前节点的父元素，就是栈顶的上一个元素，在这里就类似div
  currentParent = stack[stack.length -1]
  // 建立parent与children的关系
  if(currentParent) {
    element.parent = currentParent
    currentParent.children.push(element)
  }
}

// 对文本进行处理
function handleChars(text) {
  // 去掉空格
  text = text.replace(/\s/g, '')
  if(text) {
    currentParent.children.push({
      type: TEXT_TYPE,
      text,
    })
  }
}

// 核心逻辑--parse： 解析标签，生成ast
// 思路： 
// 正则匹配html字符串，
// 遇到开始标签、结束标签和文本时，解析，生成对应的ast,建立相应的父子关联， 不断地advance截取剩余的html字符串
// 直到html全部解析完毕

// 这里主要写了对于开始标签里面的属性的处理 --parseStartTag

export function parse(html) {
  while(html) {
    // 查找<
    let textEnd = html.indexOf('<')
    // 如果<在第一个，表示接下来就是一个标签，开始标签/结束标签
    if(textEnd === 0) {
      // 如果开始标签解析有结果
      const startTagMatch = parseStartTag()
      if(startTagMatch) {
        // 把解析好的标签名和属性生成ast  
        handleStartTag(startTagMatch)
        continue;
      }

      // 匹配结束标签 </
      const endTagMatch = html.match(endTag)
      if(endTagMatch) {
        advance(endTagMatch[0].length)
        handleEndTag(endTagMatch[1])
        continue;
      } 

      let text; // 形如hello<div></div>
      if(textEnd > 0) {
        // 获取文本
        text = html.substring(0, textEnd) // substring 不会修改原字符串
      }
      if(text) {
        advance(text.length)
        handleChars(text)
      }
    }
  }


  // 匹配开始标签,收集其属性
  function parseStartTag() {
    const start = html.match(startTagOpen)
    if(start) {
      const match = {
        tagName: start[1],
        attrs: [] 
      }
      // 匹配到开始标签就截取掉
      advance(start[0].length)

      // 开始匹配属性
      // end 表示结束符号 > 
      // attr 表示匹配的属性

      let end, attr;
      while(
        !(end = html.match(startTagClose)) && 
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length)
        attr = {
          name: attr[1],
          value: attr[3] || attr[4] || attr[5], // 正则匹配支持单引号、双引号和无引号的属性
        }
        match.attrs.push(attr)
      }

      if(end) {
        // 匹配到结束标识 >, 表示开始标签解析完毕
        advance(1)
        return match
      }
    }
  }

  // 截取html字符串，每次匹配到了，就继续往前
  function advance(n) {
    // let str = 'hello world'
    // let strSub = str.substring(2) 
    // console.log('strSub', strSub) // 'llo world'
    html = html.substring(n)
  }

  // 返回生成的ast
  return root

}