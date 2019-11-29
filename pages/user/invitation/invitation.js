// pages/user/money/money.js
var app = getApp();
var common = require("../../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_info: null,
    iconURL: app.dataBase.iconURL,
    coupon_arr: [
      {
        'title': '首次邀请',
        'content': '注册下单成功',
        'tag': '满10元使用'
      }, {
        'title': '邀请 2 人',
        'content': '注册下单成功',
        'tag': '满10元使用'
      }, {
        'title': '邀请 3 人',
        'content': '注册下单成功',
        'tag': '满10元使用'
      }, {
        'title': '邀请无上限',
        'content': '大额现金等你拿',
        'tag': '加油！'
      },
    ],
    showRuleModalStatus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.accountLog()
  },
  accountLog:function(){
    var that = this;
    var uri = app.getPath.getInviteInfo;
    common.ApiGateWayTest(uri, '', true, function (res) {
      if (res.data.success == 1) {
        that.setData({
          user_info: res.data.result
        })
      }      
    })
  },
  // 弹窗
  setRuleModalStatus: function (e) {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })

    animation.translateY(300).opacity(1).step();
    this.setData({
      animationData: animation.export()
    })

    this.setData({
      showRuleModalStatus: true
    });
    setTimeout(function () {
      animation.translateY('-150px').translateX('-50%').step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showRuleModalStatus: false
        });
      }
    }.bind(this), 200)
  },

  viewPic: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.imgurl,
      urls: [e.currentTarget.dataset.imgurl],
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
  onShareAppMessage: function () {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    console.log(pickup.pickup_id);
    return {
      title: that.data.user_info.share_title,
      path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&inviteId=' + that.data.user_info.invite_user,
      imageUrl: that.data.user_info.share_img,
      success: function (res) {
        console.log("转发成功");
      },
      fail: function (res) {
        console.log("转发失败");
      }
    }
  }
})