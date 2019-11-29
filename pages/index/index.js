var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
//引入这个插件，使html内容自动转换成wxml内容
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    // 自提点
    showRedEnvel: false,
    tiket_id: 0,
    pickup: {
      cityName: '请选择提货点'
    },
    navBarHeight: app.globalData.navBarHeight,
    showTissue: false,
    listScroll: true,
    showAdver: false,
    indicatorDots: false,
    autoplay: false,
    buy_now: 0,
    showSearchBG: false,
    scrollTop: 0,
    duration: 500,
    interval: 5000,
    singleAdcurrent: 0,
    indexAdcurrent: 0,
    newIndexAdcurrent: 0,
    newIndexIndicator: 0,
    indicatorColor: "#fff",
    indicatorActiveColor: "#eb3c39",
    circular: true,
    adList: [],
    service_title: [],
    barList: [],
    acticity_new_person: [],
    acticity_buy: {},
    page_size: 10,
    shopList: [],
    page: 1,
    refresh: true,
    checkSessionKey: app.checkSessionKey,
    iconURL: app.dataBase.iconURL,
    // showCloseImg: false,
    showCouponList: false,
    // 限时抢购
    flashSale_title: '',
    ac_load_btn: true,
    actived_idx: 1,
    activity_id: 0,
    activitylist: [],
    good_list: [],
    total: 0,
    timer_btn: false,
    singleAd: [],
    advertisementAd: [],
    AdClickBtn: true,
    isGoodListBool: false,
    // 商详
    productId: 0,
    itemData: {},
    showSKUstatus: 0,
    optionalAttrs: {},
    skuImages: '',
    bannerItem: [],
    buynum: 1,
    // 属性选择
    firstIndex: -1,
    choosed_sku: '',
    cartAmount: 0,
    // 弹窗SKU，不能减不能加
    undel: true,
    unadd: false,
    // SKU的VIP价格和非SVIP是否相同
    isPriceEqual: false,
    canPurchase: false,
    //模块
    indexModel: null,
    // 新厂图片数据
    newFactoryList: [],
    // 分享信息
    share_data: {
      share_title: "",
      share_img: ""
    },
    // 公众号组件显示
    showOfficial: true,
    showTips: true,
    pickUpActivity: {},
    takeoutAnimation: false,
    choosePickupShow: false,
    chooseSelectIndex: 0,
    choosePickupList: [],
    showMoreTips: false,
    shop_id: 0,
    showPacketAd: true,
    showPacketCoupon: false,
    subjectAdList: [],
    packetModal: [],
    teamNum: 0,
    teamGoodsList: [],
    team_page: 1,
    team_page_size: 20,
    bargain_page: 1,
    bargain_page_size: 20,
    be_team_page: 1,
    be_team_page_size: 20,
    bargainList: [],
    teamList: [],
    beTeamList: [],
    sliderBarFixed: false,
    // 领券成功弹窗
    showCouponsSuccess: false,
    showPhoneModal: false,
    getRemind: false,
    checkShowBottom: false,
    showBottomLoading: false,
    homeSituation: {},
    showTiket: false,
    showRedEnvelType: 1,
    activityAdIndexInfo: {},
    showIndexLogo: false,
    stortInfo: {},
    scrollLeftNum: 0,
    couponEntry: {},
    isShowWelfare: false,
    newIndexAdImageH: 332,
    showDownGuide: false,
    showSwiperScreen: false,
    newIndexEasingFunction: 'default',
    changeIndexTabFixed: false,
  },
  onLoad: function(options) {
    common.showLoad(this);
    this.is_welfare = options.is_welfare;
    wx.showShareMenu({
      withShareTicket: true
    })
    // 判断是否显示下拉引导
    var isShowDownGuide = common.getStorageSync('isShowDownGuide');
    if (!isShowDownGuide && isShowDownGuide == '') {
      this.setData({
        showDownGuide: true
      })
    }
    // 设置reload 为true 才允许加载数据，为了返回当前页，onShow不重新加载数据使用
    // 加载页面时先设置默认值
    common.setStorageSync('reLoad', true);
    var pickupId = common.getStorageSync('getpickup');
    this.setData({
      entryData: options
    })
    // 监听checkSessionKey
    event.on('show', this, function(data) {
      this.setData({
        showCouponsSuccess: false,
        AdClickBtn: true
      })
    })
    // 监听小程序后台后隐藏关注组件
    event.on('hide', this, function(res) {
      this.setData({
        showOfficial: false
      })
    })
    if (!app.checkSessionKey) {
      event.on('checkSessionKey', this, function(data) {
        this.data.checkSessionKey = data;
      })
    }
    // this.getPacketModal();
  },
  onShow: function(options) {
    var that = this;
    var pickupId = common.getStorageSync('getpickup');
    app.aldstat.sendEvent("get_index", {
      "提货点": pickupId.cityName
    });
    common.setInviteShareLogin();
    if (pickupId && that.data.pickup.pickup_id != pickupId.pickup_id && that.data.pickup.pickup_id != undefined) {
      if (pickupId.pickup_type == 0) {
        // that.loadData();
        that.getActivityAdIndex();
      } else {
        that.getPickUpAcitivity();
      }
      that.setData({
        pickup: pickupId
      })
    }
    if (common.getStorageSync('reLoad')) {
      common.setStorageSync('reLoad', false);
    } else {
      if (pickupId.pickup_type == 0) {
        that.getStorNumber();
        that.getAdvertisement().then(() => {
          that.getCouponEntry().then(() => {
            that.getHomeSituation()
          })
        })
      }
      return;
    }
    that.setData({
      pickup: common.getStorageSync('getpickup'),
      good_list: [],
      page: 1
    });
    // 外部携带的参数
    var options = that.data.entryData;
    if (options && options.tissue == 'true') {
      this.setData({
        showTissue: true
      })
    }
    // 判断是否第一次进入 且是从外部进入，如二维码扫码 && app.firstlaunchApp
    // options && options.entryType && options.entryType == 'external'
    if (options && (options.atitude || options.pickup_id) && (!pickupId || options.is_welfare == 1)) {
      if (options.atitude) {
        that.getExternal(options.atitude, 1).then(function() {
          // 关闭开关，让app知道已经不是第一次进入当前页
          app.firstlaunchApp = false;
          // 清空data内携带参数
          that.data.entryData = {};
          var city = common.getStorageSync('city');
          var pickup = common.getStorageSync('getpickup');
          var data = {
            pickup: pickup,
            city: city,
            isAuthorization: true
          }
          data.showPage = true;
          that.setData(data);
          if (pickup.pickup_type == 0) {
            // that.loadData(city);
            that.getActivityAdIndex();
          } else {
            that.getPickUpAcitivity()
          }
          // 外部已带经纬度定位，无需再调用定位接口，所以将缓存定位改为真，让页面可以显示
          common.setStorageSync('authSetting', {
            'scope.userLocation': true
          });
        })
      } else {
        that.getExternal(options.pickup_id, 2).then(function() {
          // 关闭开关，让app知道已经不是第一次进入当前页
          app.firstlaunchApp = false;
          // 清空data内携带参数
          that.data.entryData = {};
          var city = common.getStorageSync('city');
          var pickup = common.getStorageSync('getpickup');
          var data = {
            pickup: pickup,
            city: city,
            isAuthorization: true
          }
          data.showPage = true;
          that.setData(data);
          if (pickup.pickup_type == 0) {
            // that.loadData(city);
            that.getActivityAdIndex();
          } else {
            that.getPickUpAcitivity()
          }
          // 外部已带经纬度定位，无需再调用定位接口，所以将缓存定位改为真，让页面可以显示
          common.setStorageSync('authSetting', {
            'scope.userLocation': true
          });
        })
      }
      return;
    }
    // 定位检测
    that.local(function(city) {
      var data = {
        city: city,
        isAuthorization: common.getStorageSync('authSetting')['scope.userLocation']
      }
      that.setData(data);
      // 关闭开关，让app知道已经不是第一次进入当前页
      app.firstlaunchApp = false;
      // 判断是否有开启定位和仓库
      if (city.warehouse_id != -1 && pickupId.pickup_id) {
        that.showAddTips();
        data.showPage = true;
        that.setData(data);
      } else {
        data.showPage = false;
        that.setData(data);
        return false;
      }
      that.setData({
        page: 1,
        shopList: [],
        recommendList: [],
        good_list: [],
      })
      if (pickupId.pickup_type == 0) {
        // that.loadData(city);
        that.getActivityAdIndex();
      } else {
        that.getPickUpAcitivity(city)
      }
      // that.getIndexShareInfo();
      // that.getShopPickUp();
    })

    //获取屏幕宽度，根据比例设置轮播的高度
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          height: res.windowWidth / 1.70454545
        })
      }
    })
  },
  // 从外部二维码扫码，带经纬度和外部标识external
  getExternal: function(value, type) {
    var that = this;
    var uri = app.getPath.getpickup;
    if (type == 1) {
      var data = {
        atitude: value
      }
    } else {
      var data = {
        pickup_id: value
      }
    }
    return new Promise(function(resolve, reject) {
      // 获取提货点
      common.ApiGateWayTest(uri, data, true, function(res) {
        if (res && res.data && res.data.success == 1) {
          if (type == 1) {
            var res = res.data.result.cities;
          } else {
            var res = res.data.result.cities.pick_up;
          }
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
              'pickup_type': res.pickup_type,
              'cityName': res.pickup_name,
              'pickup_address': res.pickup_address,
              'pickup_contact': res.pickup_contact,
              'pickup_phone': res.pickup_phone
            },
          }, function(res) {
            resolve('获取id成功')
          })
        }
      })
    })
  },
  //关闭首页弹窗
  closeTips() {
    this.setData({
      showTips: false
    })
  },
  // 显示添加小程序提示
  showAddTips() {
    setTimeout(() => {
      this.setData({
        showTips: false
      })
    }, 10000)
    // var date=new Date().toLocaleDateString();
    // if(wx.getStorageSync("add-tips")){
    //   var tips=wx.getStorageSync("add-tips");
    //   if(date===tips){
    //     this.setData({
    //       showTips:false
    //     })
    //   }else{

    //     this.setData({
    //       showTips:true
    //     })
    //     wx.setStorageSync("add-tips", date);
    //   }
    // }else{
    //   wx.setStorageSync("add-tips",date);
    // }
  },
  //显示加入小程序帮助
  toShowTips() {
    this.setData({
      showMoreTips: true
    })
  },
  //关闭加入小程序帮助
  closeAllTips() {
    this.setData({
      showMoreTips: false,
      showTips: false
    })
  },
  // 获取数据
  loadData: function(city) {
    var that = this;
    // 全部接口回调完成后停止下拉动画
    // that.getScKillList(), that.getDate(), that.getActivitylist(), that.getSubjuctList(), that.getActivitynewperson(),
    Promise.all([that.getpickuplistr(), that.getAd(), that.getBar(), that.getsingleAd(), that.getIndexProducts(), that.getHomeSituation(), that.getAdvertisement()]).then(function(res) {
      if (!res[0]) {
        common.setStorageSync('reLoad', true);
        that.onShow();
        return
      } else {
        wx.stopPullDownRefresh();
      }
    })
    if (wx.createSelectorQuery) {
      wx.createSelectorQuery().select('#topHeight').boundingClientRect(function(rect) {
        if (rect && rect.top) {
          that.setData({
            scrollTop: rect.top // 节点的上边界坐标
          })
        }
      }).exec()
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  // 新厂首页获取数据
  getNewFactory(city) {
    var that = this;
    that.getNewAd();
    that.getSubjectAd();
    var uri = app.getPath.newFactory;
    common.ApiGateWayTest(uri, '', true, function(res) {
      var resData = res.data;
      if (resData.success == 1) {
        that.setData({
          newFactoryList: resData.result.data
        })
      } else {
        common.toast(resData.msg);
        return
      }
      wx.stopPullDownRefresh()
    })
  },
  // 获取首页分享数据
  getIndexShareInfo() {
    var that = this;
    var uri = app.getPath.indexShareInfo;
    var data = {
      type: 5
    }
    common.ApiGateWayTest(uri, data, true, function(res) {
      var resData = res.data;
      if (resData.success == 1) {
        if (resData.result.data != '' && resData.result.data != null) {
          that.setData({
            share_data: resData.result.data
          })
        }
      } else {
        common.toast(resData.msg);
        return
      }
    })
  },
  // 定位检测
  local: function(callback) {
    var that = this;
    that.setData({
      isAuthorization: common.getStorageSync('authSetting')['scope.userLocation']
    })
    var city = common.getStorageSync('city');
    var pickup = common.getStorageSync('getpickup');
    if (app.firstlaunchApp && pickup.pickup_id == undefined) {
      // 进入app后首次打开当前页面   没仓库的情况下 先获取地理定位
      if (that.data.isAuthorization) {
        // 增加加载，防止未加载完当前定位就点击
        common.showLoad(that)
      }
      common.getpickup(function(res) {
        var city = res.cities;
        if (city.choose_pickup && city.choose_pickup.length > 1) {
          that.setData({
            choosePickupShow: true,
            choosePickupList: city.choose_pickup
          });
          (callback && typeof(callback) === "function") && callback(city);
          common.hideLoad(that);
          return;
        } else {
          common.setStorageSync('reLoad', true);
          that.onShow();
          (callback && typeof(callback) === "function") && callback(city);
          common.hideLoad(that);
        }
      })
    } else {
      // 有自提点的情况下，直接 取自提点 不重新请求
      // 第二次进入当前页（从选择定位页面进入），直接用仓库地址请求数据
      (callback && typeof(callback) === "function") && callback(city);
    }
  },
  // 打开定位回调
  openSet: function(e) {
    var that = this;
    that.setData({
      isAuthorization: e.detail.isAuthorization
    })
    common.setStorageSync('reLoad', true);
    app.dataBase.isRefresh = true;
    that.onShow()
  },
  //跳转分类页
  goCategory: function() {
    wx.switchTab({
      url: '/pages/category/category'
    })
  },

  // 上拉加载
  onReachBottom: function() {
    var pickupId = common.getStorageSync('getpickup');
    if (pickupId.pickup_type == 0) {
      return false;
      if (this.data.refresh) {
        this.setData({
          page: this.data.page + 1
        })
        this.getIndexProducts();
        // this.getActivitygoodslist()
      }
    } else {
      if (this.data.teamNum == 1) {
        if (this.data.bargainList.length > 0 && this.data.bargainList.length % this.data.bargain_page_size == 0) {
          this.data.bargain_page = this.data.bargainList.length / this.data.bargain_page_size + 1;
          this.setData({
            showBottomLoading: true
          })
          this.getBargainActivity();
        }
      } else if (this.data.teamNum == 0) {
        if (this.data.teamList.length > 0 && this.data.teamList.length % this.data.team_page_size == 0) {
          this.data.team_page = this.data.teamList.length / this.data.team_page_size + 1;
          this.setData({
            showBottomLoading: true
          })
          this.getTeamList();
        }
      } else if (this.data.teamNum == 2) {
        if (this.data.beTeamList.length > 0 && this.data.beTeamList.length % this.data.be_team_page_size == 0) {
          this.data.be_team_page = this.data.beTeamList.length / this.data.be_team_page_size + 1;
          this.setData({
            showBottomLoading: true
          })
          this.getBeTeamList();
        }
      }
    }
  },
  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      shopList: [],
      recommendList: [],
      good_list: [],
      showAdver: false,
      showCouponsSuccess: false
    })
    if (this.data.pickup.pickup_type == 0) {
      // this.loadData();
      this.getActivityAdIndex();
    } else {
      this.getPickUpAcitivity();
    }
  },
  // 获取是否签到
  signcheck: function() {
    var that = this;

    var uri = app.getPath.signcheck;
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, {}, true, function(res) {
        if (res && res.data && res.data.success == 1) {
          var data = res.data.result;
          that.setData({
            signcheckStatus: data.status
          })
          resolve('success signcheck');
        }
      })
    })
  },
  to_sign: function() {
    // 判断是否登录或者老用户
    if (!app.checkSessionKey) {
      wx.navigateTo({
        url: '/pages/register/register?isGetCoupon=1'
      })
    }
    var pickup = common.getStorageSync('getpickup');
    app.aldstat.sendEvent("on_index_floatSign", {
      "提货点": pickup.cityName
    });
    if (this.data.signcheckStatus == 0) {
      wx.navigateTo({
        url: "/pages/sign/sign?entryType=external",
      })
    } else if (this.data.signcheckStatus == 1) {
      wx.navigateTo({
        url: "/packageB/tools/turntable",
      })
    }

  },
  // 获取轮播图
  getAd: function() {
    var that = this;
    var uri = app.getPath.adlist;
    var data = {
      pid: 1
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
  // 新版本获取轮播图
  getNewAd: function() {
    var that = this;
    var uri = app.getPath.adlist;
    var data = {
      pid: 6
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
  // 跳转指定专题页
  goWebView: function(e) {
    var item = e.currentTarget.dataset.item;
    var type = e.currentTarget.dataset.type;
    if (type == 1) {
      var pickup = common.getStorageSync('getpickup');
      app.aldstat.sendEvent("on_index_popup", {
        "提货点": pickup.cityName
      });
    } else if (type == 2) {
      var pickup = common.getStorageSync('getpickup');
      app.aldstat.sendEvent("on_index_swiper", {
        "名称": item.ad_name,
        "提货点": pickup.cityName,
        "提货点&名称": pickup.cityName + "_" + item.ad_name
      });
    } else if (type == 3) {
      var pickup = common.getStorageSync('getpickup');
      app.aldstat.sendEvent("on_index_changeSwiper", {
        "名称": item.ad_name,
        "提货点": pickup.cityName,
        "提货点&名称": pickup.cityName + "_" + item.ad_name
      });
    } else if (type == 4) {
      var pickup = common.getStorageSync('getpickup');
      app.aldstat.sendEvent("on_index_newAddimage", {
        "提货点": pickup.cityName
      });
    }
    if (item.media_type != 9) {
      common.goAdWebView(e);
    } else if (item.media_type == 9) {
      // if (item.take_type == 2) {
      //   // 点击领取弹窗优惠券
      //   // 判断是否登录或者老用户
      //   if (!app.checkSessionKey) {
      //     wx.navigateTo({
      //       url: '/pages/register/register?isGetCoupon=1'
      //     })
      //   }
      //   if (!app.checkSessionKey) {
      //     event.on('isGetCoupon', this, function (data) {
      //       this.getCoupon(item.ad_link, item.ad_id, 2)
      //     })
      //   } else {
      //     this.getCoupon(item.ad_link, item.ad_id, 2)
      //   }
      // }
      // 首页优惠券领券
      if (!app.checkSessionKey) {
        common.goRegister();
        return false;
      } else {
        this.getCoupons(item.ad_id)
      }
    }
  },
  //  限时抢购
  // 时间
  getDate: function() {
    var that = this;
    this.timer = setInterval(function() {
      // 精确到秒
      var timestamp = Math.floor((new Date()).getTime() / 1000);
      // 限时秒杀判断刷新
      // var scKill_idx = that.data.scKill_idx;
      // var btn3 = that.data.scKillList[scKill_idx].progress.start_time/1000 - timestamp;
      // var btn4 = that.data.scKillList[scKill_idx].progress.end_time/1000 - timestamp;

      // if (btn3 == -3 || btn4 == -3){
      //   wx.showLoading({
      //     title: '更新中',
      //     icon: 'none'
      //   })
      //   that.setData({
      //     page: 1,
      //     scKill_list: []
      //   })
      //   that.getScKillList();
      // }

      // 限量抢购判断刷新
      var actived_idx = that.data.actived_idx;
      var btn1 = that.data.activitylist[actived_idx].progress.start_time / 1000 - timestamp;
      var btn2 = that.data.activitylist[actived_idx].progress.end_time / 1000 - timestamp;
      if (btn1 == -3 || btn2 == -3) {
        common.showLoad(that);
        that.setData({
          page: 1,
          good_list: [],
          timer_btn: true
        })
        that.getActivitylist();
      }

    }, 1000)
  },

  // 限时秒杀
  // scKillactived: function (e) {
  //   var that = this;
  //   var d = e.currentTarget.dataset;
  //   // 防止点击过快，重复加载数据
  //   if (!that.data.ac_load_btn) {
  //     return false;
  //   }

  //   that.setData({
  //     scKill_id: d.sckill_id,
  //     scKill_idx: d.sckill_idx,
  //     page: 1,
  //     scKill_list: []
  //   })

  //   that.getSckillgoodslist();
  // },
  // getScKillList:function(){
  //   var that = this;
  //   var uri = app.getPath.scKill;
  //   return new Promise(function (resolve, reject) {
  //     common.ApiGateWayTest(uri, {}, true, function (res) {
  //       var res = res.data;
  //       if (res.success == 1) {
  //         // 先置默认值
  //         var activity_id = 0;
  //         var actived_idx = 0;
  //         var lists = res.result.lists;

  //         // 如果没有数据
  //         if (lists.length == 0) {
  //           // 全清空
  //           that.setData({
  //             scKillList: [],
  //             scKill_id,
  //             scKill_idx,
  //           })
  //           return false;
  //         }

  //         that.getDate();
  //         var btn = true;
  //         for (var i = 0; i < lists.length; i++) {
  //           var state = lists[i].progress.state;
  //           // 判断正在抢购中
  //           if (state == 1) {
  //             activity_id = lists[i].activity_id;
  //             actived_idx = i;
  //             btn = false;
  //             break;
  //           }
  //         }
  //         // 没有判断距离最近的即将开始
  //         if (btn) {
  //           for (var i = 0; i < lists.length; i++) {
  //             var state = lists[i].progress.state;
  //             if (state == 2) {
  //               activity_id = lists[i].activity_id;
  //               actived_idx = i;
  //               btn = false;
  //               break;
  //             }
  //           }
  //         }
  //         // 再无则取中间项
  //         if (btn) {
  //           activity_id = lists[2].activity_id;
  //           actived_idx = 2;
  //         }
  //         that.setData({
  //           scKillList: lists,
  //           scKill_id: activity_id,
  //           scKill_idx:actived_idx
  //         })
  //         that.getSckillgoodslist();
  //         resolve('限时秒杀成功')
  //       }
  //     })
  //   })
  // },
  // getSckillgoodslist(callback){
  //   var that = this;
  //   wx.showLoading({
  //     title: '更新中',
  //     icon: 'none'
  //   })
  //   // 关闭开关
  //   that.data.ac_load_btn = false;
  //   var uri = app.getPath.activitygoodslist;
  //   var data = {
  //     page: 1,
  //     page_size: 2,
  //     activity_id: this.data.scKill_id
  //   }
  //   common.ApiGateWayTest(uri, data, true, function (res) {
  //     if (res.statusCode == 500) {
  //       wx.hideLoading();
  //       return false;
  //     }
  //     var res = res.data;
  //      // 循环活动列表，得到当前选中的状态
  //     var nowState = that.data.scKillList[that.data.scKill_idx];//当前选中的index
  //     for (let i in that.data.scKillList) {
  //       if (that.data.scKillList[i].activity_id == that.data.scKill_id) {
  //         // 当前选中的活动的状态，
  //         var nowState = that.data.scKillList[i].progress.state;
  //       }
  //     }
  //     if (res.success == 1) {
  //       var lists = res.result.lists;
  //       // 给所有的商品列表项添加状态
  //       for (var i = 0; i < lists.length; i++) {
  //         lists[i].state = nowState;
  //       }
  //       var good_list = lists;
  //       // if (good_list.length > 0) {
  //       //   var isGoodListBool = false;
  //       // } else {
  //       //   var isGoodListBool = true;
  //       // }
  //       that.setData({
  //         scKill_list: good_list,
  //         // total: res.result.total,
  //         // isGoodListBool
  //       })
  //       // 打开开关
  //       that.data.ac_load_btn = true;
  //       wx.hideLoading();

  //     }
  //   })
  // },

  // 限量抢购判断选中
  actived: function(e) {
    var that = this;
    var d = e.currentTarget.dataset;
    if (!that.data.ac_load_btn) {
      return false;
    }
    that.setData({
      activity_id: d.activity_id,
      actived_idx: d.actived_idx,
      page: 1,
      good_list: []
    })

    that.getActivitygoodslist();
  },
  // 获取限量抢购上面部分信息
  getActivitylist() {
    var that = this;
    var uri = app.getPath.activitylist;
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, {}, true, function(res) {
        var res = res.data;
        if (res.success == 1) {
          // 先置默认值
          var activity_id = 0;
          var actived_idx = 0;
          var lists = res.result.lists;
          // 如果没有数据
          if (lists.length == 0) {
            that.setData({
              activitylist: [],
              activity_id,
              actived_idx,
              flashSale_title: ''
            })
            return false;
          }
          that.getDate();
          var flashSale_title = '';
          var btn = true;
          for (var i = 0; i < lists.length; i++) {
            var state = lists[i].progress.state;
            // 判断正在抢购中
            if (state == 1) {
              activity_id = lists[i].activity_id;
              actived_idx = i;
              // flashSale_title = lists[i].time + '限量抢购';
              btn = false;
              break;
            }
          }
          // 没有判断距离最近的即将开始
          if (btn) {
            for (var i = 0; i < lists.length; i++) {
              var state = lists[i].progress.state;
              if (state == 2) {
                activity_id = lists[i].activity_id;
                actived_idx = i;
                // flashSale_title = lists[i].time + '限量抢购';
                btn = false;
                break;
              }
            }
          }
          // 再无则取中间项
          if (btn) {
            activity_id = lists[2].activity_id;
            actived_idx = 2;
            // flashSale_title = lists[2].time + '限量抢购';
          }
          that.setData({
            activitylist: lists,
            activity_id: activity_id,
            actived_idx,
            flashSale_title: '下单无门槛，全场免邮费'
          })
          that.getActivitygoodslist();
          resolve('getActivitylist success')
        }
      })
    })

  },
  // 获取限量抢购商品列表信息
  getActivitygoodslist(callback) {
    var that = this;
    common.showLoad(that);
    // 关闭开关
    that.data.ac_load_btn = false;
    var uri = app.getPath.activitygoodslist;
    var data = {
      page: this.data.page,
      page_size: this.data.page_size,
      activity_id: this.data.activity_id
    }
    common.ApiGateWayTest(uri, data, true, function(res) {
      if (res.statusCode == 500) {
        common.hideLoad(that);
        return false;
      }
      var res = res.data;
      var nowState = that.data.activitylist[that.data.actived_idx];
      for (let i in that.data.activitylist) {
        if (that.data.activitylist[i].activity_id == that.data.activity_id) {
          var nowState = that.data.activitylist[i].progress.state;
        }
      }
      if (res.success == 1) {
        var lists = res.result.lists;
        // 给所有的商品列表项添加状态
        for (var i = 0; i < lists.length; i++) {
          lists[i].state = nowState;
        }
        // var good_list = [...that.data.good_list, ...lists];
        var good_list = that.data.good_list ? that.data.good_list.concat(lists) : lists;
        if (good_list.length > 0) {
          var isGoodListBool = false;
        } else {
          var isGoodListBool = true;
        }
        that.setData({
          good_list: good_list,
          total: res.result.total,
          isGoodListBool
        })
        if (that.data.good_list.length < that.data.total) {
          that.refresh(true)
        } else {
          that.refresh(false)
        }
        // 打开开关
        that.data.ac_load_btn = true;
        common.hideLoad(that);

      }
    })
  },

  // 广告图片
  getsingleAd: function() {
    var that = this;
    var uri = app.getPath.adlist;
    var data = {
      pid: 4
    }
    common.ApiGateWayTest(uri, data, true, function(res) {
      if (res && res.data && res.data.success == 1) {
        var data = res.data.result;
        that.setData({
          singleAd: data,
          singleAdcurrent: 0
        })
      }
    })
  },
  // 领取弹窗优惠券-新人
  getCoupon: function(coupon_id, ad_id, take_type) {
    var that = this;
    // 防止多次点击
    if (!this.data.AdClickBtn) {
      return false;
    } else {
      this.data.AdClickBtn = false;
    }
    var uri = app.getPath.addCoupon;

    var data = {
      coupon_id
    }
    common.ApiGateWayTest(uri, data, true, function(res) {
      if (res && res.data && res.data.success == 1) {
        var result = res.data.result;
        // common.toast(result.state_desc);
        that.adclose(ad_id, 1)
        that.setData({
          showCouponList: true
        })
        if (take_type == 2) {
          that.setData({
            showCloseImg: true
          })
        }
      } else {
        // 防点击开关打开
        that.data.AdClickBtn = true;
      }

    })
  },
  // 首页领券
  getCoupons(ad_id) {
    var that = this;
    // 防止多次点击
    if (!this.data.AdClickBtn) {
      return false;
    } else {
      this.data.AdClickBtn = false;
    }
    var uri = app.getPath.addAdCoupon;
    var data = {
      ad_id: ad_id
    }
    common.ApiGateWayTest(uri, data, true, function(res) {
      var resData = res.data;
      if (resData.success == 1 && resData.result.state == 0) {
        that.setData({
          popupCouponsList: resData.result.couponInfo,
          showAdver: false,
          showCouponsSuccess: true
        })
      } else {
        that.setData({
          showAdver: false,
        })
        that.data.AdClickBtn = true;
        if(!!resData.result){
        common.toast(resData.result.state_desc);
      }
        return
      }
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
      return
    })
  },
  // 弹窗广告
  getAdvertisement: function() {
    var that = this;
    return new Promise((resolve, reject) => {
      var uri = app.getPath.adlist;
      var data = {
        pid: 5
      }
      common.ApiGateWayTest(uri, data, true, function(res) {
        if (res && res.data && res.data.success == 1) {
          var data = res.data.result;
          if (typeof data == 'object' && data.constructor == Array && data[0].media_type && data[0].media_type != '') {
            var pickup = common.getStorageSync('getpickup');
            app.aldstat.sendEvent("exposure_index_popup", {
              "提货点": pickup.cityName
            });
            if (!!data[0].ad_text){
              WxParse.wxParse('advertisementAdText', 'html', data[0].ad_text, that, 0);
            }
            that.setData({
              advertisementAd: data,
              showAdver: true,
              isShowWelfare: false,
              showRedEnvel: false,
              showCouponsSuccess: false
            }, () => {
              resolve()
            })
            that.adclose(data[0].ad_id, 0);
              // 弹窗领取优惠券
            if(data[0].media_type == 16){
              var uri = app.getPath.addCoupon;
              var data = {
                coupon_id: data[0].ad_link
              }
              common.ApiGateWayTest(uri, data, true, function(res) {

              })
            }
          } else if (data[0].media_type == 9 && data[0].ad_code == '') {
            that.setData({
              advertisementAd: data,
              showAdver: false
            }, () => {
              resolve()
            })
          }else {
            that.setData({
              showAdver: false
            }, () => {
              resolve()
            })
          }
        }
      })
    })
  },
  advertisementOut(e) {
    var that = this;
    var ad_id = e.detail.target.dataset.ad_id;
    common.formIdUpdate(e);
    if (app.checkSessionKey) {
      common.formIdUpdate(e);
      if (ad_id && ad_id > 0) {
        that.adclose(ad_id, 0)
      }
    }
    that.setData({
      showAdver: false,
      showCouponsSuccess: false,
      AdClickBtn: true
    })
  },
  // 获取bar列表
  getBar: function() {
    var that = this;
    var uri = app.getPath.barList;
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, '', true, function(res) {
        if (res && res.data && res.data.success == 1) {
          var data = res.data.result;
          for (var i = 0; i < data.barList.length; i++) {
            // 	类型（1.签到 2.领券中心 3.专题 4.活动页 5.限时抢购 6.门店支付 7.通用活动 8.砍价活动）
            switch (data.barList[i].type) {
              case 1:
                data.barList[i].url = '/pages/sign/sign?entryType=external'
                break;
              case 2:
                data.barList[i].url = '/pages/couponCenter/couponCenter?entryType=external'
                break;
              case 3:
                if (data.barList[i].position > 0) {
                  data.barList[i].url = '/pages/index/configureModelPage/configureModelPage?position=' + data.barList[i].position
                } else {
                  data.barList[i].url = '/pages/projectPage/projectPage?entryType=external&type=3&id=' + data.barList[i].id;
                }
                break;
              case 4:
                data.barList[i].url = '/pages/activity/activity?entryType=external&activity_id=' + data.barList[i].id;
                // data.barList[i].url = '/packageA/select/select?id='+66;
                break;
              case 5:
                data.barList[i].url = '/pages/flashSale/flashSale'
                break;
              case 6:
                data.barList[i].url = '../../packageB/topay/topay'
                break;
              case 7:
                data.barList[i].url = '/packageA/select/select?entryType=external&id=' + data.barList[i].id;
                break;
              case 8:
                data.barList[i].url = '/packageA/bargain/bargain?entryType=external&activity_bargain_id=' + data.barList[i].id;
                break;
              case 9:
                data.barList[i].url = '/packageA/team-product/team-product?entryType=external&teamId=' + data.barList[i].id;
                break;
              case 10:
                data.barList[i].url = data.barList[i].id;
                break;
              default:
                data.barList[i].url = ''
            }
          }

          that.setData({
            barList: data.barList,
            service_title: data.service_title
          })
          resolve('barSuccess');
        } else {
          common.toast('网络错误');
        }
      })
    })
  },
  goBar: function(e) {
    let url = e.currentTarget.dataset.url;
    let index = e.currentTarget.dataset.index;
    var pickup = common.getStorageSync('getpickup');
    if (app.checkSessionKey) {
      common.formIdUpdate(e);
    }
    app.aldstat.sendEvent("on_index_tabbar_" + (Number(index) + 1), {
      "提货点": pickup.cityName
    });
    wx.navigateTo({
      url: url
    })
  },
  // 获取新人活动列表
  getActivitynewperson: function() {
    var that = this;
    var uri = app.getPath.activitynewperson;
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, '', true, function(res) {
        if (res && res.data && res.data.success == 1) {
          var data = res.data.result;
          that.setData({
            acticity_new_person: data.acticity_new_person
          })

          resolve('barSuccess');
        }
      })
    })
  },
  // 获取抢购接口
  getActivityindex: function() {
    var that = this;
    var uri = app.getPath.activityindex;
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, '', true, function(res) {
        if (res && res.data && res.data.success == 1) {
          var data = res.data.result;
          that.setData({
            acticity_buy: data.acticity_buy
          })
          resolve('barSuccess');
        } else {
          common.toast('网络错误');
        }
      })
    })
  },
  // 首页专题列表
  // getSubjuctList:function(){
  //     var that = this;
  //     var uri = app.getPath.subjuctList;
  //     return new Promise(function (resolve, reject) {
  //         common.ApiGateWayTest(uri, '', true, function (res) {
  //             if (res && res.data && res.data.success == 1) {
  //                 var data = res.data.result.subjectList;

  //                 that.setData({subjuctList:data})

  //               resolve('subjuctListSuccess');
  //             } else {
  //                 common.toast('网络错误');
  //             }
  //         })
  //     })
  // },
  // 获取精选推荐
  getIndexProducts: function(page) {
    var that = this;
    var uri = app.getPath.goodsRecommend;
    var data = {
      page: this.data.page,
      page_size: this.data.page_size
    }
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function(res) {
        if (res && res.data) {
          var data = res.data;
          if (data.success == 1) {
            var list = data.result.products;
            // var imglist = data.result.products;
            // var list = [];
            // var dataList = [];
            // for(var i in imglist){
            //   list.push(imglist[i]);
            //   if((Number(i)+1)%2 == 0){
            //     dataList.push(list);
            //     list = [];
            //   }
            //   if(i == imglist.length-1 && list.length > 0){
            //     dataList.push(list);
            //   }
            // }
            // that.setData({
            //   shopList: that.data.shopList.concat(dataList)
            // })
            that.setData({
              shopList: that.data.shopList.concat(list)
            })
            if (data.result.products.length < that.data.page_size) {
              that.refresh(false);
              that.setData({
                showBottomLoading: false
              })
            } else {
              that.refresh(true);
              that.setData({
                showBottomLoading: true
              })
            }
          } else if (data.success == 0) {
            that.refresh(false);
          }
          resolve('productsSuccess');
        } else {
          common.toast('网络错误');
        }
      })
    })
  },

  // 是否允许上拉加载
  refresh: function(data) {
    this.setData({
      refresh: data
    })
  },
  // 去搜索页面
  goSearch: function() {
    wx.navigateTo({
      url: '../search/search?keyWord=' + this.data.keyWord
    })
  },
  tap_to_top: function() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  // 滚动判断
  onPageScroll: function(e) {
    var that = this;
    if (wx.createSelectorQuery()) {
      const query = wx.createSelectorQuery()
      query.select('#chang-index-tab').boundingClientRect(res => {
        if (res && res.top) {
          if (res.top < that.data.navBarHeight && !that.data.changeIndexTabFixed) {
            that.setData({
              changeIndexTabFixed: true
            })
          } else if (res.top > that.data.navBarHeight && that.data.changeIndexTabFixed) {
            that.setData({
              changeIndexTabFixed: false
            })
          }
        }
      }).exec();
    }
    if (!this.data.takeoutAnimation) {
      this.setData({
        takeoutAnimation: true
      })
    } else {
      this.endScroll();
    }
  },
  endScroll: function() {
    clearTimeout(this.scroll);
    this.scroll = setTimeout(function() {
      if (this.data.takeoutAnimation) {
        this.setData({
          takeoutAnimation: false
        });
      }
    }.bind(this), 500);
  },
  onShareAppMessage: function(res) {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    var entry_share_info = common.getStorageSync('entry_share_info');
    if (res.target && res.target.dataset.shareinfo) {
      let shareInfo = res.target.dataset.shareinfo;
      if (shareInfo && shareInfo.fromButton == 'notice') {
        return {
          title: entry_share_info.urge_share_text,
          path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
          imageUrl: entry_share_info.urge_share_img
        }
      } else if (shareInfo && shareInfo.fromButton == 'envelopes') {
        return {
          title: entry_share_info.invite_share_text,
          path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
          imageUrl: entry_share_info.invite_share_img
        }
      } else {
        return {
          title: entry_share_info.invite_share_text,
          path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
          imageUrl: entry_share_info.invite_share_img
        }
      }
    } else {
      return {
        title: entry_share_info.invite_share_text,
        path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
        imageUrl: entry_share_info.invite_share_img
      }
    }
  },
  //
  // 跳转商品页
  goToProduct(e) {
    var goodsid = e.currentTarget.dataset.goodsId;
    var goodsName = e.currentTarget.dataset.name;
    var pickup = common.getStorageSync('getpickup');
    app.aldstat.sendEvent("on_index_rushToBuy", {
      "提货点": pickup.cityName,
      "名称": goodsName,
      "提货点&名称": pickup.cityName + "_" + goodsName
    });
    if (app.checkSessionKey) {
      common.formIdUpdate(e);
    }
    wx.navigateTo({
      url: '/pages/product/product?entryType=external&productId=' + goodsid
    })
  },


  // 商详加入购物车移出
  currentAttrs: [],
  confirmData: {},
  // SKU弹窗
  setModalStatus: function(type) {
    if (this.data.showSKUstatus == 0) {
      this.data.showSKUstatus = 1;
    } else {
      this.data.showSKUstatus = 0;
    }
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })

    animation.translateY(300).opacity(1).step();

    this.setData({
      animationData: animation.export()
    })

    if (this.data.showSKUstatus == 1) {

      this.setData({
        showModalStatus: true
      });
    }
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (this.data.showSKUstatus == 0) {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)
  },
  //添加到购物车
  addShopCart: function(e) {
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    var that = this;
    if (this.data.productid == e.target.dataset.productid) {
      addCart(e)
    } else {
      this.loadProductDetail(e).then(function() {
        addCart(e)
      })
    }

    function addCart(e) {
      if (!that.checkCanPurchase()) return;
      var product = that.data.itemData;
      var type = e.currentTarget.dataset.type;
      that.setData({
        buy_now: 0
      })
      // type == 'addcart' &&
      if (that.currentAttrs.length == product.properties.length) {
        // 验证库存
        var product_id = '';
        for (var i in product.stock) {
          var stock = product.stock[i].key;
          stock = stock.split('_');
          stock.sort(function(a, b) {
            return a - b;
          })
          stock = stock.join('_');
          var attrs = that.currentAttrs.join('_');
          if (attrs == stock) {
            product_id = product.stock[i].key;
            break;
          }
        }
        var invurl = app.getPath.addCart;
        if (product.pre_info && product.pre_info.is_pre == 1) {
          invurl = app.getPath.addCart;
        }
        var invdata = {
          goods_id: product.goods_id,
          sku_key: product_id,
          amount: that.data.buynum
        };
        app.aldstat.sendEvent("加入购物车", {
          "商品名称": that.data.itemData.report.goods_name,
          "用户名": that.data.itemData.report.nick_name
        })
        common.formIdUpdate(e);
        common.ApiGateWayTest(invurl, invdata, true, function(ret) {
          if (!ret) return;
          if (ret.data.success != 0) {
            that.currentAttrs = []
            that.setData({
              cartAmount: ret.data.result.cart_num,
              productid: 0
            })
            common.toast(ret.data.msg)
            if (type == 'bottomcart') {
              that.setData({
                showModalStatus: false,
                showSKUstatus: 0
              })
            }

          } else {
            common.toast(ret.data.msg);
            return;
          }
        })
      } else {
        // type != 'addcart' ||
        if (that.data.showSKUstatus == 0) {
          that.setModalStatus(type);
          that.setData({
            showfwModalStatus: false,
            showShareModalStatus: false,
            showBonusModal: false
          })
        } else {
          common.toast('请选择商品款式');
        }
      }
    }
  },
  // 立即购买
  nowPurchase: function(e) {
    var that = this;
    // 跳转登录
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    if (that.data.productid == e.target.dataset.productid) {
      nowPurchaseSub(e)
    } else {
      that.loadProductDetail(e).then(function() {
        nowPurchaseSub(e)
      })
    }

    function nowPurchaseSub(e) {
      if (!that.checkCanPurchase()) return;
      var product = that.data.itemData;
      that.setData({
        buy_now: 1
      })
      if (that.currentAttrs.length == product.properties.length) {
        // 验证库存
        var product_id = '';
        for (var i in product.stock) {
          var stock = product.stock[i].key;
          stock = stock.split('_');
          stock.sort(function(a, b) {
            return a - b;
          })
          stock = stock.join('_');
          var attrs = that.currentAttrs.join('_');
          if (attrs == stock) {
            product_id = product.stock[i].key;
            break;
          }
        }
        var invurl = app.getPath.skuEnough;
        if (product.pre_info && product.pre_info.is_pre == 1) {
          invurl = app.getPath.skuEnough;
        }
        var invdata = {
          goods_id: product.goods_id,
          sku_key: product_id,
          amount: that.data.buynum
        };
        app.aldstat.sendEvent("立即购买", {
          "商品名称": that.data.itemData.report.goods_name,
          "用户名": that.data.itemData.report.nick_name
        })
        common.formIdUpdate(e);
        common.ApiGateWayTest(invurl, invdata, true, function(ret) {
          if (!ret) return;
          if (ret.data.result.is_enough != 1) {
            common.toast(ret.data.result.msg);
            return;
          } else {
            that.currentAttrs = []
            // showSKUstatus 0关闭  1展开  重置为关闭
            that.setData({
              showModalStatus: false,
              showSKUstatus: 0,
              cartAmount: ret.data.result.cart_num,
              productid: 0
            });
            wx.navigateTo({
              url: '/pages/confirm/confirm',
            })
          }
        })
      } else {
        if (that.data.showSKUstatus == 0) {
          that.setModalStatus();
          that.setData({
            showfwModalStatus: false,
            showShareModalStatus: false,
            showBonusModal: false
          })
        } else {
          common.toast('请选择商品款式');
        }
      }
      // 立即购买的缓存
      common.setStorage({
        key: "nowPay",
        data: that.confirmData
      })
    }
  },
  // 商品详情数据获取
  loadProductDetail: function(e) {
    var productid = e.target.dataset.productid;
    this.setData({
      productid: e.target.dataset.productid
    })
    var that = this;
    common.showLoad(that);
    var uri = app.getPath.goodsInfo;
    var skuAmounturi = app.getPath.getSkuAmount;
    var data = {
      goods_id: productid,
    }
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function(res) {
        if (res.statusCode == 200) {
          var productlist = res.data.result;
          // productlist.min_buy_amount = productlist.min_buy_amount ? productlist.min_buy_amount : 1;
          var content = productlist.goods_content;
          var introContent = productlist.detail_explain;
          var islike = productlist.is_liked;
          productlist.current_price = productlist.shop_price;
          productlist.price = productlist.market_price;
          // WxParse.wxParse('content', 'html', content, that, 0);
          // WxParse.wxParse('introContent', 'html', introContent, that, 0);
          that.setData({
            itemData: productlist,
            bannerItem: productlist.gallery,
            indicatorDots: productlist.gallery.length > 1 ? true : false,
            buynum: productlist.min_buy_amount,
            // isLike: islike,
            brandID: productlist.cat_id,
            skuSvipCurrent: productlist.shop_price,
            skuCurrent: productlist.market_price,
          });
          that.setDefaultSKU(productlist);
          // that.loadipRecommend();
          // that.getGoodsRecommend();
          that.isPriceEqual();


          common.hideLoad(that);
        } else if (res.statusCode == 500) {
          common.hideLoad(that);
          return;
          common.toast("网络错误");
        } else {
          common.hideLoad(that);
          common.toast("获取购物车数量失败");
        }
        resolve('获取商详信息')
      })
      common.ApiGateWayTest(skuAmounturi, '', true, function(res) {
        if (res.statusCode == 200) {
          that.setData({
            cartAmount: res.data.result.cart_num
          })
        }
      })
    })

  },

  //设置默认SKU
  setDefaultSKU: function(product) {

    // product 请求到的数据
    var defaultAttrIds = [];
    var defaultAttrStock = null;
    var maybeStock = [];
    var effectiveStock = [];
    // 得到SKU组合的原始数组
    for (var i = 0; i < product.properties.length; ++i) {
      var property = product.properties[i];
      if (!property.is_multiselect) {
        maybeStock[i] = [];
        for (var j = 0; j < property.attrs.length; j++) {
          maybeStock[i].push(property.attrs[j].id);
        }
      }
    }
    // 得到多个笛卡尔积组合
    maybeStock = common.multiCartesian(maybeStock);
    if (maybeStock.length && maybeStock[0] instanceof Array) {
      for (var i = 0; i < maybeStock.length; i++) {
        maybeStock[i].sort(function(a, b) {
          return a - b;
        })
      }
    }
    //验证是否可以购买
    this.setData({
      canPurchase: this.checkCanPurchase()
    })
    var min_sku_price = 9999999999;
    var min_sku_svip_price = 9999999999;
    for (var i = 0; i < product.stock.length; ++i) {
      var _goods_attr = product.stock[i].key.split('_');
      var _min_sku_price = product.stock[i].market_price,
        _min_sku_svip_price = product.stock[i].price;
      var hasDefaultFlag = false;

      if (min_sku_svip_price > _min_sku_svip_price) {
        var ids = [];
        if (product.is_goods_number > 0 && product.is_on_sale && product.stock[i].is_enough) { //商品能购买，并且该sku有库存 则更新最低价
          for (var ind = 0, len = _goods_attr.length; ind < len; ind++) {
            ids.push(parseInt(_goods_attr[ind]));
          }
          defaultAttrIds = ids;
          defaultAttrStock = [{
            attrs: defaultAttrIds,
            stock: product.stock[i]
          }];
          hasDefaultFlag = true;
          min_sku_svip_price = _min_sku_svip_price;
          min_sku_price = _min_sku_price;
        } else if (!product.is_goods_number > 0 || !product.is_on_sale) { //商品不能购买，则一定更新最低价，否则就是9999999999
          for (var ind = 0, len = _goods_attr.length; ind < len; ind++) {
            ids.push(parseInt(_goods_attr[ind]));
          }
          defaultAttrIds = ids;
          defaultAttrStock = [{
            attrs: defaultAttrIds,
            stock: product.stock[i]
          }];
          hasDefaultFlag = true;
          min_sku_svip_price = _min_sku_svip_price;
          min_sku_price = _min_sku_price;
        }
      }
      _goods_attr.sort(function(a, b) {
        return a - b;
      });
      _goods_attr = _goods_attr.join('_');
      for (var j = 0; j < maybeStock.length; j++) {
        var _thisStock = '';
        if (maybeStock[j] instanceof Array) {
          _thisStock = maybeStock[j].join('_');
        } else if (maybeStock[j] instanceof Object) {
          _thisStock = '';
        } else {
          _thisStock = maybeStock[j];
        }
        if (_goods_attr == _thisStock) {
          if (product.stock[i].is_enough == true) {
            effectiveStock.push({
              attrs: maybeStock[j],
              stock: product.stock[i]
            })
          }
        }
      }
    }
    var skuSvipCurrent = this.data.itemData.current_price;
    var skuCurrent = this.data.itemData.price;
    this.setData({
      sku_price: min_sku_price,
      min_sku_price: min_sku_price,
      sku_svip_price: min_sku_svip_price,
      min_sku_svip_price: min_sku_svip_price,
      skuSvipCurrent: parseFloat(skuSvipCurrent).toFixed(2),
      skuCurrent: skuCurrent,
      currentStock: defaultAttrStock,
    });
    //先通过设置默认sku，来设置默认显示价格，设置完之后，把默认sku去掉，不影响原来逻辑
    this.currentAttrs = defaultAttrIds;
    this.setData({
      hasDefaultSKU: this.data.currentStock ? true : false
    })
    this.set_choosed_sku();
    defaultAttrIds = [];
    defaultAttrStock = null;
    this.setData({
      currentStock: null,
      hasDefaultSKU: false
    });
    this.currentAttrs = [];
    if (effectiveStock.length == 1) {
      defaultAttrIds = (effectiveStock[0].attrs instanceof Array) ? effectiveStock[0].attrs : [effectiveStock[0].attrs];
      defaultAttrStock = effectiveStock[0].stock;
    }
    if (effectiveStock.length > 1) {
      for (var i in product.properties) {
        var attrs = product.properties[i].attrs;
        for (var j in attrs) {
          var isin_count = 0;
          for (var k in effectiveStock) {
            var isin = new RegExp(attrs[j].id).test(effectiveStock[k].attrs);
            if (isin) {
              isin_count++;
            }
          }
          if (isin_count == effectiveStock.length) {
            defaultAttrIds.push(attrs[j].id);
          }
        }
      }
    }
    this.setData({
      currentStock: defaultAttrStock,
    });
    this.currentAttrs = defaultAttrIds;
    this.setData({
      hasDefaultSKU: this.data.currentStock ? true : false
    })
    this.set_choosed_sku();
  },
  //设置choosed_sku
  set_choosed_sku: function() {
    var that = this;
    var product = that.data.itemData;
    if (that.currentAttrs.length < product.properties.length) {
      that.data.sku_price = that.data.min_sku_price;
      that.data.sku_svip_price = that.data.min_sku_svip_price;
      that.setData({
        choosed_sku: '选择：商品规格',
        skuImages: product.header_img,
        skuSvipCurrent: that.data.itemData.current_price,
        skuCurrent: that.data.itemData.price
      });
      that.setAttrsClass();
      return;
    }
    var choosed_sku = '';
    var sku_price = 0;
    var sku_svip_price = 0;
    var skuSvipCurrent = that.data.itemData.current_price;
    var skuCurrent = that.data.itemData.price;
    that.setData({
      choosed_sku: choosed_sku,
      sku_price: sku_price,
      sku_svip_price: sku_svip_price,
      skuSvipCurrent: skuSvipCurrent,
      skuCurrent: skuCurrent
    });
    for (var i in product.properties) {
      var attrs = product.properties[i].attrs;
      for (var j in attrs) {
        for (var k in that.currentAttrs) {
          if (that.currentAttrs[k] == attrs[j].id) {
            choosed_sku += attrs[j].item + ' ';
            //					sku_price += attrs[j].attr_price;
            //					sku_svip_price += attrs[j].attr_svip_price;
          }
        }
      }
    }
    if (choosed_sku != '') {
      for (var i in product.stock) {
        var stock = product.stock[i].key;
        stock = stock.split('_');
        stock.sort(function(a, b) {
          return a - b;
        })
        stock = stock.join('_');
        var attrs = that.currentAttrs.join('_');
        if (attrs == stock) {
          that.data.skuImages = product.stock[i].header_img;
          sku_price = product.stock[i].market_price;
          sku_svip_price = product.stock[i].shop_price;
        }
      }
      that.confirmData = [{
        goods_name: product.goods_name,
        goods_id: product.goods_id,
        sku_key: attrs,
        amount: that.data.buynum,
        shop_price: sku_svip_price,
        market_price: sku_price,
        sku_key_name: "规格:" + choosed_sku,
        sku_img: that.data.skuImages
      }]
      choosed_sku = '已选：' + choosed_sku;
      var skuSvipCurrent = sku_svip_price;
      var skuCurrent = sku_price;
      that.setData({
        choosed_sku: choosed_sku,
        sku_price: sku_price,
        sku_svip_price: sku_svip_price,
        skuSvipCurrent: skuSvipCurrent,
        skuCurrent: skuCurrent,
        skuImages: that.data.skuImages
      });
    }
    that.setAttrsClass();
  },
  //SKU选择
  attrValueselest: function(e) {
    var that = this;
    var product = this.data.itemData;
    if (!product) return;
    var property = e.currentTarget.dataset.property;
    var attr = e.currentTarget.dataset.attr;
    if (attr.is_multiselect) {
      var attrs = [].concat(this.optionalAttrs);
      var index = attrs.indexOf(attr.id);
      if (-1 == index) {
        attrs.push(attr.id);
      } else {
        attrs.splice(index, 1);
      }
      this.setData({
        optionalAttrs: attrs
      });
    } else {
      var inStock = false;
      for (var i in product.stock) {
        if (product.stock[i].is_enough != true) {
          continue;
        }
        if (product.stock[i].key.indexOf(String(attr.id)) >= 0) {
          inStock = true;
          break;
        }
      }
      if (!inStock) {
        common.toast('库存不足');
        return;
      }
      var stock = null;
      var attrs = [].concat(this.currentAttrs);
      var index = attrs.indexOf(attr.id);
      if (-1 == index) {
        attrs.push(attr.id);
      } else {
        attrs.splice(index, 1);
      }
      for (var i in property.attrs) {
        if (property.attrs[i].id != attr.id) {
          var index = attrs.indexOf(property.attrs[i].id);
          if (-1 != index) {
            attrs.splice(index, 1);
          }
        }
      }
      attrs = attrs.filter(function(attr, index, self) {
        return self.indexOf(attr) === index;
      });
      attrs.sort(function(a, b) {
        return a - b;
      })
      if (attrs.length) {
        var key = attrs.join('_');
        for (var i = 0; i < product.stock.length; ++i) {
          var _goods_attr = product.stock[i].key.split('_');
          _goods_attr.sort(function(a, b) {
            return a - b;
          });
          _goods_attr = _goods_attr.join('_');
          if (_goods_attr == key) {
            stock = product.stock[i];
            break;
          }
        }
      }
      if (stock && stock.is_enough) {
        this.data.currentStock = stock,
          this.currentAttrs = attrs,
          this.setData({
            buynum: product.min_buy_amount
          })
      } else {
        if (attrs.length < product.properties.length) {
          this.data.currentStock = null,
            this.currentAttrs = attrs,
            this.setData({
              buynum: product.min_buy_amount
            })
        } else {
          common.toast('库存不足');
        }
      }
      this.setData({
        canPurchase: this.checkCanPurchase()
      });
    }
    this.set_choosed_sku();
  },
  //设置每一个attr的class
  setAttrsClass: function() {
    var product = this.data.itemData;
    var property = product.properties
    for (var i in property) {
      var attrs = property[i].attrs;
      for (var j in attrs) {
        var attr = attrs[j];
        if (!product) {
          attr.class = 'disable';
          continue;
        }
        if (product.is_goods_number == 0) {
          attr.class = 'disable';
          continue;
        }
        var attrArr = [];
        if (attr.is_multiselect) {
          attr.class = this.optionalAttrs.indexOf(attr.id) == -1 ? '' : 'active';
        } else {
          attr.class = this.currentAttrs.indexOf(attr.id) == -1 ? '' : 'active';
          var inStock = false;
          for (var i in product.stock) {
            if (product.stock[i].is_enough != true) {
              var currentAyyrsJn = this.currentAttrs.join("_");
              if (product.stock[i].key.indexOf(String(currentAyyrsJn)) >= 0 && this.currentAttrs.length > 0) {
                var stockDisplyKey = product.stock[i].key.split("_");
                for (var j in stockDisplyKey) {
                  if (stockDisplyKey[j] != this.currentAttrs) {
                    for (var k in product.properties) {
                      for (var s in product.properties[k].attrs) {
                        if (product.properties[k].attrs[s].id == stockDisplyKey[j]) {
                          product.properties[k].attrs[s].class = 'disable';
                        }
                      }
                    }
                  }
                }
              } else {
                continue;
              }
            }
            if (product.stock[i].key.indexOf(String(attr.id)) >= 0) {
              inStock = true;
              break;
            }
          }
          if (!inStock) {
            attr.class += 'disable';
          }
        }
      }
    }
    this.setData({
      itemData: product
    })
  },
  //验证是否可以购买
  checkCanPurchase: function() {
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
    if (this.currentAttrs.length >= product.properties.length) {
      for (var i in product.properties) {
        if (!product.properties[i].is_multiselect) {
          required = true;
          break;
        }
      }
      if (required) {
        if (!this.currentAttrs || !this.currentAttrs.length) {
          return false
        }
        if (!this.data.currentStock) {
          return false
        }
      }
    }
    this.setData({
      sumbitName: '立即购买',
    });
    return true
  },

  // SKU价格和非VIP价格是否相同
  isPriceEqual: function() {
    var that = this;
    if (that.data.itemData.price && that.data.itemData.current_price) {
      var price = that.data.itemData.price + that.data.sku_price,
        svip_price = that.data.itemData.current_price + that.data.sku_svip_price;
      if (price == svip_price) {
        that.setData({
          isPriceEqual: true,
        });
      } else {
        that.setData({
          isPriceEqual: false,
        });
      }
    } else {
      that.setData({
        isPriceEqual: false,
      });
    }
  },
  // 加减
  changeNum: function(e) {
    var that = this;
    var product = that.data.itemData;
    var invurl = app.getPath.skuEnough;
    if (product.pre_info && product.pre_info.is_pre == 1) {
      invurl = app.getPath.skuEnough;
    }
    var product_id = '';
    for (var i in product.stock) {
      var stock = product.stock[i].key;
      stock = stock.split('_');
      stock.sort(function(a, b) {
        return a - b;
      })
      stock = stock.join('_');
      var attrs = that.currentAttrs.join('_');
      if (attrs == stock) {
        product_id = product.stock[i].key;
        break;
      }
    }
    if (that.currentAttrs.length == product.properties.length) {
      // alpha-beta 0  减
      if (e.currentTarget.dataset.alphaBeta == 0) {
        if (!that.checkCanPurchase()) return;
        // Lin start
        if (that.data.buynum <= that.data.itemData.min_buy_amount) {
          common.toast('不能小于最小购买数量')
          return;
        }
        // Lin end
        if (that.data.buynum <= 1) {
          // buynum: 1
        } else if (that.data.buynum === 2) {
          that.setData({
            buynum: that.data.buynum - 1,
            undel: true
          })
        } else {
          that.setData({
            buynum: that.data.buynum - 1,
          })
        }
        // 验证库存
        if (that.data.buynum != 1) {
          var invdata = {
            goods_id: product.goods_id,
            sku_key: product_id,
            amount: that.data.buynum
          };
          common.ApiGateWayTest(invurl, invdata, true, function(ret) {
            if (!ret) return;
            if (ret.data.result.is_enough != 1) {
              common.toast(ret.data.result.msg);
              return;
            }
          })
        }
      } else {
        // alpha-beta 1  加      max_buy_amount==0不限制数量
        // Lin start
        if (that.data.itemData.max_buy_amount != 0 && that.data.buynum >= that.data.itemData.max_buy_amount) {
          common.toast('不能在多啦~')
          return;
        }
        // Lin end
        that.setData({
          buynum: that.data.buynum + 1,
          undel: false
        })
        if (that.data.buynum > 1) {
          var invdata = {
            goods_id: product.goods_id,
            sku_key: product_id,
            amount: that.data.buynum
          };
          common.ApiGateWayTest(invurl, invdata, true, function(ret) {
            if (!ret) return;
            if (ret.data.result.is_enough != 1) {
              common.toast(ret.data.result.msg);
              that.setData({
                buynum: that.data.buynum - 1,
              })
              that.set_choosed_sku();
              return;
            }
          })
        }
      }
      that.confirmData.num = that.data.buynum;
    } else {
      if (that.data.showSKUstatus == 0) {
        that.setModalStatus();
      } else {
        common.toast('请选择商品款式');
      }
    }
    that.set_choosed_sku();
  },
  gzhBindload(e) {
    if (e.detail.status != 0) {
      this.setData({
        showOfficial: false
      })
    }
  },
  getConfigureIndexModel2: function() {
    var that = this;
    var uri = app.getPath.indexmodel;
    var data = {
      position: 3
    };
    common.ApiGateWayTest(uri, data, true, function(res) {
      if (res && res.data && res.data.success == 1) {
        that.setData({
          indexModel2: res.data.result.lists,
        })
      }
    })
  },
  getConfigureIndexModel: function() {
    var that = this;
    var uri = app.getPath.indexmodel;
    var data = {
      position: 1
    };
    common.ApiGateWayTest(uri, data, true, function(res) {
      if (res && res.data && res.data.success == 1) {
        that.setData({
          indexModel: res.data.result.lists,
        })
      }
    })
  },
  //获取首页团购
  getPickUpAcitivity(city) {
    var that = this;
    Promise.all([that.getpickuplistr(), that.getAdvertisement()]).then(function(res) {
      if (!res[0]) {
        common.setStorageSync('reLoad', true);
        that.onShow();
        return
      } else {
        that.getNewAd();
        that.getSubjectAd();
        that.data.bargain_page = 1;
        that.bargain_page_size = 20;
        that.data.team_page = 1;
        that.data.team_page_size = 20;
        that.data.be_team_page = 1;
        that.data.be_team_page_size = 20;
        that.data.teamList = [];
        that.data.beTeamList = [];
        that.data.bargainList = [];
        that.data.teamGoodsList = [];
        that.getAllActivity();
        wx.stopPullDownRefresh();
      }
    })

    // common.ApiGateWayTest(url,"",true,function (res) {
    //       var res=res.data
    //     if(res.success==1){
    //       let pickUpArr = res.result.data;
    //       that.setData({
    //         pickUpActivity: pickUpArr
    //       })
    //       if (that.data.teamNum == 0) {
    //         that.setData({
    //           teamGoodsList: pickUpArr.team_in_progress.goods_list
    //         })
    //       } else if (that.data.teamNum == 1) {
    //         that.setData({
    //           teamGoodsList: pickUpArr.bargain_in_progress.goods_list
    //         })
    //       } else if (that.data.teamNum == 2) {
    //         that.setData({
    //           teamGoodsList: pickUpArr.be_team.goods_list
    //         })
    //       }
    //   } else {
    //     common.toast(res.msg);
    //     return
    //   }
    //   wx.stopPullDownRefresh()
    // })
  },
  getAllActivity() {
    let that = this;
    if (that.data.teamNum == 0) {
      that.getTeamList();
    } else if (that.data.teamNum == 1) {
      that.getBargainActivity();
    } else if (that.data.teamNum == 2) {
      that.getBeTeamList();
    }
  },
  // 选择提货点(重叠提货点)
  choosePickupChange(e) {
    this.setData({
      chooseSelectIndex: e.currentTarget.dataset.index
    })
  },
  // 设置提货点(重叠提货点)
  choosePickupSubmit() {
    this.setData({
      choosePickupShow: false
    })
    common.setStorageSync('getpickup', this.data.choosePickupList[this.data.chooseSelectIndex ? this.data.chooseSelectIndex : 0]);
    common.setStorageSync('reLoad', true);
    this.onShow();
  },
  // 前往领取纸巾
  goTissue(e) {
    common.formIdUpdate(e);
    var url = 'https://share.lltjs.com/app/index.php?i=2&c=entry&from=account&account=a450f613484aea3458ac7a7eba952d720d671557&xid=&do=entry&m=llt_afan'
    app.dataBase.pageUrl = url;
    common.goWebview();
    this.setData({
      showTissue: false
    })
  },
  // 跳转店铺
  goTakeoutShop() {
    var that = this;
    wx.navigateTo({
      url: '/packageA/takeout-shop/takeout-shop?entryType=external&shop_id=' + that.data.shop_id,
    })
  },
  // 获取店铺id
  getShopPickUp() {
    var that = this;
    var url = app.getPath.getShopPickUp;
    common.ApiGateWayTest(url, '', true, function(res) {
      var res = res.data;
      if (res.success == 1) {
        that.setData({
          shop_id: res.result.shop_id
        })
      }
    })
  },
  // 首页弹窗领红包
  getPacket() {
    this.setData({
      showPacketAd: false,
      showPacketCoupon: true
    })
  },
  // 关闭弹窗红包广告
  hide_packet_ad() {
    this.setData({
      showPacketAd: false
    })
  },
  hide_packet_coupon() {
    this.setData({
      showPacketCoupon: false
    })
  },
  // 获取首页专题广告
  getSubjectAd() {
    var that = this;
    var uri = app.getPath.adlist;
    var data = {
      pid: 9
    }
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function(res) {
        if (res && res.data && res.data.success == 1) {
          var data = res.data.result;
          that.setData({
            subjectAdList: data,
          })
          resolve('successAd');
        }
      })
    })
  },
  // 获取首页弹窗广告
  getPacketModal() {
    var that = this;
    var uri = app.getPath.adlist;
    var data = {
      pid: 10
    }
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function(res) {
        if (res && res.data && res.data.success == 1) {
          var data = res.data.result;
          that.setData({
            packetModal: data,
          })
          resolve('successAd');
        }
      })
    })
  },
  // 切换活动tab
  change_team_tab(e) {
    let that = this;
    let num = e.currentTarget.dataset.num;
    if (num == that.data.teamNum) return;
    common.showLoad(that);
    this.setData({
      teamNum: num
    })
    this.data.bargain_page = 1;
    this.bargain_page_size = 20;
    this.data.team_page = 1;
    this.data.team_page_size = 20;
    this.data.be_team_page = 1;
    this.data.be_team_page_size = 20;
    this.data.teamList = [];
    this.data.beTeamList = [];
    this.data.bargainList = [];
    this.data.teamGoodsList = [];
    this.setData({
      checkShowBottom: false,
      showBottomLoading: false
    })
    if (that.data.sliderBarFixed) {
      if (common.compareVersion('2.3.1') >= 0) {
        wx.pageScrollTo({
          selector: '#slider-bar-team'
        })
      } else {
        wx.pageScrollTo({
          scrollTop: 0
        })
      }
    }
    that.getAllActivity()
  },
  // 获取首页砍价信息
  getBargainActivity() {
    let that = this;
    let url = app.getPath.getBargainActivity;
    let data = {
      page: that.data.bargain_page,
      page_size: that.data.bargain_page_size,
    };
    common.ApiGateWayTest(url, data, true, function(res) {
      var resData = res.data;
      if (resData.success === 1) {
        if (resData.result.data.length < that.data.bargain_page_size) {
          that.setData({
            checkShowBottom: true
          })
        }
        let bargainList = that.data.bargainList;
        that.data.bargainList = bargainList.length > 0 ? [...bargainList, ...resData.result.data] : resData.result.data;
        that.data.bargainList = that.data.bargainList.map(item => {
          item.shop_price = parseFloat(item.shop_price);
          item.market_price = parseFloat(item.market_price);
          return item;
        })
        that.setData({
          showBottomLoading: false,
          teamGoodsList: that.data.bargainList
        })
        common.hideLoad(that);
      }
    })
  },
  //获取首页拼团信息
  getTeamList() {
    let that = this;
    let url = app.getPath.getTeamActivity;
    let data = {
      page: that.data.team_page,
      page_size: that.data.team_page_size,
      type: 1
    };
    common.ApiGateWayTest(url, data, true, function(res) {
      var resData = res.data;
      if (resData.success === 1) {
        if (resData.result.data.length < that.data.team_page_size) {
          that.setData({
            checkShowBottom: true
          })
        }
        let teamList = that.data.teamList;
        that.data.teamList = teamList.length > 0 ? [...teamList, ...resData.result.data] : resData.result.data;
        that.data.teamList = that.data.teamList.map(item => {
          item.shop_price = parseFloat(item.shop_price);
          item.market_price = parseFloat(item.market_price);
          return item;
        })
        that.setData({
          showBottomLoading: false,
          teamGoodsList: that.data.teamList
        })
        common.hideLoad(that);
      }
    })
  },
  //获取首页即将拼团信息
  getBeTeamList() {
    let that = this;
    let url = app.getPath.getTeamActivity;
    let data = {
      page: that.data.be_team_page,
      page_size: that.data.be_team_page_size,
      type: 2
    };
    common.ApiGateWayTest(url, data, true, function(res) {
      var resData = res.data;
      if (resData.success === 1) {
        if (resData.result.data.length < that.data.team_page_size) {
          that.setData({
            checkShowBottom: true
          })
        }
        let beTeamList = that.data.beTeamList;
        that.data.beTeamList = beTeamList.length > 0 ? [...beTeamList, ...resData.result.data] : resData.result.data;
        that.data.beTeamList = that.data.beTeamList.map(item => {
          item.shop_price = parseFloat(item.shop_price);
          item.market_price = parseFloat(item.market_price);
          return item;
        })
        that.setData({
          showBottomLoading: false,
          teamGoodsList: that.data.beTeamList
        })
        common.hideLoad(that);
      }
    })
  },
  // 新厂首页轮播改变触发
  newSwiperChange(e) {
    this.setData({
      indexAdcurrent: e.detail.current
    })
  },
  // 红包-获取左侧提示信息
  getHomeSituation() {
    var that = this;
    return new Promise((resolve, reject) => {
      var url = app.getPath.sureHomeSituation;
      common.ApiGateWayTest(url, '', true, function(res) {
        var resData = res.data;
        if (resData.success == 1) {
          that.setData({
            homeSituation: resData.result,
            tiket_id: resData.result.coupon_id,
          })
          var isOnWithdrawDate = common.getStorageSync('isOnWithdrawDate');
          if (isOnWithdrawDate && isOnWithdrawDate == new Date().getDate()) {
            that.setData({
              showRedEnvel: false
            }, () => {
              resolve()
            })
          } else {
            if ((resData.result.status == 1 || resData.result.status == 2) && !that.data.isShowWelfare && !that.data.showAdver) {
              if (that.data.tiket_id > 0) {
                that.setData({
                  showRedEnvel: true,
                  isShowWelfare: false,
                  showAdver: false,
                  showRedEnvelType: 3
                }, () => {
                  resolve()
                })
              } else {
                that.setData({
                  showRedEnvel: true,
                  isShowWelfare: false,
                  showAdver: false,
                  showRedEnvelType: 1
                }, () => {
                  resolve()
                })
              }
              
            } else {
              that.setData({
                showRedEnvel: false
              }, () => {
                resolve()
              })
            }
          }
          var entry_share_info = {
            user_id: resData.result.user_id,
            invite_share_img: resData.result.invite_share_img,
            invite_share_text: resData.result.invite_share_text,
            urge_share_img: resData.result.urge_share_img,
            urge_share_text: resData.result.urge_share_text,
            rule_img: resData.result.rule_img,
          }
          common.setStorageSync('entry_share_info', entry_share_info)
        } else {
          resolve()
        }
      })
    })
  },
  // 红包-左侧点击跳转（领红包）
  getEnvelopes(e) {
    var item = e.currentTarget.dataset.item;
    var that = this;
    var pickupId = common.getStorageSync('getpickup');
    app.aldstat.sendEvent("index_urging_report", {
      "提货点": pickupId.cityName
    });
    if (item.status == 2 || item.status == 3) {
      wx.navigateTo({
        url: '/packageB/invitation-share/invitation-share?type=2',
      })
    } else if (item.status == 4) {
      wx.navigateTo({
        url: '/packageB/invitation-share/invitation-share?type=1',
      })
    } else if (item.status == 1) {
      that.setData({
        showRedEnvel: true,
        showRedEnvelType: item.status
      })
    }
  },
  // 关闭手机号授权弹窗
  closePhoneModal() {
    this.setData({
      showPhoneModal: false
    })
  },
  // 显示获取手机号授权弹窗
  toShowPhoneModal() {
    this.setData({
      showPhoneModal: true
    })
  },
  // 获取手机号授权
  getPhone: function(e) {
    var that = this;
    if (!(e.detail.encryptedData && e.detail.iv)) {
      return false
    }
    // 新用户注册
    // 获取手机号
    var mobileUri = app.getPath.getWXMobile;

    // 重新获取code获取手机号
    wx.login({
      success: function(res) {
        var Mobiledata = {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          code: res.code
        };
        common.ApiGateWayTest(mobileUri, Mobiledata, true, function(resData) {
          if (resData.data.success == 1) {
            common.toast('绑定成功');
            that.setData({
              getRemind: true,
              showPhoneModal: false
            })
          } else {
            return
          }
        })
      }
    })
  },
  // 重新获取提货点信息
  getpickuplistr: function() {
    var that = this;
    var uri = app.getPath.pickupInfo;
    var pickupId = common.getStorageSync('getpickup');
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, '', true, function(res) {
        var resData = res.data;
        if (resData.success == 1) {
          if (resData.result.pickup_type != pickupId.pickup_type) {
            common.setStorageSync('getpickup', resData.result);
            resolve(false);
          } else {
            resolve(true);
          }
        } else {
          reject();
        }
      })
    })
  },
  // 轮播指示器切换
  onSwiperIndicator(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    that.setData({
      showSwiperScreen: true,
      newIndexEasingFunction: 'easeOutCubic'
    }, () => {
      that.setData({
        newIndexAdcurrent: index,
        newIndexIndicator: index,
        scrollLeftNum: index > 1 ? (index - 1) * 186 - 93 : 0,
      }, () => {
        setTimeout(() => {
          that.setData({
            showSwiperScreen: false,
            newIndexEasingFunction: 'default'
          })
        }, 500)
        that.changeIndexGotop();
      })
    })
    setTimeout(() => {
      that.setData({
        showSwiperScreen: false
      })
    }, 1000)
  },
  // 改版首页数据
  getActivityAdIndex() {
    var that = this;
    var url = app.getPath.activityAdIndex;
    common.showLoad(that);
    that.getpickuplistr().then(res => {
      wx.stopPullDownRefresh();
      if (!res) {
        common.setStorageSync('reLoad', true);
        common.hideLoad(that);
        that.onShow();
        return
      } else {
        common.ApiGateWayTest(url, '', true, function(res) {
          var resData = res.data;
          if (resData.success == 1 && resData.result.data.constructor != Array) {
            var returns = false;
            if (wx.getSystemInfoSync().screenHeight > (667 + 60 + wx.getSystemInfoSync().screenWidth - 375)) {
              that.setData({
                showIndexLogo: true
              })
            }
            resData.result.data.list = resData.result.data.list.map(item => {
              item.value.map(items => {
                items.shop_price = Number(items.shop_price);
                items.market_price = Number(items.market_price);
                return items
              })
              return item
            })
            that.setData({
              activityAdIndexInfo: resData.result.data,
              newIndexAdcurrent: resData.result.data.selected_index,
              newIndexIndicator: resData.result.data.selected_index,
              scrollLeftNum: resData.result.data.selected_index > 1 ? (resData.result.data.selected_index - 1) * 186 - 93 : 0
            }, () => {
              that.getAd();
              that.getStorNumber();
              common.hideLoad(that);
              that.getAdvertisement().then(() => {
                that.getCouponEntry().then(() => {
                  that.getHomeSituation();
                })
              })
            })
          } else {
            wx.stopPullDownRefresh();
            common.hideLoad(that);
          }
        })
      }
    })
  },
  // 改版首页商品跳转
  goChangeGoods(e) {
    var that = this;
    var item = e.currentTarget.dataset.item;
    if (item.media_type == 1) {
      wx.navigateTo({
        url: '/pages/product/product?entryType=external&productId=' + item.ad_link,
      })
    } else if (item.media_type == 2) {
      wx.navigateTo({
        url: '/packageA/bargain/bargain?entryType=external&activity_bargain_id=' + item.ad_link
      })
    } else if (item.media_type == 3) {
      wx.navigateTo({
        url: '/packageA/team-product/team-product?entryType=external&teamId=' + item.ad_link,
      })
    } else {
      wx.navigateTo({
        url: item.ad_link,
      })
    }
  },
  // 获取新版首页轮播库存
  getStorNumber() {
    var that = this;
    var url = app.getPath.indexGetStock;
    common.ApiGateWayTest(url, '', true, function(res) {
      var resData = res.data;
      if (resData.success == 1) {
        that.setData({
          stortInfo: resData.result.data
        })
      }
    })
  },
  //新厂首页优惠券领取弹窗
  getCouponEntry() {
    var that = this
    return new Promise((resolve, reject) => {
      var uri = app.getPath.couponEntry
      common.ApiGateWayTest(uri, '', true, function(res) {
        var resData = res.data;
        if (resData.success == 1) {
          if ((that.is_welfare == 1 && resData.result.is_show == 1 && !that.data.showAdver) || (resData.result.status != 2 && !that.data.showAdver)) {
            that.setData({
              isShowWelfare: true,
              showRedEnvel: false,
              showAdver: false
            }, () => {
              resolve()
            })
            that.is_welfare = 0;
          } else if (that.is_welfare == 1 && resData.result.is_show == 0) {
            that.setData({
              isShowWelfare: false
            }, () => {
              resolve()
            })
            common.toast(resData.result.status_desc);
          } else {
            that.setData({
              isShowWelfare: false
            }, () => {
              resolve()
            })
          }
          that.setData({
            couponEntry: resData.result
          })
        } else {
          common.toast(resData.msg);
          resolve();
          return
        }
      })
    })
  },
  //显示福利弹窗
  showWelfare() {
    this.setData({
      isShowWelfare: true
    })
  },
  //关闭福利弹窗
  closeWelfare() {
    this.setData({
      isShowWelfare: false
    })
  },
  // 领取福利红包
  getWelfareCoupon() {
    var that = this;
    common.showLoad(that);
    var uri = app.getPath.addCoupon;
    var coupon_ids = that.data.couponEntry.coupon_info.map(item => {
      return item.id
    })
    var data = {
      coupon_id: coupon_ids
    }
    common.ApiGateWayTest(uri, data, true, function(res) {
      var resData = res.data;
      if (resData.success == 1) {
        common.toast(resData.result.state_desc);
        that.getCouponEntry();
        common.hideLoad(that);
      } else {
        common.toast(resData.msg);
        return;
      }
    })
  },
  // 首页轮播联动
  indicatorIndexSwiper(e) {
    var that = this;
    if (e.detail.source == "touch") {
      that.setData({
        newIndexAdcurrent: e.detail.current,
        newIndexIndicator: e.detail.current,
        scrollLeftNum: e.detail.current > 1 ? (e.detail.current - 1) * 186 - 93 : 0
      }, function(res) {
        that.changeIndexGotop();
      })
    }
  },
  // 首页下拉提示控制
  changeIndexMove(e) {
    var that = this;
    if (wx.createSelectorQuery) {
      if (that.data.showDownGuide) {
        var query = wx.createSelectorQuery()
        query.select('#indicatorPage').boundingClientRect(function(res) {
          if (res.top < -50) {
            var animation = wx.createAnimation({
              duration: 500,
              timingFunction: "linear",
              delay: 0
            })
            animation.bottom(-100).opacity(0).step();

            that.setData({
              downGuideanimation: animation.export()
            }, function(res) {
              common.setStorageSync('isShowDownGuide', 1);
              that.data.showDownGuide = false;
              return;
            })
          }
        }).exec()
      } else {
        return;
      }
    } else {
      var animation = wx.createAnimation({
        duration: 500,
        timingFunction: "linear",
        delay: 0
      })
      animation.bottom(-100).opacity(0).step();

      that.setData({
        downGuideanimation: animation.export()
      }, function(res) {
        common.setStorageSync('isShowDownGuide', 1);
        that.data.showDownGuide = false;
        return;
      })
    }
  },
  // 首页滚动回到对应位置
  changeIndexGotop() {
    var that = this;
    if (that.data.changeIndexTabFixed) {
      var swiperHeight = 0;
      if (wx.createSelectorQuery()) {
        var query = wx.createSelectorQuery()
        query.select('#changeIndexSwiper').boundingClientRect(function(res) {
          if (res && res.top) {
            wx.pageScrollTo({
              scrollTop: res.height,
              duration: 0
            })
          } else {
            wx.pageScrollTo({
              scrollTop: 0,
              duration: 0
            })
          }
        }).exec()
      } else {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0
        })
      }
    }
  },
  // 滚动溢出
  bindtouchmove() {
    return false
  },
});