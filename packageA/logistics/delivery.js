const app = getApp();
const common = require('../../utils/common.js')

Page({
  data: {
    inputValue: "",
  },
  onLoad: function (options) {
   
  },
  onShow: function () {
    if (this.data.order_text && this.data.checkText) {
      common.toast(this.data.order_text)
      this.data.checkText=false
    }
  },
  deliveryInput(e){
    this.setData({
      inputValue: e.detail.value
    })
  },
  submit(){
    var that = this;
    common.showLoad(that);
    wx.navigateTo({
      url: '../../packageA/logistics/orderdetile?orderSn=' + that.data.inputValue,
      success: ()=>{
        common.hideLoad(that);
      }
    })
    setTimeout(()=>{
      common.hideLoad(that);
    },3000)
    that.setData({
      inputValue: ""
    })
  },
  goRecord(){
    wx.navigateTo({
      url: '/packageA/logistics/cancel-record',
    })
  },
  scanCode(){
    var that = this;
    wx.scanCode({
      success (res){
        that.data.inputValue = res.result;
        that.submit();
      }
    })
  }
})
