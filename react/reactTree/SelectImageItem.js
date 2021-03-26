import React, { Component } from "react";
import { connect } from "react-redux";
import { namespace } from "@/models/addVote";
import { namespace as editTextareaNameSpace } from "@/models/editTextarea";
import { namespace as editGroupNameSpace } from "@/models/editGroup";
import { List, Toast, Modal } from "antd-mobile";
import IconComponent from "@/component/Icon";
// import { toBase64 } from "@/utils/tool";
import { get, loop } from 'lodash'
import styles from "./style.module.less";

const editImage = require('@/assets/image/edit.png')

const addImage = require('@/assets/image/list_icon_add.png')

const alert = Modal.alert;
const getBase64Image = function (img) {  
  var canvas = document.createElement("canvas");  
  canvas.width = img.width;  
  canvas.height = img.height;  
  var ctx = canvas.getContext("2d");  
  ctx.drawImage(img, 0, 0, img.width, img.height);  
  var ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();  
  var dataURL = canvas.toDataURL("image/"+ext);  
  return dataURL;  
}  
class SelectImageItem extends Component {
  addImage = () => {
    const that = this
    window.wx.chooseImage({
      count: 1,             //可以实现多选
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: function (res) {
        const localId = res.localIds[0]
          window.wx.getLocalImgData({
            localId,
            success: function(res) {
              const localData = res.localData
              const imgSrc = [localData]
              const isEditGroup = !!get(that.props, 'isEditGroup')
              that.props.dispatch({
                type: `${isEditGroup? editGroupNameSpace : namespace}/uploadImage`,
                payload: {
                  files: encodeURIComponent(get(imgSrc, '0')) || 0,
                  index: that.props.index
                }
              })
            },
            fail: function(err) {
              console.log('getLocalImgData-err',err)
            }
          })
       
      },
      complete:function(msg) {
        console.log('complete-msg',msg)
      }
    });
  };

  render() {
    const { routePage, item, query } = this.props;
    const uploadImage = get(item, "image");
    const subjectValue = item.optionSubject.value
    const infoContent = item.optionInfo.value
    return (
      <div className={styles.SelectImageItem}>
        <div className={styles.container}>
          <div className={styles.label}>
            <div
              // htmlFor={`file-${index}`}
              className={styles.addImage}
              onClick={this.addImage}
              style={{
                // background: `url('${uploadImage ? `/elinkvote${get(item, "image")}` : addImage}') no-repeat center center`
                background: `url('${uploadImage ? `/elinkvote${get(item, "image")}` : addImage}') no-repeat center center`
              }}
            >
              {!!uploadImage && <img src={editImage} alt="" className={styles.editIcon} />}
            </div>
            {/* <input
              type="file"
              id={`file-${index}`}
              style={{ display: "none" }}
              onChange={this.onChange}
            /> */}
            <div
              className={
                subjectValue ? styles.content : styles.placeHolder
              }
              onClick={() => {
                routePage(item.optionSubject.path, `${query}&initialValue=${subjectValue || ''}`);
              }}
            >
              {subjectValue || "请输入选项信息"}
            </div>
          </div>
          <div onClick={() => {
            alert('', '确定删除该选项？', [
              { text: '取消', onPress: loop },
              { text: '确定', onPress: () => this.props.delOption(this.props.index) },
            ])
          }}>
            <IconComponent
              type={require("@/assets/icons/svg/list_icon_delete.svg")}
              // type={require("@/assets/icons/svg/pop_icon_delete.svg")}
              color="#F86B2E"
              className={styles.delete}
            />
          </div>
        </div>
        <List id="infoDetails" onClick={() => {
            routePage(item.optionInfo.path, `${query}&initialValue=${infoContent || ''}`);
          }} className={infoContent ? 'infoDetailsBlack' : 'infoDetailsGray'}>
            <List.Item arrow="horizontal">{infoContent || "输入详细信息（选填）"}</List.Item>
          </List>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  ...state[editTextareaNameSpace],
  ...state[namespace]
});

export default connect(mapStateToProps)(SelectImageItem);
