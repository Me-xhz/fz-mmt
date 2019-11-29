// pages/confirm/paymentStatus/paymentStatus.js
var app = getApp();
var common = require("../../utils/common.js");

Page({
  data: {
    iconURL: app.dataBase.iconURL,
    // 上拉加载部分
    refresh: true,
    page: 1,
    recommend_good_list: [],
    showNewCouponModalStatus: false,
    newCouponImg: '',
    duration: 500,
    interval: 5000,
    indexAdcurrent: 0,
    indicatorColor: "#fff",
    indicatorActiveColor: "#eb3c39",
    circular: true,
    autoplay: false,
    adList: [],
    indicatorDots:false,
    showRedEnvel: false,
    showRedEnvelType: 1,
    red_packet_id: 0
  },
  onLoad: function (options) {
    if (options == undefined) {
      common.toast("请求参数错误");
      return;
    }
    wx.showShareMenu({
      withShareTicket: true
    })
    var that = this;
    that.setData({
      order_id: options.order_id,
    })
    that.getcheckPay();
  },
  onShow: function () {

  },
  getcheckPay : function(){
    var that = this;
    var uri = app.getPath.checkPay;
    var data = {
      order_id: that.data.order_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res.data.success == 1) {
        let order_url=app.getPath.achieveOrder
        let achieve_data={
          order_id:that.data.order_id
        }
        common.ApiGateWayTest(order_url,achieve_data,true,function (resData) {
          if(resData.data.success==1){
            if(resData.data.result.state==0){
              common.toast(resData.data.result.state_desc)
            }
          }
          that.setData({
            msg: res.data.msg,
            success: res.data.success,
          })
        })
      } else {
        app.aldstat.sendEvent("下单未支付");
        that.setData({
          msg: res.data.msg,
          success: res.data.success
        })
      }
    })
  },
  goOrderList: function () {
    var that = this;
    wx.redirectTo({
      url: '/packageA/user/dingdan?entryType=external&currentTab=0'
    })
  },
  goHome: function(){
    wx.switchTab({
      url: '/pages/credits-exchange/credits-exchange'
    })
  },
  onPay: function () {
    var that = this;
    var payUri = app.getPath.doPayPoint;
    var payData = {
      order_id: that.data.order_id
    }
    common.ApiGateWayTest(payUri, payData, true, function (res) {
      var resData = res.data;
      if (resData.success == 1) {
        // common.toast(resData.result.msg);
        if (resData.result.state==0){
          wx.redirectTo({
            url: '/packageA/credits-payment/credits-payment?order_id=' + payData.order_id
          })
        }
      }
    })
  },
  // 分享
  onShareAppMessage: function (res) {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    var entry_share_info = common.getStorageSync('entry_share_info');
    if (res.target && res.target.dataset.shareinfo) {
      let shareInfo = res.target.dataset.shareinfo;
      if (shareInfo && shareInfo.fromButton == 'notice') {
        return {
          title: entry_share_info.urge_share_text,
          path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
          imageUrl: entry_share_info.urge_share_img
        }
      } else if (shareInfo && shareInfo.fromButton == 'envelopes') {
        return {
          title: entry_share_info.invite_share_text,
          path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
          imageUrl: entry_share_info.invite_share_img
        }
      } else {
        return {
          title: entry_share_info.invite_share_text,
          path: '/pages/index/index?pickup_id=' + pickup.pickup_id,
          imageUrl: entry_share_info.invite_share_img
        }
      }
    } else {
      return {
        title: entry_share_info.invite_share_text,
        path: '/pages/index/index?pickup_id=' + pickup.pickup_id,
        imageUrl: entry_share_info.invite_share_img
      }
    }
  }
})
