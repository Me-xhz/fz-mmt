// pages/user/my-order-return.js
var app = getApp();
var common = require("../../utils/common.js");
Page({
  data: {
    iconURL: app.dataBase.iconURL,
    page_size: 5,
    page: 1,
    isEmpty: false
  },
  onLoad: function (options) {

  },
  onShow: function () {
    this.data.page = 1;
    this.data.page_size = 5;
    this.data.orders = '';
    this.loadOrderList();
  },
  loadOrderList: function () {
    var that = this;
    common.showLoad(this);
    var url = app.getPath.getbackorderlist;
    var data = {
      page: that.data.page,
      page_size: that.data.page_size,
    };
    common.ApiGateWayTest(url, data, true, function (res) {
      if (res.data.success == 1) {
        var orders = res.data.result.data;
        that.data.orders = that.data.orders ? that.data.orders.concat(orders) : orders;
        that.setData({
          orders: that.data.orders
        })
        common.hideLoad(that);
        wx.stopPullDownRefresh();
      } 
    })
  },
  cancel_back:function(e){
    var that = this;
    
    var url = app.getPath.backcancel;
    var data = {
      back_id: e.currentTarget.dataset.back_sn
    };
    common.ApiGateWayTest(url, data, true, function (res) {

      var res = res.data;
      if (res.success==1){
        if(res.result.state==0){
          common.toast(res.result.state_desc);
          that.data.orders = '';
          that.data.page = 1;
          that.data.page_size = 5;
          that.loadOrderList();
        }
      }
    })
  },
  go_order_return_detail: function (e) {
    var id = e.currentTarget.dataset.back_sn;
    wx.navigateTo({
      url: '../user/order-return-detail?entryType=external&id=' + id,
    })
  },
  go_aftermarketSchedule: function (e) {
    var id = e.currentTarget.dataset.back_sn;
    wx.redirectTo({
      url: '../user/aftermarket-schedule?id=' + id,
    })
  },
  onReachBottom: function () {
    var that = this;
    if (that.data.orders && that.data.orders.length % that.data.page_size == 0) {
      that.data.page = that.data.orders.length / that.data.page_size + 1;
      that.loadOrderList();
    }
  },
  onPullDownRefresh: function () {
    var that = this;
    that.data.orders = '';
    that.data.page = 1;
    that.data.page_size = 5;
    that.loadOrderList();
  },
})