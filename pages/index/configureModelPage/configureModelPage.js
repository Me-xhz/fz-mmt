// pages/index/configureModelPage/configureModelPage.js
var app = getApp();
var common = require("../../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var position = options.position;
    this.setData({
      position
    })
    this.getConfigureIndexModel(position)
    this.getShare(position)
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    return {
      title: that.share_data.share_title,
      imageUrl: that.share_data.share_img,
      path: '/pages/index/configureModelPage/configureModelPage?position=' + that.data.position,
      success: function (res) {
        common.toast('分享成功')
      },
      fail: function (res) {
        common.toast('分享失败')
      }
    }
  },
  getConfigureIndexModel: function (position) {
    var that = this;
    var uri = app.getPath.indexmodel;
    var data = {
      position
    };
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res && res.data && res.data.success == 1) {
        if (res.data.result.title){
          wx.setNavigationBarTitle({
            title: res.data.result.title
          })
        }
        var indexModel = res.data.result.lists;
        if (indexModel.length==0){
          common.toast('该活动已结束')
          setTimeout(function(){
            
            wx.navigateBack({
              delta: 2
            })
          },1500)
        
        }
        indexModel.forEach(function (model) {
          model.forEach(function (item) {
            // 增加优惠券总金额
            if (item.type == 1 && item.route.url == "coupon") {
              var total = 0;
              item.route.param.forEach(function (good) {
                total += parseInt(good.money);
              })
              item.route.total = total;
            }
          })
        })
        that.setData({
          indexModel
        })
      }
    })
  },
  // 获取分享信息
  getShare: function (position){
    var that = this;
    var uri = app.getPath.indexShare;
    var data = {
      position
    };
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res && res.data && res.data.success == 1) {
        that.setData({
          share_data: res.data.result
        })
      }
    })
  },
  toGetCoupon:function(e){
    this.getConfigureIndexModel(this.data.position)
  }
})