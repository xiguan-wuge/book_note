import React, { Component } from 'react';
import styles from "./style.module.less";
import { namespace } from "@/models/addVote";
import { connect } from "react-redux";
import { getTreeData } from '@/services'
import { Toast } from "antd-mobile";
import Icon from '@/component/Icon'
import { CSSTransition } from 'react-transition-group';
import { times } from 'lodash';
class PickerUser extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      headerTitle: '请选择人员',
      inputValue: '',
      showSearchCancel: false,
      searchList: [],
      currentselectedList: [], // 已选人员id
      list: [],
      navList: [
        {
          name:'选择人员',
          id: ''
        }
      ],
      isShowSelected: false,
      allTree: {}, // 所有组织
      allSelected: [], // 已选组织（人员）
    }
    this.back = this.back.bind(this);
    this.searchCancel = this.searchCancel.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.clearInput = this.clearInput.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.selectPeople = this.selectPeople.bind(this);
    this.showAllSelected = this.showAllSelected.bind(this);
    this.getList = this.getList.bind(this);
    this.getOrgsDetail = this.getOrgsDetail.bind(this);
    this.clickNavItem = this.clickNavItem.bind(this);
    this.onInputKeyup = this.onInputKeyup.bind(this);
    this.comfirm = this.comfirm.bind(this);
    this.repalceChildren = this.repalceChildren.bind(this);
    this.findTargetList = this.findTargetList.bind(this);
    this.updateTreeDown = this.updateTreeDown.bind(this);
    this.findTargetObj = this.findTargetObj.bind(this);
    this.echoCheckedFromApply = this.echoCheckedFromApply.bind(this);
    this.echoSearchList = this.echoSearchList.bind(this);
    // this.judgeHalfChecked = this.judgeHalfChecked.bind(this);
  }
  componentWillMount () {
    this.allTreeTemp = {}
    this.list = []
    this.allSelectedTemp = [] // 所有已选数组（从组织树中收集而来），用于提交
    this.hasCheckedList = this.props.selected // 已选数组（从申请页传递过来的数据），用于回显
    this.allSearchedList = [] // 搜索结果选中的人员（未添加到组织树中的部分，添加到组织树中的部分需要剔除）
    
  }
  componentDidMount() {
    this.getList('',false,)
  }
  back() {
    this.props.emitToFrom([])
  }
  handleInput(e) {
    this.setState({
      inputValue: e.target.value
    })
  }
  handleFocus() {
    this.setState({
      showSearchCancel: true
    })
  }
  clearInput() {
    this.setState({
      inputValue: ''
    })
  }
  checkSelected(item) {
    const { listItemImgActive, listItemImg } = styles
    const { checked } = item
    let style = listItemImg
    if(checked) {
      style = listItemImgActive
    } else {
      this.allSearchedList.forEach(search =>{
        if(search.id === item.id) {
          style = listItemImgActive
        }
      })
    }
    return style;
  }
  showAllSelected() {
    let {currentselectedList, isShowSelected} = this.state
    if(currentselectedList.length) {
      this.setState({
        isShowSelected: !isShowSelected
      })
    } else {
      this.setState({
        isShowSelected: false
      })
    }
  }
  selectPeople(item,type) {
    const searchList = this.state.searchList
    let checkedStatus = !item.checked
    // 更新已选组织列表
    const chooseIndex = this.hasCheckedList.findIndex(hasCheck => {
      return item.id === hasCheck.id
    })
    if(chooseIndex > -1) {
      this.hasCheckedList.splice(chooseIndex,1)
    }
    const searchIndex = this.allSearchedList.findIndex(search => {
      return search.id === item.id
    })
    if(searchIndex > -1) {
      this.allSearchedList.splice(searchIndex,1)
    }
    let inTree = false
    // 修改组织树里的状态(选中)
    this.findTargetObj(this.allTreeTemp, item.id, (obj) => {
      obj.checked = checkedStatus
      inTree = true
      this.updateTreeDown(obj, checkedStatus)
      // 检查同级组织是否全部被选中
      if(item.pId) {
        this.watchParentCheckStatus(item.pId)
      }
    })
    // 搜索新增
    if(type === 'search') {
      if(!inTree && checkedStatus) {
        item.checked = true
        this.allSearchedList.push(item)
      }
      searchList.forEach(search => {
        if(search.id === item.id) {
          search.checked = checkedStatus
        }
      })
      this.setState({
        searchList: searchList
      })
    }
    if(type === 'show') {
      // const searchIndexOfShow = this.allSearchedList.forEach(search => {
      //   return search.id === item.id 
      // })
      // if(searchIndexOfShow > -1) {
      //   this.allSearchedList.slice(searchIndexOfShow,1)
      // }
      searchList.forEach(search => {
        if(search.id === item.id) {
          search.checked = checkedStatus
        }
      })
      this.setState({
        searchList: searchList
      })
    }
    this.computedAllSelected()
    this.setState({
      list: this.list
    })
    if(!this.allSelectedTemp.length) {
      this.setState({
        isShowSelected: false
      })
    }
  }
  searchCancel(){
    this.setState({
      showSearchCancel: false,
      inputValue: '',
      searchList: []
    })
  }
  // 回车触发搜索
  onInputKeyup(e) {
    if(e.keyCode === 13) {
      this.getList(this.state.inputValue,true)
    }
  }
  // 判断当前组织的下级是否全部选中，
  // 全部选中，则将当前组织的状态设为选中
  // 否在，当前组织状态设为不选中
  watchParentCheckStatus(parentId) {
    const source = this.allTreeTemp
    this.findTargetObj(source, parentId, (obj) => {
      if(!obj.children) {
        // 最顶级组织（或者是人员），无下即组织，退出查找
        return; 
      } else if(obj.children && obj.children.length) {
        let checkedAll = true
        obj.children.forEach(item => {
          checkedAll = checkedAll && item.checked
        })
        obj.checked = checkedAll
        if(obj.pId) {
          // 继续判断上一级是否全选
          this.watchParentCheckStatus(obj.pId)
        }
      }
    })
  }
  // 查找目标组织，执行回调
  findTargetObj (sourceObj, targetId, callback) {
    if(!targetId) {
      // 目标组织为最顶层组织
      callback(sourceObj)
      return;
    } else if(targetId && sourceObj.id === targetId) {
      callback(sourceObj)
      return;
    } else if(sourceObj.children && sourceObj.children.length) {
      sourceObj.children.forEach(item => {
        this.findTargetObj(item, targetId, callback)
      })
    }
  }
  // 向下修改组织状态
  updateTreeDown (targetObj, checked) {
    targetObj.checked = checked
    if(targetObj.children && targetObj.children.length) {
      targetObj.children.forEach(item => {
        this.updateTreeDown(item, checked)
      })
    }
  }
  // 判断当前项是否在已选组织中,若存在 则修改状态
  echoCheckedFromApply(obj) {
    let hasChecked = false
    this.hasCheckedList.forEach(item => {
      if(item.id === obj.id) {
        hasChecked = true
      }
    })
    if(hasChecked) {
      obj.checked = true
    }
  }
  // 1. 回显当前组织的已选状态（从已选组织中对比）a.修改最顶级组织的状态, b.修改子组织的状态
  // 2. 替换目标children（递归生成组织树）
  repalceChildren(sourceObj, targetId, replaceList) {
    // 判断是否在已选数组中
    if(!sourceObj.pId && !sourceObj.checked) {
      this.echoCheckedFromApply(sourceObj)
    }
    if(sourceObj.id === targetId) {
      // 若组织树中已存在改数据列表，则不替换 （为维护已修改的选中）
      if(!sourceObj.children) {
        const { checked } = sourceObj
        replaceList.forEach( item => {
          item.checked = checked
          if(!checked) {
            this.echoCheckedFromApply(item)
          }
        })
        sourceObj.children = replaceList
      }
    } else if(sourceObj.isParent && sourceObj.children && sourceObj.children.length) {
      sourceObj.children.forEach(item => {
        this.repalceChildren(item, targetId, replaceList)
      })
    }
  }
  // 递归查找某组织的下级组织，用于替换显示列表
  findTargetList(sourceObj, parentId) {
    if(!parentId) {
      this.list = [sourceObj]
      return;
    } else if(sourceObj.id && sourceObj.id === parentId && sourceObj.children){
      this.list = sourceObj.children
      return;
    } else if(sourceObj.isParent && sourceObj.children) {
      sourceObj.children.forEach(item => {
        if(item.children) {
          this.findTargetList(item, parentId)
        }
      })
    }
  }
  // 接口，获取下级组织
  getList(val,isSearch,nav) {
    getTreeData(val || '', isSearch).then(res => {
      if(res.isSearch) {
        if(!res.data.length) {
          Toast.info('暂无搜索结果');
        } else {
          // const result = this.echoSearchList(res.data)
          this.setState({
            searchList: res.data
          })
        }
      } else {
        if(res.data.length) {
          const data = res.data.map(item => {
            return {
              ...item,
              checked: false
            }
          })
          // 生成组织树
          if(data.length === 1 && !data[0].pId) {
            // 若是空对象则赋值，否则，保持原有数据状态
            const arr = Object.keys(this.allTreeTemp)
            if(!arr.length) {
              this.allTreeTemp = data[0]
            }
          }
          // } else {
          //   this.repalceChildren(this.allTreeTemp, val, data)
          // }
          this.repalceChildren(this.allTreeTemp, val, data)
          this.findTargetList(this.allTreeTemp, val)
          if(!val) {
            this.computedAllSelected()
          }
          if(nav) {
            const { navList } = this.state 
            navList.push({
              id: nav.id, 
              name: nav.name
            })
            this.setState({
              navList:navList,
            },() => {
              this.refs.navListContent.scrollTo(9999,0)
            })
          }
          this.setState({
            list: this.list,
          },()=>{
            this.refs.currentList.scroll(0,0)
            
          })
        } else {
          Toast.info('暂无数据');
        }
        
      }
    }).catch(err => {
      console.log('getOrgsOrUsers-err', err)
    })
  }
  // 将组织树的选中状态回显到搜索列表（取消使用）
  // 由于搜索结果列表项无上级组织id，无法准确回显出当前项在组织树中的状态，所以不回显
  echoSearchList(list) {
    let result = []
    list.forEach(item =>{
      let checkedStatus = false
      let inTree = false
      this.findTargetObj(this.allTreeTemp,item.id,(targetObj) =>{
        checkedStatus = targetObj.checked
        inTree = true
      })
      // 回显以搜索组织里的状态
      if(!checkedStatus) {
        let searchedIndex = this.allSearchedList.findIndex(search =>{
          return search.id === item.id
        })
        if(searchedIndex > -1) {
          checkedStatus = true
        }
      }
      // 从已选列表中查找是否有当前项
      if(!inTree && !checkedStatus) {

      }
      item.checked = checkedStatus
      item.inTree = inTree
      result.push(item)
    })
    return result
  }
  // 切换搜索列表的人员的选中状态
  toggleSearchItem(item , index) {
    const checked = !!item.checked
    let inTree = false
    this.findTargetObj(this.allTreeTemp,item.id,(targetObj) =>{
      inTree = true
      targetObj.checked = !checked
      // 搜索结果是人员列表，无下级组织，检查同级组织状态改变对上级组织的影响即可
      if(item.pId) {
        this.watchParentCheckStatus(item.pId)
      }
    })
    if(!inTree) {
      // 由于搜索列表中无pId,在组织树中找不到对应项，就无需更改上下级状态
      const searchedIndex = this.allSearchedList.findIndex(search =>{
        return search.id === item.id
      })
      if(searchedIndex === -1) {
        this.allSearchedList.push(item)
      } else {
        this.allSearchedList.splice(searchedIndex,1)
      }
    }
    item.checked = !checked
    const searchList = this.state.searchList
    searchList[index] = item
    this.setState({
      searchList: searchList,
    })
    this.computedAllSelected()
  }
  getOrgsDetail(item) {
    if(item.isParent) {
      const {id, name} = item
      this.getList(id,false,{id,name})
    }
  }
  checkListItemMore(isParent) {
    const {listItemMore, displayNone} = styles
    return isParent ? listItemMore : displayNone
  }
  clickNavItem(item,index) {
    const {navList} = this.state
    if(index === navList.length -1) {
      return
    }
    let arr = []
    if(index) {
      arr=navList.slice(0,index+1)
    } else {
      arr = [{name: '选择人员', id: ''}]
    }
    this.setState({
      navList:arr
    })
    const id = item.id
    this.getList(id,false)
  }
  // 统计所有已选人员
  computedAllSelected() {
    // debugger;
    this.allSelectedTemp = []
    this.getNodeSelected(this.allTreeTemp)
    
    // 添加展开组织树时已选items
    if(!this.allSelectedTemp.length) {
      this.allSelectedTemp = this.hasCheckedList.map(item => {
        return {
          ...item,
          checked: true
        }
      })
    } else if(this.hasCheckedList.length) {
      this.allSelectedTemp.forEach(item => {
        this.hasCheckedList.forEach(hasItem => {
          if(item.id === hasItem.id) {
            hasItem.inTree = true
          }
        })
      })
      

      // const choosed = this.hasCheckedList.filter(item => {
      //   return !item.isTree
      // })
      let choosed = []
      this.hasCheckedList.forEach(item => {
        if(!item.inTree) {
          choosed.push({
            ...item,
            checked: true
          })
        }
      })
      this.allSelectedTemp = [].concat(this.allSelectedTemp,choosed)
      this.hasCheckedList = choosed
    }
    
    // 添加搜索列表中选中的items
    if(!this.allSelectedTemp.length) {
      this.allSelectedTemp = this.allSearchedList
    } else if(this.allSearchedList.length) {
      this.allSelectedTemp.forEach(item => {
        this.allSearchedList.forEach(hasItem => {
          if(item.id === hasItem.id) {
            hasItem.inTree = true
          }
        })
      })
      // const searched = this.allSearchedList.filter(item => {
      //   return !item.isTree
      // })
      let searched = []
      this.allSearchedList.forEach(item => {
        if(!item.inTree) {
          searched.push({
            ...item,
            checked: true
          })
        }
      })
      this.allSelectedTemp = [].concat(this.allSelectedTemp, searched)
      this.allSearchedList = searched
    }

    this.setState({
      currentselectedList: this.allSelectedTemp
    })
  }
  // 收集组织树中已选组织（人员）
  getNodeSelected(sourceObj) {
    if(sourceObj.checked) {
      this.allSelectedTemp.push(sourceObj)
    }
    if(!sourceObj.children) {
      // 当前是人员，无需向下查找
      return;
    } else if(sourceObj.children){
      // 当前是组织
      if(sourceObj.checked) {
        // 当前组织已选中，下级默认选中，无需向下查找
      } else if(sourceObj.children.length){
        sourceObj.children.forEach(item => {
          this.getNodeSelected(item)
        })
      }
    }
  }
  comfirm() {
    this.computedAllSelected()
    console.log('confirm',this.allSelectedTemp)
    this.props.emitToFrom(this.allSelectedTemp)
  }
  // // css 样式未生效，暂用钩子函数添加过渡样式
  onEnter(el) {
    el.style.backgroundColor="rgba(0,0,0,0)"
    
  }
  onEntering(el) {
    el.style.backgroundColor="rgba(0,0,0,0.3)"
    el.style.transition="background-color 0.5s"
  }
  onExit(el) {
    el.style.backgroundColor="rgba(0,0,0,0.3)"
  }
  onExiting(el) {
    el.style.backgroundColor="rgba(0,0,0,0)"
    el.style.transition="background-color 0.3s"
  }
  // onExited(el) {
  //   // el.style.display = 'none'
  //   console.log('onExited')
  // }
  onListEnter(el) {
    el.style.transform="translateY(100%)"
    
  }
  onListEntering(el) {
    el.style.transform="translateY(0)"
    el.style.transition="transform 0.3s"
  }
  onListExit(el) {
    el.style.transform="translateY(0)"
  }
  onListExiting(el) {
    el.style.transform="translateY(100%)"
    el.style.transition="transform 0.3s"
  }
  render() {
    const { show } = this.props;
    if(show) {
      const {
        inputValue, 
        navList,
        isShowSelected,
        currentselectedList
      } = this.state
      const {
        displayNone, 
        pickerNav, 
        pickerList,
        navItemIcon, 
        pickerSelectedListMask,
        selectedIconUp,
        overflowHidden
      } = styles
      const searchContenStyle = this.state.showSearchCancel ? styles.searchContent : styles.searchContentAll
      const searchCancelStyle = this.state.showSearchCancel ? styles.searchCancel : styles.searchCancelHide
      const searchDelStyle = inputValue ? styles.searchDel : styles.searchDelHide
      const searchListStyle = this.state.searchList.length ? styles.searchList : displayNone

      // 渲染dom
      return (
        <div className={styles.pickerUser} >
          <div className={styles.pickerHeader}>
            <Icon className={styles.headerSvg} 
              type={require('@/assets/icons/svg/nav_icon_return.svg')} color="#fff"
              onClick={this.back}/>
            <div className={styles.headerText}>{this.state.headerTitle}</div>
          </div>
          <div className={styles.pickerSearch}>
            <div className={searchContenStyle}>
              <div className={styles.searchIcon}></div>
              <input value={this.state.inputValue} 
                onChange={this.handleInput} 
                placeholder="请输入关键字搜索"
                onFocus={this.handleFocus}
                onKeyUp={this.onInputKeyup}/>
              <div className={searchDelStyle} onClick={this.clearInput}></div>
            </div>
            <div className={searchCancelStyle} 
              onClick={this.searchCancel}>
                取消
            </div>
          </div>
          {/* 搜索结果列表 */}
          <div className={searchListStyle}>
            {
              this.state.searchList.map((item,index) => {
                return (
                  <div className={styles.listItemWrapper} key={item.id}>
                    <div className={styles.checkImgWrapper}
                      onClick={()=> {this.selectPeople(item, 'search')}}>
                      <div className={this.checkSelected(item)}></div>
                    </div>
                    <div className={styles.listItemText}>{item.name}</div>
                  </div>
                )
              })
            }
          </div>
          {/* 已选组织层级列表 */}
          <div className={navList.length? pickerNav : displayNone} id="navList">
            <div className={styles.navContent} ref="navListContent">
              {
                navList.map((nav, navIndex) => {
                  return (
                    <div className={styles.navItem} 
                      key={nav.id}
                      onClick={()=>{this.clickNavItem(nav,navIndex)}}>
                      <span className={styles.navItemText}>{nav.name}</span>
                      <div className={navList.length -1 === navIndex ? displayNone: navItemIcon}></div>
                    </div>
                  )
                })
              }
            </div>
          </div>
          {/* 当前组织列表 */}
          <div className={`${pickerList} ${isShowSelected ? overflowHidden:''}`} ref="currentList">
            {
              this.state.list.map((item) => {
                const checkedCss = this.checkSelected(item)
                return (
                  <div className={styles.listItemWrapper} key={item.id}>
                    <div className={styles.checkImgWrapper}
                      onClick={()=> {this.selectPeople(item, 'list')}}>
                      <div className={checkedCss}></div>
                    </div>
                    <div className={styles.listItemText}
                      onClick={()=> {this.getOrgsDetail(item)}}>{item.name}</div>
                    <div className={this.checkListItemMore(item.isParent)} 
                      onClick={()=> {this.getOrgsDetail(item)}}></div>
                  </div>
                )
              })
            }
          </div>
          {/* 已选人员或者组织列表 */}
          <CSSTransition 
            in={isShowSelected}
            timeout={300}
            classNames="fade"
            unmountOnExit
            appear={true}
            onEnter={this.onEnter}
            onEntering={this.onEntering}
            onExit={this.onExit}
            onExiting ={this.onExiting}>
            <div className={pickerSelectedListMask} onClick={()=> {
                this.setState({
                  isShowSelected: false
                })
              }}
            ></div>
          </CSSTransition>
          <CSSTransition
            in={isShowSelected}
            timeout={300}
            classNames="list"
            unmountOnExit
            appear={true}
            onEnter={this.onListEnter}
            onEntering={this.onListEntering}
            onExit={this.onListExit}
            onExiting ={this.onListExiting}>
            <div className={styles.selectedList}>
              {
                this.state.currentselectedList.map((item) => {
                  return (
                    <div className={`${styles.listItemWrapper} ${styles.listItemRight}`} key={item.id}>
                      <div className={styles.checkImgWrapper}
                        onClick={()=> {this.selectPeople(item, 'show')}}>
                          <div className={this.checkSelected(item)}></div>
                      </div>
                      <div className={styles.listItemText}>
                        {item.name}
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </CSSTransition>
          {/* footer */}
          <div className={styles.pickerFooter}>
            <div className={styles.pickerFooterLeft} onClick={this.showAllSelected}>
              <div className={currentselectedList.length ? '': displayNone}>
                已选人员（{currentselectedList.length}）
              </div>
              <div className={`${currentselectedList.length ? selectedIconUp : displayNone} ${isShowSelected ? styles.selectedIconDown: ''}`}></div>
            </div>
            <div className={styles.pickerFooterRight}>
              <div className={styles.btn} onClick={this.comfirm}>确定</div>
            </div>
          </div>
        </div>
      )
    } else {
      return null
    }
  }
    
}
const mapStateToProps = models => ({
  ...models[namespace]
});

export default connect(mapStateToProps)(PickerUser)