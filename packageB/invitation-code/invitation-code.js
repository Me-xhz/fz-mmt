// packageB/invitation-code/invitation-code.js
var app = getApp();
const common = require("../../utils/common.js");
const QRCode = require('../../utils/qrcode/weapp-qrcode.js')
var WxParse = require('../../wxParse/wxParse.js');
import rpx2px from '../../utils/qrcode/rpx2px.js'
let qrcode;

// 300rpx 在6s上为 150px
const qrcodeWidth = rpx2px(300)

Page({
  data: {
    iconURL: app.dataBase.iconURL,
    qrcodeWidth: qrcodeWidth,
    info:{},
    showRidoTitleModal: false
  },
  onLoad: function (options){
    var that = this;
    // 外部带商品店铺
    that.setData({
      entryData: options
    })
    var options = that.data.entryData;
    var pickupId = common.getStorageSync('getpickup');
    // 判断是否第一次进入 且是从外部进入，如二维码扫码 && app.firstlaunchApp
    if (options && (options.atitude || options.pickup_id) && !pickupId) {
      that.getExternal(options.pickup_id).then(function () {
        // 关闭开关，让app知道已经不是第一次进入当前页
        app.firstlaunchApp = false;
        // 外部已带经纬度定位，无需再调用定位接口，所以将缓存定位改为真，让页面可以显示
        common.setStorageSync('authSetting', {
          'scope.userLocation': true
        });
      })
    }
  },
  onShow: function () {
    clearInterval(this.checkInterval);
    this.getInfo();
  },
  onHide(){
    clearInterval(this.checkInterval);
  },
  onUnload(){
    clearInterval(this.checkInterval);
  },
  // 从外部二维码扫码，带经纬度和外部标识external
  getExternal: function (pickup_id) {
    var that = this;
    var uri = app.getPath.getpickup;
    var data = {
      pickup_id: pickup_id
    }
    return new Promise(function (resolve, reject) {
      // 获取提货点
      common.ApiGateWayTest(uri, data, true, function (res) {
        if (res && res.data && res.data.success == 1) {
          var res = res.data.result.cities.pick_up;
          common.setStorage({
            key: 'getpickup',
            data: {
              'pickup_id': res.pickup_id,
              'cityName': res.pickup_name,
              'pickup_address': res.pickup_address,
              'pickup_contact': res.pickup_contact,
              'pickup_phone': res.pickup_phone,
              'pickup_type': res.pickup_type,
            }
          }, function (res) {
            resolve('获取id成功')
          })
          common.setStorage({
            key: 'city',
            data: {
              'pickup_id': res.pickup_id,
              'warehouse_id': res.warehouse_id,
              'cityName': res.city_name,
              'is_pick_up': 1
            }
          })
        }
      })
    })
  },
  // 获取信息接口
  getInfo(){
    var that = this;
    common.showLoad(this);
    clearInterval(that.checkInterval);
    var url = app.getPath.createCode;
    var checkIsVailedUrl = app.getPath.checkIsVailed;
    var launchOption = common.getStorageSync('invite_activity_shareTicket');
    if (launchOption.shareTicket && launchOption.shareTicket != ''){
      wx.getShareInfo({
        shareTicket: launchOption.shareTicket,
        success: function (res) {
          var data = {
            invite_activity_id: launchOption.query.invite_activity_id,
            wx_scene: launchOption.scene,
            encrypted_data: JSON.stringify(res),
          }
          common.ApiGateWayTest(url, data, true, function (res) {
            var resData = res.data;
            common.hideLoad(that);
            if (resData.success == 1) {
              that.setData({
                info: resData.result
              })
              WxParse.wxParse('content', 'html', resData.result.remark, that, 0);
              if (resData.result.invite_code != '') {
                if (resData.result.status == 0){
                  var checkIsVailedData = {
                    invite_code: resData.result.invite_code
                  }
                  that.checkInterval = setInterval(() => {
                    common.ApiGateWayTest(checkIsVailedUrl, checkIsVailedData, true, function (checkRes) {
                      var checkResData = checkRes.data;
                      if (checkResData.success == 1) {
                        if (checkResData.result.data.status == 1) {
                          clearInterval(that.checkInterval);
                          that.setData({
                            'info.status': 1,
                            'info.status_text': "已兑换",
                            showRidoTitleModal: true
                          })
                          setTimeout(() => {
                            that.setData({
                              showRidoTitleModal: false
                            })
                            wx.switchTab({
                              url: '/pages/index/index',
                            })
                          }, 4000)
                        } else {
                          return
                        }
                      }
                    })
                  }, 1000)
                }
                qrcode = new QRCode('canvas', {
                  // usingIn: this, // usingIn 如果放到组件里使用需要加这个参数
                  text: resData.result.invite_code,
                  width: qrcodeWidth,
                  height: qrcodeWidth,
                  colorDark: "#000000",
                  colorLight: "white",
                  correctLevel: QRCode.CorrectLevel.H,
                });
              }
            } else {
              common.toast(resData.msg);
              return
            }
          })
        },
        fail: function (res) {
          common.hideLoad(that);
          common.toast('非正常操作');
          return;
        }
      })
    }else{
      var data = {
        invite_activity_id: launchOption.query ? launchOption.query.invite_activity_id : that.data.entryData.invite_activity_id,
        wx_scene: launchOption.scene ? launchOption.scene : 1001,
        encrypted_data: '',
      }
      common.ApiGateWayTest(url, data, true, function (res) {
        var resData = res.data;
        common.hideLoad(that);
        if (resData.success == 1) {
          that.setData({
            info: resData.result
          })
          WxParse.wxParse('content', 'html', resData.result.remark, that, 0);
          if (resData.result.invite_code != '') {
            if (resData.result.status == 0) {
              var checkIsVailedData = {
                invite_code: resData.result.invite_code
              }
              that.checkInterval = setInterval(() => {
                common.ApiGateWayTest(checkIsVailedUrl, checkIsVailedData, true, function (checkRes) {
                  var checkResData = checkRes.data;
                  if (checkResData.success == 1) {
                    if (checkResData.result.data.status == 1) {
                      clearInterval(that.checkInterval);
                      that.setData({
                        'info.status': 1,
                        'info.status_text': "已兑换",
                        showRidoTitleModal: true
                      })
                      setTimeout(() => {
                        that.setData({
                          showRidoTitleModal: false
                        })
                        wx.switchTab({
                          url: '/pages/index/index',
                        })
                      }, 4000)
                    } else {
                      return
                    }
                  }
                })
              }, 1000)
            }
            qrcode = new QRCode('canvas', {
              // usingIn: this, // usingIn 如果放到组件里使用需要加这个参数
              text: resData.result.invite_code,
              width: qrcodeWidth,
              height: qrcodeWidth,
              colorDark: "#000000",
              colorLight: "white",
              correctLevel: QRCode.CorrectLevel.H,
            });
          }
        } else {
          common.toast(resData.msg);
          return
        }
      })
    }
  },
  // 长按保存二维码
  save: function () {
    wx.showActionSheet({
      itemList: ['保存图片'],
      success: function (res) {
        if (res.tapIndex == 0) {
          qrcode.exportImage(function (path) {
            wx.saveImageToPhotosAlbum({
              filePath: path,
            })
          })
        }
      }
    })
  },
  // 返回首页
  gotoHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 滚动溢出
  bindtouchmove() {
    return false
  },
})