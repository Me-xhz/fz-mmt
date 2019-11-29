// packageA/takeout-order/takeout-order.js
var app = getApp();
var common = require("../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    tab_change:0,
    page_size: 5,
    page: 1,
    orders:[],
    backorders:[],
    isShowGoHome: false
  },
  onLoad:function(options){
    var that=this;
    // 模板消息跳转退货退款
    if (options.tab_change){
      that.setData({
        tab_change : options.tab_change
      })
    }
    var that = this;
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
    this.setData({
      entryData: options
    })
    var options = that.data.entryData
    var pickupId = common.getStorageSync('getpickup');
    // 判断是否第一次进入 且是从外部进入，如二维码扫码 && app.firstlaunchApp
    if (options && (options.atitude || options.pickup_id) && !pickupId) {
      that.getExternal(options.pickup_id).then(function () {
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
              'pickup_type': res.pickup_type
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
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.data.page = 1;
    this.data.page_size = 5;
    this.data.orders = [];
    this.data.backorders=[];
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 50
    })
    this.getOrderList();
    this.getBackOrderList();
  },
  //切换订单列表
  swichNav(e){
    var that=this;
    common.showLoad(that);
    // wx.pageScrollTo({
    //   scrollTop: 0,
    //   duration:50
    // })
    that.setData({
      tab_change:e.currentTarget.dataset.tab
    });
    this.onPullDownRefresh();
  },
  //获取订单列表
  getOrderList(){
    var that=this;
    var url=app.getPath.shopOrderList;
    var data = {
      page: that.data.page,
      page_size: that.data.page_size,
      status : this.data.tab_change
    };
    common.ApiGateWayTest(url, data, true,function (res) {
      var res=res.data;
      var allOrders=res.result.data
      if (res.success===1){
        that.data.orders = that.data.orders ? that.data.orders.concat(allOrders) : allOrders;
        that.setData({
          orders: that.data.orders
        })
        common.hideLoad(that);
      } else {
        common.toast(res.data.msg);
      }
    })
  },
  //获取售后订单
  getBackOrderList(){
    var that=this;
    var url=app.getPath.shopOrderBack;
    var data={
      page: that.data.page,
      page_size: that.data.page_size
    };
    common.ApiGateWayTest(url, data, true,function (res) {
      var res=res.data;
      var allOrders=res.result.orderBackInfo
      if (res.success===1){
        that.data.backorders = that.data.backorders ? that.data.backorders.concat(allOrders) : allOrders;
        that.setData({
          backorders: that.data.backorders
        })
        common.hideLoad(that);
      } else {
        common.toast(res.data.msg);
      }
    })
  },
  //跳转售后单详情
  goBackOrderDetail(e){
    var order = e.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: './order-back?entryType=external&order_id=' + order
    })
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
      res.confirm && common.ApiGateWayTest(url, data, true,function (res) {
        if (res.data.success == 1){
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 100
          })
          common.toast(res.data.msg);
          that.onPullDownRefresh();
        }else{
          common.toast(res.data.msg);
        }
      });
    })
  },
  //跳转订单详情
  goOrderDetail: function (e) {
    var order = e.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: './order-detail?entryType=external&order_id=' + order
    })
  },
  // 立即支付
  touchPay: function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.orderId;
    var payUri = app.getPath.doPay;
    var payData = {
      order_type: 2,
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
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 100
          })
          // that.onPullDownRefresh();
        })
      }
    })
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    var that = this;
    that.data.orders = [];
    that.data.backorders=[];
    that.data.page = 1;
    that.data.page_size = 5;
    that.getOrderList();
    that.getBackOrderList();
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
        if (res.data.success == 1){
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 100
          })
          common.toast(res.data.msg);
          that.onPullDownRefresh();
        }else{
          common.toast(res.data.msg);
        }
      })
    })
  },
  checkPay: function (orderId){
    var that = this;
    var uri = app.getPath.checkPay;
    var data = {
      order_id: orderId,
      order_type: 2
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 100
      })
      that.onPullDownRefresh();
    })
  },
  onReachBottom: function () {
    var that = this;
    if (that.data.orders && that.data.orders.length % that.data.page_size == 0) {
      that.data.page = that.data.orders.length / that.data.page_size + 1;
      if(this.data.tab_change!=4){
        that.getOrderList();
      }else{
        that.getBackOrderList()
      }
    }
  },
  touchExpress: function (e) {
    var item = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../user/order-express?order=' + item.order.order_id + '&delivery_id=' + item.delivery_id
    })
  },
  touchComment: function (e) {
    var order = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: '../user/order-review?order=' + order
    })
  },
  touchSubComment: function(e){
    var order = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: '../user/add-order-review?order=' + order,
    })
  },
  // 申请退款
  refund: function (e) {
    var that = this;
    var orderId = e.target.dataset.orderId;
    wx.navigateTo({
      url: '/packageA/user/application-return?type=1&orderId=' + orderId
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
  //阻止冒泡
  unLoad(){

  },
  //跳转在线客服
  golinkkf: function () {
    app.dataBase.pageUrl = 'http://q.url.cn/s/6l3eQOm?_type=wpa&_wv=2';
    common.goWebview();
  }
})
