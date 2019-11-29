// pages/user/order-return-detail.js
var app = getApp();
var common = require("../../utils/common.js");
Page({
  data: {
    iconURL: app.dataBase.iconURL,
    back_id:''
  },
  onLoad: function (options) {
    if (options == undefined || options.order_id == undefined) {
      common.toast("请求参数错误");
      return;
    }
    // 从外部分享进入时，显示左上角回到首页  改动带external时为内部进入携带参数，外部进入不带参数
    if (options && options.entryType && options.entryType == 'external') {
      this.setData({
        isShowGoHome: false
      })
    } else {
      this.setData({
        isShowGoHome: true
      })
    }
    var that = this;
    that.setData({
      back_id: options.order_id
    })
  },
  onShow: function(){
    if (this.data.back_id == undefined) {
      common.toast("请求参数错误");
      return;
    }
    this.getBackDetail();
  },
  // 返回首页
  gotoHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // Idontk:function(){
  //   var that = this;
  //   common.showModal('是否和提货点人员确认已寄回','确认',function(r){
  //     if (r.cancel){
  //       return false;
  //     }
  //     var url = app.getPath.backReturnPickup;
  //     var data = {
  //       back_id: that.data.back_id,
  //     };
  //     common.ApiGateWayTest(url, data, true, function (res) {
  //       var res = res.data;
  //       if(res.success==1){
  //         common.toast(res.msg)
  //         that.getBackDetail();
  //       }
  //     })
  //   })
  // },
  //获取数据
  getBackDetail: function () {
    var that = this;
    var e = that.data;
    common.showLoad(this);
    var url = app.getPath.shopOrderBackDetail;
    var data = {
      back_id: that.data.back_id,
    };
    common.ApiGateWayTest(url, data, true, function (res) {
      if (res.data.success == 1) {
        var res = res.data.result.data;
        that.setData({
          backInfo:res,
        })
      }
      common.hideLoad(that);
    })
  },
  //前往订单进度
  go_aftermarketSchedule: function (e) {
    var id = e.currentTarget.dataset.back_sn;
    wx.redirectTo({
      url: '../user/aftermarket-schedule?id=' + id,
    })
  },
  // 拨打客服电话
  phoneCall: function () {
    common.phoneCall(app.globalData.hotline);
  },
  //跳转在线客服
  golinkkf: function () {
    app.dataBase.pageUrl = 'http://q.url.cn/s/6l3eQOm?_type=wpa&_wv=2';
    common.goWebview();
  }
})
