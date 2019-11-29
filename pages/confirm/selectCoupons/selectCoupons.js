// pages/confirm/selectCoupons/selectCoupons.js
var app = getApp();
var common = require("../../../utils/common.js");

Page({
  data: {
    iconURL: app.dataBase.iconURL,
    order_product:[],
  },
  
  onLoad: function (options) {
    if (options == undefined || options.order_product == undefined) {
      common.toast("请求参数错误");
      return;
    }
    var that = this;
    that.data.order_product = options.order_product;
    that.setData({
      coupon_id: options.coupon_id
    })
    that.getOrderCouponList()
  },

  onShow: function () {
  
  },
  getOrderCouponList : function(){
    var that = this;
    var uri = app.getPath.getOrderCouponList;
    var data = {
      order_product: that.data.order_product
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res.data.errorCode != 1){
        var res = res.data.result;
        that.setData({
          cashgifts: res.data
        })
      }else{
        common.toast(res.data.msg)
      }
    })
  },
  touchCashgift : function(e){
    var item = e.currentTarget.dataset.item;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      cashgift: item,
    })
    wx.navigateBack();
  },
  touchClear: function(){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      cashgift: {
        id : -1
      },
    })
    wx.navigateBack();
  },
})