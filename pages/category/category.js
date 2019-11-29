
var app = getApp();
var common = require("../../utils/common.js");
var icon_url = app.dataBase.iconURL;

Page({
  data: {
    iconURL: app.dataBase.iconURL,
    sort:0,
    order:1,
    currType: 1,
    page: 1,
    page_size: 10,
    good_list:[],
    topFixed: false,

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
  onLoad: function (option) {
    var that = this;
    that.getData();
    //  定位检测
    that.local(function (city) {
      var data = {
        city: city,
        isAuthorization: true
      }
      // 判断是否有定位和仓库
      if (that.data.isAuthorization && city.warehouse_id != -1) {
        data.showPage = true;
        that.setData(data);

      } else {
        data.showPage = false;
        that.setData(data);
        return false;
      }
    })
  },
  onShow:function(){
    var that = this;
    var pickupId = common.getStorageSync('getpickup');
    app.aldstat.sendEvent("get_category", {
      "提货点": pickupId.cityName
    });
    if (app.dataBase.isRefresh) {
      var that = this;
      // 重置数据，避免下拉加载列表加载原先数据
      that.setData({
        sort: 0,
        order: 1,
        currType: 1,
        page: 1,
        good_list: [],
        topFixed: false
      })
      that.getData();
      //  定位检测
      that.local(function (city) {
        var data = {
          city: city,
          isAuthorization: true
        }
        // 判断是否有定位和仓库
        if (that.data.isAuthorization && city.warehouse_id != -1) {
          data.showPage = true;
          that.setData(data);

        } else {
          data.showPage = false;
          that.setData(data);
          return false;
        }
      })
      app.dataBase.isRefresh = false;
    }
  },
  getData:function(){
    var that = this;
    that.getcategoryNav().then(function (result) {
      that.getbrandList(that.data.currType);
    });
  },
  // 定位检测
  local: function (callback) {
    var that = this;
    that.setData({
      isAuthorization: common.getStorageSync('authSetting')['scope.userLocation']
    })
    var city = common.getStorageSync('city');
    var pickup = common.getStorageSync('getpickup');
    if (app.firstlaunchApp && city.warehouse_id == undefined) {
      // 进入app后首次打开当前页面   没仓库的情况下 先获取地理定位
      if (that.data.isAuthorization) {
        // 增加加载，防止未加载完就点击
        common.showLoad(that)
      }
      common.getpickup(function (res) {
        var city = res.cities;
        (callback && typeof (callback) === "function") && callback(city);
        common.hideLoad(that)
      })

    } else {
      // 有自提点的情况下，直接 取自提点 不重新请求
      // 第二次进入当前页（从选择定位页面进入），直接用仓库地址请求数据
      (callback && typeof (callback) === "function") && callback(city);
    }
  },
  // 打开定位回调
  openSet: function (e) {
    var that = this;
    that.setData({
      isAuthorization: e.detail.isAuthorization
    })
    common.setStorageSync('reLoad', true);
    app.dataBase.isRefresh = true;
    that.onShow()
  },
  // 跳转指定专题页
  goWebView: function (e) {
    common.goAdWebView(e);
  },
  // 获取分类导航
  getcategoryNav: function(){
    var that = this;
    var uri = app.getPath.categorynav;
    return new Promise(function (resolve, reject) {
      common.ApiGateWayTest(uri, '', true, function (res) {
        
        if (res.statusCode == 200) {
          var res = res.data.result;
          that.setData({
            types: res,
            currType: res[0].cat_id
          })
          resolve('getcategoryNavSuccess');
        }
      })
    })
  },
  // 商品列表
  getbrandList:function(){
    var that = this;
    var uri = app.getPath.categoodslist;
    var data = {
      cat_id: that.data.currType,
      page: that.data.page,
      page_size: that.data.page_size,
      sort: that.data.sort,
      order: that.data.order
    }
    common.showLoad(that);
    common.ApiGateWayTest(uri, data, true, function (res) {
      common.hideLoad(that);
      if (res.data.errorCode != 0) {
        var res = res.data.result;
        if(res.lists.length==0){
          common.toast('没有更多商品~');
        }
        that.setData({
          typeTree: res,
          good_list:[...that.data.good_list,...res.lists]
        })
      }else{
        that.setData({
          typeTree: []
        })
      }
    })
  },
  sortTypes:function(e){
    var sort = Number(e.currentTarget.dataset.sort);
    var order = this.data.order;
    if(sort==2){
      order = order==1 ? 2 : 1;
    }
    this.setData({
      sort,
      order,
      page:1,
      good_list: []
    })
    this.getbrandList();
  },
  // 二级商品分类列表
  // getgoodsCategory: function(id){
  //   var that = this;
  //   var uri = app.getPath.goodscategory;
  //   var data = {
  //     page: that.data.page,
  //     page_size: that.data.page_size,
  //     cat_id: id
  //   }
  //   common.ApiGateWayTest(uri, data, true, function (res) {
  //     if (res.statusCode == 200) {
  //       var res = res.data.result;
  //       that.setData({
  //         typeTree: res.data
  //       })
  //     }
  //   })
  // },
  // 选择分类
  tapType: function (e) {

    var that = this;
    var item = e.currentTarget.dataset.item;
    if (item.cat_id) {
      that.setData({
        currType: item.cat_id,
        good_list:[],
        page:1,
        sort:0,
        order:2
      })
      that.getbrandList(that.data.currType);
    }
    // if(item.brand_id){
    //   that.setData({
    //     currType: item.brand_id
    //   })
    //   that.getbrandList(that.data.currType);
    // }else{
    //   that.setData({
    //     currType: item.cat_id
    //   })
    //   that.getgoodsCategory(that.data.currType);
    // }
  },
  // 上拉加载更多
  onReachBottom: function () {
    var that = this;
    if (that.data.good_list && that.data.typeTree.total != that.data.good_list.length) {
      this.setData({
        page: that.data.page + 1
      })
      that.getbrandList();
    }
  },
  // 滚动
  scrollEvent:function(e){
    var top = e.detail.scrollTop;
    if(top>60){
      this.setData({topFixed:true})
    }else{
      this.setData({ topFixed: false })
    }
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
  // setModalStatus: function (type) {
  //   if (this.data.showSKUstatus == 0) {
  //     this.data.showSKUstatus = 1;
  //   } else {
  //     this.data.showSKUstatus = 0;
  //   }
  //   var animation = wx.createAnimation({
  //     duration: 300,
  //     timingFunction: "linear",
  //     delay: 0
  //   })

  //   animation.translateY(300).opacity(1).step();

  //   this.setData({
  //     animationData: animation.export()
  //   })

  //   if (this.data.showSKUstatus == 1) {

  //     this.setData({
  //       showModalStatus: true
  //     });
  //   }
  //   setTimeout(function () {
  //     animation.translateY(0).step()
  //     this.setData({
  //       animationData: animation
  //     })
  //     if (this.data.showSKUstatus == 0) {
  //       this.setData({
  //         showModalStatus: false
  //       });
  //     }
  //   }.bind(this), 200)
  // },
  //添加到购物车
  addShopCart: function (e) {
    // 跳转登录
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    var that = this;
    // 判断sku是否立即购买
    this.setData({ buy_now: e.target.dataset.buynow})
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
        common.ApiGateWayTest(invurl, invdata, true, function (ret) {
          if (!ret) return;
          if (ret.data.success != 0) {
            that.currentAttrs = []
            that.setData({
              cartAmount: ret.data.result.cart_num,
              productid:0
            })
            common.toast(ret.data.msg)
            if (type == 'bottomcart') {
              // that.setModalStatus(e);
              that.setData({
                showModalStatus: false,
                showSKUstatus:0
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
  // 跳转商品页
  goToProduct(e) {
    var goodsid = e.currentTarget.dataset.goodsid;
    if (app.checkSessionKey) {
      common.formIdUpdate(e);
    }
    wx.navigateTo({
      url: '/pages/product/product?entryType=external&productId=' + goodsid
    })
  },
  // 下拉刷新
  // refresh: function (e) {
  //   var that = this;
  //   setTimeout(function () {
  //     wx.startPullDownRefresh()
  //     that.setData({
  //       good_list: [],
  //       page: 1,
  //       hideHeader: false
  //     })
  //     that.getbrandList(that.data.currType);
  //   }, 300);
  // }
})