import React from "react";
import {
  List,
  Picker,
  Switch,
  DatePicker,
  WhiteSpace,
  NavBar,
  Toast,
  Modal
} from "antd-mobile";
import { createForm } from "rc-form";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { get, findIndex, loop } from "lodash";
import AddOptions from "./AddOptions";
import { namespace } from "@/models/addVote";
import { getSelectOption, getPlulicWays } from "@/utils/tool";
import { HEADER_ITEMS, ADD_VOTE_OPTIONS_ITEM } from "@/constants";
import dayjs from "dayjs";
import Icon from '@/component/Icon'
import { namespace as globalNamespace } from "@/models/global";
import { Pickers, SELECT_RADIO_ITEMS } from "@/constants/addVote";
import VoteType from "./VoteType";
import SelectImageItem from "./SelectImageItem";
import GroupItem from "./GroupItem";
import styles from "./style.module.less";
import PickerUser from "./PickerUser";

const alert = Modal.alert;

class FormWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUers: [],
      height: 0,
      offsetTop: 0,
      show: false
    };
    
    this.getPickerEmit = this.getPickerEmit.bind(this)
  }

  static getDerivedStateFromProps(nextProps, preState) {
    const height =
      document.documentElement.clientHeight -
      preState.offsetTop -
      nextProps.footBtnsHeight -
      1;
    return { height };
  }

  setDraftsValue = () => {
    // 设置草稿箱初始值
    const id = get(this.props, "id");
    const details = get(this.props, `draftsDetails.${id}`);
    const subject = get(details, "subject");
    const des = get(details, "des");
    const rstOpen = parseInt(get(details, "rstOpen"), 10) ? false : true;
    const maxPerGroupTag = get(details, "maxPerGroupTag") ? true : false;
    const commentCensorFlag = get(details, "commentCensorFlag") ? true : false;
    const endDate = new Date(dayjs(get(details, "endDate")).valueOf());
    const multiMax = [get(details, "multiMax")];
    const multiMin = [get(details, "multiMin")];
    const typeOpen = [parseInt(get(details, "typeOpen") || 0, 10)];
    const type = get(details, "type") === "3" ? true : false;
    let options = get(details, "options");
    if (maxPerGroupTag) {
      const arr = [];
      options.forEach(item => {
        const index = findIndex(arr, { groupName: get(item, "groupTag") });
        const option = {
          optionSubject: {
            key: "optionSubject",
            path: "/editTextarea/optionSubject",
            value: get(item, "subject")
          },
          optionInfo: {
            key: "optionInfo",
            path: "/editTextarea/optionInfo",
            value: get(item, "optionInfo.content") || ""
          },
          image: get(item, "optionInfo.cover") || ""
        };
        if (index !== -1) {
          arr[index].options.push(option);
        } else {
          arr.push({
            groupName: get(item, "groupTag"),
            optionSubject: {
              key: "optionSubject",
              path: "/editTextarea/optionSubject"
            },
            optionInfo: {
              key: "optionInfo",
              path: "/editTextarea/optionInfo"
            },
            options: [option]
          });
        }
      });
      options = arr;
    } else {
      options = options.map(option => {
        return {
          optionSubject: {
            key: "optionSubject",
            path: "/editTextarea/optionSubject",
            value: get(option, "subject")
          },
          optionInfo: {
            key: "optionInfo",
            path: "/editTextarea/optionInfo",
            value: get(option, "optionInfo.content") || ""
          },
          image: get(option, "optionInfo.cover") || ""
        };
      });
    }
    let selectRange = [];
    // if (get(details, "joinUserIds")) {
    //   console.log('details.joinUserIds',details.joinUserIds)
    //   const joinUserIdsArr = get(details, "joinUserIds").split(',')
    //   const joinUserNamesArr = get(details, "joinUserNames").split(',')
    //   selectRange = joinUserIdsArr.map((userId, index) => {
    //     return {
    //       userId,
    //       userName: get(joinUserNamesArr, index) || ''
    //     }
    //   })
    // }

    // 将详情中的已选用户和已选组织回显到选人组件
    if(details.joinUserIds || details.joinOrgIds) {
      let joinUserIdsArr = []
      let joinOrgIdsArr = []
      let joinUserNameArr = []
      let joinOrgNameArr = []
      if(details.joinUserIds) {
        joinUserIdsArr = details.joinUserIds.split(',')
        joinUserNameArr = details.joinUserNames.split(',')
      }
      if(details.joinOrgIds) {
        joinOrgIdsArr = details.joinOrgIds.split(',')
        joinOrgNameArr = details.joinOrgNames.split(',')
      }

      const rebackArr =  []
      joinUserIdsArr.forEach((userId,index) => {
        if(userId) {
          selectRange.push({
            userId,
            userName: joinUserNameArr[index] || '',
            isParent:false
          })
          rebackArr.push({
            id: userId,
            name: joinUserNameArr[index] || '',
            isParent:false
          })
        }
      })

      joinOrgIdsArr.forEach((userId,index) =>{
        if(userId) {
          selectRange.push({
            userId,
            userName: joinOrgNameArr[index],
            isParent:true
          })
          rebackArr.push({
            id: userId,
            name: joinOrgNameArr[index],
            isParent:true
          })
        }
      })
      this.setState({
        selectedUers:rebackArr
      })
    }
    this.props.form.setFieldsValue({
      rstOpen,
      maxPerGroupTag,
      commentCensorFlag,
      endDate,
      multiMax,
      multiMin,
      type,
    });
    this.props.dispatch({
      type: `${namespace}/setState`,
      payload: {
        subject,
        des,
        rstOpen,
        typeOpen,
        maxPerGroupTag,
        commentCensorFlag,
        endDate,
        multiMax,
        multiMin,
        type,
        options,
        joinUserIds: selectRange
      }
    });
  };

  componentDidUpdate(preProps) {
    const id = get(this.props, "id");
    const details = get(this.props, `draftsDetails.${id}`);
    const preDetails = get(preProps, `draftsDetails.${id}`);
    if (id && !preDetails && details) {
      this.setDraftsValue();
    }
  }

  componentDidMount() {
    console.log('componentDidMount-props',this.props)
    this.props.onRef(this);
    const offsetTop = ReactDOM.findDOMNode(this.form).parentNode.offsetTop;
    this.setState({
      offsetTop
    });
    this.setDefaultRange()
  }
  // 在离开新增页面后，再返回新增页面时，将投票范围回显
  setDefaultRange = () => {
    console.log('setDefaultRange',this.props.joinUserIds)
    let arr = []
    this.props.joinUserIds.forEach(item => {
      arr.push({
        id: item.userId,
        name: item.userName,
        isParent: item.isParent
      })
    })
    this.setState({
      selectedUers: arr
    })

  }
  addVoteSelects = () => {
    const OPTION_MAX_CEILING =
      get(this, "props.config.OPTION_MAX_CEILING") || 2;
    const GROUP_MAX_CEILING = get(this, "props.config.GROUP_MAX_CEILING") || 2;
    const optionLength = get(this, "props.options.length");
    const maxPerGroupTag = true;
    const maxOption = maxPerGroupTag ? GROUP_MAX_CEILING : OPTION_MAX_CEILING;
    if (optionLength < maxOption) {
      this.props.dispatch({
        type: `${namespace}/setState`,
        payload: {
          options: [...this.props.options, ADD_VOTE_OPTIONS_ITEM]
        }
      });
    } else {
      Toast.info(`最多添加${maxOption}个${maxPerGroupTag ? "题目" : "选项"}`);
    }
  };

  delOption = i => {
    const maxPerGroupTag = get(this, "props.maxPerGroupTag");
    if (get(this.props, `options.length`) <= 1) {
      return Toast.fail(
        `删除失败，至少需要一个${maxPerGroupTag ? "题目" : "选项"}`
      );
    }
    let options = this.props.options.filter((item, index) => {
      return index !== i;
    });
    if(JSON.parse(sessionStorage.getItem('groupArr'))){

  
    let a=JSON.parse(sessionStorage.getItem('groupArr'));
    let groupTag=''
    if(a.groupArr[i]){
       groupTag=a.groupArr[i].groupTag
    }
   
    if(a.options){
      a.options=a.options.filter(item=>item.groupTag!==groupTag)
    }
   if( a.groupInfoList&&a.groupInfoList[i]){
    a.groupInfoList.splice(i,1)
   }
   if(a.groupArr&&a.groupArr[i]){
    a.groupArr.splice(i,1)
   }

  
   sessionStorage.setItem('groupArr',JSON.stringify(a))
  }
    this.props.dispatch({
      type: `${namespace}/setState`,
      payload: {
        options
      }
    });
  };
  getPickerEmit(value) {
    this.setState({
      show: false,
    })
    if(!value || (!value.length)) {
      return
    }
    const data = []
    const arr = []
    value.forEach(item => {
      data.push({
        userId: item.id,
        userName: item.name,
        isParent: item.isParent
      })
      arr.push({
        id: item.id,
        name: item.name,
        isParent: item.isParent
      })
    })
    this.setState({
      selectedUers: arr
    })
    this.props.dispatch({
      type: `${namespace}/setState`,
      payload: {
        joinUserIds: data
      }
    });
  }
  selectRange = () => {
    // 使用自定义组件
    this.setState({
      show: true
    })
    // 企信jssdk
    // jssdk.selectUser({
    //   // id: "mine",
    //   ignoreself: 1,
    //   selecteduids: joinUserIds,
    //   maxLimit: 999,
    //   success: selectData => {
    //     const data = get(JSON.parse(decodeURI(selectData)), "EIM.newUser").map(
    //       item => {
    //         return {
    //           userId: get(item, "userid"),
    //           userName: get(item, "username")
    //         };
    //       }
    //     );
    //     this.props.dispatch({
    //       type: `${namespace}/setState`,
    //       payload: {
    //         joinUserIds: data
    //       }
    //     });
    //   },
    //   fail(data) {
    //     alert(data);
    //   }
    // });
  };

  renderItemComponent = item => {
    let value = this.props[item.key] || "";
    if (value && Array.isArray(value) && item.key === 'joinUserIds') {
      value = value.map(user => user.userName).join(",");
    }
    return (
      <List key={item.key}>
        <List.Item
          extra={value || item.placeHolder}
          arrow="horizontal"
          onClick={() => {
            item.path &&
              this.props.routePage(item.path, `initialValue=${value || ''}`);
            item.click && item.click();
          }}
          className={value ? 'black' : 'gray'}
        >
          {item.title}
        </List.Item>
      </List>
    );
  };

  saveVote = args => {
    const formValues = this.props.form.getFieldsValue([
      "endDate",
      "typeOpen",
      "commentCensorFlag",
      "rstOpen",
      "type",
      "maxPerGroupTag",
    ]);
    const subject = get(this.props, "subject"); // 标题
    const des = get(this.props, "des"); //描述
    // 最多选项
    const multiMax =
      get(formValues, "multiMax") && get(formValues, "multiMax")[0];
    // 最少选项
    const multiMin =
    get(formValues, "multiMin") && get(formValues, "multiMin")[0]||1;
    // 截止时间
    const endDate = dayjs(get(formValues, "endDate")).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    // 是否分组
    const groupTag = get(formValues, "maxPerGroupTag");
    // 是否图片投票
    const type = get(formValues, "type");
    // 评论审核
    const commentCensorFlag = get(formValues, "commentCensorFlag");
    const rstOpen = get(formValues, "rstOpen");
    const typeOpen =
      get(formValues, "typeOpen") && get(formValues, "typeOpen")[0];
    const groupOptions = [];
    var groupInfoList= [];
    var groupInfoList2 = [];
    let arr={}
    // console.log(this.props.options)
    // if(sessionStorage.getItem('groupArr')){
    //   console.log('1')
    //   console.log(JSON.parse(sessionStorage.getItem('groupArr')))
    //    arr=JSON.parse(sessionStorage.getItem('groupArr'))
    //   groupInfoList2=arr.groupInfoList
    //   groupInfoList=groupInfoList2.filter(item=>{
    //     item.groupItems=item.options
    //         return item.groupTag&&item.groupTag!==''
    //   })
    // }else{



      console.log('2')
      if(groupTag && get(args, 'state') !== 0 ) {
        const multiMin =
        (get(formValues, "multiMin") && get(formValues, "multiMin")[0])||2;
        for(let i = 0; i < this.props.options.length; i += 1) {
          const option = this.props.options[i];
          if(!get(option, 'options.length') || (get(option, 'options.length') < multiMin)) {
            return Toast.fail(`题目选项不能为空`);
          }
        }
      }
      console.log(this.props)
      const options = this.props.options
      .map((option,index) => {
        if(option.groupName){
        if(option.groupName!==undefined||option.groupName!==''){
        let obj={}
        obj.groupTag=option.groupName
        obj.multiMax=option.multiMax
        obj.multiMin=option.multiMin
        obj.sort=index+1
        let groupItems=[];
        const arr = get(option, "options") || [];
        arr.forEach((arrItem,key)=>{
          console.log(arrItem)
          let newObj={}
          newObj.subject=get(arrItem, "optionSubject.value") || '';
          newObj.groupTag=get(option, "groupName") || '';
          newObj.multiMax=get(option, "multiMax") || 1;
          newObj.multiMin=get(option, "multiMin") || 1;
          newObj.optionInfo={
            content: get(arrItem, "optionInfo.value") || '',
            contentHtml: get(arrItem, "optionInfo.value") || '',
            cover: type ? (get(arrItem, "image") || "") : ""
          }
          groupItems.push(newObj)
        })
        obj.groupItems=groupItems;
        groupInfoList.push(obj)
      }
    }
      })
      .filter(Boolean);
      let arrSession=[],arrList=[];
       if(sessionStorage.getItem('groupArr')){
        arr=JSON.parse(sessionStorage.getItem('groupArr'))
        arrList=arr.groupInfoList
        arrSession=arrList.filter(item=>{
          item.groupItems=item.options
              return item.groupTag&&item.groupTag!==''
        })
    }
    console.log(groupInfoList)

      arrSession.forEach(item=>{
        if(item.createDate){
          delete item.createDate
        }
        if(item.id){
          delete item.id
        }
        if(item.updateDate){
          delete item.updateDate
        }
        if(item.options){
          delete item.options
        }
      })

  console.log(arrSession)
  let arrTotal=arrSession.concat(groupInfoList)
  arrTotal=arrTotal.filter(item=>{
    return item.multiMax!=undefined
  })
  console.log(arrTotal)
    let params = {
      groupInfoList:arrTotal,
      subject,
      des,
      // options: groupTag ? groupOptions : options,
      maxPerGroupTag: groupTag ? 1 : 0, // 题目
      type: type ? 3 : 2, // 图片投票
      commentCensorFlag: commentCensorFlag ? 1 : 0, //评论审核
      rstOpen: rstOpen ? "0" : "1", // 是否隐藏投票结果 0隐藏 1公开
      typeOpen, //投票结果公开方式
      endDate, //截止时间
      ...args
      // state, // 发布或存草稿箱
    };
    // const joinUserIds = get(this.props, "joinUserIds")
    //   .map(item => item.userId)
    //   .join(",");
    // if (joinUserIds) {
    //   params.joinUserIds = joinUserIds;
    // } else {
    //   params.allJoin = 1; // 如果不选择投票范围，则对所有人可见
    // }
    
    // 区分组织id和用户id
    let userArr = []
    let orgArr = []
    let cascaders = []
    this.props.joinUserIds.forEach(item => {
      if(item.isParent) {
        orgArr.push(item.userId)
        cascaders.push(1)
      } else {
        userArr.push(item.userId)
      }
    })
    if(userArr.length || orgArr.length) {
      params.joinUserIds = userArr.join(',')
      params.joinOrgIds = orgArr.join(',')
      params.joinOrgCascades = cascaders.join(',')
    } else {
      params.allJoin = 1;
    }
    const error = this.validateParams(params);
    if (error) {
      return Toast.fail(error);
    }
    if (params.state === 1 && params.allJoin === 1) {
      return alert("", "您未选择投票范围，默认将发送给所有人，请知悉", [
        { text: "取消", onPress: loop },
        {
          text: "确定",
          onPress: () => {
            this.props.dispatch({
              type: `${namespace}/saveVote`,
              payload: {
                ...params,
              }
            });
          }
        }
      ]);
    }
    return this.props.dispatch({
      type: `${namespace}/saveVote`,
      payload: {
        ...params,
      }
    });
  };

  validateParams = ({
    subject,
    multiMax,
    multiMin,
    groupInfoList,
    maxPerGroupTag,
    state,
    type
  }) => {
    if (!subject) {
      // fix:QX-37105
      return "标题不能为空";
    }

    // fix: 保存草稿时不应该所有字段都做校验，只要填写标题就应该可以保存
    if (state !== 0) {
      if (multiMin > multiMax) {
        return "最少选项不得大于最多选项";
      }
   
      if (get(groupInfoList, "length")) {
        if (maxPerGroupTag) {
          for (let i = 0; i < this.props.options.length; i += 1) {
            const groupName = get(this.props.options, `${i}.groupName`);
            if (!groupName) {
              return "题目不能为空";
            }
          }
        } else {
          if ((state === 1 || state === 5) && get(groupInfoList, "length") < multiMin) {
            return `选项不得少于${multiMin}项`
          }
          for (let i = 0; i < groupInfoList.length; i += 1) {
            const subject = get(groupInfoList, `${i}.subject`);
            if (!subject) {
              return "选项不能为空";
            }
          }
        }
      } else {
        return "请输入选项";
      }

      if (type === 3) {
        // QX-36428 移动端，图片投票上传图片改为必填项，否则不上传图片，详情页无占位图，已跟产品和UI确认
        if (!!this.props.maxPerGroupTag) {
          for (let i = 0; i < this.props.options.length; i += 1) {
            const optionsArr = get(this, `props.options.${i}.options`) || []
            for(let j = 0; j < optionsArr.length; j += 1) {
              const image = get(optionsArr, `${j}.image`);
              if (!image) {
                return "封面-图片不能为空";
              }
            }
          }
        } else {
          for (let i = 0; i < this.props.options.length; i += 1) {
            const image = get(this.props.options, `${i}.image`);
            if (!image) {
              return "封面-图片不能为空";
            }
          }
        }
      }
    }
  };
  // ShowPickerUser() {
  //   let node = null
  //   if(this.state.show) {
  //     node = <PickerUser show={this.state.show} selected={this.state.selectedUers} emitToFrom={this.getPickerEmit}/>
  //   }
  //   return node
  // }
  render() {
    const { getFieldProps } = this.props.form;
    const {show, selectedUers} = this.state
    // const {show, selectedUers} = this.state
    const selectData = getSelectOption(
      parseInt(get(this.props, "config.MULTI_MAX_CEILING") || 24)
    );
    const publicWays = getPlulicWays();
    const groupTag = this.props.form.getFieldValue("maxPerGroupTag");
    const id = get(this.props, "id") || "";
    const {getPickerEmit} = this
    const ShowPickerUser = function() {
      let node = null
      if(show) {
        // node = <PickerUser show={this.state.show} selected={this.state.selectedUers} emitToFrom={this.getPickerEmit}/>
        node = <PickerUser show={show} selected={selectedUers} emitToFrom={getPickerEmit}/>
      }
      return node
    }
    return (
      <>
        <NavBar
          className={styles.navBar}
          icon={<Icon className={styles.left} onClick={this.props.goBack}  type={require('@/assets/icons/svg/nav_icon_return.svg')} color="#fff" /> }
          rightContent={
            <div
              onClick={() => {
                this.saveVote({
                  state: 1,
                  id
                });
              }}
            >
              发布
            </div>
          }
        >
          新建投票
        </NavBar>
        <div className={styles.whiteBlock}></div>
        <form className="add-vote">
          <div
            ref={el => (this.form = el)}
            style={{
              height: this.state.height,
              overflow: "auto"
            }}
          >
            {HEADER_ITEMS.map(item => {
              return this.renderItemComponent(item);
            })}
            <WhiteSpace className={styles.blockLowHeight}/>
            <>
              {this.renderItemComponent({
                key: "joinUserIds",
                placeHolder: "请选择",
                title: "投票范围",
                click: this.selectRange
              })}
              <List>
                <DatePicker
                  minDate={new Date()}
                  {...getFieldProps("endDate", {
                    initialValue: get(this.props, "endDate")
                  })}
                  onChange={(date) => {
                    this.props.dispatch({
                      type: `${namespace}/setState`,
                      payload: {
                        endDate: date
                      }
                    });
                    this.props.form.setFieldsValue({
                      endDate: date
                    });
                  }}
                >
                  <List.Item arrow="horizontal" className={get(this.props, "endDate") ? 'black' : 'gray'}>截止时间</List.Item>
                </DatePicker>
              </List>
              {SELECT_RADIO_ITEMS.map((item,index) => {
                return (
                  <React.Fragment key={item.key} >
                    <List  className={item.key=='maxPerGroupTag'?styles.displayNone:''} >
                    <List.Item
                      extra={
                        <Switch
                          {...getFieldProps(item.key, {
                            initialValue: get(this.props, `${item.key}`),
                            valuePropName: "checked"
                          })}
                          onClick={checked => {
                            this.props.dispatch({
                              type: `${namespace}/setState`,
                              payload: {
                                [item.key]: checked
                              }
                            });
                            this.props.form.setFieldsValue({
                              [item.key]: checked
                            });
                          }}
                        />
                      }
                      className={get(this.props, `${item.key}`) ? 'black' : 'gray',(index===2||index===3)?styles.displayNone:''}
                    >
                      {item.title}
                    </List.Item>
                  </List>
                  {item.key === 'rstOpen' && !this.props.form.getFieldValue("rstOpen") && (
                    <List>
                      <Picker
                        data={publicWays}
                        cols={1}
                        {...getFieldProps("typeOpen", {
                          initialValue: get(this.props, "typeOpen")
                        })}
                        className="forss"
                        onChange={val => {
                          this.props.dispatch({
                            type: `${namespace}/setState`,
                            payload: {
                              typeOpen: val
                            }
                          });
                          this.props.form.setFieldsValue({
                            typeOpen: val
                          });
                        }}
                      >
                        <List.Item arrow="horizontal" className={get(this.props, "typeOpen") ? 'black' : 'gray'}>投票结果公开方式</List.Item>
                      </Picker>
                    </List>
                  )}
                  </React.Fragment>
                );
              })}
              {Pickers.map(item => {
                return (
                  <List key={item.key} className={styles.displayNone}>
                    <Picker
                      data={selectData}
                      cols={1}
                      {...getFieldProps(item.key, {
                        initialValue: get(this.props, `${item.key}`)
                      })}
                      className="forss"
                      onChange={val => {
                        this.props.dispatch({
                          type: `${namespace}/setState`,
                          payload: {
                            [item.key]: val
                          }
                        });
                        this.props.form.setFieldsValue({
                          [item.key]: val
                        });
                      }}
                    >
                      <List.Item arrow="horizontal" className={get(this.props, `${item.key}`) ? 'black' : 'gray'}>{`${groupTag ? '同分组': ''}${item.title}`}</List.Item>
                    </Picker>
                  </List>
                );
              })}
            </>
            <WhiteSpace className={styles.blockLowHeight} />
            <List
              renderFooter={
                <AddOptions
                  addVoteSelects={this.addVoteSelects}
                  isGroup={!!groupTag}
                />
              }
              className="addVote-list"
            >
              {this.props.options.map((item, index) => {
                const query = `index=${index}`;
                
                if (groupTag) {
                  // 题目
                  return (
                    <GroupItem
                      key={index}
                      index={index}
                      routePage={this.props.routePage}
                      delOption={this.delOption}
                      isInputImageText={!!this.props.form.getFieldValue("type")}
                      item={item}
                    />
                  );
                }
                if (this.props.form.getFieldValue("type")) {
                  // 图文投票
                  return (
                    <SelectImageItem
                      key={index}
                      query={query}
                      item={item}
                      index={index}
                      routePage={this.props.routePage}
                      delOption={this.delOption}
                    />
                  );
                }
                return (
                  <VoteType
                    key={index}
                    query={query}
                    item={item}
                    index={index}
                    routePage={this.props.routePage}
                    delOption={this.delOption}
                  />
                );
              })}
            </List>
            <WhiteSpace size="xl" />
          </div>
        </form>
        <ShowPickerUser/>
      </>
    );
  }
}

const mapStateToProps = models => {
  return {
    ...models[namespace],
    config: get(models, `${globalNamespace}.config`)
  };
};

const BasicInputWrapper = connect(mapStateToProps)(
  createForm({ name: "add-vote" })(FormWrapper)
);

export default BasicInputWrapper;
