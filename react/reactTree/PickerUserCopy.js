import React, { Component } from 'react';
import styles from "./style.module.less";
import { namespace } from "@/models/addVote";
import { connect } from "react-redux";
import { getTreeData } from '@/services'
import { Toast } from "antd-mobile";
import Icon from '@/component/Icon'
import { CSSTransition } from 'react-transition-group';
const selected = [
  0, //未选中
  1, // 全选
  2, // 未全选
]
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
      allTreeData: {}, // 组织树的数据
      choosedUser:[], // 已选组织
      choosedOrg: [], // 已选人员
      cancelUser:[], // 从已选组织（人员）里取消的人员
      cancelOrg: [], //从已选组织（人员）里取消的组织
      currentPageList: [], // 当前组织列表
      currentPageSelcted: [], // 当前页已选组织（人员）
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
    this.cancelOrgFromSelected = this.cancelOrgFromSelected.bind(this);
    this.findParent = this.findParent.bind(this);
    this.findChilren = this.findChilren.bind(this);
  }
  componentWillMount () {
    this.setState({
      currentselectedList: this.props.selected
    })
  }
  componentDidMount() {
    this.getList('',false,null, 0)
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
  // 查找指定组织
  findTarget(item, isUp) {
    console.log('findTarget',item)
    const { allTreeData } = this.state
    const { orgPath } = item
    let result = null
    // 查找上级
    if(isUp) {
      
    }
  }
  // 向上查找上级
  findParent(item) {
    const { allTreeData } =this.state
    const parent = this.findTarget(item, true)
  }
  // 向上查找下级
  findChilren(item) {
    const { allTreeData } =this.state
  }
  // 判断当前节点是否的选中状态： 不选/全选/半选
  checkSelected(item) {
    const { selectedStatus, orgPath } = item
    const { listItemImgActive, listItemImgNotAllSelected, listItemImg } = styles
    // const index = this.state.currentselectedList.findIndex((selected)=> {
    //   return selected.id === item.id
    // }) 
    // const style = index >-1 ? listItemImgActive : listItemImg

    // const parent = item.pId ? this.findParent(item) : null
    // const children = item.isParent ? this.findChilren(item) : null
    const style = selectedStatus === 0 ? listItemImg: selectedStatus === 1 ? listItemImgActive : listItemImgNotAllSelected
    return style
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
  // 删除已选人员或者组织
  // 从当前组织向上查找，将已选组织
  cancelOrgFromSelected(item) {
    // console.log('cancelOrgFromSelected',item)
    const { orgPath, pId } = item
    const { allTreeData, cancelUser, cancelOrg, choosedOrg, choosedUser } = this.state
    if(orgPath && orgPath.length > 1 && pId) {
      // console.log('up')
      // 存在上级,
      const path = orgPath.slice(0, orgPath.length - 1)
      let target = []
      // console.log('path',path)
      path.forEach(pathItem => {
        if(pathItem === '0') {
          target = allTreeData
        } else {
          target = allTreeData.children
        }
      })
      // console.log('cancel-target',target)
      if(item.isParent) {
        cancelOrg.push(item)
        // console.log('cancelOrg00',cancelOrg)
      } else {
        cancelUser.push(item)
        // console.log('cancelUser00',cancelUser)
      }
      // 将上级中所有组织添加到choosedOrg/choosedUser
      if(target.children) {
        // 顶层组织
        target.selectedStatus = 0
        const index = choosedOrg.findIndex(org => {
          return org.id === item.id
        })
        if(index > -1) {
          choosedOrg.splice(index, 1)
        }
        this.setState({
          cancelOrg:cancelOrg,
        })
       
      } else {
        // 非顶层组织
        // console.log('not top 111')
        Object.keys(target).forEach(targetItem => {
          const targetIndexInChoosed = -1
          if(targetItem.isParent) {
            targetIndexInChoosed = choosedOrg.findIndex(choosed => {
              return choosed.id === targetItem.id
            })
            if(targetIndexInChoosed > -1) {

            }
          }
        })
      }
      
    }
  }

  selectPeople(item) {
    // console.log('selectPeople',item)
    let {id,selectedStatus} = item
    const {currentselectedList, isShowSelected, list, choosedUser, choosedOrg} = this.state
    // 修改页面的组织item状态
    const page = list
    page.forEach(pageItem => {
      if(pageItem.id ===id) {
        pageItem.selectedStatus = pageItem.selectedStatus === 0 ? 1 : 0
      }
    })
    // 修改已选组织（人员）数组
    const index = currentselectedList.findIndex(selected => {
      return item.id === selected.id
    })
    let arr = []
    if(index > -1) {
      arr = currentselectedList.splice(index,1)
    } else {
      arr = currentselectedList.push({
        name:item.name,
        id:item.id,
        isParent: item.isParent,
        orgPath: item.orgPath,
        selectedStatus: item.selectedStatus
      })
    }
    // console.log('selectedStatus',selectedStatus)
    // 修改组织或人员数组（用于接口请求的数组）
    if(item.isParent) {
      // 通过当前item的选中状态来判断时新增还是从已选里删除
      if(!selectedStatus) {
        choosedOrg.push({
          name:item.name,
          id:item.id,
          isParent: item.isParent,
          orgPath: item.orgPath,
          selectedStatus: item.selectedStatus
        })
      } else {
        // const orgIndex = choosedOrg.findIndex(selected => {
        //   return item.id === selected.id
        // })
        // orgIndex > -1 && choosedOrg.splice(orgIndex, 1)
        this.cancelOrgFromSelected(item)
      }
      
    } else {
      if(!selectedStatus){
        choosedUser.push({
          name:item.name,
          id:item.id,
          isParent: item.isParent,
          orgPath: item.orgPath,
          selectedStatus: item.selectedStatus
        })
      } else {
        // const userIndex = choosedUser.findIndex(selected => {
        //   return item.id === selected.id
        // })
        // userIndex > -1 && choosedUser.splice(userIndex,1)
        this.cancelOrgFromSelected(item)
      }
    }
    
    this.setState({
      currentselectedId: arr,
      list: page,
      isShowSelected: !currentselectedList.length && isShowSelected,
      choosedUser: choosedUser,
      choosedOrg: choosedOrg
    }, () => {
      // console.log('choosedOrg', this.state.choosedOrg)
      // console.log('choosedUser', this.state.choosedUser)
      // console.log('currentselectedId', this.state.currentselectedId)
      // console.log('list', this.state.list)
    })
    // if(!currentselectedList.length && isShowSelected) {
    //   this.setState({
    //     isShowSelected: false
    //   })
    // }
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
  
  getList(val,isSearch,orgPath, selected) {
    // console.log('getList-selected',selected)
    // console.log('orgPath',orgPath)
    getTreeData(val || '', isSearch).then(res => {
      // console.log('val-----',val)
      if(res.isSearch) {
        this.setState({
          searchList: res.data
        })
        if(!res.data.length) {
          Toast.info('暂无搜索结果');
        }
      } else {
        const data = res.data
        // this.setState({
        //   list: data
        // })
        // 缓存当前组织树
        if(val) {
          // 非顶级组织
          let treeDataCopy = JSON.parse(JSON.stringify(this.state.allTreeData))
          let target = {}
          // 查找需要添加子组织的组织（成为目标组织）
          orgPath.forEach(item => {
            if(item === '0') {
              target = treeDataCopy
            } else {
              if(target.children) {
                target = target.children[item]
              }
            }
            
          })
          // 给目标组织添加子组织
          target.children = {}
          const orgList = []
          data.forEach(listItem => {
            const newOrgPath = [...orgPath, listItem.id]
            const addItem = {
              ...listItem,
              orgPath: newOrgPath,
              selectedStatus: selected
            }
            const orgId = listItem.id
            target.children[orgId] =addItem
            orgList.push(addItem)
          })
          // console.log('treeDataCopy1', treeDataCopy)
          this.setState( {
            allTreeData: treeDataCopy,
            list: orgList,
            currentPageList: orgList
          },() => {
            // console.log('set not top',this.state.allTreeData)
          })
        } else {
          // 顶级组织
          const topObj = {
            ...data[0],
            orgPath: ['0'],
            selectedStatus: selected
          }
          this.setState({
            allTreeData: topObj,
            list: [topObj],
            currentPageList: [topObj]
          },()=> {
            // console.log('set top',this.state.allTreeData)
          })
        }
        
      }
    }).catch(err => {
      console.log('getOrgsOrUsers-err', err)
    })
  }
  getOrgsDetail(item) {
    // console.log('getOrgsDetail', item)
    const {id, name, orgPath, selectedStatus} = item
    const { navList } = this.state 
    navList.push({id, name, orgPath})
    this.setState({
      navList: navList
    })
    // console.log('selectedStatus',selectedStatus)
    this.getList(id, false, orgPath, selectedStatus)
  }
  setSelectedSatus(status, list) {
    
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
  comfirm() {
    let result = []
    this.setState({
      isShowSelected: false
    })
    result = this.state.currentselectedList
    this.props.emitToFrom(result)
  }
  // css 样式未生效，暂用钩子函数添加过渡样式
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
              this.state.searchList.map((item) => {
                return (
                  <div className={styles.listItem} key={item.id}>
                    <div className={this.checkSelected(item)}
                      onClick={()=> {this.selectPeople(item)}}></div>
                    <div className={styles.listItemText}
                      onClick={()=> {this.selectPeople(item)}}>{item.name}</div>
                  </div>
                )
              })
            }
          </div>
          {/* 已选组织层级列表 */}
          <div className={navList.length? pickerNav : displayNone} id="navList">
            <div className={styles.navContent}>
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
          <div className={`${pickerList} ${isShowSelected ? overflowHidden:''}`}>
            {
              this.state.list.map((item) => {
                return (
                  <div className={styles.listItem} key={item.id}>
                    <div className={this.checkSelected(item)}
                      onClick={()=> {this.selectPeople(item)}}></div>
                    <div className={styles.listItemText}
                      onClick={()=> {this.selectPeople(item)}}>{item.name}</div>
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
                    <div className={`${styles.listItem} ${styles.listItemRight}`} key={item.id}>
                      <div className={this.checkSelected(item)}
                        onClick={()=> {this.selectPeople(item)}}>
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
              <div  
              className={`${currentselectedList.length ? selectedIconUp : displayNone} ${isShowSelected ? styles.selectedIconDown: ''}`}></div>
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