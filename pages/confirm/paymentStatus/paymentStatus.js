// pages/confirm/paymentStatus/paymentStatus.js
var app = getApp();
var common = require("../../../utils/common.js");

Page({
  data: {
    iconURL: app.dataBase.iconURL,
    // 上拉加载部分
    refresh: true,
    page: 1,
    recommend_good_list: [],
    showNewCouponModalStatus: false,
    newCouponImg: "",
    duration: 500,
    interval: 5000,
    indexAdcurrent: 0,
    indicatorColor: "#fff",
    indicatorActiveColor: "#eb3c39",
    circular: true,
    autoplay: false,
    adList: [],
    indicatorDots: false,
    showRedEnvel: false,
    showRedEnvelType: 1,
    red_packet_id: 0,
    //是否下单弹出通知框
    order_confirm_notice: false,
    //弹窗图片url
    order_confirm_img: '',
  },
  onLoad: function(options) {
    this.weekShippingAd();
    if (options == undefined) {
      common.toast("请求参数错误");
      return;
    }
    wx.showShareMenu({
      withShareTicket: true
    });
    var that = this;
    that.setData({
      order_id: options.order_id,
      payment_code: options.payment_code
    });
    that.getcheckPay();
    this.getAd();
  },
  onShow: function() {
    this.getRecommendGoodList();
  },
  getcheckPay: function() {
    var that = this;
    var uri = app.getPath.checkPay;
    var newCouponUri = app.getPath.paySuccessCoupon;
    var data = {
      order_id: that.data.order_id,
      payment_code: that.data.payment_code
    };
    common.ApiGateWayTest(uri, data, true, function(res) {
      if (res.data.success == 1) {
        let order_url = app.getPath.achieveOrder;
        let achieve_data = {
          order_id: that.data.order_id
        };
        common.ApiGateWayTest(order_url, achieve_data, true, function(resData) {
          if (resData.data.success == 1) {
            if (resData.data.result.state == 0) {
              common.toast(resData.data.result.state_desc);
            }
          }
          that.setData({
            msg: res.data.msg,
            success: res.data.success
          });
          if (
            res.data.result.couponInfo.list_img &&
            Object.prototype.toString.call(res.data.result.couponInfo) ===
            "[object Object]"
          ) {
            that.showNewCouponModalStatus();
            that.setData({
              newCouponImg: res.data.result.couponInfo.list_img
            });
          }
          that.getSendRpAfterOrder();
        });
      } else {
        app.aldstat.sendEvent("下单未支付");
        that.setData({
          msg: res.data.msg,
          success: res.data.success
        });
      }
    });
    // if (that.data.payment_type && that.data.payment_type == 'true'){
    //   that.setData({
    //     msg: '订单支付失败',
    //     success: 0
    //   })
    // }else{

    // }
  },
  goOrderList: function() {
    var that = this;
    wx.redirectTo({
      url: "../../../packageA/user/dingdan?entryType=external&currentTab=0"
    });
  },
  goOrderDetail: function() {
    var that = this;
    wx.redirectTo({
      url: "../../../packageA/user/detail?orderId=" + that.data.order_id
    });
  },
  goHome: function() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  onPay: function() {
    var that = this;
    var payUri = app.getPath.doPay;
    var payData = {
      order_id: that.data.order_id,
      payment_code: that.data.payment_code
    };
    common.ApiGateWayTest(payUri, payData, true, function(res) {
      if (res.data.success == 1) {
        var data = res.data.result;
        common.doWechatPay(
          data,
          function(res) {
            that.getcheckPay();
          },
          function(failres) {}
        );
      }
    });
  },
  // 新人自动发放优惠券弹窗
  showNewCouponModalStatus: function(e) {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });

    this.setData({
      animationData: animation.export()
    });

    this.setData({
      showNewCouponModalStatus: true
    });
    setTimeout(
      function() {
        animation
          .translateY("-100px")
          .translateX("-50%")
          .opacity(1)
          .step();
        this.setData({
          animationData: animation
        });
      }.bind(this),
      200
    );
  },
  // 隐藏新人自动发放优惠券弹窗
  hideNewCouponModalStatus: function(e) {
    common.formIdUpdate(e);
    this.setData({
      showNewCouponModalStatus: false
    });
  },
  goCouponList: function(e) {
    var that = this;
    wx.redirectTo({
      url: "../../../pages/coupon/coupon?entryType=external"
    });
  },
  // 上拉加载部分
  getRecommendGoodList: function() {
    var that = this;
    var url = app.getPath.highSaleGoods;
    var page_size = 10;
    var data = {
      page: this.data.page,
      page_size
    };
    common.ApiGateWayTest(url, data, true, function(res) {
      var res = res.data;
      if (res.success == 1) {
        that.setData({
          recommend_good_list: [
            ...that.data.recommend_good_list,
            ...res.result.products
          ]
        });
        if (res.result.products.length < page_size) {
          that.refresh(false);
        } else {
          that.refresh(true);
        }
      }
    });
  },
  //获取广告图
  getAd: function() {
    var that = this;
    var uri = app.getPath.adlist;
    var data = {
      pid: 7
    };

    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function(res) {
        if (res && res.data && res.data.success == 1) {
          var data = res.data.result;
          if (data.length > 1) {
            that.setData({
              indicatorDots: true
            });
          } else {
            that.setData({
              indicatorDots: false
            });
          }
          that.setData({
            adList: data,
            indexAdcurrent: 0,
            // share_title: data.share_title,
            indicatorDots: data.length > 1 ? true : false
            // keyWord: data.keyword
          });
          resolve("successAd");
        }
      });
    });
  },
  adclose: function(ad_id, is_close) {
    var that = this;
    var uri = app.getPath.adclose;
    var data = {
      ad_id,
      is_close
    };
    common.ApiGateWayTest(uri, data, true, function(res) {});
  },
  // 跳转指定专题页
  goWebView: function(e) {
    common.goAdWebView(e);
  },
  // 是否允许上拉加载
  refresh: function(data) {
    this.setData({
      refresh: data
    });
  },
  // 红包-是否有领取红包
  getSendRpAfterOrder() {
    var that = this;
    var url = app.getPath.sendRpAfterOrder;
    var data = {
      order_id: that.data.order_id
    };
    common.ApiGateWayTest(url, data, true, function(res) {
      var resData = res.data;
      if (resData.success == 1) {
        var entry_share_info = {
          user_id: resData.result.user_id,
          invite_share_img: resData.result.invite_share_img,
          invite_share_text: resData.result.invite_share_text,
          urge_share_img: resData.result.urge_share_img,
          urge_share_text: resData.result.urge_share_text
        };
        common.setStorageSync("entry_share_info", entry_share_info);
        if (resData.result.is_send) {
          that.setData({
            showRedEnvel: true,
            showRedEnvelType: 1,
            red_packet_id: resData.result.red_packet_id
          });
        } else {
          that.setData({
            showRedEnvel: true,
            showRedEnvelType: 2
          });
        }
      } else {
        // common.toast(resData.msg);
        return;
      }
    });
  },
  // 上拉触底事件
  onReachBottom: function(e) {
    if (this.data.refresh) {
      this.setData({
        page: this.data.page + 1
      });
      this.getRecommendGoodList();
    }
  },
  // 分享
  onShareAppMessage: function(res) {
    var that = this;
    var pickup = common.getStorageSync("getpickup");
    var entry_share_info = common.getStorageSync("entry_share_info");
    if (res.target && res.target.dataset.shareinfo) {
      let shareInfo = res.target.dataset.shareinfo;
      if (shareInfo && shareInfo.fromButton == "notice") {
        return {
          title: entry_share_info.urge_share_text,
          path: "/pages/index/index?pickup_id=" +
            pickup.pickup_id +
            "&user_id=" +
            entry_share_info.user_id,
          imageUrl: entry_share_info.urge_share_img
        };
      } else if (shareInfo && shareInfo.fromButton == "envelopes") {
        return {
          title: entry_share_info.invite_share_text,
          path: "/pages/index/index?pickup_id=" +
            pickup.pickup_id +
            "&user_id=" +
            entry_share_info.user_id,
          imageUrl: entry_share_info.invite_share_img
        };
      } else {
        return {
          title: entry_share_info.invite_share_text,
          path: "/pages/index/index?pickup_id=" + pickup.pickup_id,
          imageUrl: entry_share_info.invite_share_img
        };
      }
    } else {
      return {
        title: entry_share_info.invite_share_text,
        path: "/pages/index/index?pickup_id=" + pickup.pickup_id,
        imageUrl: entry_share_info.invite_share_img
      };
    }
  },

  //通知框
  changeOrderNotice() {
    this.setData({
      order_confirm_notice: false
    })
  },
  //是否弹窗接口
  weekShippingAd() {
    var that = this;
    var uri = app.getPath.weekShippingAd;
    common.ApiGateWayTest(uri, '', true, function(res) {
      if (res.data.success == 1) {
        that.setData({
          order_confirm_notice: !!res.data.result.status,
          order_confirm_img: res.data.result.img
        })
      }
    })
  }

});