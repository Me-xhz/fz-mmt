const app = getApp();
const common = require('../../utils/common.js')

Page({
  data: {
    items: [],
    boxInfo: {}
  },

  onLoad: function (options) {
    this.getBoxInfo(options.box_sn)
  },

  onShow: function () {

  },
  getBoxInfo(id){
    var that = this;
    var uri = app.getPath.boxInfo;
    var data = {
      box_sn: id
    }
    common.ApiLogistics(uri, data, true, function (res) {
      if (res.success == 1){
        that.setData({
          items: res.result.boxOrderInfo,
          boxInfo: res.result.boxInfo
        })
      }
    })
  }
})