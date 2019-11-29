// pages/couponCenter/couponCenter.js
var app = getApp();
var common = require("../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    lists:[],
    share_info: {},
    user_id: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.getallcouponlist()
    wx.showShareMenu({
      withShareTicket: true
    })

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

    // 外部带商品店铺
    this.setData({
      entryData: options
    })
    var options = that.data.entryData;
    var pickupId = common.getStorageSync('getpickup');
    // 判断是否第一次进入 且是从外部进入，如二维码扫码 && app.firstlaunchApp
    if (options && (options.atitude || options.pickup_id) && !pickupId) {
      that.getExternal(options.pickup_id).then(function () {
        // 关闭开关，让app知道已经不是第一次进入当前页
        app.firstlaunchApp = false;
        // 清空data内携带参数
        that.data.entryData = {};
        // 外部已带经纬度定位，无需再调用定位接口，所以将缓存定位改为真，让页面可以显示
        common.setStorageSync('authSetting', {
          'scope.userLocation': true
        });
      })
    }
  },
  // 从外部二维码扫码，带经纬度和外部标识external
  getExternal: function (pickup_id) {
    var that = this;
    var uri = app.getPath.getpickup;
    var data = {
      pickup_id: pickup_id
    }
    return new Promise(function (resolve, reject) {
      // 获取提货点
      common.ApiGateWayTest(uri, data, true, function (res) {
        if (res && res.data && res.data.success == 1) {
          var res = res.data.result.cities.pick_up;
          common.setStorage({
            key: 'city',
            data: {
              'pickup_id': res.pickup_id,
              'warehouse_id': res.warehouse_id,
              'cityName': res.city_name,
              'is_pick_up': 1
            }
          })
          common.setStorage({
            key: 'getpickup',
            data: {
              'pickup_id': res.pickup_id,
              'cityName': res.pickup_name,
              'pickup_address': res.pickup_address,
              'pickup_contact': res.pickup_contact,
              'pickup_phone': res.pickup_phone,
              'pickup_type': res.pickup_type
            },
          },function(res) {
            resolve('获取id成功')
          })
        }
      })
    })
  },
  // 返回首页
  gotoHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  getallcouponlist:function(){
    var that = this;
    var uri = app.getPath.getallcouponlist;
    common.ApiGateWayTest(uri, '', true, function (res) {
      if (res && res.data && res.data.success == 1) {
        var result = res.data.result;
        that.setData({
          lists: result.lists,
          share_info: result.share_info,
          user_id: result.user_id
        })
        
      }
    })
  },
  addCoupon:function(e){
    var that = this;
    // 跳转登录
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    var uri = app.getPath.addCoupon;
    var lists = that.data.lists;
    var data = {
      coupon_id:e.currentTarget.dataset.id
    }

    common.ApiGateWayTest(uri, data, true, function (res) {

      if (res && res.data && res.data.success == 1) {
        var result = res.data.result;
        common.toast(result.state_desc);
        that.getallcouponlist()
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 上报关系链-存在token才上报
    var token = common.getStorageSync('token');
    if (token && token != '') {
      common.setInviteShareLogin()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    return {
      title: that.data.share_info.share_title,
      path: '/pages/couponCenter/couponCenter?pickup_id=' + pickup.pickup_id + '&user_id=' + that.data.user_id,
      imageUrl: that.data.share_info.share_img,
      success: function (res) {
        common.toast('分享成功')
      },
      fail: function (res) {
        common.toast('分享失败')
      }
    }
  }
})