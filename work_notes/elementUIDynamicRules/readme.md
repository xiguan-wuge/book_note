### elementUI 动态切换rules

#### 场景
> 一个form表单中，一个属性值的改变（当该属性值不为空时，校验表单; 为空时，不校验,即rule = {}）

#### 问题
> 问题本质：即使两个表单绑定的值不同，但是浏览器在解析时，先解析第一个表单，此时表单上是没有绑定ref，之后再解析第二个表单时，浏览器发现这它的prop和第一个表单的prop一样，所以就认为这两个表单是同一个表单，就没有重新渲染，而ref本身是作为渲染结果被创建的，所以第二个表单没能成功绑定ref，验证就无法生效。

#### 解决思路
> - 给表单添加key值，用某个值来判断，区分是两个表单; 
> - 动态切换rules

#### code

```
html:

<el-form ref="form" :v-model="form" :rules="formRules" :key="`${visible ? 'fom1' : 'fom2'}`">

js: 

computed: {
  formRules () {
    return this.visible ? {} : {
      props1： [
        { required: true, message: '请输入props', trigger: 'blur' }
      ]
    }
  }
}

```