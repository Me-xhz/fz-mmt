// packageA/my-pickup-code/my-pickup-code.js
var app = getApp();
var common = require("../../utils/common.js");
const QRCode = require('../../utils/qrcode/weapp-qrcode.js')
import rpx2px from '../../utils/qrcode/rpx2px.js'
let qrcode;

// 424rpx 在6s上为 212px
const qrcodeWidth = rpx2px(424)
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    qrcodeWidth: qrcodeWidth,
    isShowGoHome:false,
    itemData:{}
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
    this.getAllGoodsList()
  },
  // 返回首页
  gotoHome: function() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  getAllGoodsList(){
    let that=this
    let url=app.getPath.getAllGoodsList
    common.ApiGateWayTest(url,'',true,function (res) {
      if(res.data.success==1){
        that.setData({
          itemData:res.data.result,
        })
        that.showQrcode(that.data.itemData.user_code)
        wx.stopPullDownRefresh();
      }
    })
  },
  // 长按保存二维码
  save: function() {
    wx.showActionSheet({
      itemList: ['保存图片'],
      success: function(res) {
        if (res.tapIndex == 0) {
          qrcode.exportImage(function(path) {
            wx.saveImageToPhotosAlbum({
              filePath: path,
            })
          })
        }
      }
    })
  },
  //获取二维码
  showQrcode(code){
    qrcode = new QRCode('canvas', {
      // usingIn: this, // usingIn 如果放到组件里使用需要加这个参数
      text: code,
      width: qrcodeWidth,
      height: qrcodeWidth,
      colorDark: "#000000",
      colorLight: "white",
      correctLevel: QRCode.CorrectLevel.H,
    });
  },
//    跳转核销记录
  goRecord(){
      wx.navigateTo({
          url:'/packageA/cancel-order/cancel-order?entryType=external'
      })
  },
//    刷新二维码
  reloadCode(e){
      let that=this
      let data={
          user_code:e.currentTarget.dataset.code
      }
      let url=app.getPath.flashUserCode
      common.ApiGateWayTest(url,data,true,function (res) {
          if(res.data.success==1){
              that.showQrcode(res.data.result.user_code)
              common.toast(res.data.result.msg)
          }
      })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    this.getAllGoodsList()
  }
})
