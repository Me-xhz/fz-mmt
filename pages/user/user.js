// pages/user/user.js
var app = getApp();
var common = require("../../utils/common.js");
Page({
  data: {
    navBarHeight: app.globalData.navBarHeight,
    iconURL: app.dataBase.iconURL,
    userInfo: {},
    subtotal: {},
    loadingText: '加载中...',
    loadingHidden: false,
    pickup: {},
    duration: 500,
    interval: 5000,
    indexAdcurrent: 0,
    indicatorColor: "#fff",
    indicatorActiveColor: "#eb3c39",
    circular: true,
    autoplay: false,
    adList: [],
    indicatorDots:false,
    invite_info: {},
    // checkSessionKey: app.checkSessionKey,
    // 上拉加载部分
    // refresh: true,
    // page:1,
    // recommend_good_list:[],
    // adList:[]
  },
  onLoad: function () {
    var that = this;
    // if (this.data.refresh){
    //   this.getRecommendGoodList()
    // };
  },
  onShow(){
    var that = this;
    var pickupId = common.getStorageSync('getpickup');
    var token = common.getStorageSync('token');
    this.setData({
      pickup: pickupId
    })

    this.getUserdata();
    if (token && token != ''){
      this.getCsLatestUrgeLog();
    }
    this.setData({ checkSessionKey: app.checkSessionKey });
    app.aldstat.sendEvent("get_user", {
      "提货点": pickupId.cityName
    });
    // 跳转登录
    // if (!app.checkSessionKey) {
    //   wx.switchTab({
    //     url: '/pages/index/index',
    //     success(res){
    //       common.goRegister();
    //     }
    //   })
    // }
  },
  // 前往登录注册
  goRegister(){
    if (!app.checkSessionKey) {
      common.goRegister();
      return;
    }
  },
  // 获取手机号去登录注册
  getPhone:function(e){
    var that = this;
    if (!(e.detail.encryptedData && e.detail.iv)){
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
        common.ApiGateWayTest(mobileUri, Mobiledata, true,function (resData) {
          if(resData.data.success == 1){
            common.toast('绑定成功');
          }else{
            return
          }
          that.getUserdata();
        })
      }
    })
  },
  goWhere:function(e){
    var that = this;
    var currentTab = e.currentTarget.dataset.currenttab;
    if (app.checkSessionKey){
      wx.navigateTo({
        url: '/packageA/user/dingdan?entryType=external&currentTab=' + currentTab
      })
    }else{
      that.goRegister()
    }
  },
  goWhere2: function (e) {
    var that = this;
    var url = e.currentTarget.dataset.url;
    if (app.checkSessionKey) {
      wx.navigateTo({
        url: url
      })
    } else {
      that.goRegister()
    }
  },
  //获取广告图
  getAd: function() {
    var that = this;
    var uri = app.getPath.adlist;
    var data = {
      pid:3
    }

    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function(res) {
        if (res && res.data && res.data.success == 1) {
          var data = res.data.result;
          if (data.length > 1) {
            that.setData({
              indicatorDots: true
            })
          } else {
            that.setData({
              indicatorDots: false
            })
          }
          that.setData({
            adList: data,
            indexAdcurrent: 0,
            // share_title: data.share_title,
            indicatorDots: data.length > 1 ? true : false,
            // keyWord: data.keyword
          })
          resolve('successAd');
        }
      })
    })
  },
  adclose: function(ad_id, is_close) {
    var that = this;
    var uri = app.getPath.adclose;
    var data = {
      ad_id,
      is_close
    }
    common.ApiGateWayTest(uri, data, true, function(res) {
    })
  },
  // 跳转指定专题页
  goWebView: function(e) {
    common.goAdWebView(e);
  },
  getUserdata: function(){
    var that = this;
    var uri = app.getPath.userInfo;
    var expressUserUri = app.getPath.expressUserUri;
    // var subtotalUri = app.getPath.subtotal;
    common.ApiGateWayTest(uri,'',true,function(res){
      if (res.data.success == 1){
        var res = res.data.result;
        common.setStorage({
          key: 'userInfo',
          data: res,
        })
        that.setData({
          userInfo: res
        })
        if (res.has_express == 1) {
          common.ApiGateWayTest(expressUserUri, '', true, function (res) {
            var resData = res.data;
            if (resData.success == 1) {
              common.setStorageSync('expressToken', resData.result.token);
              common.setStorageSync('expressAuthList', resData.result.authList);
              common.setStorageSync('getExpressPickupId', resData.result.pickup_id);
              that.pickupName = resData.result.pickup_name
            }else{
              common.toast('获取商家信息失败')
            }
          })
        }
      }
    })
    that.getordernum();
  },
  // 更新用户信息
  getUserinfo: function(e){
    var that = this;
    if (e.detail.userInfo) {

      var uri = app.getPath.getWXUserInfo;
      var data = {
        encrypted_data: e.detail.encryptedData,
        iv: e.detail.iv,
        signature: e.detail.signature
      }
      common.ApiGateWayTest(uri, data, true, function (data) {

        if (data.data.success==1){
          that.getUserdata();
        }
      })
    } else {
      common.toast('拒绝授权将无法体验完整功能，建议重新点击进行授权!')
    }
  },
  getordernum:function(){
    var that = this;
    var uri = app.getPath.getordernum;

    common.ApiGateWayTest(uri, '', true, function (res) {

      if (res.data.success==1){
        that.setData({
          ordernum: res.data.result
        })
      }
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
  goLogistics(){
    this.goRegister();
    wx.navigateTo({
      url: '../../packageA/logistics/index?pickupName=' + this.pickupName,
    })
  },
  goToSign: function () {
    this.goRegister();
    wx.navigateTo({
      url: '../sign/sign?entryType=external',
    })
  },
  toTakeout(){
    this.goRegister();
    wx.navigateTo({
      url: '../../packageA/takeout-order/takeout-order?entryType=external',
    })
  },
  goBargain(){
    this.goRegister();
    wx.navigateTo({
      url: '../../packageA/mybargain/mybargain?entryType=external',
    })
  },
  toShopCoupon(){
    this.goRegister();
    wx.navigateTo({
      url: '../../packageA/takeout-coupon/takeout-coupon?entryType=external',
    })
  },
  //跳转我的取货码
  goPickUpList(){
    this.goRegister();
    wx.navigateTo({
      url: '../../packageA/my-pickup-code/my-pickup-code?entryType=external',
    })
  },
  // 邀请红包提示
  getCsLatestUrgeLog(){
    var that = this;
    var url = app.getPath.csLatestUrgeLog;
    common.ApiCoordination(url,'',true,function(res){
      var resData = res.data;
      if (resData.success == 1){

        if (resData.result.invite_list.length > 0){
          // 判断是否已邀请三人下单
          var jsonstring = resData.result.invite_list[0].is_coupon

          if (jsonstring) {
            that.setData({
              couptextShow: true,
              // 保留字段，邀请代金券的额度
              tiket_limit: resData.result.invite_list[0].coupon.money.bonus,
              tikType: resData.result.invite_list[0].coupon.money.type
            })
          }else{
            that.setData({
              couptextShow: false,
              // 保留字段，邀请代金券的额度
              // tiket_limit: resData.result.invite_list[0].coupon.money.bonus
            })
          }

          that.setData({
            invite_info: resData.result
          })
        }else{
          that.getAd();
          that.setData({
            invite_info: {}
          })
        }
      }
    })
  },
  clearStorage(){
    wx.clearStorage({
      success: function(res){
        common.toast('清除成功')
      }
    })
  },
  // 催促上报
  urgingReport(e) {
    common.formIdUpdate(e);
    var pickupId = common.getStorageSync('getpickup');
    app.aldstat.sendEvent("user_urging_report", {
      "提货点": pickupId.cityName
    });
  },
  // 跳转邀请记录页面
  getEnvelopes(){
    wx.navigateTo({
      url: '/packageB/invitation-share/invitation-share?type=2',
    })
  },
  onShareAppMessage(e){
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    var entry_share_info = common.getStorageSync('entry_share_info');
    return {
      title: e.from == 'button' ? entry_share_info.urge_share_text : '',
      path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
      imageUrl: e.from == 'button' ? entry_share_info.urge_share_img : ''
    }
  },
  // // 上拉加载部分
  // getRecommendGoodList: function () {
  //   var that = this;
  //   var url = app.getPath.lowPriceGoods;
  //   var page_size = 10;
  //   var data = {
  //     page: this.data.page,
  //     page_size
  //   }
  //   common.ApiGateWayTest(url, data, true, function (res) {

  //     var res = res.data;
  //     if (res.success == 1) {
  //       that.setData({
  //         recommend_good_list: [...that.data.recommend_good_list, ...res.result.products]
  //       })
  //       if (res.result.products.length < page_size){
  //         that.refresh(false)
  //       }else{
  //         that.refresh(true)
  //       }
  //     }
  //   })
  // },
  // // 是否允许上拉加载
  // refresh: function (data) {
  //   this.setData({
  //     refresh: data
  //   })
  // },
  // // 上拉触底事件
  // onReachBottom:function(e){
  //   if (this.data.refresh) {
  //     this.setData({
  //       page: this.data.page + 1
  //     })
  //     this.getRecommendGoodList();
  //   }
  // },

  // 广告图片
  // getAd: function () {
  //   var that = this;
  //   var uri = app.getPath.adlist;
  //   var data = {
  //     pid: 3
  //   }
  //     common.ApiGateWayTest(uri, data, true, function (res) {
  //       if (res && res.data && res.data.success == 1) {
  //         var data = res.data.result;
  //         console.log(data)
  //         that.setData({
  //           adList:data
  //         })
  //       }
  //     })
  // },
})
