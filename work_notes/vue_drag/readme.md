### vue 框架中拖拽指令的实现

#### 使用场景

- 图片的拖拽

#### 思路
> 当鼠标按下时，记录鼠标的位置，鼠标移动时，记录鼠标移动的x,y值,当鼠标松开时，比较差值，改变当前元素的style中的left和top值

#### code

```
directives: {
    drag: function(ele, binding, vNode) {
      let currentEl = ele; // 当前元素
      currentEl.onmousedown = function(e1) {
        e1.preventDefault();
        // console.log('currentElstyy', currentEl.style)
        currentEl.style.cursor = '-webkit-grab'
        // console.log('cursor', currentEl.style.cursor)
        // 获取当前节点的left和top样式
        let eleLeft = currentEl.style.left
        let eleTop = currentEl.style.top
        // 记录鼠标的开始位置
        let startX = e1.clientX
        let startY = e1.clientY
        // 计算两边坐标
        document.onmousemove = function(e2) {
          currentEl.style.cursor = '-webkit-grabbing'
          // 记录鼠标的停止位置
          let endX = e2.clientX
          let endY = e2.clientY
          // 计算鼠标移动后的x,y 值
          let left = endX - startX
          let top = endY - startY
          if(eleLeft && eleTop) {
            let leftVal = eleLeft.slice(0, -2) -0
            let topVal = eleTop.slice(0, -2) -0
            // 若当前节点left和top有值，则在原来的值上加上鼠标移动的距离
            currentEl.style.left = leftVal + left  + "px";
            currentEl.style.top = topVal + top  + "px";
          } else {
            // 若无值，则将鼠标移动的距离赋值给left，top
            currentEl.style.left = left  + "px";
            currentEl.style.top = top  + "px";
          }
        };
        // 鼠标停止移动时，事件移除
        document.onmouseup = function() {
          currentEl.style.cursor = 'move'
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
  }

```
#### 和一般的拖拽的不同

> 网上看到的拖拽的实现都是基于当前元素的父级等元素做偏移，此移动是基于当前元素，是基于当前元素的移动的x，y
#### 踩得坑

> 鼠标开始按下时会回归原点，因为一开始当前节点的left和top可能为空，所以需要获取当前节点的left和top，若有值，则在原有的left（top）值上加上移动距离，若物质，则将移动距离赋值给left（top）

#### 参考链接
- [vue指令讲解](https://www.cnblogs.com/Double-Zhang/p/7891664.html)
- [谷歌鼠标小手效果](https://www.zhangxinxu.com/study/201412/cursor-grab-grabbing.html)