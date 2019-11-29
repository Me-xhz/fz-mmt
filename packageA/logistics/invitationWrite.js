const app = getApp();
const common = require('../../utils/common.js')

Page({
  data: {
    inputValue: ""
  },
  onLoad: function (options) {

  },
  onShow: function () {

  },
  deliveryInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  submit() {
    var that = this;
    common.showTitleModal('是否确定核销？','邀请码：' + that.data.inputValue,'确定',function(res){
      if (res.confirm){
        var url = app.getPath.inviteActivityReceiveList;
        var data = {
          invite_code: that.data.inputValue
        }
        common.ApiGateWayTest(url, data, true, function (res) {
          var resData = res.data;
          common.toast(resData.msg);
          that.setData({
            inputValue: ""
          })
        })
      }else{
        common.toast("已取消");
        return
      }
    })
  },
  scanCode() {
    var that = this;
    wx.scanCode({
      success(res) {
        that.data.inputValue = res.result;
        that.submit();
      }
    })
  }
})