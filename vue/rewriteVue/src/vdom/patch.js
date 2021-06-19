// patch用来渲染和更新视图，这里目前先介绍初次渲染逻辑
export function patch(oldVnode, vnode) {
  // 判断传入的oldVnode是否是一个真实元素
  // 关键：
  // 初次渲染时传入的是vm.$el,就是new Vue()时传入的el选项，所以是真实dom
  // 视图更新的时候，vm.$el就被替换成了更新之前的oldVnode
  const isRealElement = oldVnode.nodeType
  if(isRealElement) {
    // 初次渲染的整体思路：
      // 根据虚拟dom调用原生js方法，创建真实dom节点，并替换掉el选项的位置

    // 初次渲染
    const oldElm = oldVnode
    const parentElm = oldElm.parentNode
    // 将虚拟dom转换成真实dom
    let el = createElm(vnode)
    // 插入到老的el节点的下一个节点的前面，就相当于插入到老得el节点的后面
    // 这里不直接使用appendChild是为了不破坏替换的位置
    parentElm.insertBefore(el, oldElm.nextSibling)
    // 删除老的el节点
    parentElm.removeChild(oldVnode)
    return el;
  } else {
    // oldVnode是虚拟dom,就是更新过程，使用diff算法
    if(oldVnode.tag !== vnode.tag) {
      // 如果新旧标签不一致，用新的替换旧的
      // oldVnode.el代表的是真实的dom节点，进行同级比较
      oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
    }
    if(!oldVnode.tag) {
      // 旧节点是一个文本节点
      if(oldVnode.text !== vnode.text) {
        oldVnode.el.textContent = vnode.text
      }
    }
    // 不符合上面的两种，代表标签一致，并且不是文本节点
    // 为了节点复用，所以直接把旧的虚拟dom对应真实的dom(oldVnode.el), 赋值给新的虚拟dom的el属性
    const el = (vnode.el = oldVnode.el)
    updateProperties(vnode, oldVnode.data) // 更新属性
    const oldCh = oldVnode.children || []
    const newCh = vnode.children 
    if(oldCh.length > 0 && newCh.length > 0) {
      // 新老都存在子节点
      updateChildren(el, oldCh, newCh)
    } else if(oldCh.length) {
      // 老的存在子节点，新的没有子节点
      el.innerHTML = ''
    } else if(newCh.length) {
      // 新的有子节点，老的没有
      for(let i = 0; i < newCh.length; i++) {
        const child = newCh[i]
        el.appendChild(createElm(child))
      }
    }
  }
}

