var app = getApp();
var common = require("../../utils/common.js");
const QRCode = require('../../utils/qrcode/weapp-qrcode.js')
import rpx2px from '../../utils/qrcode/rpx2px.js'
let qrcode;

// 300rpx 在6s上为 150px
const qrcodeWidth = rpx2px(300)

// pages/order/detail.js
Page({
  data: {
    iconURL: app.dataBase.iconURL,
    ORDER_STATUS: app.ORDER_STATUS,
    reasons: [
      '多拍/拍错/不想要', '缺货'
    ],
    iphoneXBottom: '0rpx',
    order_id: "",
    order: {},
    h: '00',
    m: '00',
    s: '00',
    qrcodeWidth: qrcodeWidth,
    showCountMode: false,
    shopCouponImg: '',
    showBackTip: false,
    // 送达日期
    special_day_text:'次日送达'
  },
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        var model = res.model
        if (model.search('iPhone X') != -1) {
          that.setData({
            iphoneXBottom: '68rpx'
          })
        }
      }
    })
    if (options == undefined || options.orderId == undefined) {
      common.toast("请求参数错误");
      return;
    }
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
    var orderid = options.orderId;
    this.setData({
      orderId: orderid,
    })
  },
  onShow: function () {
    if (this.data.orderId == undefined) {
      common.toast("请求参数错误");
      return;
    }
    this.loadProductDetail(this.data.orderId);
  },
  onReady() {

  },
  // 联系便利店店主
  callManager: function (e) {
    var telNum = e.currentTarget.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: telNum
    })
  },
  //倒计时函数
  countTime: function (now, end) {
    var that = this;
    var leftTime = end - now;
    var d, h, m, s;
    var teamTime = setInterval(() => {
      leftTime = leftTime - 1
      if (leftTime >= 0) {
        d = Math.floor(leftTime / 60 / 60 / 24, 10); //计算剩余的天数
        h = Math.floor((leftTime / 60 / 60) % 24) + d * 24;
        m = Math.floor((leftTime / 60) % 60);
        s = Math.floor(leftTime % 60);
      } else {
        clearInterval(teamTime);
        that.loadProductDetail();
        return false;
      }
      h = h > 9 ? h : ('0' + h);
      m = m > 9 ? m : ('0' + m);
      s = s > 9 ? s : ('0' + s);
      this.setData({
        h,
        m,
        s
      })
    }, 1000)
  },
  //申请原因弹层
  setModalStatus: function (e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step();

    this.setData({
      animationData: animation.export()
    })

    this.setData({
      showfwModalStatus: true,
      textareaHidden: true
    });
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showfwModalStatus: false,
          textareaHidden: false
        });
      }
    }.bind(this), 200)
  },
  //选择申请原因
  setReasonBefore: function (e) {
    var that = this;
    if (e.currentTarget.dataset.item) {
      var item = e.currentTarget.dataset.item;
    } else {
      var item = this.data.reasons[e.detail.value["0"]]
    }
    var reason = item;
    if (e.currentTarget.dataset.status == 1) {
      common.showModal('是否确定退款？', '确定', function (e) {
        if (e.confirm) {
          that.refund(item);
          that.setData({
            showfwModalStatus: false
          });
        }

      })

    } else {
      this.setModalStatus(e);
      return false;
    }

  },
  // 申请退款
  refund: function (e) {
    var that = this;
    var orderId = e.target.dataset.orderId;
    wx.navigateTo({
      url: '/packageA/user/application-return?type=1&orderId=' + orderId
    })
    // var url = app.getPath.submitbackordersn;
    // var data = {
    //   order_sn: that.data.order.order_sn,
    //   reason:reason
    // };
    // common.ApiGateWayTest(url, data, true, function (res) {
    //   var res = res.data;
    //   if(res.success==1){
    //     common.toast(res.result.state_desc)
    //     wx.navigateTo({
    //       url: '/packageA/user/order-return-detail?id=' + res.result.back_id
    //     })

    //   }
    // })
  },
  loadProductDetail: function (orderid) {
    var that = this;
    common.showLoad(this);
    var url = app.getPath.orderDetail;
    var data = {
      order_id: that.data.orderId
    };
    common.ApiGateWayTest(url, data, true, function (res) {
      var order = res.data.result;
      if (order.status != 12) {
        if (!wx.hideShareMenu) {
          wx.hideShareMenu();
        }
      } else {
        var now = new Date().getTime() / 1000;
        if (order.found_end_time >= now) {
          that.countTime(now, order.found_end_time)
        }
      }
      for (var i = 0; i < order.products.length; i++) {
        if (order.products[i].back_info.back_id != 0) {
          that.data.showBackTip = true;
          break
        }
      }
      that.setData({
        order: order,
        showBackTip: that.data.showBackTip,
        special_day_text:!order.special_day_text.length? that.special_day_text : order.special_day_text
      })
      that.getIsShowShopCouponAd()
      if (order.status == app.ORDER_STATUS.PICKING) {
        qrcode = new QRCode('canvas', {
          // usingIn: this, // usingIn 如果放到组件里使用需要加这个参数
          text: order.get_sn,
          width: qrcodeWidth,
          height: qrcodeWidth,
          colorDark: "#000000",
          colorLight: "white",
          correctLevel: QRCode.CorrectLevel.H,
        });
      }
      common.hideLoad(that);
    })
  },
  // 积分订单支付
  pointPay(e) {
    var that = this;
    var orderId = e.currentTarget.dataset.orderId;
    var payUri = app.getPath.doPayPoint;
    var payData = {
      order_id: orderId
    }
    common.ApiGateWayTest(payUri, payData, true, function (res) {
      var resData = res.data;
      if (resData.success == 1) {
        if (resData.result.state == 1) {
          common.toast('商品兑换失败')
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 100
          })
        } else {
          common.toast('商品兑换成功')
          wx.redirectTo({
            url: '/packageA/credits-payment/credits-payment?order_id=' + payData.order_id
          })
        }
      }
    })
  },
  //前往商品详情页
  goprodcut: function (e) {
    var productId = e.currentTarget.dataset.productId;
    var order_prom_type = e.currentTarget.dataset.order_prom_type
    if (order_prom_type == 8) {
      var goods_id = e.currentTarget.dataset.scoreId;
      wx.navigateTo({
        url: '/packageA/credits-product/credits-product?entryType=external&productId=' + goods_id,
      })
    } else {
      wx.navigateTo({
        url: '../../pages/product/product?entryType=external&productId=' + productId,
      })
    }

  },
  touchComment: function (e) {
    var order = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: '../user/order-review?order=' + order
    })
  },
  go_application_return: function (e) {
    var goods = e.currentTarget.dataset.goods;
    if (goods.back_info && goods.back_info.back_id != 0) {
      wx.navigateTo({
        url: '../user/order-return-detail?entryType=external&id=' + goods.back_info.back_id,
      })
    } else {
      wx.navigateTo({
        url: '../user/application-return?type=2&rec_id=' + goods.rec_id,
      })
    }
  },
  //取消订单
  touchCancel: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.orderId;
    var url = app.getPath.cancelOrder;
    var data = {
      order_id: orderId
    }
    var content = '是否取消该订单？';
    var confirmText = '确定';
    common.showModal(content, confirmText, function (res) {
      res.confirm && common.ApiGateWayTest(url, data, true, function (res) {
        if (res.data.success == 1) {
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 100
          })
          common.toast(res.data.msg);
          that.loadProductDetail();
        } else {
          common.toast(res.data.msg);
        }
      });
    })
  },

  //确认收货
  touchConfirm: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.orderId;
    var uri = app.getPath.confirmReceive;
    var data = {
      order_id: orderId
    }
    var content = '你确定已收到宝贝吗？';
    var confirmText = '确定';
    common.showModal(content, confirmText, function (res) {
      res.confirm && common.ApiGateWayTest(uri, data, true, function (res) {
        if (res.data.success == 1) {
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 100
          })
          common.toast(res.data.msg);
          that.loadProductDetail();
        } else {
          common.toast(res.data.msg);
        }
      })
    })
  },
  // 立即支付
  touchPay: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.orderId;
    var payUri = app.getPath.doPay;
    var payData = {
      order_id: orderId,
      payment_code: 'wxpay'
    }
    common.ApiGateWayTest(payUri, payData, true, function (res) {
      if (res.data.success == 1) {
        var data = res.data.result;
        common.doWechatPay(data, function (res) {
          common.toast('支付成功');
          // 支付成功后二次验证，修改后台状态
          // that.checkPay(orderId)
          wx.navigateTo({
            url: '/pages/confirm/paymentStatus/paymentStatus?order_id=' + payData.order_id + '&payment_code=' + payData.payment_code,
          })
        }, function (failres) {
          common.toast('支付失败');
          // wx.pageScrollTo({
          //   scrollTop: 0,
          //   duration: 100
          // })
          that.loadProductDetail();
        })
      }
    })
  },
  checkPay: function (orderId) {
    var that = this;
    var uri = app.getPath.checkPay;
    var data = {
      order_id: orderId
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      // wx.pageScrollTo({
      //   scrollTop: 0,
      //   duration: 100
      // })
      that.loadProductDetail();
    })
  },
  touchSubComment: function (e) {
    var order = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: '../user/add-order-review?order=' + order,
    })
  },
  //查看物流
  touchExpress: function (e) {
    var item = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../user/order-express?order=' + item.order.id + '&delivery_id=' + item.delivery_id
    })
  },
  // 复制到剪贴板
  setClipboard: function () {
    wx.setClipboardData({
      data: this.data.order.order_sn,
      success: function () {
        common.toast('复制成功')
      },
      fail: function () {
        common.toast('复制失败，请重试')
      }
    })
  },
  // 返回首页
  gotoHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 拨打客服电话
  phoneCall: function () {
    common.phoneCall(app.globalData.hotline);
  },
  //跳转在线客服
  golinkkf: function () {
    app.dataBase.pageUrl = 'http://q.url.cn/s/6l3eQOm?_type=wpa&_wv=2';
    common.goWebview();
  },
  /**
   * 用户分享
   */
  onShareAppMessage: function () {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    return {
      title: that.data.order.share_title,
      path: '/packageA/groupbuy/groupbuy?pickup_id=' + that.data.order.pickup_id + '&found_id=' + that.data.order.found_id,
      imageUrl: that.data.order.share_img,
    }
  },
  toShare(e) {
    common.formIdUpdate(e);
  },
  // 长按保存二维码
  save: function () {
    console.log('save')
    wx.showActionSheet({
      itemList: ['保存图片'],
      success: function (res) {
        console.log(res.tapIndex)
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
  // 是否有可领取优惠券
  getIsShowShopCouponAd() {
    var that = this;
    var uri = app.getPath.adlist;
    var data = {
      pid: 11
    }
    common.ApiGateWayTest(uri, data, true, res => {
      var resData = res.data;
      if (resData.success == 1) {
        if (resData.result[0].ad_link != '') {
          that.setData({
            showCountMode: true,
            shopCouponImg: resData.result
          })
        } else {
          that.setData({
            showCountMode: false
          })
        }
      } else {
        common.toast(resData.msg);
        return
      }
    })
  },
  // 跳转指定专题页
  goWebView: function (e) {
    var that = this;
    common.goAdWebView(e);
  },
  // 跳转拼团详情
  toDetail(e) {
    var that = this;
    common.formIdUpdate(e);
    wx.navigateTo({
      url: '/packageA/groupbuy/groupbuy?found_id=' + that.data.order.found_id + '&entryType=external',
    })
  }
})