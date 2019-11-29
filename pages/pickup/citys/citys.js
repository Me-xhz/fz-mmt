// pages/pickup/citys/citys.js
var app = getApp();
var common = require("../../../utils/common.js");
var wxaSortPicker = require('../../../utils/wxaSortPicker/wxaSortPicker.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
  
  },
  cityslist: function () {
    var that = this;
    var uri = app.getPath.pickupregionlist;
    common.ApiGateWayTest(uri, {}, true, function (res) {
      var res = res.data;
      if (res.success == 1) {
        var cities_list = res.result.cities;
        var cities = [];
        // 过滤掉无提货点城市
        cities_list.forEach(function(item){
          if (item.is_pick_up==1){
            cities.push(item)
          }
        })
        that.setData({
          cities: cities
        })
        wxaSortPicker.init(that.data.cities, that);
      }
    })
  },
  wxaSortPickerItemTap: function (e) {

    var city = e.target.dataset.citys;
    var is_pick_up = city.is_pick_up;
    var pages = getCurrentPages();
    common.setStorageSync('city', city);
    // 如果没开通定位，从选择城市选择定位，
    common.setStorageSync('authSetting', {
      'scope.userLocation':true
    });
    
    var pickup_city = "pickup.cityName"
    pages[pages.length - 2].setData({
      'city': city,
      is_pick_up: is_pick_up,
      [pickup_city]: ""
    })
    app.dataBase.isRefresh = true;
    wx.navigateBack({
      delta: 1
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.cityslist();
    // console.log(getCurrentPages())
    var city = common.getStorageSync('city');
    this.setData({
      city:city,
      type: options.type
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
  // onShareAppMessage: function () {

  // }
})