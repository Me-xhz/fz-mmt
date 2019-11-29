// pages/sign/sign.js
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    showRules: true,
    showSignin: true,
    gift_list: [{
        is_signined: 0,
        text: "第一天",
        today: false
      },
      {
        is_signined: 0,
        text: "第二天",
        today: false
      },
      {
        is_signined: 0,
        text: "第三天",
        today: false
      },
      {
        is_signined: 0,
        text: "第四天",
        today: false
      },
      {
        is_signined: 0,
        text: "第五天",
        today: false
      },
      {
        is_signined: 0,
        text: "第六天",
        today: false
      },
      {
        is_signined: 0,
        text: "第七天",
        today: false
      },
    ],
    rule_text: [
      "1、每天签到，每天可领取奖励，余额将自动充值至账户余额中，余额明细可点击我的——账户余额，即可查看；优惠券将自动加入我的优惠券中。",
      "2、签到漏签不可补签，签到需连续性进行签到，否则会错过后面的大额优惠券喔。",
      "3、当连续签到7天后，系统将重置，重新从第一天签到开始计数。",
      "4、签到已领取现金余额，表示您通过签到获取的余额总额。",
      "5、签到重置的时间为每日的24点钟整",
      "6、如果用户存在违规行为，主办方将取消用户的活动资格、并有权撤销相关违规交易、收回奖励等利益，同时依照相关规则进行处罚。",
      "7、如出现不可抗力或情势变更的情况（包括但不限于重大灾害事件、活动受政府机关指令需要停止举办或调整的、活动遭受严重网络攻击或因系统故障需要暂停举办的），则主办方可依相关法律法规的规定主张免责。"
    ],
    signState: {},
    signcount: {
      sign:0,
      count:0,
      money:'0.00',
      now_points:0
    },
    goAc:false,
    guideShow:false,
    // 上拉加载部分
    refresh: true,
    page: 1,
    recommend_good_list: [],
    isShowGoHome: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    // 未登录跳转
    // 监听checkSessionKey
    if (app.checkSessionKey) {
      this.setData({checkSessionKey: true});
      that.usersigncount();
    }else{
      event.on('checkSessionKey', this, function (data) {
        this.setData({
          checkSessionKey: data
        });
        that.usersigncount();
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
    this.setData({
      entryData: options
    })
    var options = that.data.entryData;
    var pickupId = common.getStorageSync('getpickup');
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
        const token = common.getStorageSync('token')
        // if (token == undefined || token == '') {
        //   common.showRidoModal('登录小程序获取信息', '登录', function() {
        //     that.usersigncount();
        //   })
        // }
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

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
            key: 'city',
            data: {
              'pickup_id': res.pickup_id,
              'warehouse_id': res.warehouse_id,
              'cityName': res.city_name,
              'is_pick_up': 1
            }
          })
          common.setStorage({
            key: 'getpickup',
            data: {
              'pickup_id': res.pickup_id,
              'cityName': res.pickup_name,
              'pickup_address': res.pickup_address,
              'pickup_contact': res.pickup_contact,
              'pickup_phone': res.pickup_phone,
              'pickup_type': res.pickup_type
            },
          },function(res) {
            resolve('获取id成功')
          })
        }
      })
    })
  },
  // 获取信息
  usersigncount: function() {
    var that = this;
    var uri = app.getPath.usersigncount;
    common.ApiGateWayTest(uri, '', true, function(res) {
      if (res.data.success == 1) {
        var res = res.data.result;
        res.days = res.sign == 1 ? res.count : (res.count + 1);

        that.setData({
          random: Math.random(),
          signcount: res
        })
        that.barAction();
      }
    })
  },
  // 返回首页
  gotoHome: function() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  isCheckLogin:function(){
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
  },
  // 签到
  sign: function(e) {
    var that = this;
    common.formIdUpdate(e);

    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    if (that.data.signcount.sign == 1) return;
    var uri = app.getPath.usersign;
    common.ApiGateWayTest(uri, '', true, function(res) {
      if (res.data.success == 1) {
        var res = res.data.result;
        that.setData({
          signState: res
        })
        that.showButton2();
      }
    })
  },
  switchChange: function(e) {
    // status 1 开启 2关闭
    var that = this;
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    var open_msg = e.currentTarget.dataset.open_msg;
    if (open_msg == 1) {
      open_msg = 2;
    } else {
      open_msg = 1;
    }
    if (open_msg == 1) {
      openmsg(that);
    } else {
      wx.showModal({
        title: '关闭提醒',
        content: '关闭提醒可能会让你错失大额现金哦~',
        confirmText: '继续提醒',
        confirmColor: '#555555',
        cancelText: '关闭提醒',
        cancelColor: '#BBBBBB',
        success: function(e) {
          // console.log(e)
          if (e.cancel) {
            openmsg(that);
          } else if (e.confirm) {
            return false
          }
        }
      })
    }
    // 开启/关闭签到提醒
    function openmsg(that) {
      var uri = app.getPath.openmsg;
      var signcount = that.data.signcount;
      var data = {
        status: open_msg
      }
      common.ApiGateWayTest(uri, data, true, function(res) {
        var res = res.data;
        if (res.success == 1) {
          if (res.result.status == 1) {
            signcount.open_msg = open_msg;
            that.setData({
              signcount
            })
            var msg = open_msg == 1 ? '已开启签到提醒' : '取消提醒成功';
            common.toast(msg);
          }
        }
      })
    }
  },
  showButton: function() {
    var that = this;
    that.setData({
      showRules: (!that.data.showRules),
    })
  },
  showButton2: function() {
    var that = this;
    that.setData({
      showSignin: (!that.data.showSignin)
    })
    // 关闭弹窗重新加载数据
    if (that.data.showSignin){
      that.usersigncount();
      that.showGuide();
      that.setData({
        goAc:true
      })
    }
  },
  closeGuide:function(){
    this.setData({
      guideShow: false
    })
  },
  gameGuide:function(){
    var that = this;
    var uri = app.getPath.gameGuide;
    common.ApiGateWayTest(uri, '', true, function (res) {
      console.log(res)
      if (res.data.success == 1 && res.data.result.status == 0) {
        that.usersigncount()
      }
    })
  },
  // 显示引导
  showGuide:function(){
    var that = this;
    var game_guide = this.data.signcount.game_guide;
    if (game_guide==1){
      return false;
    }
    this.gameGuide();
    wx.pageScrollTo({scrollTop: 0, duration: 100})
    var timer = setTimeout(function(){
      that.setData({
        guideShow:true
      })
    },1600)
  },
  // bar动画
  barAction:function(){
    let count = this.data.signcount.count;
    const animation = wx.createAnimation({
      duration: 1500,
      timingFunction: 'ease',
    })
    this.animation = animation
    animation.width((count * 14.3)+'%').step()

    this.setData({
      animationData: animation.export()
    })
  },
  // 上拉加载部分
  getRecommendGoodList: function() {
    var that = this;
    common.showLoad(that)
    var url = app.getPath.newGoodsRecommend;
    var page_size = 10;
    var data = {
      page: this.data.page,
      page_size: page_size
    }
    common.ApiGateWayTest(url, data, true, function(res) {
      var res = res.data;
      if (res.success == 1) {
        if (that.data.page == 1) that.data.recommend_good_list = [];
        that.setData({
          recommend_good_list: [...that.data.recommend_good_list, ...res.result.products]
        })
        if (res.result.products.length < page_size) {
          that.refresh(false)
        } else {
          that.refresh(true)
        }
      }
      common.hideLoad(that);
    })
  },
  // 是否允许上拉加载
  refresh: function(data) {
    this.setData({
      refresh: data
    })
  },
  // 上拉触底事件
  onReachBottom: function(e) {
    if (this.data.refresh) {
      this.setData({
        page: this.data.page + 1
      })
      this.getRecommendGoodList();
    }
  },

  goIndex: function() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  goIntegralList: function() {
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    wx.navigateTo({
      url: '../sign/integral/integral'
    })
  },

  goToLotteryDraw: function () {
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    wx.navigateTo({
      url: '../../packageB/tools/turntable'
    })
  },

  goToShare: function() {
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    wx.navigateTo({
      url: '../../pages/user/invitation/invitation'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.usersigncount();
    this.getRecommendGoodList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    return {
      title: that.data.signcount.share_info.share_title,
      path: '/pages/sign/sign?pickup_id=' + pickup.pickup_id,
      imageUrl: that.data.signcount.share_info.share_img,
      success: function(res) {
        common.toast('分享成功')
      },
      fail: function(res) {
        common.toast('分享失败')
      }
    }
  }
})
