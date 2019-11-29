// pages/register/register.js
var app = getApp();
var common = require("../../utils/common.js");
var event = require('../../utils/event.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    rBtn: true,
    isFace: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this
    this.setData(options);
    // 判断上一个页面是不是一刀砍价页面跳转来的 如果是则不会有取消按钮
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    if (prevPage.route == 'packageA/bargainshare/bargainshare' && prevPage.data.isFace) {
      _this.setData({
        isFace: true
      })
    }

  },
  onGotUserInfo: function (e) {
    var that = this;
    common.showLoad(that);
    var userData = {
      encrypted_data: e.detail.encryptedData,
      iv: e.detail.iv,
      signature: e.detail.signature
    }
    common.getUserSessionKey().then(function (res) {
      var isOldUser = common.getStorageSync('isOldUser');
      if (e.detail.userInfo) {
        // 注册账户
        if (that.data.rBtn) {
          that.data.rBtn = false;
          if (isOldUser === 2) {
            // 老用户更新
            that.updateUserInfo(userData);
            common.hideLoad(that);
          } else if (isOldUser === 0) {
            app.checkSessionKey = true;
            that.data.rBtn = true;
            common.hideLoad(that);
            // 非老用户，在token过期重新checklogin情况，直接返回上一页（checklogin时直接赋值）
            wx.navigateBack({
              delta: 1
            })
          } else {
            // 为防止网络过慢进入此页面，此处重新获取checkSessionKey
            // 如果为true，阻断，直接返回上一页
            common.hideLoad(that);
            if (app.checkSessionKey) {
              wx.navigateBack({
                delta: 1
              })
              return false;
            }
            common.register(function (data) {
              if (data.data.success == 1) {
                common.setStorageSync('token', data.data.result.token);
                app.checkSessionKey = true;
                event.emit('checkSessionKey', true);
                // 优惠券弹窗进入
                // if (that.data.isGetCoupon && that.data.isGetCoupon == 1) {
                //   event.emit('isGetCoupon', 1);
                // }
                wx.navigateBack({
                  delta: 1
                })
              } else {
                common.toast(data.data.msg);
                that.data.rBtn = true;
                app.checkSessionKey = false;
              }
              common.hideLoad(that);
            }, userData)
          }
          var isOldUser = wx.removeStorageSync('isOldUser');
          var shareTicket_info = common.getStorageSync('shareTicket_info');
          if (shareTicket_info && shareTicket_info != '') {
            common.setStorageSync('reLoad', true);
          }
        }
        common.hideLoad(that);
      } else {
        common.toast('拒绝授权将无法体验完整功能，建议重新点击进行授权!')
        common.hideLoad(that);
      }
    })

  },
  // 老用户更新信息
  updateUserInfo: function (userData) {
    var that = this;
    var uri = app.getPath.getWXUserInfo;
    common.ApiGateWayTest(uri, userData, true, function (data) {
      if (data.data.success == 1) {
        app.checkSessionKey = true;
        event.emit('checkSessionKey', true);
        common.setStorageSync('isOldUser', 0);
        // 优惠券弹窗进入
        // if (that.data.isGetCoupon && that.data.isGetCoupon == 1) {
        //   event.emit('isGetCoupon', 1);
        // }
        wx.navigateBack({
          delta: 1
        })
      } else {
        common.toast(data.data.msg);
        that.data.rBtn = true;
        app.checkSessionKey = false;
      }
    })
  },
  routerOut() {
    wx.navigateBack({
      delta: 1
    })
  }
})