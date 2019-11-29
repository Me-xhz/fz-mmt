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
    productId: 0,
    itemData: {
      shop_type: 0
    },
    actual_store_count: '',
    isLike: 0,
    showSKUstatus: 0,
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
    prom_bool:false,
    activity_bool:false,
    activity_classfy:"",
    teamList:[],
    team_num:0,
    check_remind:false,
    check_remind_activity: false,
    showPhoneModal: false,
    // navbar
    navbarOpacity: 0,
    showBack: false,
    navBarHeight: app.globalData.navBarHeight,
    team_type:'',
    team_sku_type:0,
    noticeUnload: false,
    isShowCredits:false,
    credits_msg:'',
    animationData:'',
    showScore:false,
    scoreTaskList:[],
    showTaskForward:false,
  },
  currentAttrs: [],
  commentTop: 0,
  contentTop: 0,
  confirmData: {},
  showCountDown:true,
  onShow: function() {
    this.setData({
      checkSessionKey: app.checkSessionKey
    });
    if (this.data.itemData.team_id && this.data.itemData.team_id != undefined){
      this.loadProductDetail();
    }
    // 上报关系链-存在token才上报
    var token = common.getStorageSync('token');
    if (token && token != '') {
      common.setInviteShareLogin()
    }
  },
  onUnload: function(){
    this.setData({
      noticeUnload: true
    })
  },
  // 传值
  onLoad: function(options) {
    var that = this;
    wx.showShareMenu({
      withShareTicket: true
    })
    var page = getCurrentPages();
    if (page.length > 1){
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
    event.on('checkSessionKey', this, function(data) {
      this.setData({
        checkSessionKey: data
      });

    })
    let codeId = '';
    let codePickup = '';
    if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      codeId = scene.split("&")[0];
      codePickup = scene.split('&amp;')[1];
    }
    if (options.productId == undefined && codeId == '') {
      common.toast("请求参数错误");
      return;
    }
    var that = this;
    if (options && options.scene && options.scene != '') {
      that.setData({
        productId: codeId,
      });
      this.setData({
        isShowGoHome: true
      })
    } else {
      that.setData({
        productId: options.productId,
      });
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
      that.getExternal(codePickup).then(function() {
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
      })
      return;
    }
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
        that.checkSessionKey = true;
        that.loadProductDetail();
      })
    } else {
      that.checkSessionKey = true;
      that.loadProductDetail();
    }
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
  // 轮播画廊
  setPreviewImage: function(e) {
    var that = this;
    var current = e.currentTarget.dataset.current;
    var imgUrl = [];
    for (var i = 0; that.data.bannerItem.length > i; i++) {
      imgUrl.push(that.data.bannerItem[i]);
    }
    wx.previewImage({
      current: current,
      urls: imgUrl,
    })
  },
  // SKU弹窗
  setModalStatus: function(type) {
    var that=this;
    if (this.data.showSKUstatus == 0) {
      this.data.showSKUstatus = 1;
    } else {
      this.data.showSKUstatus = 0;
    }
    that.data.team_sku_type = 1;
    var animation = wx.createAnimation({
      duration: 250,
      timingFunction: "linear",
      delay: 0
    })

    animation.translateY(368).opacity(1).step();

    this.setData({
      animationData: animation.export()
    })

    if (this.data.showSKUstatus == 1) {

      this.setData({
        showModalStatus: true
      });
    }
    setTimeout(function() {
      if(that.data.iphoneXBottom=="68rpx"){
        animation.translateY(-34).step()
      }else{
        animation.translateY(0).step()
      }
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

  // 服务弹窗
  setfwModalStatus: function(e) {
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
    setTimeout(function() {
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
  showShareModalStatus: function(e) {
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
    setTimeout(function() {
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
  loadProductDetail: function() {
    var that = this;
    common.showLoad(this);
    var uri = app.getPath.scoreGoodsInfo;
    var skuAmounturi = app.getPath.getSkuAmount;
    var data = {
      score_goods_id: that.data.productId,
    }
    common.ApiGateWayTest(uri, data, true, function(res) {
      if (res.statusCode == 200) {
        var productlist = res.data.result.info;
        // productlist.min_buy_amount = productlist.min_buy_amount ? productlist.min_buy_amount : 1;
        var content = productlist.goods_content;
        var introContent = productlist.detail_explain;
        var islike = productlist.is_liked;
        productlist.current_price = productlist.score_price;
        productlist.price = productlist.market_price;
        productlist.team_price = parseFloat(productlist.team_price);
        // WxParse.wxParse('content', 'html', content, that, 0);
        // WxParse.wxParse('introContent', 'html', introContent, that, 0);
        that.setData({
          itemData: productlist,
          actual_store_count: String(productlist.sale_num),
          bannerItem: productlist.gallery,
          indicatorDots: productlist.gallery.length > 1 ? true : false,
          buynum: 1,
          // isLike: islike,
          brandID: productlist.cat_id,
          skuSvipCurrent: parseFloat(productlist.score_price),
          skuCurrent: parseFloat(productlist.market_price),
        });
        if (productlist.is_notice==1){
          that.setData({
            check_remind:true
          })
        }
        if (productlist.is_activity_notice == 1){
          that.setData({
            check_remind_activity: true
          })
        }
        // if (that.data.aldExposure == true) {
        //   app.aldstat.sendEvent("进入商品详情", {
        //     "商品名称": that.data.itemData.report.goods_name,
        //     "用户名": that.data.itemData.report.nick_name
        //   })
        //   that.data.aldExposure = false;
        // }
        if(productlist.exchange_type==1){
            that.setDefaultSKU(productlist);
        }

        // that.loadipRecommend();
        // that.getGoodsRecommend();
        that.isPriceEqual();
        common.hideLoad(that);
      } else {
        common.hideLoad(that);
        common.toast("获取购物车数量失败");
      }
    })
    common.ApiGateWayTest(skuAmounturi, '', true, function(res) {
      if (res.statusCode == 200) {
        that.setData({
          cartAmount: res.data.result.cart_num
        })
      }
    })
  },
  // 轮播图片加载完成
  swiperImageLoad: function() {
    var that = this;
    that.setData({
      swiperImgBl: true
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
      skuSvipCurrent: parseFloat(skuSvipCurrent),
      skuCurrent: parseFloat(skuCurrent),
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
        skuSvipCurrent: parseFloat(that.data.itemData.current_price),
        skuCurrent: parseFloat(that.data.itemData.price)
      });

      that.setAttrsClass();
      return;
    }
    var choosed_sku = '';
    var sku_price = 0;
    var sku_svip_price = 0;
    var sku_svip_team_price=0;
    var skuSvipCurrent = that.data.itemData.current_price;
    var skuCurrent = that.data.itemData.price;
    that.setData({
      choosed_sku: choosed_sku,
      sku_price: sku_price,
      sku_svip_price: sku_svip_price,
      skuSvipCurrent: parseFloat(skuSvipCurrent),
      skuCurrent: parseFloat(skuCurrent)
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
          sku_price = product.score_price;
          sku_svip_price = product.score_price;
          sku_svip_team_price = product.score_price;
        }
      }
      that.confirmData = [{
        score_goods_name: product.score_goods_name,
        score_goods_id: product.score_goods_id,
        sku_key: attrs,
        amount: that.data.buynum,
        shop_price: sku_svip_price,
        market_price: sku_price,
        sku_key_name: "规格:" + choosed_sku,
        sku_img: that.data.skuImages
      }]
      choosed_sku = '已选：' + choosed_sku;
      var skuSvipCurrent = that.data.team_type == 1 ? sku_svip_team_price:sku_svip_price;
      var skuCurrent = sku_price;
      that.setData({
        choosed_sku: choosed_sku,
        sku_price: sku_price,
        sku_svip_price: sku_svip_price,
        skuSvipCurrent: parseFloat(skuSvipCurrent),
        skuCurrent: parseFloat(skuCurrent),
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
              buynum: 1
            })
      } else {
        if (attrs.length < product.properties.length) {
          this.data.currentStock = null,
              this.currentAttrs = attrs,
              this.setData({
                buynum:1
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
    if(product.exchange_type==1){
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
    common.formIdUpdate(e);
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
        if (that.data.buynum <= 1) {
          common.toast('不能小于最小兑换数量')
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
          // common.ApiGateWayTest(invurl, invdata, true, function(ret) {
          //   if (!ret) return;
          //   if (ret.data.result.is_enough != 1) {
          //     common.toast(ret.data.result.msg);
          //     return;
          //   }
          // })
        }
      } else {
        // alpha-beta 1  加      max_exchange_num==0不限制数量
        // Lin start
        if (that.data.itemData.max_exchange_num != 0 && that.data.buynum >= that.data.itemData.max_exchange_num) {
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
          // common.ApiGateWayTest(invurl, invdata, true, function(ret) {
          //   if (!ret) return;
          //   if (ret.data.result.is_enough != 1) {
          //     common.toast(ret.data.result.msg);
          //     that.setData({
          //       buynum: that.data.buynum - 1,
          //     })
          //     that.set_choosed_sku();
          //     return;
          //   }
          // })
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
  //
  goRegister: function() {
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
  },

  // 立即购买
  nowPurchase: function(e) {
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    if (!this.checkCanPurchase()) return;
    var that = this;
    var atitude = '';
    //设置sku确认按钮为立即购买
    this.setData({
      team_type:0
    })

    if (that.data.itemData.shop_type == 1) {
      that.setzjModalStatus(e);
      return;
    }
    var product = that.data.itemData;
    if (that.currentAttrs.length == product.properties.length && product.max_exchange_num < 2 || (that.currentAttrs.length == product.properties.length)) {
      // 验证库存
      var product_id = '';
      for (var i in product.stock) {
        var stock = product.stock[i].key;
        stock = stock.split('_');
        stock.sort(function (a, b) {
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
        "商品名称": that.data.itemData.score_goods_name,
        // "用户名": that.data.itemData.report.nick_name
      })
      common.formIdUpdate(e);
      common.showLoad(this);
      next(e)
      // common.ApiGateWayTest(invurl, invdata, true, function (ret) {
      //   if (!ret) return;
      //   if (ret.data.result.is_enough != 1) {
      //     common.hideLoad(that);
      //     common.toast(ret.data.result.msg);
      //     return;
      //   } else {
      //     next(e)
      //   }
      // })
    } else {
      if (that.data.showSKUstatus == 0) {
        that.setModalStatus();
        that.data.team_sku_type =1
        that.setData({
          showfwModalStatus: false,
          showShareModalStatus: false,
          showBonusModal: false
        })
      } else {
        common.toast('请选择商品款式');
      }
    }
    function next(){
      var checkOrderUri = app.getPath.scorePreCheckOrder;
      var orderProduct = [{
        score_goods_id: that.confirmData[0].score_goods_id,
        sku_key: that.confirmData[0].sku_key,
        num: that.confirmData[0].amount,
      }]
      orderProduct = JSON.stringify(orderProduct);
      var checkOrderData = {
        order_product: orderProduct,
      }
      common.ApiGateWayTest(checkOrderUri, checkOrderData,true,function(resData){
        common.hideLoad(that);
        if(resData.data.success == 1){
          if(resData.data.result.state==0){
            that.confirmData[0]['team_order'] = 0;
            that.confirmData[0]['channel'] = that.data.itemData.is_team;
            // 立即购买的缓存
            common.setStorage({
              key: "nowPay",
              data: that.confirmData
            })
            wx.navigateTo({
              url: '/packageA/check-credits-order/check-credits-order',
            })
          }else{
            that.setData({
              credits_msg:resData.data.result.msg,
              isShowCredits:true,
            })
            return
          }
        }else{
          common.toast(resData.data.msg);
          return
        }
      })
    }
  },
  // 分享后弹窗WX指示图
  shareTo: function() {
    this.setData({
      isShowModeWx: 1,
    });
    // this.onShareAppMessage();
  },
  clossShare: function() {
    this.setData({
      isShowModeWx: 0,
    });
  },
  // 调用微信分享接口
  onShareAppMessage: function(res) {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    var entry_share_info = common.getStorageSync('entry_share_info');
        return {
          title: entry_share_info.urge_share_text,
          path: '/packageA/credits-product/credits-product?pickup_id=' + pickup.pickup_id + '&score_goods_id=' + this.data.itemData.score_goods_id,
          imageUrl: entry_share_info.urge_share_img
        }
    // if (res.target && res.target.dataset.shareinfo) {
    //   let shareInfo = res.target.dataset.shareinfo;
    //   if (shareInfo && shareInfo.fromButton == 'notice') {
    //     return {
    //       title: entry_share_info.urge_share_text,
    //       path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
    //       imageUrl: entry_share_info.urge_share_img
    //     }
    //   } else if (shareInfo && shareInfo.fromButton == 'envelopes') {
    //     return {
    //       title: entry_share_info.invite_share_text,
    //       path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
    //       imageUrl: entry_share_info.invite_share_img
    //     }
    //   } else {
    //     return {
    //       title: that.data.itemData.share_title,
    //       path: '/pages/product/product?productId=' + that.data.itemData.score_goods_id + '&pickup_id=' + pickup.pickup_id + '&user_id=' + that.data.itemData.user_id,
    //       imageUrl: that.data.itemData.share_img
    //     }
    //   }
    // } else {
    //   return {
    //     title: that.data.itemData.share_title,
    //     path: '/pages/product/product?productId=' + that.data.itemData.score_goods_id + '&pickup_id=' + pickup.pickup_id + '&user_id=' + that.data.itemData.user_id,
    //     imageUrl: that.data.itemData.share_img
    //   }
    // }
  },
  //
  closeShareWx: function() {
    this.setData({
      isShowModeWx: 0,
    });
  },
  closeShareBox: function() {
    this.setData({
      isShowbox: 0,
    });
  },
  //移动超出显示返回顶部按钮
  onPageScroll: function(e) {
    var that = this;
    if (that.data.navbarOpacity < 1 && e.scrollTop > 100){
      that.setData({
        navbarOpacity: e.scrollTop / 500
      })
    } else if (that.data.navbarOpacity > 0 && e.scrollTop < 200){
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
  gotoPagetop: function() {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  // 返回首页
  gotoHome: function(e) {
    common.formIdUpdate(e);
    this.setData({
      showScore:false
    })
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 跳转购物车
  goToCart: function(e) {
    common.formIdUpdate(e);
    wx.switchTab({
      url: '/pages/cart/cart',
    })
  },
  aldminishare: function(e) {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    var url = 'pages/product/product?productId=' + that.data.itemData.score_goods_id + '&entryType=external&pickup_id=' + pickup.pickup_id;
    var data = {};

    data = e.currentTarget.dataset
    data['path'] = url;
    wx.showToast({
      title: '分享生成中...',
      icon: 'loading'
    })
    wx.request({
      method: 'post',
      url: 'https://shareapi.aldwx.com/Main/action/Template/Template/applet_htmlpng',
      data: data,
      success: function(data) {
        if (data.data.code === 200) {
          wx.previewImage({
            urls: [data.data.data]
          })
        }
        that.clossShare()
        // 关闭loading
        common.hideLoad(that);
      },
      complete: function() {
        common.hideLoad(that);
      },
      fail: function() {
        common.hideLoad(that);
      }
    })
  },
  // 下拉刷新
  onPullDownRefresh: function() {
    that.loadProductDetail();
    setTimeout(function() {
      wx.stopPullDownRefresh();
    }, 1500);
  },
  // 分享图片
  closeSharePic: function() {
    this.setData({
      isShowSharePic: false,
    });
  },

  drawPic: function() {
    let that = this;
    that.clossShare();
    common.showLoad(this);
    // let AcodePic = null;
    var productShareimg = "";
    var codePicImage = "";
    var drawImageUrl = "";

    let promise2 = new Promise(function(resolve, reject) {
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
    let promise3 = new Promise(function(resolve, reject) {
      wx.request({
        //正式服
        url: 'https://wx.shop.haoyousheng.com.cn/v1/goods/getWXACodeUnlimit',
        //测试服
        // url: 'https://api-t.st-llshop.surex.cn/v1/goods/getWXACodeUnlimit',
        method: 'post',
        responseType: 'arraybuffer', //这一行非常重要，重中之重
        data: {
          secene: that.data.productId + '&' + pickup.pickup_id,
          page: "pages/product/product",
          application: 'goodBuy',
        },
        success: function(res) {
          var timestamp = Date.parse(new Date());
          const filePath = `${wx.env.USER_DATA_PATH}/${'erweima'+timestamp}.${'jpg'}`;
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
        fail: function(res) {
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
      if (that.data.itemData.score_goods_name.length > 12) {
        ctx.fillText(that.data.itemData.score_goods_name.slice(0, 12), 283 / 2, 245) //  内容  不会自己换行 需手动换行
        ctx.fillText(that.data.itemData.score_goods_name.slice(12, 24), 283 / 2, 265) //  内容
      } else {
        ctx.fillText(that.data.itemData.score_goods_name, 283 / 2, 245) //  内容  不会自己换行 需手动换行
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

  TransformationPic: function() {
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

  saveSharePic: function() {
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
        if (res.errMsg === "saveImageToPhotosAlbum:fail auth deny"){
          wx.showModal({
            title: '提示',
            content: '未获取相册授权，是否获取',
            success(res) {
              if (res.confirm) {
                wx.openSetting({
                  success(settingdata) {
                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                      that.saveSharePic();
                    }else {
                      wx.showToast({
                        title:"拒绝授权将无法保存图片",
                        icon: 'none',
                        duration: 1500
                      })
                    }
                  }
                })
              } else if (res.cancel) {
                wx.showToast({
                  title:"拒绝授权将无法保存图片",
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

  setzjModalStatus: function(e) {
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
    setTimeout(function() {
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
  // 取消设置弹窗
  settingModalStatus: function(){
    this.setData({
      showSettingModalStatus: false
    })
  },
  // 前往设置
  goSetting: function(){
    var that = this;
    wx.openSetting({
      success(res) {
        if (res.authSetting["scope.userLocation"] == true){
          that.setData({
            showSettingModalStatus: false
          })
        }
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
  //关闭兑换完弹窗
  showCreditsModal(){
    this.setData({
      isShowCredits:false
    })
  },
  goPageUrl(){
    var that = this;
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    } else {
      wx.navigateTo({
        url: '/pages/pageUrl/pageUrl',
      })
    }
  },
  //显示积分领取弹窗
  showScoreModal(){
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
    setTimeout(function() {
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
  //关闭弹窗
  closeScoreModal(){
    this.setData({
      showScore: false
    });
  },
  //弹窗显示任务列表
  showScoreTask(){
    let that=this
    let url=app.getPath.scoreTaskList
    common.ApiGateWayTest(url,'',true,function (res) {
      if(res.data.success==1){
        if(res.data.result.list.length>0){
          that.setData({
            scoreTaskList:res.data.result.list,
            isShowCredits:false
          })
          that.showScoreModal()
        }else{
          that.setData({
            showTaskForward:true,
            isShowCredits:false
          })
        }

      }
    })
  },
  //获取任务列表
  getScoreTask(){
    let that=this
    let url=app.getPath.scoreTaskList
    common.ApiGateWayTest(url,'',true,function (res) {
      if(res.data.success==1){
        if(res.data.result.list.length>0){
          that.setData({
            scoreTaskList:res.data.result.list
          })
        }else{
          that.setData({
            showTaskForward:true
          })
        }

      }
    })
  },
  closeTaskForward(){
    this.setData({
      showTaskForward:false
    })
  },
  //获取优惠券
  getCoupon(e){
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    if (!this.checkCanPurchase()) return;
    var that = this;
    var atitude = '';
    console.log(that.data.itemData,'商品信息')
    if (that.data.itemData.shop_type == 1) {
      that.setzjModalStatus(e);
      return;
    }
    common.formIdUpdate(e);
    common.showLoad(this);
    next(e)

    function next(){
      var checkOrderUri = app.getPath.scorePreCheckOrder;
      var orderProduct = [{
        score_goods_id: that.data.itemData.score_goods_id,
        sku_key: that.data.itemData.key,
        num: 1,
        exchange_type: that.data.itemData.exchange_type
      }]
      orderProduct = JSON.stringify(orderProduct);
      var checkOrderData = {
        order_product: orderProduct,
      }
      common.ApiGateWayTest(checkOrderUri, checkOrderData,true,function(resData){
        common.hideLoad(that);
        if(resData.data.success == 1){
          if(resData.data.result.state==0){
            wx.showModal({
              title: '提示',
              content: '是否确认兑换',
              success (res) {
                if (res.confirm) {
                  let coupon_url=app.getPath.confirmAddCoupon
                  let id={
                    score_goods_id:that.data.itemData.score_goods_id
                  }
                  common.ApiGateWayTest(coupon_url,id,'',function (result) {
                      if(result.data.success==1){
                          wx.showModal({
                              title: '提示',
                              confirmText:'立即查看',
                              cancelText:'确定',
                              content: result.data.result.state_desc,
                              success (res) {
                                  if (res.confirm) {
                                      wx.navigateTo({
                                          url:'/pages/coupon/coupon?entryType=external'
                                      })
                                  } else if (res.cancel) {
                                    that.loadProductDetail();
                                  }
                              }
                          })
                      }
                  })
                } else if (res.cancel) {

                }
              }
            })
          }else{
            that.setData({
              credits_msg:resData.data.result.msg,
              isShowCredits:true,
            })
            return
          }
        }else{
          common.toast(resData.data.msg);
          return
        }
      })
    }
  },
  //签到接口
  creditsSign(){
    let that=this;
    let url=app.getPath.achieveSign
    common.ApiGateWayTest(url,'',true,function (res) {
      if(res.data.success==1){
        if(res.data.result.state==0){
          common.toast(res.data.result.state_desc)
          that.getScoreTask()
        }else{
          common.toast(res.data.result.state_desc)
        }
      }else{
        common.toast(res.data.msg)
      }
    })
  },
});
