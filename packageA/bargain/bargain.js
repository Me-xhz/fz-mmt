// packageA/bargain/bargain.js
//获取应用实例
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newlocal:"",
    loacl:"",
    isShow:false,
    isNewUser: false,
    iconURL: app.dataBase.iconURL,
    showSettingModalStatus: false,
    showRank: 3,
    showMoreRank: true,
    d: "00",
    h: "00",
    m: "00",
    s: "00",
    ad: "00",
    ah: "00",
    am: "00",
    as: "00",
    ahs: 0,
    isShowGoHome: false,
    showRules: true,
    persentBox: 50,
    buttonDisplay: false,
    activity_bargain_id: 0,
    bargaining_id: 0,
    buttonDisplayText: '商品已抢光,正在补货中~',
    itemData: Object,
    actual_store_count: '',
    bargainBySelfInfo: {},
    swiperImgBl: false,
    iphoneXBottom: "0rpx",
    rule: {},
    indicatorDots:true,
    // navbar
    navbarOpacity: 0,
    showBack: false,
    navBarHeight: app.globalData.navBarHeight,
    popupShow: false,
    showPhoneModal: false,
    isSubscribe: false,
    is_bind_moble: 0,
    is_login: true,
    termination: false,
    isEnoughPopupShow: false,
    sellOutNoticeInfo: {},
    team_type: 1,
    showSKUstatus: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    //获取是否是新手
    common.isNewUser({ time_atitude: app.dataBase.userAtitude },(res)=>{
      that.setData({
        isNewUser: res
      })
    })
 
    wx.showShareMenu({
      withShareTicket: true
    })
    that.data.activity_bargain_id = options.activity_bargain_id;
    that.data.termination = options.termination;
    var page = getCurrentPages();
    if (page.length > 1) {
      that.setData({
        showBack: true
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
    wx.getSystemInfo({
      success: function(res) {
        var model = res.model
        if (model.search('iPhone X') != -1) {
          that.setData({
            iphoneXBottom: '68rpx'
          })
        }
      }
    })
  },
  onShow(){
    var that = this;
    that.getBaseInfo();
    if (that.data.itemData.time_status == 0){
      that.setData({
        popupShow: that.data.popupShow,
      })
    }
    // 上报关系链-存在token才上报
    var token = common.getStorageSync('token');
    if (token && token != '') {
      common.setInviteShareLogin()
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
              'pickup_type': res.pickup_type,
            }
          },function (res) {
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
  // 点击查看更多排行榜信息
  showMoreRank() {
    this.setData({
      showRank: 5,
      showMoreRank: false
    })
  },

  cancal:function(){
    this.setData({
      isShow:false
    })
  },
  confim:function(){
    this.setData({
      isShow:false
    })
    this.getBargainBySelf(this.data.temporarye)
  },
  // 倒计时函数
  countDown(endtime) {
    var that = this;
    var nowtime = new Date().getTime() / 1000;
    var lesstime = endtime - nowtime;
    clearInterval(that.timeStart);
    that.timeStart = setInterval(() => {
      if (lesstime > 0) {
        lesstime--;
        var d = parseInt(lesstime / 60 / 60 / 24);
        var h = parseInt(lesstime / 60 / 60 % 24) + d * 24;
        var m = parseInt(lesstime / 60 % 60);
        var s = parseInt(lesstime % 60);
        if (h < 10) {
          h = "0" + h
        }
        if (m < 10) {
          m = "0" + m
        }
        if (s < 10) {
          s = "0" + s
        }
        that.setData({
          h: h,
          m: m,
          s: s
        });
      } else {
        clearInterval(that.timeStart);
        that.getBaseInfo();
      }
    }, 1000)
  },
  // 倒计时函数
  countDownB(endtime) {
    var that = this;
    var nowtime = new Date().getTime() / 1000;
    var lesstime = endtime - nowtime;
    clearInterval(that.timeStartB);
    that.timeStartB = setInterval(() => {
      if (lesstime > 0) {
        lesstime--;
        var d = parseInt(lesstime / 60 / 60 / 24);
        var h = parseInt(lesstime / 60 / 60 % 24);
        var m = parseInt(lesstime / 60 % 60);
        var s = parseInt(lesstime % 60);
        if (h < 10) {
          h = "0" + h
        }
        if (m < 10) {
          m = "0" + m
        }
        if (s < 10) {
          s = "0" + s
        }
        that.setData({
          ad: d < 10 ? "0" + d : d,
          ah: h,
          am: m,
          as: s
        });
      } else {
        clearInterval(that.timeStartB);
        that.getBaseInfo();
      }
    }, 1000)
  },
  // 毫秒倒计时
  hsCountTime: function(){
    var time = 9;
    setInterval(()=>{
      time --;
      if(time < 0){
        time = 9;
      }
      this.setData({
        ahs: time
      })
    },100)
  },
  //规则的显示隐藏
  showRule(e) {
    var that = this;
    common.formIdUpdate(e);
    this.setData({
      showRules: !that.data.showRules
    })
  },
  // 砍价活动详情
  getBaseInfo() {
    var that = this;
    common.showLoad(that);
    var uri = app.getPath.getBargainGoodsInfo;
    var data = {
      activity_bargain_id: that.data.activity_bargain_id
    }
    common.ApiGateWayTest(uri, data, true, function(res) {
      var resData = res.data;
      if (resData.success == 1) {
        if (resData.result.activity_bargaining_id && resData.result.activity_bargaining_id > 0 && !that.data.termination){
          setTimeout(()=>{
            wx.redirectTo({
              url: '../bargainshare/bargainshare?bargaining_id=' + resData.result.activity_bargaining_id
            })
          },100)
          return
        }
        that.data.activity_bargain_id = resData.result.activity_bargain_id;
        that.data.bargaining_id = resData.result.activity_bargaining_id;
        resData.result.floor_price = parseFloat(resData.result.floor_price);
        resData.result.shop_price = parseFloat(resData.result.shop_price);
        that.setData({
          itemData: resData.result,
          actual_store_count: String(resData.result.sale_num),
          indicatorDots: resData.result.gallery.length > 1? true : false
        })
        // 未登录分享按钮显示
        if (resData.result.time_status == 0 && !resData.result.is_notice){
          if (!app.checkSessionKey) {
            that.setData({
              is_login: false
            })
          }
        }
        // 判断是否弹出售罄提示窗
        if (resData.result.is_enough == 0){
          var url = app.getPath.sellOutNotice;
          common.ApiGateWayTest(url,'',true,function(res){
            var resData = res.data;
            if(resData.success == 1){
              that.setData({
                sellOutNoticeInfo: resData.result.data
              })
              if (app.isShowISEnough) {
                app.isShowISEnough = false;
                that.setData({
                  isEnoughPopupShow: true
                })
              }
            }
          })
        }
        that.verificationShop();
        that.getTeamRule();
        var nowtime = new Date().getTime() / 1000;
        if (resData.result.end_time > nowtime) {
          that.countDown(resData.result.end_time);
        }
        if (resData.result.time_status != 2){
          if (resData.result.time_status == 1){
            that.countDownB(resData.result.activity_end_time);
          }else{
            that.countDownB(resData.result.activity_start_time);
          }
        }
      } else {
        common.hideLoad(that);
        common.toast(res.data.msg);
        return
      }
      common.hideLoad(that);
    })
  },
  // 验证商品是否可以购买
  verificationShop() {
    var that = this;
    if (that.data.itemData.is_on_sale != 1) {
      that.setData({
        buttonDisplayText: '商品已下架',
        buttonDisplay: true
      })
      return
    }
    if (that.data.itemData.is_enough != 1) {
      that.setData({
        buttonDisplayText: '商品已抢光，正在补货中~',
        buttonDisplay: true
      })
      return
    }
    if (that.data.itemData.time_status == 2 && that.data.itemData.bargain_activity_status == 0) {
      that.setData({
        buttonDisplayText: '活动已结束',
        buttonDisplay: true
      })
      return
    }
  },
  // 轮播画廊
  setPreviewImage: function(e) {
    var that = this;
    var current = e.currentTarget.dataset.current;
    var imgUrl = that.data.itemData.gallery.map(item=>{
      return item.src
    });
    wx.previewImage({
      current: current,
      urls: imgUrl,
    })
  },
  // 轮播图片加载完成
  swiperImageLoad: function() {
    var that = this;
    that.setData({
      swiperImgBl: true
    })
  },
  // SKU选择触发完成
  skuSubmit(e){
    this.setData({
      showSKUstatus: false,
      choosed_sku: e.detail.shopItemInfo.spec_name
    })
    this.confirmData = {
      sku_key: e.detail.shopItemInfo.key,
      item_id: e.detail.shopItemInfo.item_id
    }
    if (this.data.team_type == 0){
      this.goShop(e);
    }else{
      this.isNewLocation(e);
    }
  },
  // 显示SKU弹窗
  showSkuPopup(){
    var that = this;
    that.setData({
      showSKUstatus: true
    });
  },
  // 隐藏SKU弹窗
  skuPopupHide(){
    var that = this;
    this.confirmData = '';
    that.setData({
      showSKUstatus: false
    });
  },
  // 先拦截 判断是否是在厂区外
  
  isNewLocation(e){
    var _this = this
    common.isNewUser({ time_atitude: app.dataBase.userAtitude }, (res) => {
      let newlocal = common.getStorageSync('getpickup').cityName
      if (res) {
        _this.setData({
          isShow: true,
          temporarye: e,
          newlocal: newlocal
        })
      } else {
        _this.getBargainBySelf(e)
      }
    })
  },
  // 创建砍价活动
  getBargainBySelf(e) {
    var that=this
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    common.formIdUpdate(e);
    this.setData({
      team_type: 1
    })
    var product = that.data.itemData;
    if (product.stock.length == 1) {
      that.confirmData = {
        sku_key: product.stock[0].key,
        item_id: product.stock[0].item_id
      }
      next();
    }else{
      if (this.confirmData && this.confirmData.sku_key){
        if (that.data.showSKUstatus) {
          that.setData({
            showSKUstatus: false
          })
        }
        next();
      }else{
        if (that.data.showSKUstatus) {
          common.toast('请选择商品款式');
          return
        } else {
          that.setData({
            showSKUstatus: true
          })
        }
      }
    }
    function next(){
   
      common.showLoad(that);
      var itemData = that.data.itemData;
      var checkOrderUri = app.getPath.preCheckOrder;
      var orderProduct = [{
        goods_id: itemData.goods_id,
        sku_key: that.confirmData.sku_key,
        num: 1
      }]
      orderProduct = JSON.stringify(orderProduct);
      var checkOrderData = {
        order_product: orderProduct,
        activity_bargaining_id: itemData.activity_bargaining_id ? itemData.activity_bargaining_id : 0,
        time_atitude: app.dataBase.userAtitude,
      }
      var uri = app.getPath.bargainBySelf;
      var data = {
        activity_bargain_id: that.data.activity_bargain_id,
        item_id: that.confirmData.item_id
      }
     
      common.ApiGateWayTest(checkOrderUri, checkOrderData, true, function (resData) {
        if (resData.data.success == 1) {
          common.ApiGateWayTest(uri, data, true, function (res) {
            var resData = res.data;
            if (resData.success == 1) {
              that.data.bargaining_id = resData.result.activity_bargaining_id;
              wx.navigateTo({
                url: '../bargainshare/bargainshare?bargaining_id=' + resData.result.activity_bargaining_id + '&self_info=' + JSON.stringify(resData.result),
              })
            } else {
              common.toast(res.data.msg);
              return
            }
          })
        } else {
          common.toast(resData.data.msg);
          return
        }
        setTimeout(() => {
          common.hideLoad(that);
        }, 2000)
      })
    }
  },

  // 单独购买
  goShop(e) {
    var that = this;
    var shopType = e.currentTarget.dataset.shopType;
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    common.formIdUpdate(e);
    this.setData({
      team_type: 0
    })
    if (that.data.itemData.is_on_sale != 1 || that.data.itemData.is_enough != 1 || (that.data.itemData.time_status == 2 && that.data.itemData.bargain_activity_status == 0)){
      common.toast('活动商品已经售罄啦~');
      return
    }
    var product = that.data.itemData;
    if (product.stock.length == 1 || that.data.itemData.is_bargain){
      that.confirmData = {
        sku_key: product.stock[0].key,
        item_id: product.stock[0].item_id
      }
      if (shopType == 0) {
        common.showModal('砍价成功后，您可以用更低的价格进行购买，您还确定要购买吗？', '继续购买', function (res) {
          if (res.confirm) {
            next();
          }
        })
      } else if (shopType == 1) {
        next();
      }
    }else{
      if (that.confirmData && that.confirmData.sku_key) {
        if (shopType == 0) {
          common.showModal('砍价成功后，您可以用更低的价格进行购买，您还确定要购买吗？', '继续购买', function (res) {
            if (res.confirm) {
              if (that.data.showSKUstatus){
                that.setData({
                  showSKUstatus: false
                })
              }
              next();
            }
          })
        } else {
          if (that.data.showSKUstatus) {
            that.setData({
              showSKUstatus: false
            })
          }
          next();
        }
      } else {
        if (that.data.showSKUstatus){
          common.toast('请选择商品款式');
          return
        }else{
          that.setData({
            showSKUstatus: true
          })
        }
      }
    }

    function next() {
      var itemData = that.data.itemData;
      var checkOrderUri = app.getPath.preCheckOrder;
      var orderProduct = [{
        goods_id: itemData.goods_id,
        sku_key: itemData.is_bargain ? itemData.bargaining_stock[0].key : that.confirmData.sku_key,
        num: 1
      }]
      orderProduct = JSON.stringify(orderProduct);
      var checkOrderData = {
        order_product: orderProduct,
        activity_bargaining_id: itemData.activity_bargaining_id ? itemData.activity_bargaining_id : 0,
        time_atitude: app.dataBase.userAtitude,
      }
      common.ApiGateWayTest(checkOrderUri, checkOrderData, true, function (resData) {
        if (resData.data.success == 1) {
          // 缓存跳转确认订单页面
          var datas = [{
            goods_id: itemData.goods_id,
            sku_key: itemData.is_bargain ? itemData.bargaining_stock[0].key : that.confirmData.sku_key,
            amount: 1,
            team_order: 0,
            activity_bargaining_id: itemData.activity_bargaining_id,
            activity_bargain_id: itemData.activity_bargain_id,
            channel: 1
          }];
          common.setStorage({
            key: "nowPay",
            data: datas
          })
          wx.navigateTo({
            url: '/pages/confirm/confirm',
          })
        } else {
          common.toast(resData.data.msg);
          return
        }
      })
    }
  },
  //获取拼团规则
  getTeamRule() {
    var that = this;
    var uri = app.getPath.bargainRule;
    var data = {
      activity_bargain_id: that.data.activity_bargain_id
    }
    common.ApiGateWayTest(uri, data, true, function(res) {
      that.setData({
        rule: res.data.result.rule
      })
    })
  },
  // 分享隐藏
  shareFromId(e) {
    var that = this;
    common.formIdUpdate(e);
    common.showLoad(this);
    setTimeout(()=>{
      common.hideLoad(that);
    },2000)
  },
  // 返回首页
  gotoHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 我的砍价
  goMyBrangin: function(){
    wx.navigateTo({
      url: '../mybargain/mybargain',
    })
  },
  // 前往砍价页面
  goBranging(e) {
    var that = this;
    common.formIdUpdate(e);
    wx.navigateTo({
      url: '../bargainshare/bargainshare?bargaining_id=' + that.data.bargaining_id,
    })
  },
  onPageScroll(e){
    var that = this;
    if (that.data.navbarOpacity < 1 && e.scrollTop > 100) {
      that.setData({
        navbarOpacity: e.scrollTop / 500
      })
    } else if (that.data.navbarOpacity > 0 && e.scrollTop < 200) {
      that.setData({
        navbarOpacity: e.scrollTop / 500
      })
    }
  },
  back: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  backHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 分享领红包
  shareRedEnvelopes: function(e){
    var that = this;
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    common.formIdUpdate(e);
    var url = app.getPath.bargainNotice;
    var data = {
      activity_bargain_id: that.data.activity_bargain_id
    }
    common.ApiGateWayTest(url,data,true,function(res){
      var resData = res.data;
      if(resData.success == 1){
        if (resData.result.status == 1 && that.data.itemData.coupon_price > 0){
          that.data.popupShow = true;
        }else{
          that.setData({
            'itemData.is_notice': 1
          })
        }
      }else{
        common.toast(resData.msg);
        return;
      }
    })
  },
  // 分享红包点击前往查看
  goBargainCoupon: function(){
    wx.navigateTo({
      url: '/pages/coupon/coupon?entryType=external'
    })
  },
  // 隐藏红包
  hideRedPopup: function(){
    this.setData({
      popupShow: false
    })
  },
  // 获取手机号授权
  getPhone: function (e) {
    var that = this;
    if (!(e.detail.encryptedData && e.detail.iv)) {
      return false
    }
    // 新用户注册
    // 获取手机号
    var mobileUri = app.getPath.getWXMobile;

    // 重新获取code获取手机号
    wx.login({
      success: function (res) {
        var Mobiledata = {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          code: res.code
        };
        common.ApiGateWayTest(mobileUri, Mobiledata, true, function (resData) {
          if (resData.data.success == 1) {
            common.toast('绑定成功');
            that.setData({
              showPhoneModal: false,
              is_bind_moble: 1
            })
          } else {
            return
          }
        })
      }
    })
  },
  // 关闭手机号授权弹窗
  closePhoneModal() {
    this.setData({
      showPhoneModal: false
    })
  },
  // 用户是否绑定手机号
  getCheckMobile(){
    var that = this;
    var url = app.getPath.checkMobile;
    common.ApiGateWayTest(url,'',true,function(res){
      var resData = res.data;
      if(resData.success == 1){
        that.setData({
          is_bind_moble: resData.result.is_bind_moble
        })
      }else{
        common.toast(resData.msg);
        return
      }
    })
  },
  // 滚动溢出
  bindtouchmove() {
    return false
  },
  // 显示库存不足提示
  showEnoughPopup(){
    if(this.data.itemData.is_enough == 0){
      this.setData({
        isEnoughPopupShow: true
      })
    }
  },
  // 隐藏库存不足显示
  hideEnoughPopup(){
    this.setData({
      isEnoughPopupShow: false
    })
  },
  // 前往明日爆款
  goTomorrowProduct(){
    var that = this;
    var item = that.data.sellOutNoticeInfo;
    that.setData({
      isEnoughPopupShow: false
    })
    if (item.media_type == 1) {
      wx.redirectTo({
        url: '/pages/product/product?entryType=external&productId=' + item.ad_link,
      })
    } else if (item.media_type == 2) {
      wx.redirectTo({
        url: '/packageA/bargain/bargain?entryType=external&activity_bargain_id=' + item.ad_link
      })
    } else if (item.media_type == 3) {
      wx.redirectTo({
        url: '/packageA/team-product/team-product?entryType=external&teamId=' + item.ad_link,
      })
    } else {
      if (item.ad_link == '/pages/index/index' || item.ad_link == '/pages/user/user' || item.ad_link == '/pages/credits-exchange/credits-exchange') {
        wx.switchTab({
          url: item.ad_link,
        })
      } else {
        wx.redirectTo({
          url: item.ad_link,
        })
      }
    }
  },
  //验证是否可以购买
  checkCanPurchase: function () {
    var product = this.data.itemData;
    var required = false;
    if (product.pre_info && product.pre_info.is_pre == 1) {
      this.setData({
        sumbitName: product.pre_info.pre_time
      });
      return false
    }
    if (!product || product.is_enough == 0) {
      this.setData({
        sumbitName: '抱歉，商品已售罄'
      });
      return false
    }
    if (product.is_on_sale == 0) {
      this.setData({
        sumbitName: '抱歉，商品已下架'
      });
      return false
    }
    this.setData({
      sumbitName: '立即购买',
    });
    return true
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    return {
      title: that.data.itemData.bargain_share_title,
      path: '/packageA/bargain/bargain?activity_bargain_id=' + that.data.itemData.activity_bargain_id + '&pickup_id=' + pickup.pickup_id + '&user_id=' + that.data.itemData.user_id,
      imageUrl: that.data.itemData.bargain_share_img
    }
  },
})
