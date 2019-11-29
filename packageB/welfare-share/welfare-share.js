// packageB/invitation-code-share/invitation-code-share.js
var app = getApp();
const common = require("../../utils/common.js");
Page({
  data: {
    list: []
  },

  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true
    })
    this.getInviteActivity();
  },
  getInviteActivity(){
    var that = this;
    var url = app.getPath.pickUpConponShare;
    common.ApiGateWayTest(url,'',true,function(res){
      var resData = res.data;
      if(resData.success == 1){
        that.setData({
          list: resData.result
        })
      }
    })
  },
  onShareAppMessage: function (e) {
    var that = this;
    var item = e.target.dataset.item;
    return {
      title: item.share_title,
      path: '/pages/index/index?is_welfare=1' + '&pickup_id=' + item.pickup_id,
      imageUrl: item.share_img
    }
  }
})
