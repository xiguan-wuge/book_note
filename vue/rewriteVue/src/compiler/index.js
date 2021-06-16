import {parse} from './parse'
import {generate} from './codegen'
import _class from '../../../../../vue/vue@2x/vueSourceCode/vue/src/platforms/web/compiler/modules/class'

export function compileToFunction(template) {
  // 需要把html字符串转换成render函数
  // 1. 把html转换成ast语法树
    // ast用来描述代码本身形成树结构，可以描述html、css、js
  let ast = parse(template)
  // 2. 优化静态节点
  // 不影响主流程代码，暂不实现
  // if(option.optimise !== false) {
  //   optimise(ast, options)
  // }

  // 3. 通过ast 重新生成代码
    // 最后生成的代码需要和render函数一样，
    // 类似于 _c('div', {id: 'app'}, _c('div', undefined, _v('hello'+_s(name))...
    // _c代表创建元素，_v代表创建文本，

    let code = generate(ast)
    // 使用with 修改this,后面调用render函数可以使用call改变this, 方便code里面的变量取值
    let renderFn = new Function(`with(this){return ${code}}`)
    return renderFn
}
