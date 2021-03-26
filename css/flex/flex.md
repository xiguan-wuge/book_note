flex 总结
felxBox布局，目前最流行的布局方式之一，最大特性为可以让flex项目可伸缩，即可以让flex项目高度/宽度自动填充剩余空间或者缩小flex项目来适配flex容器的不足。
 flex的兼容性：移动端基本兼容，pc端存在部分不兼容，尤其是IE,具体兼容性如下图


注意：设为flex后，子元素的float、clear、vertical-align属性将失效
基本概念
flex容器，flex元素


容器属性
1. flex-diraction：决定主轴的方向，默认row
flex-direction:row | row-reverse | column | column-reverse 
2. flex-wrap:主轴上一行排列不下时，定义如何换行。默认nowrap
flex-wrap: nowrap | wrap | wrap-reverse
3. flex-flow: flex-direction 和flex-wrap的简写，默认 row nowrap
4. justify-content: 定义主轴对其方式，默认flex-start
justify-content: flex-start | flex-end | center | space-between | space-around
5. align-items: 定义交叉轴对齐方式，默认flex-start
align-items: flex-start | flex-end | center | baseline | stretch
6.定义多根轴线的对齐方式，如果只有一根轴线，则不起作用
align-content: flex-start | flex-end | center | space-between | sapce-around | stretch
flex项目属性
1. order 定义排列顺序，数值越小，排列越靠前，默认为0
2. flex-grow 定义项目的放大比例，默认为1
3. flex-shrink 定义项目的缩小比例，默认为1，即如果项目空间不足，该项目将缩小
4. flex-basis 定义项目在分配多余空间之前的的初始宽度/高度，默认auto.
5. flex是flex-grow flex-shrink flex-basis的简写 默认值是 0 1 auto
6. align-self 允许单个项目有与其他项目不一样的对齐方式，可以覆盖align-items属性，默认是auto


子元素宽高自适应原理：
关键词： flex-grow、 flex-shrink、 flex-basis、min-content max-content
min-content：宽度取决于内容中最长的单词宽度
max-content: 计算内容排列整行的宽度（容器宽度不够，就会溢出）
参考链接：
1. 自适应原理：https://zhuanlan.zhihu.com/p/50449041
2. 阮一峰flex:  http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html