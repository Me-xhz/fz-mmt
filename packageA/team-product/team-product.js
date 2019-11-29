//获取应用实例
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
//引入这个插件，使html内容自动转换成wxml内容
var WxParse = require('../../wxParse/wxParse.js');
Page({
  firstIndex: -1,
  data: {
    iconURL: app.dataBase.iconURL,
    bannerApp: true,
    iphoneXBottom: '0rpx',
    winWidth: 0,
    winHeight: 0,
    teamId: 0,
    itemData: Object,
    actual_store_count: '',
    isLike: 0,
    showSKUstatus: false,
    optionalAttrs: {},
    skuImages: '',
    bannerItem: [],
    buynum: 1,
    // 产品图片轮播
    indicatorDots: true,
    indicatorColor: "rgba(0,0,0,.2)",
    indicatorActiveColor: "#ffe150",
    autoplay: false,
    interval: 5000,
    duration: 300,
    circular: true,
    // 属性选择
    firstIndex: -1,
    choosed_sku: '',
    cartAmount: 0,
    // 滚动判断值 1：商品，2：评价，3详情
    currentLocation: 1,
    // 是否显示subbar
    showSubbar: false,
    // 滚动到的位置
    scrollTop: 0,
    scrollBar: '',
    showBackTop: false,
    // 弹窗SKU，不能减不能加
    undel: true,
    unadd: false,
    // 领券弹窗
    showBonus: 0,
    // IP推荐
    brandID: 0,
    ipRecommend: {},
    formateDatas: [],
    // 商品评论
    comment: {},
    // 拼团次数
    teamLabel: {},
    wordsLimit: true,
    limitWords: "展开",
    // SKU的VIP价格和非SVIP是否相同
    isPriceEqual: false,
    // 优惠券分享样式
    productgift: {},
    isshare: 0,
    giftNum: '',
    bounsTxtnumOn: false,
    // 优惠券展示
    showBonusModal: false,
    // 前往设置弹窗
    showSettingModalStatus: false,
    // isShowModeWx: 1,
    isShowbox: 0,
    canPurchase: false,
    date_limite_bool: true,
    date_limite_ing: true,
    // 是否显示右上角返回首页
    isShowGoHome: false,
    // 分享图片
    isShowSharePic: false,
    preurl: null,
    // 租机弹窗
    showzjModalStatus: false,
    // 方案详情切换开关
    rentToggleStatus: 0,
    aldExposure: true,
    stopCartBtn: false,
    prom_bool: false,
    activity_bool: false,
    activity_classfy: "",
    h: "00",
    m: "00",
    s: "00",
    d: "00",
    teamList: [],
    team_num: 0,
    check_remind: false,
    check_remind_activity: false,
    showPhoneModal: false,
    // navbar
    navbarOpacity: 0,
    showBack: false,
    navBarHeight: app.globalData.navBarHeight,
    team_type: 1,
    team_sku_type: 0,
    noticeUnload: false,
    // 抢购价钱
    activity_price_start: '0',
    activity_price_end: '0.00',
    activity_time_start: {},
    isEnoughPopupShow: false,
    sellOutNoticeInfo: {}
  },
  currentAttrs: [],
  commentTop: 0,
  contentTop: 0,
  confirmData: {},
  showCountDown: true,
  getDate: function (prom_info) {
    var that = this;
    var start = prom_info.start_time * 1000;
    var end = prom_info.end_time * 1000;
    var now = new Date().getTime();
    // && prom_info.prom_label=="限时抢购"
    if (now >= start && now <= end) {
      that.countTime(now, end);
      that.setData({
        date_limite_ing: true
      })
      this.date = setInterval(function () {
        var now = new Date().getTime();
        that.countTime(now, end);
      }, 1000)
      that.countTimeMs();
    } else if (start >= now && end >= now) {
      that.countTime(now, start);
      that.setData({
        date_limite_ing: false
      })
      this.date = setInterval(function () {
        var now = new Date().getTime();
        that.countTime(now, start);
      }, 1000)
    } else {
      that.setData({
        date_limite_bool: false
      })
    }

  },
  countTime: function (now, end) {
    var leftTime = end - now;
    var d, h, m, s;
    if (leftTime >= 0) {
      d = Math.floor(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数

      h = Math.floor((leftTime / 1000 / 60 / 60) % 24) + d * 24;
      m = Math.floor((leftTime / 1000 / 60) % 60);
      s = Math.floor((leftTime / 1000) % 60);

    } else {
      clearInterval(this.date);
      this.loadProductDetail();
      return false;
    }
    h = h > 9 ? h : ('0' + h);
    m = m > 9 ? m : ('0' + m);
    s = s > 9 ? s : ('0' + s);
    this.setData({
      down_date_h: h,
      down_date_m: m,
      down_date_s: s
    })
  },
  // 毫秒倒计时
  countTimeMs() {
    var ms = 9;
    this.dataMs = setInterval(() => {
      if (ms > 1) {
        ms--;
      } else {
        ms = 9
      }
      this.setData({
        down_date_ms: ms
      })
    }, 100)
  },
  //倒计时函数
  countDown: function (end) {
    var that = this;
    var now = new Date().getTime() / 1000;
    var leftTime = end - now;
    var d, h, m, s;
    clearInterval(that.teamTime);
    that.teamTime = setInterval(() => {
      leftTime = leftTime - 1
      if (leftTime >= 0) {
        d = Math.floor(leftTime / 60 / 60 / 24, 10); //计算剩余的天数
        h = Math.floor((leftTime / 60 / 60) % 24);
        m = Math.floor((leftTime / 60) % 60);
        s = Math.floor(leftTime % 60);
        d = d > 9 ? d : ('0' + d)
        h = h > 9 ? h : ('0' + h);
        m = m > 9 ? m : ('0' + m);
        s = s > 9 ? s : ('0' + s);
      } else {
        clearInterval(that.teamTime);
        this.setData({
          showCountDown: false
        })
        that.loadProductDetail();
      }
      this.setData({
        d: d, h: h, m: m, s: s,
      })
    }, 1000)
  },
  onShow: function () {
    this.setData({
      checkSessionKey: app.checkSessionKey
    });
    if (this.data.itemData.team_id && this.data.itemData.team_id != undefined) {
      this.loadProductDetail();
      this.getTeamList();
    }
    // 上报关系链-存在token才上报
    var token = common.getStorageSync('token');
    if (token && token != '') {
      common.setInviteShareLogin()
    }
  },
  onUnload: function () {
    this.setData({
      noticeUnload: true
    })
  },
  // 传值
  onLoad: function (options) {
    var that = this;
    wx.showShareMenu({
      withShareTicket: true
    })
    var page = getCurrentPages();
    if (page.length > 1) {
      that.setData({
        showBack: true
      })
    }
    wx.getSystemInfo({
      success: function (res) {
        var model = res.model
        if (model.search('iPhone X') != -1) {
          that.setData({
            iphoneXBottom: '68rpx'
          })
        }
      }
    })
    // 监听checkSessionKey
    event.on('checkSessionKey', this, function (data) {
      this.setData({
        checkSessionKey: data,
      });

    })
    let codeId = '';
    let codePickup = '';
    if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      codeId = scene.split("&")[0];
      codePickup = scene.split('&amp;')[1];
    }
    if (options.teamId == undefined && codeId == '') {
      common.toast("请求参数错误");
      return;
    }
    var that = this;
    if (options && options.scene && options.scene != '') {
      that.setData({
        teamId: codeId,
      });
      this.setData({
        isShowGoHome: true
      })
    } else {
      that.setData({
        teamId: options.teamId,
      });
      this.getTeamList();
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
    if (options && options.scene && options.scene != '') {
      that.getExternal(codePickup).then(function () {
        // 关闭开关，让app知道已经不是第一次进入当前页
        app.firstlaunchApp = false;
        // 清空data内携带参数
        that.data.entryData = {};
        // 外部已带经纬度定位，无需再调用定位接口，所以将缓存定位改为真，让页面可以显示
        common.setStorageSync('authSetting', {
          'scope.userLocation': true
        });
        that.checkSessionKey = true;
        that.loadProductDetail();
        that.loadProductgift();
      })
      return;
    }
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
        that.checkSessionKey = true;
        that.loadProductDetail();
        that.loadProductgift();
      })
    } else {
      that.checkSessionKey = true;
      that.loadProductDetail();
      that.loadProductgift();
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
          }, function (res) {
            resolve('获取id成功')
          })
        }
      })
    })
  },
  // 轮播画廊
  setPreviewImage: function (e) {
    var that = this;
    var current = e.currentTarget.dataset.current;
    var imgUrl = [];
    for (var i = 0; that.data.bannerItem.length > i; i++) {
      imgUrl.push(that.data.bannerItem[i].src);
    }
    wx.previewImage({
      current: current,
      urls: imgUrl,
    })
  },
  // 领券弹窗
  setModalBonus: function () {
    if (this.data.showBonusModal == 0) {
      this.data.showBonusModal = 1;
    } else {
      this.data.showBonusModal = 0;
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

    if (this.data.showBonusModal == 1) {

      this.setData({
        showBonusModal: true
      });
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (this.data.showBonusModal == 0) {
        this.setData({
          showBonusModal: false
        });
      }
    }.bind(this), 200)
  },

  // 弹窗里领取优惠券
  getBonus: function (e) {
    var that = this;
    // 跳转登录
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    var coupon_id = e.currentTarget.dataset.typeid;
    if (!that.data.shippingBonus) return;
    var uri = app.getPath.addCoupon;
    var data = {
      coupon_id: coupon_id,
    }
    common.formIdUpdate(e);
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res.statusCode == 200) {
        if (res.data.result) {
          common.toast(res.data.result.state_desc);
        }
      }
      that.loadProductgift();
    });
  },

  // 服务弹窗
  setfwModalStatus: function (e) {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })

    animation.translateY(300).opacity(1).step();
    this.setData({
      animationData: animation.export()
    })

    this.setData({
      showfwModalStatus: true
    });
    setTimeout(function () {
      animation.translateY('-150px').translateX('-50%').step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showfwModalStatus: false
        });
      }
    }.bind(this), 200)
  },
  // 分享选择弹窗
  showShareModalStatus: function (e) {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })

    animation.translateY(300).opacity(1).step();
    this.setData({
      animationData: animation.export()
    })

    this.setData({
      showShareModalStatus: true
    });
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showShareModalStatus: false
        });
      }
    }.bind(this), 200)
  },
  // 商品详情数据获取
  loadProductDetail: function () {
    var that = this;
    common.showLoad(this);
    var uri = app.getPath.getTeamGoodsInfo;
    var skuAmounturi = app.getPath.getSkuAmount;
    var data = {
      team_id: that.data.teamId,
    }
    common.ApiGateWayTest(uri, data, true, function (res) {

      if (res.statusCode == 200) {
        var productlist = res.data.result;
        var content = productlist.goods_content;
        var introContent = productlist.detail_explain;
        var islike = productlist.is_liked;
        productlist.current_price = productlist.shop_price;
        productlist.price = productlist.market_price;
        productlist.team_price = parseFloat(productlist.team_price);
        that.setData({
          itemData: productlist,
          actual_store_count: String(productlist.sale_num),
          bannerItem: productlist.gallery,
          indicatorDots: productlist.gallery.length > 1 ? true : false,
          brandID: productlist.cat_id,
        });
        if (productlist.is_notice == 1) {
          that.setData({
            check_remind: true
          })
        }
        if (productlist.is_activity_notice == 1) {
          that.setData({
            check_remind_activity: true
          })
        }
        // 判断是否弹出售罄提示窗
        if (productlist.is_enough == 0) {
          var url = app.getPath.sellOutNotice;
          common.ApiGateWayTest(url, '', true, function (res) {
            var resData = res.data;
            if (resData.success == 1) {
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
        if (that.data.aldExposure == true) {
          app.aldstat.sendEvent("进入商品详情", {
            "商品名称": that.data.itemData.report.goods_name,
            "用户名": that.data.itemData.report.nick_name
          })
          that.data.aldExposure = false;
        }
        that.teamLabel();
        that.setData({
          canPurchase: that.checkCanPurchase()
        })
        common.hideLoad(that);
      } else {
        common.hideLoad(that);
        common.toast("获取购物车数量失败");
      }
    })
    common.ApiGateWayTest(skuAmounturi, '', true, function (res) {
      if (res.statusCode == 200) {
        that.setData({
          cartAmount: res.data.result.cart_num
        })
      }
    })
  },
  // 轮播图片加载完成
  swiperImageLoad: function () {
    var that = this;
    that.setData({
      swiperImgBl: true
    })
  },
  // 加载优惠券
  loadProductgift: function () {
    var that = this;
    var Bonusuri = app.getPath.goodscouponlist;
    var data = {
      goods_id: that.data.teamId,
    };
    common.ApiGateWayTest(Bonusuri, data, true, function (res) {

      var shippingBonus = res.data.result;
      var bonusL = 0;
      var bounsTxtnum = 0;
      if (shippingBonus) {
        bonusL = shippingBonus.length > 3 ? 3 : shippingBonus.length;
      }
      for (var i = 0; i < bonusL; i++) {
        bounsTxtnum = bounsTxtnum + shippingBonus[i].name.length;
      }
      that.setData({
        shippingBonus: shippingBonus
      })
      if (bounsTxtnum > 24) {
        that.setData({
          bounsTxtnumOn: true
        });
      }
    })
  },
  //
  goRegister: function () {
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
  },
  // SKU选择触发完成
  skuSubmit(e) {
    this.setData({
      showSKUstatus: false,
      choosed_sku: e.detail.shopItemInfo.spec_name,
      buynum: e.detail.buynum
    })
    this.confirmData = [{
      goods_id: this.data.itemData.goods_id,
      sku_key: e.detail.shopItemInfo.key,
      item_id: e.detail.shopItemInfo.item_id,
      amount: e.detail.buynum
    }]
    if (this.data.team_type == 0) {
      this.nowPurchase(e);
    } else {
      this.delegation(e);
    }
  },
  // 显示SKU弹窗
  showSkuPopup() {
    var that = this;
    that.setData({
      showSKUstatus: true
    });
  },
  // 隐藏SKU弹窗
  skuPopupHide() {
    var that = this;
    that.confirmData = [];
    that.setData({
      showSKUstatus: false
    });
  },
  // 立即购买
  nowPurchase: function (e) {

    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    var that = this;
    var atitude = '';
    //设置sku确认按钮为立即购买
    this.setData({
      team_type: 0
    })

    if (that.data.itemData.shop_type == 1) {
      that.setzjModalStatus(e);
      return;
    }
    var product = that.data.itemData;
    if (that.confirmData.length > 0 && that.confirmData[0].sku_key) {
      var invurl = app.getPath.skuEnough;
      var invdata = {
        goods_id: product.goods_id,
        sku_key: that.confirmData[0].sku_key,
        amount: that.data.buynum
      };
      app.aldstat.sendEvent("立即购买", {
        "商品名称": that.data.itemData.report.goods_name,
        "用户名": that.data.itemData.report.nick_name
      })
      common.formIdUpdate(e);
      common.showLoad(this);
      common.ApiGateWayTest(invurl, invdata, true, function (ret) {
        if (!ret) return;
        if (ret.data.result.is_enough != 1) {
          common.hideLoad(that);
          common.toast(ret.data.result.msg);
          return;
        } else {
          next(e)
        }
      })
    } else {
      if (!that.data.showSKUstatus) {
        that.setData({
          showSKUstatus: true,
          showfwModalStatus: false,
          showShareModalStatus: false,
          showBonusModal: false
        })
      } else {
        common.toast('请选择商品款式');
      }
    }
    function next() {
      var itemData = that.data.itemData;
      var checkOrderUri = app.getPath.preCheckOrder;
      var orderProduct = [{
        goods_id: itemData.goods_id,
        sku_key: that.confirmData[0].sku_key,
        num: that.data.buynum,
      }]
      orderProduct = JSON.stringify(orderProduct);
      var checkOrderData = {
        order_product: orderProduct,
        team_order: 0,
        time_atitude: app.dataBase.userAtitude
      }
      common.ApiGateWayTest(checkOrderUri, checkOrderData, true, function (resData) {
        common.hideLoad(that);
        if (resData.data.success == 1) {
          that.confirmData[0]['team_order'] = 0;
          that.confirmData[0]['channel'] = that.data.itemData.is_team;
          // 立即购买的缓存
          common.setStorage({
            key: "nowPay",
            data: that.confirmData
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
  // 一键开团
  delegation: function (e) {
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    var that = this;
    if (that.data.itemData.shop_type == 1) {
      that.setzjModalStatus(e);
      return;
    }
    //设置sku确认按钮为一键开团
    this.setData({
      team_type: 1
    });
    var product = that.data.itemData;
    if (that.confirmData.length > 0 && that.confirmData[0].sku_key) {
      var invurl = app.getPath.skuEnough;
      var invdata = {
        goods_id: product.goods_id,
        sku_key: that.confirmData[0].sku_key,
        amount: that.data.buynum
      };
      app.aldstat.sendEvent("立即购买", {
        "商品名称": that.data.itemData.report.goods_name,
        "用户名": that.data.itemData.report.nick_name
      })
      common.formIdUpdate(e);
      common.showLoad(this);
      common.ApiGateWayTest(invurl, invdata, true, function (ret) {
        if (!ret) return;
        if (ret.data.result.is_enough != 1) {
          common.hideLoad(that);
          common.toast(ret.data.result.msg);
          return;
        } else {
          that.setData({
            showModalStatus: false,
            showSKUstatus: false
          });
          next(e)
        }
      })
    } else {
      if (!that.data.showSKUstatus) {
        that.setData({
          showSKUstatus: true,
          showfwModalStatus: false,
          showShareModalStatus: false,
          showBonusModal: false,
          skuSvipCurrent: product.stock[0].team_price
        })
      } else {
        common.toast('请选择商品款式');
      }
    }
    function next() {
      var itemData = that.data.itemData;
      var checkOrderUri = app.getPath.preCheckOrder;
      var orderProduct = [{
        goods_id: itemData.goods_id,
        sku_key: that.confirmData[0].sku_key,
        num: that.data.buynum
      }]
      orderProduct = JSON.stringify(orderProduct);
      var checkOrderData = {
        order_product: orderProduct,
        team_order: 1,
        team_id: that.data.itemData.team_id,
        time_atitude: app.dataBase.userAtitude
      }
      common.ApiGateWayTest(checkOrderUri, checkOrderData, true, function (resData) {
        common.hideLoad(that);
        if (resData.data.success == 1) {
          that.confirmData[0]['team_order'] = 1;
          that.confirmData[0]['team_id'] = that.data.itemData.team_id;
          // 立即购买的缓存
          common.setStorage({
            key: "nowPay",
            data: that.confirmData
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
  //验证是否可以购买
  checkCanPurchase: function () {
    var product = this.data.itemData;
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
  // 分享后弹窗WX指示图
  shareTo: function () {
    this.setData({
      isShowModeWx: 1,
    });
    // this.onShareAppMessage();
  },
  clossShare: function () {
    this.setData({
      isShowModeWx: 0,
    });
  },
  // 调用微信分享接口
  onShareAppMessage: function (res) {
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
          title: that.data.itemData.share_title,
          path: '/packageA/team-product/team-product?teamId=' + that.data.itemData.team_id + '&pickup_id=' + pickup.pickup_id + '&user_id=' + that.data.itemData.user_id,
          imageUrl: that.data.itemData.share_img
        }
      }
    } else {
      return {
        title: that.data.itemData.share_title,
        path: '/packageA/team-product/team-product?teamId=' + that.data.itemData.team_id + '&pickup_id=' + pickup.pickup_id + '&user_id=' + that.data.itemData.user_id,
        imageUrl: that.data.itemData.share_img
      }
    }
  },
  //
  closeShareWx: function () {
    this.setData({
      isShowModeWx: 0,
    });
  },
  closeShareBox: function () {
    this.setData({
      isShowbox: 0,
    });
  },
  closeShareShowSku: function () {
    this.setData({
      isShowbox: 0,
    });
    this.setModalStatus();
  },
  //移动超出显示返回顶部按钮
  onPageScroll: function (e) {
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
    if (e.scrollTop > 300) {
      that.setData({
        showBackTop: true
      })
    } else {
      that.setData({
        showBackTop: false
      })
    }
  },
  gotoPagetop: function () {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  /* bar滚动 */
  productGoSP: function () {
    this.setData({
      scrollTop: 0,
    });
  },
  productGoPJ: function () {
    this.setData({
      scrollBar: "comment",
      //currentLocation: 2,
    });
    var that = this;
    setTimeout(function () {
      that.setData({
        currentLocation: 2
      });
    }, 400);
  },
  productGoXQ: function () {
    this.setData({
      scrollBar: "content",
      //currentLocation: 3,
    });
    var that = this;
    setTimeout(function () {
      that.setData({
        currentLocation: 3
      });
    }, 400);
  },
  openSvip: function () {
    app.dataBase.pageUrl = 'http://mc.vip.qq.com/qqwallet/index?_wv=3&aid=mios.p.a.em_spxqy&ADTAG=vipmall&type=!svip&month=1';
    common.goWebview();
  },
  // 返回首页
  gotoHome: function (e) {
    common.formIdUpdate(e);
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  goBonusPage: function () {
    this.setData({
      isShowbox: 0,
    });
    wx.navigateTo({
      url: '/pages/rituall/rituall',
    })
  },
  //获取系统信息
  initNavHeight: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  bannerClosed: function () {
    this.setData({
      bannerApp: false,
    })
  },
  productGoProduct: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/product/product?productId=' + id,
    })
  },
  productGoTheme: function (e) {
    var brand_id = e.currentTarget.dataset.brand;
    wx.navigateTo({
      url: '/pages/listdetail/listdetail?cat_id=&title=&brand_id=' + brand_id,
    })
  },
  productGoComment: function (e) {
    var productId = e.currentTarget.dataset.productid;
    wx.navigateTo({
      url: '/pages/comment/comment?productId=' + productId,
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    that.loadProductDetail();
    that.loadProductgift();
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 1500);
  },
  // 分享图片
  closeSharePic: function () {
    this.setData({
      isShowSharePic: false,
    });
  },

  drawPic: function () {
    let that = this;
    that.clossShare();
    common.showLoad(this);
    // let AcodePic = null;
    var productShareimg = "";
    var codePicImage = "";
    var drawImageUrl = "";

    // let promise1 = new Promise(function (resolve, reject) {
    //   /* 获得要在画布上绘制的图片 */
    //   wx.getImageInfo({
    //     src: that.data.iconURL + "/product-share-card.png",
    //     success(res) {
    //       drawImageUrl = res.path;
    //       console.log("drawImageUrl", drawImageUrl)
    //       resolve(res);
    //     }
    //   })
    // });

    let promise2 = new Promise(function (resolve, reject) {
      /* 获得要在画布上绘制的图片 */
      // wx.downloadFile({
      //   url: that.data.skuImages, // 仅为示例，并非真实的资源
      //   success(res) {
      //     // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
      //     if (res.statusCode === 200) {
      //       productShareimg = res.tempFilePath;
      //       resolve(res);
      //     } else {
      //       wx.showToast({
      //         title: '网络繁忙，无法生成分享图',
      //         icon: 'none'
      //       })
      //       reject();
      //     }
      //   },
      //   fail(res) {
      //     wx.showToast({
      //       title: '下载接口没跑通',
      //       icon: 'none'
      //     })
      //     reject();
      //   }
      // })
      wx.getImageInfo({
        src: that.data.skuImages,
        success(res) {
          productShareimg = res.path;
          resolve(res);
        },
        fail(res) {
          wx.showToast({
            title: '网络繁忙，无法生成分享图',
            icon: 'none'
          })
          reject();
        }
      })
    });

    var pickup = common.getStorageSync('getpickup');
    let promise3 = new Promise(function (resolve, reject) {
      wx.request({
        //正式服
        url: 'https://wx.shop.haoyousheng.com.cn/v1/goods/getWXACodeUnlimit',
        //测试服
        // url: 'https://api-t.st-llshop.surex.cn/v1/goods/getWXACodeUnlimit',
        method: 'post',
        responseType: 'arraybuffer', //这一行非常重要，重中之重
        data: {
          secene: that.data.teamId + '&' + pickup.pickup_id,
          page: "packageA/team-product/team-product",
          application: 'goodBuy',
        },
        success: function (res) {
          // var base64 = wx.arrayBufferToBase64(res.data);
          // let AcodePic = "data:image/PNG;base64," + base64;
          // console.log("二维码获取临时地址")
          // wx.getImageInfo({
          //   src: base64,
          //   success(res) {
          //     codePicImage = res.path;
          //     console.log("codePicImage", codePicImage)
          //     resolve(res);
          //   }
          // })
          var timestamp = Date.parse(new Date());
          const filePath = `${wx.env.USER_DATA_PATH}/${'erweima' + timestamp}.${'jpg'}`;
          wx.getFileSystemManager().writeFile({
            filePath,
            data: res.data,
            encoding: 'binary',
            success() {
              codePicImage = filePath;
              resolve(filePath);
            },
            fail() {
              reject(new Error('ERROR_BASE64SRC_WRITE'));
            },
          });

        },
        fail: function (res) {
          reject();
        }
      })
    });

    /* 图片获取成功才执行后续代码 */
    Promise.all(
      [promise2, promise3]
    ).then(res => {

      /* 创建 canvas 画布 */
      const ctx = wx.createCanvasContext('shareImg')

      // 填充背景色
      ctx.rect(0, 0, 283, 480);
      ctx.setFillStyle('#FFFFFF');
      ctx.fill();

      // 背景上画圆
      ctx.beginPath();
      ctx.arc(142, -39, 185, 0, 2 * Math.PI);

      ctx.setFillStyle('#ffe150')

      ctx.fill();

      // 圆角矩形加阴影
      let rec_x = 35,
        rec_y = 36,
        rec_r = 10,
        rec_w = 220,
        rec_h = 290;
      ctx.beginPath();
      ctx.moveTo(rec_x + rec_r, rec_y);
      ctx.arcTo(rec_x + rec_w, rec_y, rec_x + rec_w, rec_y + rec_h, rec_r);
      ctx.arcTo(rec_x + rec_w, rec_y + rec_h, rec_x, rec_y + rec_h, rec_r);
      ctx.arcTo(rec_x, rec_y + rec_h, rec_x, rec_y, rec_r);
      ctx.arcTo(rec_x, rec_y, rec_x + rec_w, rec_y, rec_r);
      ctx.setFillStyle('#FFFFFF');
      ctx.setShadow(0, 0, 15, '#DDDDDD');
      ctx.fill();
      ctx.setShadow(0, 0, 0, '#ffffff');

      // 圆角矩形TAG
      let draw_x = 95,
        draw_y = 275,
        draw_r = 2,
        draw_w = 40,
        draw_h = 16;
      ctx.beginPath();
      ctx.moveTo(draw_x + draw_r, draw_y);
      ctx.arcTo(draw_x + draw_w, draw_y, draw_x + draw_w, draw_y + draw_h, draw_r);
      ctx.arcTo(draw_x + draw_w, draw_y + draw_h, draw_x, draw_y + draw_h, draw_r);
      ctx.arcTo(draw_x, draw_y + draw_h, draw_x, draw_y, draw_r);
      ctx.arcTo(draw_x, draw_y, draw_x + draw_w, draw_y, draw_r);
      ctx.setStrokeStyle('red');
      ctx.closePath();
      ctx.stroke();

      /* 绘制图像到画布  图片的位置你自己计算好就行 参数的含义看文档 */
      /* ps: 网络图片的话 就不用加../../路径了 反正我这里路径得加 */
      // ctx.setGlobalAlpha(0.1)
      // ctx.drawImage(that.data.bannerItem[0].src, -109, -109, 600, 600)
      // ctx.setGlobalAlpha(1)
      // ctx.drawImage(drawImageUrl, 31, 36, 222, 300);
      ctx.drawImage(productShareimg, 66, 71, 150, 150);
      ctx.drawImage(codePicImage, 101, 340, 80, 80)

      /* 绘制文字 位置自己计算 参数自己看文档 */
      ctx.setTextAlign('center') //  位置
      ctx.setFillStyle('#555555') //  颜色
      ctx.setFontSize(14) //  字号
      if (that.data.itemData.goods_name.length > 12) {
        ctx.fillText(that.data.itemData.goods_name.slice(0, 12), 283 / 2, 245) //  内容  不会自己换行 需手动换行
        ctx.fillText(that.data.itemData.goods_name.slice(12, 24), 283 / 2, 265) //  内容
      } else {
        ctx.fillText(that.data.itemData.goods_name, 283 / 2, 245) //  内容  不会自己换行 需手动换行
      }
      // 圆角矩形内容
      ctx.setTextAlign('center') //  位置
      ctx.setFillStyle('red') //  颜色
      ctx.setFontSize(10) //  字号
      ctx.fillText('抢购价', 115, 287) //  内容
      // 价格
      ctx.setTextAlign('center') //  位置
      ctx.setFillStyle('red') //  颜色
      ctx.setFontSize(14) //  字号
      ctx.fillText('¥' + that.data.skuSvipCurrent, 165, 289) //  内容

      // 底部提示
      ctx.setTextAlign('center') //  位置
      ctx.setFillStyle('#555555') //  颜色
      ctx.setFontSize(11) //  字号
      ctx.fillText('长按图片识别小程序码', 283 / 2, 445) //  内容
      ctx.setTextAlign('center') //  位置
      ctx.setFillStyle('#AAAAAA') //  颜色
      ctx.setFontSize(9) //  字号
      ctx.fillText('*实际价格以页面展示为准', 283 / 2, 460) //  内容

      // 原价
      ctx.setTextAlign('center') //  位置
      ctx.setFillStyle('#AAAAAA') //  颜色
      ctx.setFontSize(12) //  字号
      ctx.fillText('原价 ¥' + that.data.skuCurrent, 283 / 2, 310) //  内容
      ctx.beginPath();
      ctx.moveTo(100, 305);
      ctx.lineTo(183, 305);
      ctx.setStrokeStyle('#AAAAAA');
      ctx.stroke();

      common.hideLoad(that);

      /* 绘制 */
      that.setData({
        isShowSharePic: true,
      });
      ctx.stroke()
      ctx.draw(false, () => {
        that.TransformationPic();
      })
    })
  },

  TransformationPic: function () {
    // 生成分享图
    let that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      canvasId: 'shareImg',
      fileType: "jpg",
      quality: 1,
      success(res) {
        console.log("分享图生成成功");
        /* 这里 就可以显示之前写的 预览区域了 把生成的图片url给image的src */
        that.setData({
          preurl: res.tempFilePath
        })
      },
      fail(res) {
        wx.showModal({
          title: '消息提示',
          content: '生成分享图失败,请重试',
          showCancel: false
        })
      }
    })
  },

  saveSharePic: function () {
    let that = this;
    common.showLoad(this);
    wx.saveImageToPhotosAlbum({
      filePath: that.data.preurl,
      success(res) {
        common.hideLoad(that);
        that.setData({
          isShowSharePic: false,
          preurl: null
        });
        wx.showModal({
          title: '保存成功',
          content: '分享图保存成功',
          showCancel: false,
        })
      },
      fail(res) {
        common.hideLoad(that);
        if (res.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
          wx.showModal({
            title: '提示',
            content: '未获取相册授权，是否获取',
            success(res) {
              if (res.confirm) {
                wx.openSetting({
                  success(settingdata) {
                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                      that.saveSharePic();
                    } else {
                      wx.showToast({
                        title: "拒绝授权将无法保存图片",
                        icon: 'none',
                        duration: 1500
                      })
                    }
                  }
                })
              } else if (res.cancel) {
                wx.showToast({
                  title: "拒绝授权将无法保存图片",
                  icon: 'none',
                  duration: 1500
                })
              }
            }
          })
        }
      }
    })
  },

  setzjModalStatus: function (e) {
    console.log(e);
    var animation = wx.createAnimation({
      duration: 250,
      timingFunction: "linear",
      delay: 0
    })

    animation.translateY(368).opacity(1).step();
    this.setData({
      animationData: animation.export()
    })

    this.setData({
      showzjModalStatus: true
    });
    setTimeout(function () {
      animation.translateY('-150px').translateX('-50%').step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showzjModalStatus: false
        });
      }
    }.bind(this), 200)
  },
  // 切换租机 方案详情
  rentToggle: function (e) {
    let status = e.currentTarget.dataset.status;
    if (status != this.data.rentToggleStatus) {
      console.log(status)
      this.setData({
        rentToggleStatus: status
      })
    }
  },
  // 跳转任选活动
  to_activity: function (e) {
    let id = e.currentTarget.dataset.activity_id;
    wx.navigateTo({
      url: '/packageA/select/select?entryType=external&id=' + id,
    })
  },
  // 取消设置弹窗
  settingModalStatus: function () {
    this.setData({
      showSettingModalStatus: false
    })
  },
  // 拼团次数
  teamLabel: function () {
    var that = this;
    var uri = app.getPath.teamLabel;
    var data = {
      team_id: that.data.itemData.team_id,
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res.data.success == 1) {
        that.setData({
          teamLabel: res.data.result.data
        })
        var nowtime = new Date().getTime() / 1000;
        if (that.data.teamLabel.start_time > nowtime || that.data.teamLabel.end_time > nowtime) {
          that.setData({
            showCountDown: true
          })
          if (that.data.teamLabel.status === 2) {
            that.countDown(that.data.teamLabel.start_time)
          } else if (that.data.teamLabel.status === 1) {
            that.countDown(that.data.teamLabel.end_time)
          }
        }

      }
    })
  },
  //获取拼团列表
  getTeamList() {
    var that = this;
    var url = app.getPath.teamList;
    var data = {
      goods_id: this.data.teamId
    };
    common.ApiGateWayTest(url, data, true, function (res) {
      var res = res.data;
      if (res.success == 1) {
        if (res.result.data.length > 2) {
          that.setData({
            teamList: res.result.data.concat(res.result.data),
            team_num: res.result.data.length
          })
          console.log(that.data.teamList)
        } else {
          that.setData({
            teamList: res.result.data,
            team_num: res.result.data.length
          })
        }
      }
    })
  },
  //跳转拼团列表
  loadTeamList() {
    var that = this;
    wx.navigateTo({
      url: '/packageA/team-list/team-list?entryType=external&goods_id=' + that.data.productId,
    })
  },
  // 前往设置
  goSetting: function () {
    var that = this;
    wx.openSetting({
      success(res) {
        if (res.authSetting["scope.userLocation"] == true) {
          that.setData({
            showSettingModalStatus: false
          })
        }
      }
    })
  },
  // 切换提醒未提醒
  change_team() {
    let that = this;
    common.showLoad(this);
    let url = app.getPath.remindTeam;
    let data = {
      team_id: that.data.itemData.team_id,
      is_notice: that.data.check_remind ? '0' : '1'
    }
    common.ApiGateWayTest(url, data, true, function (res) {
      var res = res.data
      if (res.success == 1) {
        if (res.result.status == 1) {
          that.setData({
            check_remind: !that.data.check_remind
          })
          common.toast(res.result.msg)
        } else if (res.result.status == 0) {
          common.toast(res.result.msg)
        } else if (res.result.status == 2) {
          that.setData({
            showPhoneModal: true
          })
        }
        common.hideLoad(that);
      }

    })
  },
  //  跳转领券中心
  goCouponList() {
    wx.navigateTo({
      url: '/pages/couponCenter/couponCenter?entryType=external'
    })
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
              showPhoneModal: false
            })
          } else {
            return
          }
        })
      }
    })
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
  // 滚动溢出
  bindtouchmove() {
    return false
  },
  // 显示库存不足提示
  showEnoughPopup() {
    if (this.data.itemData.is_enough == 0) {
      this.setData({
        isEnoughPopupShow: true
      })
    }
  },
  // 隐藏库存不足显示
  hideEnoughPopup() {
    this.setData({
      isEnoughPopupShow: false
    })
  },
  // 前往明日爆款
  goTomorrowProduct() {
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
});
