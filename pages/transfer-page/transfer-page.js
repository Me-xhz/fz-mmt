// pages/pageUrl/pageUrl.js
var app = getApp();
var common = require("../../utils/common.js");

Page({
  data: {
    iconURL: app.dataBase.iconURL,
  },
  onLoad: function (options) {

  },
  goPageUrl(){
    var that = this;
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    } else {
      wx.navigateTo({
        url: '/pages/pageUrl/pageUrl',
      })
    }
  },
  onShareAppMessage: function () {
    return {
      title: '羊驼大赛',
      path: 'pages/transfer-page/transfer-page'
    }
  }
})