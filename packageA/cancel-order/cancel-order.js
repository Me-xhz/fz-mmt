// packageA/cancel-order/cancel-order.js
var app = getApp();
var common = require("../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    cancelList:{},
    showBottomLoading: false,
    page:1,
    page_size:10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从外部分享进入时，显示左上角回到首页  改动带external时为内部进入携带参数，外部进入不带参数
    if (options && options.entryType && options.entryType == 'external') {
      this.setData({
        isShowGoHome: false,
      })
    } else {
      this.setData({
        isShowGoHome: true
      })
    }
    this.getAlreadyWriteOffList()
  },
  // 返回首页
  gotoHome: function() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 上拉加载
  onReachBottom: function () {
    this.getMoreList()
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    this.data.page = 1;
    this.data.cancelList = [];
    this.getAlreadyWriteOffList();
  },
  // 上拉加载更多
  getMoreList(){
    let that = this;
    if (this.data.cancelList.length > 0 && this.data.cancelList.length%this.data.page_size==0){
      let url = app.getPath.getAlreadyWriteOffList
      let data = {
        page: this.data.cancelList.length / this.data.page_size + 1,
        page_size: that.data.page_size,
      }
      this.setData({
        showBottomLoading: true
      })
      common.ApiGateWayTest(url, data, true, function (res) {
        if (res.data.success == 1) {
          that.setData({
            cancelList: [...that.data.cancelList, ...res.data.result],
            showBottomLoading:false
          })
        }
      })
    }
  },
  // 获取提货记录
  getAlreadyWriteOffList(){
    let that=this;
    let url=app.getPath.getAlreadyWriteOffList
    let data = {
      page: this.data.page,
      page_size: that.data.page_size,
    }
    common.ApiGateWayTest(url, data,true,function (res) {
      if(res.data.success==1){
        that.setData({
          cancelList:res.data.result,
          showBottomLoading: false
        })
        wx.stopPullDownRefresh();
      }
    })
  },
})
