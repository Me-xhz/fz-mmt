var app = getApp();
Page({
  data: {
    currentTap: 0,
  },
  onLoad: function () {
    //调用获取四块内容的top高度
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
      case 1: e.scrollTop = this.data.couponT - barH;
        break;
      case 2: e.scrollTop = this.data.OrderT - barH;
        break;
      case 3: e.scrollTop = this.data.LogisticsT - barH;
        break;
      case 4: e.scrollTop = this.data.ServiceT - barH;
        break;
    }
    that.setDatas(current);
    wx.pageScrollTo({
      scrollTop: e.scrollTop,
      duration: 0
    });
  },
  // 获取各块内容的节点位置
  wxcreate: function () {
    var that = this;
    wx.createSelectorQuery().select('#commodity').boundingClientRect(function (rect) {
      that.setData({
        commodityT: rect.top
      })
    }).exec()
    wx.createSelectorQuery().select('#coupon').boundingClientRect(function (rect) {
      that.setData({
        couponT: rect.top
      })
    }).exec()
    wx.createSelectorQuery().select('#Order').boundingClientRect(function (rect) {
      that.setData({
        OrderT: rect.top
      })
    }).exec()
    wx.createSelectorQuery().select('#Logistics').boundingClientRect(function (rect) {
      that.setData({
        LogisticsT: rect.top
      })
    }).exec()
    wx.createSelectorQuery().select('#Service').boundingClientRect(function (rect) {
      that.setData({
        ServiceT: rect.top
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
    if (e.scrollTop >= (that.data.couponT - barH) && e.scrollTop < (that.data.OrderT - barH)) {
      that.setDatas(1)
    } else if (e.scrollTop >= (that.data.OrderT - barH) && e.scrollTop < (that.data.LogisticsT - barH)) {
      that.setDatas(2)
    } else if (e.scrollTop >= (that.data.LogisticsT - barH) && e.scrollTop < (that.data.ServiceT - barH)) {
      that.setDatas(3)
    } else if (e.scrollTop >= (that.data.LogisticsT - barH)){
      that.setDatas(4)
    }else {
      that.setDatas(0)
    }
  }
})