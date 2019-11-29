// pages/recharge/recharge.js
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    selectIdx:0,
    arr: [1, 2, 3, 4, 5, 6, 7, 8]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  selectItem:function(e){
    // console.log(e.currentTarget.dataset.index)
    var index = e.currentTarget.dataset.index;
    this.setData({
      selectIdx:index
    })
  }

})