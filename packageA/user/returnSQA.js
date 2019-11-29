// pages/user/returnSQA.js
var app = getApp();
Page({
  data: {
    currentTap: 0,
    iconUrl: app.dataBase.iconURL
  },
  onLoad: function () {
    //调用获取五块内容的top高度
    this.wxcreate();
  },
  //点击bar事件
  swichNav: function (e) {
    var that = this;
    var current = parseInt(e.currentTarget.dataset.current);
    var barH = this.data.barH;
    switch (current) {
      case 0: e.scrollTop = 0;
        break;
      case 1: e.scrollTop = this.data.refunds - barH;
        break;
      case 2: e.scrollTop = this.data.exchangeGoods - barH;
        break;
      case 3: e.scrollTop = this.data.moneyGoes - barH;
        break;
      case 4: 
        e.scrollTop = this.data.invoice - barH;
        break;
    }
    that.setDatas(current);
    wx.pageScrollTo({
      scrollTop: e.scrollTop,
      duration: 0
    });
  },
  wxcreate: function () {
    var that = this;
    wx.createSelectorQuery().select('#refundProcess').boundingClientRect(function (rect) {
      that.setData({
        refundProcess: rect.top
      })
    }).exec()
    wx.createSelectorQuery().select('#refunds').boundingClientRect(function (rect) {
      that.setData({
        refunds: rect.top
      })
    }).exec()
    wx.createSelectorQuery().select('#exchangeGoods').boundingClientRect(function (rect) {
      that.setData({
        exchangeGoods: rect.top
      })
    }).exec()
    wx.createSelectorQuery().select('#moneyGoes').boundingClientRect(function (rect) {
      that.setData({
        moneyGoes: rect.top
      })
    }).exec()
    wx.createSelectorQuery().select('#invoice').boundingClientRect(function (rect) {
      that.setData({
        invoice: rect.top
      })
    }).exec()
    wx.createSelectorQuery().select('#barH').boundingClientRect(function (rect) {
      that.setData({
        barH: rect.height
      })
    }).exec()
  },
  //bar切换的渲染调用
  setDatas: function (current) {
    this.setData({
      currentTap: current
    })
  },
  //监听滚动条事件
  onPageScroll: function (e) {
    var that = this;
    var barH = that.data.barH;
    if (e.scrollTop >= (that.data.refunds - barH) && e.scrollTop < (that.data.exchangeGoods - barH)) {
      that.setDatas(1);
    } else if (e.scrollTop >= (that.data.exchangeGoods - barH) && e.scrollTop < (that.data.moneyGoes - barH)) {
      that.setDatas(2);
    } else if (e.scrollTop >= (that.data.moneyGoes - barH) && e.scrollTop < (that.data.invoice - barH)) {
      that.setDatas(3);
    } else if(e.scrollTop >= (that.data.moneyGoes - barH)){
      that.setDatas(4);
    } else {
      that.setDatas(0)
    }
  },
  scrollBottom: function(e){
    console.log(e)
  },
  scroll: function(e){
    console.log(e)
  }
})