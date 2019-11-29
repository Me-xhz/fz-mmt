// pages/panic/panic.js
var app = getApp();
const common = require("../../utils/common.js");
var code;
Page({
  data: {
    iconURL: app.dataBase.iconURL,
    vou: [],
    currentTap: '0',
    page: 1,
    page_size: 5,
    refresh: true,
    couponType: true
  },
  //优惠券去使用
  like: function (e) {
    wx.switchTab({
      url: '../../pages/index/index'
    })
  },
  onLoad: function (options) {
    this.setData({
      page: 1
    })
    var current = this.data.currentTap;
    // this.swichNav(0);
    this.getCouponList(current);
    // 页面初始化 options为页面跳转所带来的参数
  },
  //分栏切换
  swichNav: function (e) {
    var current = e.currentTarget.dataset.current;
    this.setData({
      currentTap: current,
      vou: [],
      refresh: true,
      page: 1
    });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
    this.getCouponList(current);
  },
  //兑换优惠券（暂无）
  // couponCode: function (e) {
  //   var showType;
  //   code = e.detail.value;
  //   if (code.length > 0) {
  //     showType = true;
  //   } else {
  //     showType = false;
  //   }
  //   this.setData({
  //     code: code,
  //     sendCode: showType
  //   })
  // },
  // sendCode: function () {
  //   var that = this;
  //   var url = "/Api/api.cashgift.actAddBouns";
  //   var data = {
  //     bonus_sn: code,
  //     openid: 'a3e8fd9b6782a72836efcbaa483e3d47',
  //     adtag: '',
  //     adtag2: ''
  //   }
  //   common.ApiGateWayTest(url, data,'', function (res) {

  //   })
  // },
  //下拉刷新
  onPullDownRefresh: function(){
    var current = this.data.currentTap;
    this.setData({
      vou: [],
      refresh: true,
      page: 1
    })
    this.getCouponList(current);
  },
  //上拉加载
  onReachBottom: function(){
    if(this.data.refresh){
      this.setData({
        page: this.data.page+1
      })
      var current = this.data.currentTap;
      this.getCouponList(current);
    }
  },
  //获得优惠券各状态列表
  getCouponList: function (current,page) {
    var that = this;
    var url = app.getPath.getCouponList;
    var data = {
     page: that.data.page,
     page_size: that.data.page_size,
     status: current
    }
    common.ApiGateWayTest(url, data, true, function (res) {
      if (res && res.data && res.data.success == 1) {
        var vou = res.data.result.data;
        if (vou.length > 0) {
          for (var i in vou) {
            vou[i]['checked'] = 0;
          }
          that.setData({
            vou: that.data.vou.concat(vou),
            couponType: true
          });
          //没有下一页数据
          if(vou.length < that.data.page_size){
            that.setData({
              refresh: false,
              complete: '没有更多啦~'
            })
          }
        }else{
        //  common.toast(res.data.msg)
          that.setData({
            couponType: false,
            refresh: false
          })
        }
        wx.stopPullDownRefresh();
      }else if(res && res.data && res.data.success == 0){
        that.setData({
          couponType: false,
          content: res.data.msg
        })
      }
    })
  },
  //优惠券说明展开
  unfoldCoupon: function (e) {
    var id = e.currentTarget.dataset.checked;
    for (var i in this.data.vou) {
      if (id == this.data.vou[i].id) {
        this.data.vou[i].checked = !this.data.vou[i].checked;
      }
    }
    this.setData({
      vou: this.data.vou
    })
  },
})