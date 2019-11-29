// pages/newExclusive/newExclusive.js
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    indexModel: [],


    
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
    canPurchase: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    if (!app.checkSessionKey) {
      event.on('checkSessionKey', this, function (data) {
        this.getConfigureIndexModel();
      })
    } else {
      this.getConfigureIndexModel();
    }
    this.getShare()
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
          console.log(res.data.result.cities.pick_up)
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
            },
          },function(res) {
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
  onShareAppMessage(res) {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    return {
      title: that.share_data.share_title,
      path: '/pages/newExclusive/newExclusive?pickup_id=' + pickup.pickup_id,
      imageUrl: that.share_data.share_img,
    }
  },
  // 获取分享信息
  getShare: function (position) {
    var that = this;
    var uri = app.getPath.indexShare;
    var data = {
      position:2
    };
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res && res.data && res.data.success == 1) {
        console.log(res)
        that.setData({
          share_data: res.data.result
        })
      }
    })
  },
  getConfigureIndexModel: function () {
    var that = this;
    var uri = app.getPath.indexmodel;
    var data = {
      position: 2
    };
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res && res.data && res.data.success == 1) {
        if (res.data.result.new_user==0){
          common.toast('你已经是老用户啦，无法享受当前福利喔~')
        }
        var indexModel = res.data.result.lists;
        indexModel.forEach(function (model) {
          model.forEach(function (item) {
             // 增加优惠券总金额
            if (item.type == 1 && item.route.url == "coupon") {
              var total = 0;
              item.route.param.forEach(function (good) {
                total += parseInt(good.money);
              })
              item.route.total = total;
            }
            // 格式化商品
            if (item.type == 3 && item.goodscss==2){
              item.goods = that.rowFormat(3,item.goods);
            }
          })
        })

        // console.log(indexModel)
        that.setData({
          indexModel
        })
      }
    })
  },
  /**
     * 格式化一维数组为二维数组
     * colNum: 列数
     * arr：传入的总数组数
     * **/
  rowFormat(colNum, arr) {
    let FormatArr = [];
    let rowNum = arr.length / colNum;

    for (var i = 0; i < rowNum; i++) {
      FormatArr.push(new Array());
      for (var j = i * colNum; j < (colNum * (i + 1)); j++) {
        if (arr[j] != undefined) {
          FormatArr[i].push(arr[j]);
        }
      }
    }
    return FormatArr;
  },
  // 返回首页
  gotoHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 跳转商品页
  goToProduct(e) {
    var goodsid = e.currentTarget.dataset.goodsid;
    wx.navigateTo({
      url: '/pages/product/product?entryType=external&productId=' + goodsid
    })
  },
  // 跳转购物车
  toCart() {
    wx.switchTab({
      url: '/pages/cart/cart'
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
      // console.log(res.data.result)
      that.getConfigureIndexModel();
    })
  },
  // 一键领取
  akeyToGet(e) {
    // console.log(e.target.dataset.ad_id);
    // return
    // 跳转登录
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    var that = this;
    var param = e.target.dataset.param;
    var ad_id = e.target.dataset.ad_id;
    var coupon_id = [];
    param.forEach(function (item) {
      coupon_id.push(item.id);
    })
    var uri = app.getPath.addCoupon;
    var data = {
      coupon_id: coupon_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res && res.data && res.data.success == 1) {
        var result = res.data.result;
        common.toast(result.state_desc);
        if (result.state==0){
          that.adclose(ad_id,1)
        }
      }
    })
  },
  // 商详加入购物车移出
  currentAttrs: [],
  confirmData: {},
  // SKU弹窗
  setModalStatus: function (type) {
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
    setTimeout(function () {
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
  // 是否购物车有新人商品
  isnewpersongoods: function (goods_id, product_id) {
    var uri = app.getPath.isnewpersongoods;

    var data = {
      goods_id: goods_id,
      sku_key: product_id
    };
    return new Promise(function (resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function (res) {
        var data = res.data;
        if (data.success == 1) {
          var result = data.result.result;
          resolve(result)
        }
      })
    })

  },
  //添加到购物车
  addShopCart: function (e) {
    // 跳转登录
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    var that = this;
    console.log(e)
    // 判断sku是否立即购买
    this.setData({ buy_now: e.target.dataset.buynow })
    if (this.data.productid == e.target.dataset.productid) {
      addCart(e)
    } else {
      this.loadProductDetail(e).then(function () {
        addCart(e)
      })
    }

    function addCart(e) {
      if (!that.checkCanPurchase()) return;
      var product = that.data.itemData;
      var type = e.currentTarget.dataset.type;
      // type == 'addcart' && 
      if (that.currentAttrs.length == product.properties.length) {
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

        // 加入购物车前判断是否新人商品且是否替换新人商品
        var invurl = '';
        that.isnewpersongoods(product.goods_id, product_id).then(function (res) {
          if (res) {
            invurl = app.getPath.addCartnew;
            common.showModal('是否替换新人商品', '确定', function (res) {
              if (res.confirm) {
                _addcart()
              }
            })
          } else {
            invurl = app.getPath.addCart;
            _addcart()
          }
        })
        function _addcart(){
          // var invurl = app.getPath.addCart;
          // if (product.pre_info && product.pre_info.is_pre == 1) {
          //   invurl = app.getPath.addCart;
          // }
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
          common.ApiGateWayTest(invurl, invdata, true, function (ret) {
            if (!ret) return;
            if (ret.data.success != 0) {
              that.currentAttrs = []
              that.setData({
                cartAmount: ret.data.result.cart_num,
                productid: 0
              })
              common.toast(ret.data.msg)
              if (type == 'bottomcart') {
                // that.setModalStatus(e);
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
        }
        
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
  nowPurchase: function (e) {
    var that = this;
    // 跳转登录
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    // 判断sku是否立即购买
    this.setData({ buy_now: e.target.dataset.buynow })
    if (that.data.productid == e.target.dataset.productid) {
      nowPurchaseSub(e)
    } else {
      that.loadProductDetail(e).then(function () {
        nowPurchaseSub(e)
      })
    }
    // console.log(1)
    function nowPurchaseSub(e) {
      if (!that.checkCanPurchase()) return;
      var product = that.data.itemData;
      // that.setData({
      //   buy_now: 1
      // })
      if (that.currentAttrs.length == product.properties.length) {
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
          "商品名称": that.data.itemData.report.goods_name,
          "用户名": that.data.itemData.report.nick_name
        })
        common.formIdUpdate(e);
        common.ApiGateWayTest(invurl, invdata, true, function (ret) {
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
  loadProductDetail: function (e) {
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
    return new Promise(function (resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function (res) {

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
        } else {
          common.hideLoad(that);
          common.toast("获取购物车数量失败");
        }
        resolve('获取商详信息')
      })
      common.ApiGateWayTest(skuAmounturi, '', true, function (res) {
        if (res.statusCode == 200) {
          that.setData({
            cartAmount: res.data.result.cart_num
          })
        }
      })
    })

  },

  //设置默认SKU
  setDefaultSKU: function (product) {

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
        maybeStock[i].sort(function (a, b) {
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
      _goods_attr.sort(function (a, b) {
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
  set_choosed_sku: function () {
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
        stock.sort(function (a, b) {
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
  attrValueselest: function (e) {
    console.log('attrValueselest')
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
      attrs = attrs.filter(function (attr, index, self) {
        return self.indexOf(attr) === index;
      });
      attrs.sort(function (a, b) {
        return a - b;
      })
      if (attrs.length) {
        var key = attrs.join('_');
        for (var i = 0; i < product.stock.length; ++i) {
          var _goods_attr = product.stock[i].key.split('_');
          _goods_attr.sort(function (a, b) {
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
  setAttrsClass: function () {
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
  isPriceEqual: function () {
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
  changeNum: function (e) {
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
          common.ApiGateWayTest(invurl, invdata, true, function (ret) {
            if (!ret) return;
            if (ret.data.result.is_enough != 1) {
              console.log(ret.data.result.msg)
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
          common.ApiGateWayTest(invurl, invdata, true, function (ret) {
            if (!ret) return;
            if (ret.data.result.is_enough != 1) {
              // console.log(ret)
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
})