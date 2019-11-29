// packageA/logistics/nodelivery_detail.js
const app = getApp();
const common = require('../../utils/common.js')
Page({
  data: {
    orderDetailInfo: {},
    orderSn: 0
  },
  onLoad: function (options) {
    this.data.orderSn = options.orderSn;
    this.getDetailInfo();
  },
  getDetailInfo(){
    var that = this;
    var url = app.getPath.takeOrderDetail;
    var data = {
      order_sn: that.data.orderSn
    }
    common.ApiLogistics(url, data, true, function (resData) {
      if (resData.success == 1){
        that.setData({
          orderDetailInfo: resData.result
        })
      }else{
        common.toast(resData.msg);
        return
      }
    })
  },
  onBack(){
    var that = this;
    common.showModal('是否商品已清点完成，即将带回仓库','确定',function(res){
      if (res.confirm) {
        var url = app.getPath.unclaimedBackToWare;
        var data = {
          order_sn: that.data.orderSn
        }
        common.ApiLogistics(url, data, true, function (resData) {
          if(resData.success == 1){
            that.getDetailInfo();
          }else{
            common.toast(resData.msg);
            return
          }
        })
      }
    })
  },
  onCall(e) {
    var mobile = e.currentTarget.dataset.mobile;
    wx.makePhoneCall({
      phoneNumber: mobile
    })
  }
})