为什么函数是一等公民
在js中，函数不仅拥有一切传统函数的使用方式（声明和调用），而且可以做到像简单值一样：
赋值：（var func = function(){}）;
传参：（function func(x, callback){callback(x)}）;
返回：（function(){return function(){}}）
这样的函数也称之为第一级函数，不仅如此，js中函数还充当了类的构造函数的作用，同时又是一个Function类的实例，这样的多重身份