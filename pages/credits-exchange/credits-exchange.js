// pages/credits-exchange/credits-exchange.js
//获取应用实例
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    showBottomLoading: false,
    scoreGoodsList: [],
    page: 1,
    page_size: 20,
    points: 0,
    game_info: {},
    //轮播广告
    duration: 500,
    interval: 5000,
    indexAdcurrent: 0,
    indicatorColor: "#fff",
    indicatorActiveColor: "#eb3c39",
    circular: true,
    autoplay: false,
    adList: [],
    indicatorDots: false,
    invite_info: {},
    animationData: '',
    showScore: false,
    scoreTaskList: [],
    bargainThankList: [],
    showThankModal: false,
    scoreAdList: [],
    showForward: false,
    showTaskForward: false,
    scoreGoodsNotice: '',
    noticeCheck: false,
    marqueeDistance: 36,
    boxwidth: 0,
    intervals: 20,
    textlength: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    // 外部带商品店铺
    if (options.found_id) {
      this.setData({
        entryData: options,
        found_id: options.found_id
      })
    } else {
      this.setData({
        entryData: options
      })
    }

    var options = that.data.entryData;
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
    this.scoreGoods()

    this.getAd();
  },
  // 返回首页
  gotoHome: function () {
    this.setData({
      showScore: false
    })
    wx.switchTab({
      url: '/pages/index/index',
    })
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
    this.getScore()
    this.getBargainRewardScoreList()
  },
  // 上拉加载
  onReachBottom: function () {
    this.getMoreGoods()
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    this.data.page = 1;
    this.data.scoreGoodsList = [];
    this.scoreGoods();
  },
  //获取商品页面
  scoreGoods() {
    let that = this;
    var uri = app.getPath.scoreGoods;
    var data = {
      page: that.data.page,
      page_size: that.data.page_size,
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data
      if (resData.success == 1) {
        that.setData({
          scoreGoodsList: res.data.result.list,
          showBottomLoading: false
        })
        that.getScore()
        that.getCreditsAd()
        that.getScoreGoodsNotice()
      }
      wx.stopPullDownRefresh();
    })
  },
  // 上拉加载商品数据
  getMoreGoods() {
    let that = this
    if (this.data.scoreGoodsList.length > 0 && this.data.scoreGoodsList.length % this.data.page_size == 0) {
      let that = this;
      this.setData({
        showBottomLoading: true
      })
      var uri = app.getPath.scoreGoods;
      var data = {
        page: this.data.scoreGoodsList.length / this.data.page_size + 1,
        page_size: that.data.page_size,
      }
      common.ApiGateWayTest(uri, data, true, function (res) {
        var resData = res.data
        if (resData.success == 1) {
          that.data.scoreGoodsList = [...that.data.scoreGoodsList, ...resData.result.list]
          that.setData({
            scoreGoodsList: that.data.scoreGoodsList,
            showBottomLoading: false
          })
        }
      })
    }
  },
  //获取积分
  getScore() {
    let that = this;
    var uri = app.getPath.getUserScoreGoodsPoint;
    common.ApiGateWayTest(uri, '', true, function (res) {
      var resData = res.data
      if (resData.success == 1) {
        that.setData({
          points: resData.result.points,
          game_info: resData.result.game_info
        })
      }
    })
  },
  //获取答谢积分列表
  getBargainRewardScoreList() {
    let that = this;
    var uri = app.getPath.bargainRewardScoreList;
    common.ApiGateWayTest(uri, '', true, function (res) {
      var resData = res.data
      if (resData.success == 1) {
        if (resData.result.list.length > 0) {
          that.setData({
            bargainThankList: resData.result,
            showThankModal: true
          })
        }
      }
    })
  },
  //收下积分
  getAllPoint() {
    let that = this;
    var uri = app.getPath.changeThankLogIsshow;
    common.ApiGateWayTest(uri, '', true, function (res) {
      var resData = res.data
      if (resData.success == 1) {
        that.getScore()
      }
      that.setData({
        showThankModal: false
      })
    })
  },
  //关闭无任务弹窗
  closeTaskForward() {
    this.setData({
      showTaskForward: false
    })
  },
  //获取积分商城广告
  getCreditsAd() {
    let that = this;
    var uri = app.getPath.scoreTaskAdList;
    common.ApiGateWayTest(uri, '', true, function (res) {
      var resData = res.data
      if (resData.success == 1) {
        that.setData({
          scoreAdList: resData.result
        })
      }
    })
  },
  //显示积分领取弹窗
  showScoreModal() {
    if (this.data.showScore == 0) {
      this.data.showScore = 1;
    } else {
      this.data.showScore = 0;
    }
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })

    animation.translateY(375).opacity(1).step();

    this.setData({
      animationData: animation.export()
    })
    if (this.data.showScore == 1) {
      this.setData({
        showScore: true,
      });
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (this.data.showScore == 0) {
        this.setData({
          showScore: false
        });
      }
    }.bind(this), 200)
  },
  //获取积分商城公告
  getScoreGoodsNotice() {
    let that = this
    this.data.noticeCheck = false
    clearInterval(that.data.countTime);
    let url = app.getPath.getScoreGoodsNotice
    common.ApiGateWayTest(url, '', true, function (res) {
      if (res.data.success == 1) {
        var re1 = /(\d{1,3})+(?:\.\d+)?/g
        var re2 = /[\u4e00-\u9fa5]{2,}/g;
        if (!!res.data.result.scoreGoodsNotice) {
          var num = res.data.result.scoreGoodsNotice.match(re1);
          var text = res.data.result.scoreGoodsNotice.match(re2);
          if (num) {
            if (text){
              that.data.textlength = text[0].length * 28 + num[0].length * 18; //数字和文字长度
            }else{
              that.data.textlength = num[0].length * 18; //数字长度
            }
          } else {
            that.data.textlength = res.data.result.scoreGoodsNotice.length * 28//文字长度
          }
        }
        if (that.data.textlength > 630) {
          that.setData({
            textlength: that.data.textlength,
            noticeCheck: true,
            marqueeDistance: 630
          })
          that.run1()
        } else {
          that.setData({
            marqueeDistance: 36,
            boxwidth: that.data.textlength + 72,
            noticeCheck: false
          })
        }
        that.setData({
          scoreGoodsNotice: res.data.result.scoreGoodsNotice,
        })
      }
    })
  },
  run1() {
    var that = this;
    that.data.countTime = setInterval(function () {
      if (-that.data.marqueeDistance < that.data.textlength) {
        that.setData({
          marqueeDistance: that.data.marqueeDistance - 2,
        });
      } else {
        clearInterval(that.data.countTime);
        that.setData({
          marqueeDistance: 630
        });
        that.run1();
      }
    }, that.data.intervals);
  },
  //关闭弹窗
  closeScoreModal() {
    this.setData({
      showScore: false
    });
  },
  //弹窗显示任务列表
  showScoreTask() {
    let that = this
    let url = app.getPath.scoreTaskList
    common.ApiGateWayTest(url, '', true, function (res) {
      if (res.data.success == 1) {
        if (res.data.result.list.length > 0) {
          that.setData({
            scoreTaskList: res.data.result.list
          })
          that.showScoreModal()
        } else {
          that.setData({
            showTaskForward: true
          })
        }
      }
    })
  },
  //获取任务列表
  getScoreTask() {
    let that = this
    let url = app.getPath.scoreTaskList
    common.ApiGateWayTest(url, '', true, function (res) {
      if (res.data.success == 1) {
        if (res.data.result.list.length > 0) {
          that.setData({
            scoreTaskList: res.data.result.list
          })
        } else {
          that.setData({
            showTaskForward: true
          })
        }

      }
    })
  },
  //签到接口
  creditsSign() {
    let that = this;
    let url = app.getPath.achieveSign
    common.ApiGateWayTest(url, '', true, function (res) {
      if (res.data.success == 1) {
        if (res.data.result.state == 0) {
          common.toast(res.data.result.state_desc)
          that.getScore()
        } else {
          if (res.data.result.state_desc != "获取积分通道更新中，敬请期待") {
            common.toast(res.data.result.state_desc)
          }
        }
        that.getScoreTask()
      } else {
        common.toast(res.data.msg)
      }
    })
  },
  onShareAppMessage() {

  },
  // 前往羊驼
  goForward() {
    var that = this;
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    } else {
      wx.navigateTo({
        url: '/pages/pageUrl/pageUrl'
      })
    }
  },
  //显示敬请期待弹窗
  showForward() {
    this.setData({
      showForward: true
    })
  },
  //关闭敬请期待弹窗
  closeForward() {
    this.setData({
      showForward: false
    })
  },
  //获取广告图
  getAd: function () {
    var that = this;
    var uri = app.getPath.adlist;
    var data = {
      pid: 12
    }
    return new Promise(function (resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function (res) {
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
  adclose: function (ad_id, is_close) {
    var that = this;
    var uri = app.getPath.adclose;
    var data = {
      ad_id,
      is_close
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
    })
  },
  // 跳转指定专题页
  goWebView: function (e) {
    let item = e.currentTarget.dataset.item
    if (item.ad_link == " ") return
    common.goAdWebView(e);
  },
  // 跳转规则
  toRules() {
    wx.navigateTo({
      url: '/packageA/credits-rules/credits-rules?entryType=external'
    })
  },
  //跳转商详
  toProduct(e) {
    let id = e.currentTarget.dataset.score_goods_id
    wx.navigateTo({
      url: '/packageA/credits-product/credits-product?entryType=external&productId=' + id
    })
  },
  //跳转兑换记录
  toRecord() {
    wx.navigateTo({
      url: '/packageA/credits-record/credits-record'
    })
  },
})
