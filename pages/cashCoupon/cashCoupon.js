// pages/cashCoupon/cashCoupon.js
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
var icon_url = app.dataBase.iconURL;

Page({

  data: {
    iconURL: app.dataBase.iconURL,
  },
  onLoad:function(options){
    var that = this;
    that.setData(options);
    if (!app.checkSessionKey) {
      event.on('checkSessionKey', this, function (data) {
        this.setData({ checkSessionKey: data });
        that.getBonuslist();
        that.getShare();
      })
    }else{
      that.getBonuslist();
      that.getShare();
    }
  },
  // 领券列表
  getBonuslist:function(){
    var that = this;
    var uri = app.getPath.bonuslist;
    var data = {
      bonus_sn: that.data.bonus_sn
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var res = res.data;
      if(res.success==1){
        that.setData({
          bonuslist: res.result.lists,
          user: res.result.user
        })
      }
    })
  },
  // 领券
  exchange:function(){
    var that = this;
    var uri = app.getPath.exchange;
    var data = {
      bonus_sn: that.data.bonus_sn
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var res = res.data;
      if (res.success == 1) {
        common.toast(res.result.msg);
        that.setData({
          state: res.result.state
        })
      }
    })
  },
  // 分享信息
  getShare: function () {
    var that = this;
    var uri = app.getPath.share;
    var data = {
      bonus_sn: that.data.bonus_sn
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var res = res.data;
      if (res.success == 1) {
       that.setData({
         shareInfo:res.result[0]
       })
      }
    })
  },
  // onShareAppMessage:function(){
  //   var that = this;
  //   var shareInfo = that.data.shareInfo;
  //   return {
  //     title: shareInfo.description,
  //     path: '/pages/cashCoupon/cashCoupon?bonus_sn=' + shareInfo.bonus_sn,
  //     imageUrl: shareInfo.img,
  //     success: function (res) {
  //     }
  //   };
  // }
})