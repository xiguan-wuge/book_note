import React, { Component } from 'react';
import styles from "./style.module.less";
import { namespace } from "@/models/addVote";
import { connect } from "react-redux";
import { getTreeData } from '@/services'
import { Toast } from "antd-mobile";
import Icon from '@/component/Icon'
// import { CSSTransition } from 'react-transition-group';
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
      allTree: [], // 所有组织树
      allSelectedList: [], // 所有已选人员/组织
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
    this.setListData = this.setListData.bind(this);
  }
  componentWillMount () {
    this.setState({
      currentselectedList: this.props.selected
    })
  }
  componentDidMount() {
    this.getList('',false)
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
  // 判断选中状态
  checkSelected(item) {
    const { listItemImgActive, listItemImgHalfActive, listItemImg } = styles
    const { allSelectedList } = this.state
    let index = -1
    allSelectedList.forEach((selected,i)=> {
      if(selected.id === item.id) {
        index = i
      }
    })
    let style = listItemImg
    if(index > -1) {
      style = listItemImgActive
    } else if(item.status === 1) {
      style = listItemImgActive
    } else if(item.status === 2) {
      style = listItemImgHalfActive
    }
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
  selectPeople(item) {
    debugger;
    let allSelectedListTemp = JSON.parse(JSON.stringify(this.state.allSelectedList))
    let allTreeTemp = JSON.parse(JSON.stringify(this.state.allTree))
    let listTemp = JSON.parse(JSON.stringify(this.state.list))
    // const {currentselectedList, isShowSelected} = this.state
    const index = allSelectedListTemp.findIndex(selected => {
      return item.id === selected.id
    })
    if(index > -1) {
      allSelectedListTemp.splice(index, 1)
      // 手动取消选中，需要将当前取消选中，同时下级取消选中
      if(item.isParent) {
        allTreeTemp.forEach(treeItem => {
          if(treeItem.pId === item.id) {
            treeItem.status = 0
          }
          if(treeItem.id == item.id) {
            treeItem.status = 0
          }
        })
      }
      // 修改list
      listTemp.forEach(listItem => {
        if(listItem.id === item.id) {
          listTemp.status = 0
        }
      })
      // 修改上一级
      if(item.pId) {
        let parentStatus = 1
        allTreeTemp.forEach(treeItem => {
          let noChoosed = true
          if(treeItem.pId === item.pId) {
            noChoosed = noChoosed && treeItem.status === 0
          }
          if(noChoosed) {
            parentStatus = 0
          } else {
            parentStatus = 2
          }
        })
        allTreeTemp.forEach(treeItem => {
          if(treeItem.id === item.pId) {
            treeItem.status = parentStatus
          }
        })

        // 修改已选组织
        if(parentStatus === 2) {
          const targetIndex = allSelectedListTemp.findIndex( targetItem => {
            return targetItem.id === item.pId
          })
          allSelectedListTemp.splice(targetIndex,1)
          allTreeTemp.forEach(treeItem => {
            if(treeItem.pId === item.pId && treeItem.id !== item.id) {
              allSelectedListTemp.push(treeItem)
            }
          })
        } else {
          let arr = []
          allSelectedListTemp.forEach(selectedItem => {
            if(selectedItem.pId !== item.pId && selectedItem.id !== item.pId) {
              arr.push(allSelectedListTemp)
            }
          })
          allSelectedListTemp = arr
        }
      }
      
    } else {
      allSelectedListTemp.push({
        name:item.name,
        id:item.id,
        isParent: item.isParent,
        pId: item.pId || ''
      })
      // 修改list
      listTemp.forEach(listItem => {
        if(listItem.id === item.id) {
          listTemp.status = 1
        }
      })
      if(item.isParent) {
        allTreeTemp.forEach(treeItem => {
          if(treeItem.pId === item.id) {
            treeItem.status = 1
          }
          if(treeItem.id == item.id) {
            treeItem.status = 1
          }
        })
      }
      // 修改上一级
      if(item.pId) {
        let parentStatus = 0
        allTreeTemp.forEach(treeItem => {
          let allChoosed = true
          // let noChoosed = true
          if(treeItem.pId === item.pId) {
            allChoosed = allChoosed && treeItem.status === 1
            // noChoosed = noChoosed && treeItem.status === 0
          }
          if(allChoosed) {
            parentStatus = 1
          } else {
            parentStatus = 2
          }
        })
        allTreeTemp.forEach(treeItem => {
          if(treeItem.id === item.pId) {
            treeItem.status = parentStatus
          }
        })
        // 修改已选组织
        if(parentStatus === 2) {
          const targetIndex = allSelectedListTemp.findIndex( targetItem => {
            return targetItem.id === item.pId
          })
          allSelectedListTemp.splice(targetIndex,1)
          allTreeTemp.forEach(treeItem => {
            if(treeItem.pId === item.pId && treeItem.id !== item.id) {
              allSelectedListTemp.push(treeItem)
            }
          })
        }
      }
      

    }
    this.setState({
      allSelectedList: allSelectedListTemp,
      allTree: allTreeTemp,
      list: listTemp
    },() => {
      console.log('allSelectedList',this.state.allSelectedList)
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
  // 将接口请求的数组做选中状态的修改
  setListData(list) {
    // debugger;
    const { allSelectedList, allTree } = this.state
    let result = []
    list.forEach(item => {
      let status = 0
      const index = allSelectedList.findIndex(selectedItem => {
        return selectedItem.id === item.id
      })
      if(index > -1) {
        status = 1
      } else {
        // 区分方法： 
        // 1.存在上级，拿到上级的状态
        //   11.上级选中，则当前选中
        //   12.上级非选中，则
        let parent = null 
        allTree.forEach(treeItem => {
          if(treeItem.id === item.pId) {
            parent = treeItem
          }
        })
        if(parent) {
          const parentStatus = parent.status
          if(parentStatus === 0) {
            status = 0
          } else if(parentStatus === 1) {
            status = 1
          } else {
            if(item.isParent) {
              // 遍历下级组织来判断状态
              const pId = item.id
              if(allTree.length) {
                let allChoosed = true
                let noChoosed = true
                allTree.forEach(treeItem => {
                  if(treeItem.pId === pId) {
                    allChoosed = allChoosed && treeItem.status === 1
                    noChoosed = noChoosed && treeItem.status === 0
                  }
                })
                if(allChoosed) {
                  status = 1
                } else if(noChoosed) {
                  status = 0
                } else {
                  status = 2
                }
              } else {
                // 所有组织树未空，即未选中
                status = 0
              }
            } else {
              // 未在已选中数组，又是人员; 
              // 判断父级组织状态
              status = 0
              allTree.forEach(innerTreeItem => {
                if(innerTreeItem.id === item.id) {
                  status = innerTreeItem.status
                }
              })
            }
          }
        }
      }

      result.push({
        ...item, 
        status: status
      })
    })
    return result
  }
  getList(val,isSearch) {
    let allTreeTemp = JSON.parse(JSON.stringify(this.state.allTree))
    getTreeData(val || '', isSearch).then(res => {
      const changedData = this.setListData(res.data)
      if(res.isSearch) {
        this.setState({
          searchList: changedData
        })
        if(!res.data.length) {
          Toast.info('暂无搜索结果');
        }
      } else {
        if(val) {
          allTreeTemp = [].concat(allTreeTemp, changedData)
        } else {
          allTreeTemp = changedData
        }
        this.setState({
          list: changedData,
          allTree: allTreeTemp
        },() => {
          console.log('list',this.state.list)
          console.log('allTree',this.state.allTree)
        })
        
      }
    }).catch(err => {
      console.log('getOrgsOrUsers-err', err)
    })
  }
  getOrgsDetail(item) {
    const {id, name} = item
    const { navList } = this.state 
    navList.push({id, name})
    this.setState({
      navList:navList
    })
    this.getList(id,false)
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
          {/* <CSSTransition 
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
          </CSSTransition> */}
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