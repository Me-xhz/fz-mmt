// packageA/credits-record/credits-record.js
//获取应用实例
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    rulesList: [],
  },
  getChangeList() {
    let that = this;
    let url = app.getPath.scoreRule
    common.ApiGateWayTest(url, '', true, function (res) {
      if (res.data.success == 1) {
        that.setData({
          rulesList: res.data.result.info
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getChangeList()
  },
})
