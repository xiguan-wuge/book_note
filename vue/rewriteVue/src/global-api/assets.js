const ASSETS_TYPE = ['component', 'directive', 'filter']
export default function initAssetsRegister(Vue) {
    ASSETS_TYPE.forEach(type => {
      Vue[type] = function(id, definition) {
        if(type === 'component') {
          // this 指向Vue ??
          // 全局组件注册
          // 自组件可能也有extend方法，VueComponent.component
          definition = this.options._base.extend(definition)
        }
        this.options[type+'s'][id] = definition
      }
    })
}