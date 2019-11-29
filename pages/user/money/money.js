// pages/user/money/money.js
var app = getApp();
var common = require("../../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    account_info:[],
    iconURL: app.dataBase.iconURL
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.accountLog()
  },
  accountLog:function(){
    var that = this;
    var uri = app.getPath.accountLog;
    common.ApiGateWayTest(uri, '', true, function (res) {
      if (res.data.success == 1) {
        that.setData({
          account_info: res.data.result.account_info.reverse()
        })  
        // that.data.account_info.reverse()         
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