// 将虚拟dom转化成真实dom,就是调用原生方法生成dom树
function createElm(vnode) {
  let {tag, data, key, children, text} = vnode
  // 判断vnode是元素节点还是文本节点，文本节点的tag为undefined
  if(typeof tag === 'string') {
    // 虚拟dom的el指向真实dom
    vnode.el = document.createElement(tag)
    // 解析虚拟dom属性
    updateProperties(vnode);
    // 如果有子节点，就递归插入到父节点里面
    children.forEach(child => {
      return vnode.el.appendChild(createElm(child))
    })
  } else {
    // 文本节点
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

// 解析vnode的data 属性，映射到真实dom
// 实际上就是通过新旧遍历，
  // 删除旧的中存在的（新的中不存在的）
  // 添加新的
function updateProperties(vnode, oldProps = {}) {
  let newProps = vnode.data || {}
  let el = vnode.el; // 真实节点

  // 如果新的节点没有，需要把老的节点的属性移除
  for(const key in oldProps) {
    if(!newProps[key]) {
      el.removeAttribute(key)
    }
  }
  // 对style样式做特殊处理，如果没有新的，就需要把老的style设置为空
  const newStyle = newProps.style || {}
  const oldStyle = oldProps.style || {}
  for(const key in oldStyle) {
    if(!newStyle[key]) {
      el.style[key] = ''
    }
  }

  // 遍历新的属性，进行增加操作
  for(let key in newProps) {
    // style需要特殊处理
    if(key === 'style') {
      for(let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName]
      }
    } else if(key === 'class') {
      el.className = newProps.class
    } else {
      // 给这个元素添加属性，值就是对应的值
      el.setAttribute(key, newProps[key])
    }
  }
}

// 判断两个vnode的tag 和key 是否相同，如果相同，就认为是同一个节点，就地复用
function isSameNode(oldVnode, newVnode) {
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key
}

// diff的核心逻辑，采用双指针的方式，对比新老vnode的子节点
function updateChildren(parent, oldCh, newCh) {
  let oldStartIndex = 0
  let oldStartVnode = oldCh[0]
  let oldEndIndex = oldCh.length -1
  let oldEndVnode = oldCh[oldEndIndex]

  let newStartIndex = 0
  let newStartVnode = newCh[0]
  let newEndIndex = newCh.length -1
  let newEndVnode = newCh[newEndIndex]

  // 通过key来创建oldCh的映射表，类似 {a: 1, b: 2}
  // 代表 key 为a 的节点的在第一个位置，代表key 为 b 的节点在第二个位置
  function makeIndexByKey(children) {
    let map = {}
    children.forEach((item, index) => {
      map[item.key] = index
    })
    return map
  }
  // 生成映射表
  let map = makeIndexByKey(oldCh)
  
  // 只有当新老子节点的双指针的起始位置不大于结束位置的时候，才能循环，一方停止了，就要结束循环
  while(oldStartIndex < oldEndIndex && newStartIndex < newEndIndex) {
    // 因为暴力对比过程直接把移动的vnode设置为undefined，如果不存在vnode直接跳过
    if(!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIndex]
    } else if(!oldEndVnode) {
      oldEndVnode = [--oldEndIndex]
    } else if(isSameNode(oldStartVnode, newStartVnode)) {
      // 新旧子节点头部对比，依次向后追加
      patch(oldStartVnode, newStartVnode) // 递归。比较子节点以及后代子节点
      oldStartVnode = oldCh[++oldStartIndex]
      newStartVnode = newCh[++newStartVnode]
    } else if(isSameNode(oldEndVnode, newEndVnode)) {
      // 新旧子节点尾部对比，依次向前追加
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIndex]
      newEndVnode = newCh[--newEndIndex]
    } else if(isSameNode(oldStartVnode, newEndVnode)) {
      // 旧的头部和新的尾部相同，把旧的头部移动到尾部
      patch(oldStartVnode, newEndVnode)
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldCh[++oldStartIndex]
      newEndVnode = newCh[--newEndIndex]
    } else if(isSameNode(oldEndVnode, newStartVnode)) {
      // 旧的尾部和新的头部相同，把旧的尾部移动到头部
      patch(oldEndVnode, newStartVnode)
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldCh[--oldEndIndex]
      newStartVnode = newCh[++newStartIndex]
    } else {
      // 如果上面四种情况都不满足，需要暴力对比
      // 根据旧子节点的key和index的映射表，从新的节点头部开始查找，
      // 如果可以找到，就进行移动操作；如果找不到，旧直接进行插入
      let moveIndex = map[newStartVnode.key]
      if(!moveIndex) {
        // 在老的子节点中找不到，直接插入
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      } else {
        let moveVnode = oldCh[moveIndex]
        oldCh[moveIndex] = undefined // 占位操作，避免数组坍塌，防止旧的节点移动走了之后，破坏初始映射表的位置
        parent.insertBefore(moveVnode, oldStartVnode.el) //把找到的节点，移动到最前面
        patch(moveVnode, newStartVnode)  
      }
    }
  }

  // 如果旧子节点循环结束，但新子节点还有，说明：新节点中有需要被添加到头部或者尾部
  if(newStartIndex <= newEndIndex) {
    for(let i = newStartIndex; i <= newEndIndex; i++) {
      // 这是一个优化写法，inserBefore的第一个参数是null, 等同于appendChild
      const ele = newCh[newEndIndex+1] === null ? null :newCh[newEndIndex + 1].el
      parent.insertBefore(createElm(newCh[i]), ele)
    }
  }

  // 如果新子节点循环结束，但旧子节点没有，证明旧子节点中存在需要删除的节点
  if(oldEndIndex <= oldEndIndex) {
    for(let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldCh[i]
      if(child !== undefined) {
        parent.removeChild(child.el)
      }
    }
  }
  // 统一patch方法中新增的更新逻辑，都返回el
  return el
}