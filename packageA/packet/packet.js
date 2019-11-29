// packageA/packet/packet.js
//获取应用实例
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowGoHome: false,
    iconURL: app.dataBase.iconURL,
    helpPriceMoudle: false,
    packet_id: "",
    shop_id: 0,
    packet_msg: {},
    help_packet: {},
    packet_list: [],
    packet_rule: {},
    showRules: true,
    activity_red_packet_id: "",
    coupon_msg: {},
    isShowHelpModal: false,
    pickup_id: '',
    showBargain: false,
    showHelp:false,
    showNotHelp:false,
    showTimeEnd:false,
    activityEnd:false,
    showSelfShare: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.data.packet_id = options.packet_id;
    that.data.shop_id = options.shop_id;
    if (options.packet_bargaining){
      that.setData({
        showSelfShare: true,
        isShowHelpModal: true
      })
    }
    // 从外部分享进入时，显示左上角回到首页  改动带external时为内部进入携带参数，外部进入不带参数
    if (options && options.entryType && options.entryType == 'external') {
      this.setData({
        isShowGoHome: false
      })
    } else {
      this.setData({
        isShowGoHome: true
      })
    }
    // 外部带商品店铺
    that.setData({
      entryData: options
    })
    var options = that.data.entryData
    var pickupId = common.getStorageSync('getpickup');
    that.data.pickup_id = pickupId.pickup_id
    // 判断是否第一次进入 且是从外部进入，如二维码扫码 && app.firstlaunchApp
    if (options && (options.atitude || options.pickup_id) && !pickupId) {
      that.getExternal(options.pickup_id).then(function() {
        // 关闭开关，让app知道已经不是第一次进入当前页
        app.firstlaunchApp = false;
        // 清空data内携带参数
        that.data.entryData = {};
        // 外部已带经纬度定位，无需再调用定位接口，所以将缓存定位改为真，让页面可以显示
        common.setStorageSync('authSetting', {
          'scope.userLocation': true
        });
      })
    }

  },
  // 从外部二维码扫码，带经纬度和外部标识external
  getExternal: function(pickup_id) {

    var that = this;
    var uri = app.getPath.getpickup;
    var data = {
      pickup_id: pickup_id
    }
    return new Promise(function(resolve, reject) {
      // 获取提货点
      common.ApiGateWayTest(uri, data, true, function(res) {
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
          }, function(res) {
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
  // 返回首页
  gotoHome: function(e) {
    common.formIdUpdate(e);
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  //达到领取条件领取
  showModal(e) {
    let that = this;
    common.formIdUpdate(e);
    if (that.data.packet_msg.is_max == 1){
      that.getCoupon();
    }else{
      wx.showModal({
        content: '您可以继续分享达到最高红包金额，是否确认立即兑换!',
        success: function (res) {
          if (res.confirm) {
            that.getCoupon();
          }
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getPacketMsg();
  },
  // 分享获取上报
  onShare(e) {
    var that = this;
    common.formIdUpdate(e);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    if (that.data.showSelfShare){
      setTimeout(()=>{
        that.setData({
          showSelfShare: false,
          isShowHelpModal: false
        })
      },2000)
    }
    return {
      title: that.data.packet_msg.share_title,
      path: '/packageA/packet/packet?packet_id=' + that.data.packet_id + '&shop_id=' + that.data.shop_id + '&pickup_id=' + that.data.pickup_id,
      imageUrl: that.data.packet_msg.share_img
    }
  },
  //  获取信息
  getPacketMsg() {
    let that = this;
    let url = app.getPath.packetMsg;
    let data = {
      activity_red_packet_bargaining_id: that.data.packet_id
    }
    common.ApiGateWayTest(url, data, true, function(res) {
      var res = res.data
      if (res.success == 1) {
        // if (res.result.is_self == 0 && res.result.activity_status == 1 && (res.result.is_can_help == 0 || res.result.is_self == 0 && res.result.status == 2)) {
        //   that.setData({
        //     isShowHelpModal: true
        //   })
        // }
        if (res.result.activity_status == 0){
          if (res.result.status == 1 || res.result.status == 2){
            that.setData({
              activityEnd: true,
              isShowHelpModal: true
            })
            return;
          }
        }else{
          if (res.result.status == 2 && res.result.is_self == 0){
            that.setData({
              showTimeEnd: true,
              isShowHelpModal: true
            })
          } else if (res.result.is_can_help == 0 && res.result.is_can_sponsor == 1 && res.result.is_in_activity == 0){
            that.setData({
              showHelp: true,
              isShowHelpModal: true
            })
          } else if (res.result.is_can_help == 0 && (res.result.is_can_sponsor == 0 || res.result.is_in_activity == 1)){
            that.setData({
              showNotHelp: true,
              isShowHelpModal: true
            })
          }
        }
        that.data.activity_red_packet_id = res.result.activity_red_packet_id
        that.setData({
          packet_msg: res.result
        })
        that.getPacketRule()
        that.getPacketList();
      } else {
        common.toast(res.msg);
        return
      }
    })
  },
  // 好友助力
  helpGetPcket(e) {
    let that = this;
    common.formIdUpdate(e);
    var pUri = app.getPath.packetCheckDistance;
    var pData = {
      time_atitude: app.dataBase.userAtitude,
      shop_id: that.data.shop_id
    }
    common.ApiGateWayTest(pUri, pData, true, function (pRes) {
      if (pRes.data.success == 1) {
        let url = app.getPath.packetHelp;
        let data = {
          activity_red_packet_bargaining_id: that.data.packet_id
        }
        common.ApiGateWayTest(url, data, true, function (res) {
          var res = res.data
          if (res.success == 1) {
            if (that.data.packet_msg.status == 0) {
              if (res.result.is_can_help == 1) {
                that.setData({
                  help_packet: res.result,
                  isShowHelpModal: true,
                  showBargain: true,
                })
              }
            }
          } else {
            common.toast(res.msg);
            return
          }
        })
      }else{
        common.toast(pRes.data.msg);
        return
      }
    })

  },
  // 好友助力排行榜
  getPacketList() {
    let that = this;
    let url = app.getPath.packetList;
    let data = {
      activity_red_packet_bargaining_id: that.data.packet_id
    }
    common.ApiGateWayTest(url, data, true, function(res) {
      var res = res.data
      if (res.success == 1) {
        that.setData({
          packet_list: res.result
        })
      }
    })
  },
  // 获取规则
  getPacketRule() {
    let that = this;
    let url = app.getPath.packetRule;
    let data = {
      activity_red_packet_id: that.data.activity_red_packet_id
    }
    common.ApiGateWayTest(url, data, true, function(res) {
      var res = res.data
      if (res.success == 1) {
        that.setData({
          packet_rule: res.result.rule
        })
      }
    })
  },
  //规则的显示隐藏
  showRule() {
    let that = this;
    this.setData({
      showRules: !that.data.showRules
    })
  },
  // 点击领取大红包 重新发起助力红包
  toCreatePacket(e) {
    let that = this;
    common.formIdUpdate(e);
    var pUri = app.getPath.packetCheckDistance;
    var pData = {
      time_atitude: app.dataBase.userAtitude,
      shop_id: that.data.shop_id
    }
    common.ApiGateWayTest(pUri, pData, true, function (pRes) {
      if (pRes.data.success == 1) {
        let url = app.getPath.createPacket;
        let data = {
          activity_red_packet_id: that.data.activity_red_packet_id,
          shop_id: that.data.shop_id
        }
        common.ApiGateWayTest(url, data, true, function (res) {
          if (res.data.success == 1) {
            wx.navigateTo({
              url: '../packet/packet?packet_id=' + res.data.result.activity_red_packet_bargaining_id + '&shop_id=' + that.data.shop_id + '&packet_bargaining=true'
            })
          } else {
            common.toast(res.data.msg)
          }
        })
      } else {
        common.toast(pRes.data.msg);
        return
      }
    })
  },
  // 跳转店铺首页
  goShop(e) {
    let that = this;
    common.formIdUpdate(e);
    wx.navigateTo({
      url: '/packageA/takeout-shop/takeout-shop?shop_id=' + that.data.shop_id,
    })
  },
  // 领取优惠券
  getCoupon() {
    let that = this;
    let url = app.getPath.getPcketCoupon;
    let data = {
      activity_red_packet_bargaining_id: that.data.packet_id,
    }
    common.ApiGateWayTest(url, data, true, function(res) {
      if (res.data.success == 1) {
        if (res.data.result.data.state == 0) {
          that.setData({
            coupon_msg: res.data.result.data.userCouponInfo
          })
          that.getPacketMsg();
        } else {
          common.toast(res.data.result.data.state_desc)
        }
      } else {
        common.toast(res.msg);
        return
      }
    })
  },
  // 关闭弹窗
  closeModal() {
    this.setData({
      isShowHelpModal: false
    })
    this.getPacketMsg();
  },
  // 监听倒计时结束
  // countTimeEnd(e) {
  //   this.getPacketMsg()
  // },
})