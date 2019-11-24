### 基于el-select 的全选功能

#### 功能包含
> - 点击“全部”， 选择全部
> - 已在全选状态下， 点击“全选”，则全不选
> - 在全选状态下， 点击“非全选项”， 取消全选和取消该项
> - 在非全选状态下， 点击其余所有“非全选项”， 则“全部”高亮，点击“全部”，取消全部选择
> - 支持“新增页”中使用和“编辑页”中使用

#### 功能实现 （几种思路，各有优劣）
1. 思路1:   
全选项包含在el-select的v-model值之中 
tips: 需要后端配合处理全选项（新增页面中的el-select提交值后，需要后端对'all'， 处理；在编辑页中，需要后端将'all'返回（若包含全选））   
思路： 借用旧值（oldValue），将change事件中的value值（新值）和 oldValue 做上述功能if判断；在初始化时，将初始值赋值给旧值；每次change方法执行最后，修改旧值


```
<template>
  <div class="hello">
    <el-select
      v-model="searchList"  
      multiple
      collapse-tags
      @change="changeSelect"
      placeholder="请选择类型查询">
      <el-option 
        v-for="(type,ind) in typeList" 
        :key="ind" 
        :label="type.label" 
        :value="type.value"></el-option>
    </el-select>
  </div>
</template>
<script>
...
data() {
    return {
      searchList: [
        // "all",
        // "01",
        // "02",
        // "03",
        // "04",
        // "05",
      ],
      oldsearchList: [],
      typeList: [
        { value: "all", label: "全部" },
        { value: "01", label: "item1" },
        { value: "02", label: "item2" },
        { value: "03", label: "item3" },
        { value: "04", label: "item3" },
        { value: "05", label: "item4" },
      ],
    }
},
mounted() {
    // 将初始值赋值给旧值
    this.oldsearchList =this.searchList
    // 取出所有项的value
    this.typeList.forEach(item => {
      this.allValueList.push(item.value)
    })
  },
methods: {
    changeSelect(val) {
      // 保留所有值
      const allValues = this.allValueList;

      // 用来储存上一次的值，可以进行对比
      const oldVal = this.oldsearchList
        // this.oldsearchList.length === 0 ? this.oldsearchList : [];

      // 若是全部选择
      if (val.includes("all")) this.searchList = allValues;

      // 取消全部选中 上次有 当前没有 表示取消全选
      if (oldVal.includes("all") && !val.includes("all"))
        this.searchList = [];

      // 点击非全部选中 需要排除全部选中 以及 当前点击的选项
      // 新老数据都有全部选中
      if (oldVal.includes("all") && val.includes("all")) {
        const index = val.indexOf("all");
        val.splice(index, 1); // 排除全选选项
        this.searchList = val;
      }

      // 全选未选 但是其他选项全部选上 则全选选上 上次和当前 都没有全选
      if (!oldVal.includes("all") && !val.includes("all")) {
        if (val.length === allValues.length - 1)
          this.searchList = ["all"].concat(val);
      }

      // 储存当前最后的结果 作为下次的老数据
      this.oldsearchList = this.searchList;
    },

</script>
```   

2. 思路2:   
用一个option做“全选”与取消全选的功能，在change事件中，将''从el-select数组中删除；computed中判断el-select数组的长度是否等于options列表的长度，true -> “取消全选”； false -> “全选”

```
    <div style="margin-top: 100px;overflow:hidden;">
      <el-select
      v-model="selectVal"
      multiple
      collapse-tags
      @change="changeSelect1"
      placeholder="请选择类型查询"
    >
    <!-- 该option不用于添加数据，仅用于“全选”或“取消全选”， 添加样式，以作区分-->
    <el-option :label="allText" value="" class="all" style="
    background: teal;"></el-option>
      <el-option 
        v-for="(type,index) in typeList1" 
        :key="index" 
        :label="type.label" 
        :value="type.value"></el-option>
    </el-select>

    ...
    // data: 
      data() {
        return {
          typeList1: [
              { value: "01", label: "item1" },
              { value: "02", label: "item2" },
              { value: "03", label: "item3" },
            ],
            selectVal: [],
        }
      },
    // computed
    computed: {
      allText() {
        return this.selectVal.length === this.typeList1.length ? '取消全部' : '选择全部'
      }
  },
  methods: {
    changeSelect1(val) {
      if(val.length && val.indexOf('') > -1) {
        // 不将“全部”添加到el-selct数组中
        val.forEach((item, index, self) => {
          if(item === '') {
            self.splice(index, 1)
          }
        })
        if(val.length === this.typeList1.length) {
          // 取消全选
          this.selectVal = []
        }else {
          // 全选， 保持el-select中的选中顺序，将为添加的option添加el-select数组中
          this.typeList1.forEach(item => {
            if(val.indexOf(item.value) === -1) {
              val.push(item.value)
            }
          })
        }
      }
    },
  }
```