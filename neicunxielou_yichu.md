内存泄漏：占用的内存不需要用到了但是没有及时释放。
内存溢出：程序运行所需的内存大于可用内存，出现内存溢出的错误。(程序运行的错误，就想水杯，满了之后再加水，就会溢出。)   内存溢出一般是由内存泄漏造成的。

内存泄漏一般有一下几个： 
- 全局变量引起的内存泄漏： 
根据js垃圾回收机制，全局变量是不会被回收的,当程序关闭时，回收全局变量，释放内存，所以当一些意外的、不需要的全局变量变多了，没有释放，就造成了内存泄漏。
- 闭包引起的内存泄漏：
闭包其实是跟全局变量挂钩，但是闭包只是因为被全局变量引用了，内部的变量因为被闭包引用得不到释放，也会造成内存泄漏。
- 计时器、回调、监听等事件没有移除：
计时器、回调、监听等事件没有移除，是一直存在的，即对应的内存没有被释放，就会造成内存泄漏。
给DOM添加属性或方法：也会造成变量引用得不到释放，造成内存泄漏。
