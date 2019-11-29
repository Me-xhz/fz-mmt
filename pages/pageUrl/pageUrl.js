// pages/pageUrl/pageUrl.js
var app = getApp();
var common = require("../../utils/common.js");

Page({
  data: {

  },
  onLoad: function (options) {
    this.options = options;
    this.data.type = options.type;
    if (options.share_title && options.share_title != 'undefined'){
      this.data.share_title = options.share_title;
    }else{
      this.data.share_title = '天天买买提';
    }
  },
  onShow(){
    if (this.options.pageUrl && this.options.pageUrl != 'undefined') {
      app.dataBase.pageUrl = this.options.pageUrl.replace(/\@/g,'?');
      app.dataBase.pageUrl = app.dataBase.pageUrl.replace(/\^/g, '=');
      app.dataBase.pageUrl = app.dataBase.pageUrl.replace(/\*/g, '&');
      console.log(app.dataBase.pageUrl)
    } else {
      if (!app.checkSessionKey) {
        common.goRegister();
        return false;
      }else{
        wx.hideShareMenu();
        app.dataBase.pageUrl = 'https://demo.rp.surex.cc?token=' + common.getStorageSync('token') + '&timeStamp=' + new Date().getTime();
        console.log(app.dataBase.pageUrl)
      }
    }
    this.setData({
      pageUrl: app.dataBase.pageUrl
    })
  },
  onShareAppMessage: function (options) {
    if (this.data.type == 'activity'){
      return {
        title: this.data.share_title,
        path: '/pages/pageUrl/pageUrl?pageUrl=' + app.dataBase.pageUrl,
        success: function (res) {
          console.log('转发成功')
        },
      }
    }else if (this.data.type == 'video'){
      return {
        title: this.data.share_title,
        path: '/pages/index/index',
        success: function (res) {
          console.log('转发成功')
        },
      }
    }
  }
  // pageSuccess: function(){
  //   // 领取纸巾推广跳回首页
  //   if (app.dataBase.pageUrl == 'https://share.lltjs.com/app/index.php?i=2&c=entry&from=account&account=a450f613484aea3458ac7a7eba952d720d671557&xid=&do=entry&m=llt_afan') {
  //     setTimeout(()=>{
  //       wx.navigateBack({
  //         delta: 1
  //       })
  //     },5000)
  //   }
  // }
})