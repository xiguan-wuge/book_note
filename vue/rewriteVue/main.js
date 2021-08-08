import Vue from './src/index.js'
console.log('html vue', Vue)
// 全局组件
// Vue.components('parent-component', { 
//   template: '<div>全局组件</div>'
// })
// 初始化vue项目
let vm = new Vue({
  el: '#app',
  data() {
    return {
      name: '123',
      arr: [
        { name: 'zhangsan' },
        { name: 'zhangsan2' },
        { name: 'zhangsan3' },
        { name: 'zhangsan4' },
      ]
    }
  },
  computed: {
    computedName() {
      return `张${this.name}`
    }
  },
  created() {
    console.log('this is inner created')
  },
  // watch 例子
  watch: {
    name(newVal, oldVal) {
      console.log('watch', newVal)
    },
    // 其他几种写法
    // name: {
    //   handler(newVal, oldVal) {
    //     console.log('object-watch', newVal)
    //   },
    //   deep: true
    // },
    // name: [
    //   {
    //     handler(newVal, oldVal) {
    //       console.log('array-watch', newVal)
    //     },
    //     deep: true
    //   }
    // ],
    // name: 'doSomething'
  },
  methods: {
    doSomething() {
      console.log('do something')
    }
  },
  // router,
  // store,
  //  render: (h) => h(App)
  // render(h => {
  //   return h('div', {id: 'aaa'}, 'hello')
  // })
  // <parent-component/>
  // 
  // template: '<div id="aaa">hello {{name}}</div>'
  template: `<div id="a">
        hello 用户组件{{name}}
        <div class="zhang">{{JSON.stringify(arr)}}</div>
        <div v-for="(item, index) in arr"> {{item.name}}</div>
        <child-component/>
      </div>`,
  // 局部组件
  components: {
    'child-component': {
      template: `<div>局部组件</div>`
    }
  }
})

Vue.mixin({
  created() {
    console.log('this is outer created')
  }
})

// setTimeout(() => {
//   vm.a = '456'
//   // 调用更新
//   vm._update(vm._render())
// })

setTimeout(() => {
  vm.name = '4444'
  vm.name = '555'
  vm.name = '66'
  // 当我们每次修改数据时，渲染watcher都会去执行一次，这个是影响性能的
})