// pages/pickup/pickup.js
var app = getApp();
var common = require("../../utils/common.js");
var wxaSortPicker = require('../../utils/wxaSortPicker/wxaSortPicker.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    city: {},
    pickList:[],
    baseList: [],
    isAuthorization: false,
    pickGuide:true,
    embedType: 1
  },
  onLoad: function (options) {
    if (options.type){
      this.setData({
        type: options.type
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    this.setData({
      city: common.getStorageSync('city'),
      isAuthorization: common.getStorageSync('authSetting')['scope.userLocation']
    })
    this.getpickuplistr();
    common.setStorageSync('reLoad', true)
  },
  openSet: function () {
    var that = this;
    wx.openSetting({
      success: function (res) {
        common.getpickup(function(){
          that.setData({
            isAuthorization: res.authSetting["scope.userLocation"],
            city: common.getStorageSync('city'),
          })
        });     
      },
      fail: function (res) {
        console.log(res)
      }
    })

    // var content = '拒绝授权将无法体验完整功能，建议打开地理位置授权';
    // var confirmText = '去设置';
    // common.showModal(content, confirmText, function (res) {
    //   if (res.confirm) {
        
    //   }
    // })
  },
  goToCity:function(){
    wx.navigateTo({
        url: './citys/citys'
      })
  },
  getpickuplistr: function () {
    var that = this;
    var uri = app.getPath.pickuplistr;
    var city = that.data.city
    var data = {
      warehouse_id: that.data.city.warehouse_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var res = res.data;
      if (res.success == 1) {
        // console.log(res.result.cities)
        that.setData({
          searchValue: '',
          keyword: '',
          pickList: res.result.cities,
          baseList: res.result.cities
        })
        wxaSortPicker.init(that.data.pickList, that);
      }
    })
  },

  // 获取搜索内容
  searchValueInput: function (e) {
    var that = this;
    var value = e.detail.value;
    var cityList = that.data.baseList;
    var newList = [];
    this.setData({
      searchValue: value
    });
    if (!value) {
      that.setData({
        pickList: that.data.baseList
      })
    }

    for (var i = 0; i < cityList.length; i++) {
      if (that.fifterStr(cityList[i], value)) {
        newList.push(cityList[i])
      }
    }
    that.setData({
      pickList: newList
    })
    wxaSortPicker.init(that.data.pickList, that);
  },
  // fifter
  fifterStr: function (d, v) {
    // var py = d.py;
    var cityName = d.cityName;
    // var pinYin = d.pinYin;
    // py.indexOf(v) >= 0 || pinYin.indexOf(v) >= 0 || 
    if (cityName.indexOf(v) >= 0) {
      return true;
    } else {
      return false;
    }
  },
  // 清除搜索内容
  cancelSearch: function () {
    var that = this;
    this.setData({
      searchValue: '',
      keyword: ''
    })
    that.setData({
      pickList: that.data.baseList
    })
    wxaSortPicker.init(that.data.pickList, that);
  },
  // 获取
  wxaSortPickerItemTap:function(e){
    var getpickup = e.target.dataset.citys;

    if (Number(this.data.type)!=1){
      common.setStorageSync('getpickup', getpickup);
    }
    var pages = getCurrentPages();
    pages[pages.length - 2].setData({
      'pickup': getpickup
    })
    wx.navigateBack({
      delta: 1
    })
  },
  // 关闭选择工厂指引
  pickGuideCloss(){
    this.setData({
      pickGuide: false
    })
  }
  
})