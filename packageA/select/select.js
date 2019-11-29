// pages/select/select.js
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    shopList: [],
    page: 1,
    page_size: 10,
    activity_id: "",
    refresh: true,
    activity_detail: {},
    check_activity: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
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
      entryData: options,
      activity_id: options.id
    })
    var options = that.data.entryData
    var pickupId = common.getStorageSync('getpickup');
    // 判断是否第一次进入 且是从外部进入，如二维码扫码 && app.firstlaunchApp
    if (options && (options.atitude || options.pickup_id) && !pickupId) {
      that.getExternal(options.pickup_id).then(function() {
        // 关闭开关，让app知道已经不是第一次进入当前页
        app.firstlaunchApp = false;
        // 清空data内携带参数
        that.data.entryData = {};
        // 外部已带经纬度定位，无需再调用定位接口，所以将缓存定位改为真，让页面可以显示
        common.setStorageSync('authSetting', {
          'scope.userLocation': true
        });
        that.getIndexProducts();
      })
    }else{
      that.getIndexProducts();
    }
  },
  // 从外部二维码扫码，带经纬度和外部标识external
  getExternal: function(pickup_id) {
    var that = this;
    var uri = app.getPath.getpickup;
    var data = {
      pickup_id: pickup_id
    }
    return new Promise(function(resolve, reject) {
      // 获取提货点
      common.ApiGateWayTest(uri, data, true, function(res) {
        if (res && res.data && res.data.success == 1) {
          var res = res.data.result.cities.pick_up;
          common.setStorage({
            key: 'getpickup',
            data: {
              'pickup_id': res.pickup_id,
              'cityName': res.pickup_name,
              'pickup_address': res.pickup_address,
              'pickup_contact': res.pickup_contact,
              'pickup_phone': res.pickup_phone,
              'pickup_type': res.pickup_type
            }
          },function(res) {
            resolve('获取id成功')
          })
          common.setStorage({
            key: 'city',
            data: {
              'pickup_id': res.pickup_id,
              'warehouse_id': res.warehouse_id,
              'cityName': res.city_name,
              'is_pick_up': 1
            }
          })
        }
      })
    })
  },
  // 返回首页
  gotoHome: function() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 获取商品数据
  getIndexProducts: function() {
    var that = this;
    var uri = app.getPath.normalActivityList;
    var data = {
      page: this.data.page,
      page_size: this.data.page_size,
      normal_activity_id: this.data.activity_id
      // activity_id:48
    }
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function(res) {
        if (res && res.data) {
          var data = res.data;
          if (data.success == 1) {
            var list = data.result.lists;
            that.setData({
              shopList: that.data.shopList.concat(list)
            })
            if (data.result.lists.length < that.data.page_size) {
              that.refresh(false);
            } else {
              that.refresh(true);
            }
          } else if (data.success == 0) {
            that.refresh(false);
          }
          resolve('productsSuccess');
        } else {
          common.toast('网络错误');
        }
      })
    })
  },
  // 获取活动详情
  get_activitydetail: function() {
    var that = this;
    var uri = app.getPath.normalActivityDetail;
    var data = {
      normal_activity_id: this.data.activity_id
      // activity_id:48
    }
    common.ApiGateWayTest(uri, data, true, function(res) {
      if (res.data.success == 1) {
        that.setData({
          activity_detail: res.data.result.data,
        })
      } else {
        //返回错误提示信息
        setTimeout(() => {
          console.log(res.data.msg)
          wx.showToast({
            title: "出错啦",
            icon: 'none',
            duration: 1500
          })
        }, 600)
        that.setData({
          check_activity: false
        })
      }
      wx.setNavigationBarTitle({
        title: res.data.result.data.name //页面标题为路由参数
      })
    })
  },
  // 是否允许上拉加载
  refresh: function(data) {
    this.setData({
      refresh: data
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    //获取活动信息
    that.get_activitydetail();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.refresh) {
      this.setData({
        page: this.data.page + 1
      })
      this.getIndexProducts();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    return {
      title: that.data.activity_detail.share_title,
      path: 'packageA/select/select?id=' + that.data.activity_id + '&pickup_id=' + pickup.pickup_id,
      imageUrl: that.data.activity_detail.share_img,
      success: function(res) {
        console.log("转发成功");
      },
      fail: function(res) {
        console.log("转发失败");
      }
    }
  }
});