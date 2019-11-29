const app = getApp();
const common = require('../../utils/common.js')

Page({
  data: {
    itemList:[],
    inputValue: ""
  },

  onLoad: function (options) {
    this.getboxlist()
  },

  onShow: function () {

  },
  arrivalInput(e){
    var that = this;
    var value = e.detail.value;
    const reg = /^[a-zA-Z]{2}\d{7}[a-zA-Z]{1}\d{2}$/;
    var content = "中转箱码为：" + value;
    var confirmText = "确认";
    if (value.length == 12 && reg.test(value) == false) {
      common.toast("请输入正确的提货箱码")
      return;
    } else if (value.length == 12 && reg.test(value) == true) {
      common.showModal(content, confirmText,function(res){
        if (res.confirm){
          that.confirmbox(value);
        }else{
          return
        }
      })
      return;
    }
  },
  getboxlist(){
    common.showLoad(this);
    var that = this;
    var url = app.getPath.getboxlist;
    common.ApiLogistics(url,'',true,function(res){
      if (res.success == 1) {
        that.setData({
          itemList: res.result.box_group_list,
        })
      } else {
        common.toast(res.msg)
      }
      common.hideLoad(that);
    })
  },
  confirmbox(value){
    common.showLoad(this);
    var that = this;
    var url = app.getPath.confirmbox;
    var data = {
      box_sn: value
    }
    common.ApiLogistics(url,data,true,function(res){
      common.toast(res.msg);
      that.setData({
        inputValue: ""
      })
      if (res.success == 1) {
        that.getboxlist();
      }
      common.hideLoad(that);
    })
  },
  scanCode() {
    var that = this;
    wx.scanCode({
      success(res) {
        that.confirmbox(res.result);
      }
    })
  },
  goArrivalOrder(e){
    var that = this;
    var box_sn = e.currentTarget.dataset.box_sn;
    wx.showModal({
      content: '是否确认发送【提货码】通知用户？',
      cancelText: '确定',
      cancelColor: '#EB3C39',
      confirmText: '取消',
      confirmColor: '#000',
      success:function(res){
        if (res.cancel){
          that.confirmbox(box_sn);
          that.getboxlist();
        }
      }
    })
  }
})