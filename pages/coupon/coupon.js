// pages/coupon/coupon.js
var app = getApp();
var common = require("../../utils/common.js");
var code;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    vou: [],
    couponlist:[],
    currentTab: 0,
    page: 1,
    page_size: 10,
    refresh: true,
    couponType: true,
    loading:true,
    ac_load_btn: true,
    isShowGoHome: false,
    now_time: (new Date()).getTime(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options && options.entryType && options.entryType == 'external') {
      this.setData({
        isShowGoHome: false
      })
    } else {
      this.setData({
        isShowGoHome: true
      })
    }
  },
  onShow() {
    var current = this.data.currentTab;
    this.setData({
      vou: [],
      refresh: true,
      page: 1
    })
    this.getCouponList(current);
  },
  //优惠券去使用
  like: function (e) {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 切换状态栏
  swichNav: function (e) {
    var that = this;
    if (!that.data.ac_load_btn) {
      return false;
    } 
    var current= e.currentTarget.dataset.current;
    that.setData({
      currentTab: current,
      vou: [],
      refresh: true,
      page: 1
    });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
     
    that.getCouponList(current); 
  },
  // 返回首页
  gotoHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var current = this.data.currentTap;
    this.setData({
      vou: [],
      refresh: true,
      page: 1
    })
    this.getCouponList(current);
  },

  //上拉加载
  onReachBottom: function () {
    var that = this
    if (that.data.refresh) {
      that.setData({
        page: that.data.page + 1
      })
      var current = that.data.currentTab;
      that.getCouponList(current);
    }
  },

  // 获取优惠券列表
  getCouponList:function(current,page){
    var that = this;
    common.showLoad(that);
    // 关闭开关
    that.data.ac_load_btn = false;
    var uri = app.getPath.couponList;
    var data = {
      page:that.data.page,
      page_size:that.data.page_size,
      status:current
    }
    common.ApiGateWayTest(uri, data, true, function(res){
      if (res && res.data && res.data.success == 1) {
        var vou = res.data.result.lists;
        if (vou.length > 0) {
          for (var i in vou) {
            vou[i]['checked'] = 0;
          }
          that.setData({
            vou: that.data.vou.concat(vou),
            couponType: true,
          });
          //没有下一页数据
          if (vou.length < that.data.page_size) {
            that.setData({
              refresh: false,
            })
          }
        } else {
          that.setData({
            couponType: false,
            refresh: false,
          })
        }
        wx.stopPullDownRefresh();
      } else if (res && res.data && res.data.success == 0) {
        that.setData({
          couponType: false,
          content: res.data.msg
        })
      }
      // 打开开关
      that.data.ac_load_btn = true;
      common.hideLoad(that);
    })
  },

})