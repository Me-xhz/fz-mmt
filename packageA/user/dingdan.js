// /user/dingdan.js
var app = getApp();
var common = require("../../utils/common.js");
Page({
    data: {
        iconURL: app.dataBase.iconURL,
        //订单状态
        ORDER_STATUS: app.ORDER_STATUS,
        //tab切换
        TAB_ALL: 0,
        TAB_CREATED: 1,
        TAB_PAID: 2,
        TAB_DELIVERING: 3,
        TAB_DELIVERIED: 4,
        currentTab: '0',
        page_size: 5,
        page: 1,
        reasons: [
            '商品质量问题', '商品漏发/错发', '其他'
        ],
        orders:[],
        isShowGoHome:false
    },
    onLoad: function (options) {
        if (options == undefined || options.currentTab == undefined) {
            common.toast("请求参数错误");
            return;
        }
        this.setData({
            currentTab: String(options.currentTab),
        });
        if (options && options.entryType && options.entryType == 'external') {
            this.setData({
                isShowGoHome: false,
            })
        } else {
            this.setData({
                isShowGoHome: true
            })
        }
    },
    onShow: function () {
        this.data.page = 1;
        this.data.page_size = 5;
        this.data.orders = [];
        wx.pageScrollTo({
            scrollTop: 0,
            duration: 100
        })
        this.loadOrderList();
    },
    // 返回首页
    gotoHome: function () {
        wx.switchTab({
            url: '/pages/index/index',
        })
    },
    //获取订单列表数据
    loadOrderList: function () {
        var that = this;
        common.showLoad(this);
        var url = app.getPath.orderList;
        if (that.data.currentTab == 0) {
            that.data.currentTab = "0";
        }
        var data = {
            page: that.data.page,
            page_size: that.data.page_size,
            status : that.data.currentTab
        };
        common.ApiGateWayTest(url, data, true,function (res) {
            var orders = res.data.result.data;
            if (orders && res.data.errorCode != 1){
                that.data.orders = that.data.orders ? that.data.orders.concat(orders) : orders;
                that.setData({
                    orders: that.data.orders
                })
                common.hideLoad(that);
                wx.stopPullDownRefresh();
            } else {
                common.toast(res.data.msg);
            }
        })
    },
    swichNav: function (e) {
        var that = this;
        if (that.data.currentTab === e.currentTarget.dataset.current) {
            return false;
        } else {
            var current = e.currentTarget.dataset.current;
            that.getOrderStatus();
            that.setData({
                currentTab: current,
            });
        };
        that.onPullDownRefresh();
    },
    getOrderStatus: function () {
        return this.data.currentTab == 0 ? 1 : this.data.currentTab == 2 ? 2 : this.data.currentTab == 3 ? 3 : this.data.currentTab== 4 ? 4 : 0;
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
    // 立即支付
    touchPay: function(e){
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
                    wx.pageScrollTo({
                        scrollTop: 0,
                        duration: 100
                    })
                    // that.onPullDownRefresh();
                })
            }
        })
    },
    // 积分订单支付
    pointPay(e){
        var that = this;
        var orderId = e.currentTarget.dataset.orderId;
        var payUri = app.getPath.doPayPoint;
        var payData = {
            order_id: orderId
        }
        common.ApiGateWayTest(payUri, payData, true, function (res) {
            var resData = res.data;
            if (resData.success == 1) {

                if (resData.result.state==1){
                    common.toast('商品兑换失败');
                    wx.pageScrollTo({
                        scrollTop: 0,
                        duration: 100
                    })
                }else{
                    common.toast('商品兑换成功');
                    wx.redirectTo({
                        url: '/packageA/credits-payment/credits-payment?order_id=' + payData.order_id
                    })
                }
            }
        })
    },
    checkPay: function (orderId){
        var that = this;
        var uri = app.getPath.checkPay;
        var data = {
            order_id: orderId
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
            that.loadOrderList();
        }
    },
    onPullDownRefresh: function () {
        var that = this;
        that.data.orders = [];
        that.data.page = 1;
        that.data.page_size = 5;
        that.loadOrderList();
    },
    goOrderDetail: function (e) {
        var order = e.currentTarget.dataset.orderid;
        wx.navigateTo({
            url: '../user/detail?entryType=external&orderId=' + order
        })
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
    }
})
