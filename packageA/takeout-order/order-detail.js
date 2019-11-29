var app = getApp();
var common = require("../../utils/common.js");
// pages/order/detail.js
Page({
  data: {
    iconURL: app.dataBase.iconURL,
    ORDER_STATUS: app.ORDER_STATUS,
    reasons: [
      '多拍/拍错/不想要', '缺货'
    ],
    iphoneXBottom: '0rpx',
    order_id:"",
    order:{},
    isShowGoHome:false,
  },
  onLoad: function (options) {
    var that=this;
    if (options == undefined || options.order_id == undefined) {
      common.toast("请求参数错误");
      return;
    }
    // 从外部分享进入时，显示左上角回到首页  改动带external时为内部进入携带参数，外部进入不带参数
    if (options && options.entryType && options.entryType == 'external') {
      that.setData({
        isShowGoHome: false,
      })
    }else{
      that.setData({
        isShowGoHome: true
      })
    }
    var orderid = options.order_id;
    this.setData({
      order_id: orderid,
    })
  },
  onShow: function () {
    if (this.data.order_id == undefined) {
      common.toast("请求参数错误");
      return;
    }
    this.loadProductDetail(this.data.order_id);
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
      common.showModal('是否确定退款？','确定',function(e){
        if(e.confirm){
          that.refund(item);
          that.setData({
            showfwModalStatus: false
          });
        }

      })

    }else{
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
  },
  //获取订单详情信息
  loadProductDetail: function (orderid) {
    var that = this;
    var url = app.getPath.shopOrderDetail;
    var data = {
      order_id: that.data.order_id
    };
    common.showLoad(that);
    common.ApiGateWayTest(url, data, true,function (res) {
      var order = res.data.result;
      that.setData({
        order: order
      })
      common.hideLoad(that);
      if(order.status==2){
        let order_url=app.getPath.achieveOrder
        let achieve_data={
          order_id:that.data.order_id
        }
        common.ApiGateWayTest(order_url,achieve_data,true,function (resData) {
          if(resData.data.result.state==0){
            common.toast(resData.data.result.state_desc)
          }
        })
      }
    })
  },
  //前往商品详情页
  goprodcut: function (e) {
    var productId = e.currentTarget.dataset.productId;
    // wx.navigateTo({
    //   url:''
    // })
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
    var url = app.getPath.shopCancelOrder;
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
      order_type:'2',
      order_id: orderId,
      payment_code: 'wxpay'
    }
    common.ApiGateWayTest(payUri, payData, true, function (res) {
      if (res.data.success == 1) {
        var data = res.data.result;
        common.doWechatPay(data, function (res) {
          common.toast('支付成功');
          // 支付成功后二次验证，修改后台状态
          that.checkPay(orderId)

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
      order_id: orderId,
      order_type: 2
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
  setClipboard: function(){
    wx.setClipboardData({
      data: this.data.order.order_sn,
      success: function(){
        common.toast('复制成功')
      },
      fail: function(){
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
  }
})
