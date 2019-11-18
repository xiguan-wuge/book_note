### 回显el-tabs

#### 场景
> 使用elementUI中的el-tab做为标签分页，点击第二个标签页后，再点击“详情”，跳转路由，再返回时，一般el-tab回到第一个标签，需要实现的功能是调到详情之前选中那个标签，返回时，就回到那个标签

#### 实现思路
> 通过tab-click 方法将tab页参数写入到当前路由中，在返回时，在当前页的mounted中取路由参数并赋值

#### code
- 当前页面
```
<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
    <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
    <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
    <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
  </el-tabs>
</template>
<script>
  export default {
    data() {
      return {
        activeName: 'second'
      };
    },
    methods: {
      handleClick(tab, event) {
        console.log(tab, event);
        this.$router.replace({
          name: 'currentRoute', // 当前页面的路由名
          query: {
            activeName: this.activeName
          }
        })
      }
    },
    mounted() {
      let routeActiveName = this.$route.query.activeName
      if(routeActiveName) {
        this.activeName = routeActiveName
      }
    }
  };
</script>
```

- 详情页
```
methods: {
  back() {
    this.$router.back()
  }
}
```