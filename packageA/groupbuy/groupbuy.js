//获取应用实例
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL:app.dataBase.iconURL,
    showRules: true,
    showSettingModalStatus: false,
    showStartTeamModal: false,
    showInTeamModal: false,
    found_id: '',
    pickup_id: '',
    teamFoundStatus: 0,
    teamFound: {},
    teamFollow: {},
    teamMsg:{},
    h: '00',
    m: '00',
    s: '00',
    order_id: "",
    team_id: 0,
    rule: {},
    teamLabel: {},
    teamList:[],
    duration: 500,
    interval: 5000,
    indexAdcurrent: 0,
    indicatorColor: "#fff",
    indicatorActiveColor: "#eb3c39",
    circular: true,
    autoplay: false,
    adList:[],
    indicatorDots:false,
    showModalStatus:false,
    canPurchase:false,
    showSKUstatus: 0,
    currentAttrs:[],
    choosed_sku: '',
    skuImages:'',
    itemData: {
      shop_type: 0
    },
    skuSvipCurrent:'',
    buynum: 1,
    team_sku_type:0,
  },
  //规则的显示隐藏
  showButton(e) {
    var that = this;
    common.formIdUpdate(e);
    this.setData({
      showRules: !that.data.showRules
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.showShareMenu({
      withShareTicket: true
    })
    if (options.teamType && options.teamType == 1){
      that.setData({
        showStartTeamModal: true
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
      entryData: options,
      found_id: options.found_id
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
      })
    }
    this.getAd();
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
            key: 'getpickup',
            data: {
              'pickup_id': res.pickup_id,
              'cityName': res.pickup_name,
              'pickup_address': res.pickup_address,
              'pickup_contact': res.pickup_contact,
              'pickup_phone': res.pickup_phone,
              'pickup_type': res.pickup_type
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getTeamRule();
    this.getGroupInfo();
    // 上报关系链-存在token才上报
    var token = common.getStorageSync('token');
    if (token && token != '') {
      common.setInviteShareLogin()
    }
  },
  //获取拼团详情
  getGroupInfo() {
    var that = this;
    var uri = app.getPath.teamFound;
    var data = {
      found_id: that.data.found_id
    }
    common.showLoad(this);
    common.ApiGateWayTest(uri, data, true, function(res) {
      var res = res.data;
      that.setData({
        teamMsg:res.result,
        teamFound: res.result.teamFound,
        teamFollow: res.result.teamFollow,
        teamLabel: res.result.teamBuyLimit,
        order_id: res.result.order_id,
        teamFoundStatus: res.result.status,
        team_id: res.result.team_id,
        skuSvipCurrent:res.result.teamFound.price,
        skuCurrent:res.result.teamFound.goods_price,
        buynum:res.result.teamFound.min_buy_amount,
      })
      that.getTeamList();
      that.setDefaultSKU(res.result.teamFound);
      if (res.result.teamFound.status == 1 && res.result.order_id == 0 && res.result.teamBuyLimit.follow_limit == 0 && res.result.teamBuyLimit.found_limit > 0){
        that.setData({
          showInTeamModal: true
        })
      }
      var now = new Date().getTime() / 1000;
      if (res.result.teamFound.found_end_time >= now){
        that.countTime(now, res.result.teamFound.found_end_time)
      }
      common.hideLoad(that);
      if(res.result.order_id!=0){
        let order_url=app.getPath.achieveOrder
        let achieve_data={
          order_id:res.result.order_id
        }
        common.ApiGateWayTest(order_url,achieve_data,true,function (resData) {
          if(resData.data.result.state==0){
            common.toast(resData.data.result.state_desc)
          }
        })
      }
    })
  },
  //获取广告图
  getAd: function() {
    var that = this;
    var uri = app.getPath.adlist;
    var data = {
      pid:8
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
  //获取拼团规则
  getTeamRule() {
    var that = this;
    var uri = app.getPath.teamRule;
    common.ApiGateWayTest(uri, '', true, function(res) {
      that.setData({
        rule: res.data.result.rule
      })
    })
  },
  //倒计时函数
  countTime: function(now, end) {
    var that = this;
    var leftTime = end - now;
    var d, h, m, s;
    var teamTime = setInterval(() => {
      leftTime = leftTime - 1
      if (leftTime >= 0) {
        d = Math.floor(leftTime / 60 / 60 / 24, 10); //计算剩余的天数
        h = Math.floor((leftTime / 60 / 60) % 24) + d * 24;
        m = Math.floor((leftTime / 60) % 60);
        s = Math.floor(leftTime % 60);
      } else {
        clearInterval(teamTime);
        that.getTeamRule();
        that.getGroupInfo();
        return false;
      }
      h = h > 9 ? h : ('0' + h);
      m = m > 9 ? m : ('0' + m);
      s = s > 9 ? s : ('0' + s);
      this.setData({
        h,
        m,
        s
      })
    }, 1000)

  },
  //获取拼团列表
  getTeamList(){
    var that=this;
    var url=app.getPath.teamList;
    var data={
      goods_id:that.data.teamFound.goods_id
    };
    common.ApiGateWayTest(url, data, true,function (res) {
      var res=res.data;
      if(res.success==1){
        if(res.result.data.length>2){
          that.setData({
            teamList:res.result.data.concat(res.result.data),
            team_num:res.result.data.length
          })
        }else{
          that.setData({
            teamList:res.result.data,
            team_num:res.result.data.length
          })
        }
      }
    })
  },
  //查看订单跳转
  showOrder(e) {
    common.formIdUpdate(e);
    var that = this;
    if (app.checkSessionKey) {
      wx.navigateTo({
        url: '../../packageA/user/detail?orderId=' + that.data.order_id + '&entryType=external'
      })
    } else {
      common.toast('未登录');
    }
  },
  // 返回首页
  gotoHome: function (e) {
    common.formIdUpdate(e);
      wx.switchTab({
        url: '/pages/index/index',
      })
  },
  //重新下单跳转
  payAgain(e) {
    common.formIdUpdate(e);
    var that=this;
    that.setData({
      showInTeamModal: false
    })
    if(that.data.teamFoundStatus == 1 || that.data.teamFoundStatus == 2){
      common.toast('拼团活动已结束');
    }else{
      wx.navigateTo({
        url: '/packageA/team-product/team-product?entryType=external&teamId=' + that.data.team_id
      })
    }
  },
  //分享工友埋点
  toShare(e) {
    common.formIdUpdate(e);
    setTimeout(()=>{
      this.setData({
        showStartTeamModal: false
      })
    },2000)
  },
  //一键参团
  toAddTeam(e) {
    var that = this;
    var teamFound = that.data.teamFound;
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    common.formIdUpdate(e);
    var checkOrderUri = app.getPath.preCheckOrder;
    var orderProduct = [{
      goods_id: teamFound.goods_id,
      sku_key: teamFound.sku_key,
      num: 1
    }]
    orderProduct = JSON.stringify(orderProduct);
    var checkOrderData = {
      order_product: orderProduct,
      team_order: 2,
      team_id: that.data.team_id,
      found_id: teamFound.found_id,
      time_atitude: app.dataBase.userAtitude,
    }
    common.ApiGateWayTest(checkOrderUri, checkOrderData, true, function (resData) {
      if (resData.data.success == 1) {
        // 缓存跳转确认订单页面
        var datas = [{
          goods_name: teamFound.goods_name,
          goods_id: teamFound.goods_id,
          sku_key: teamFound.sku_key,
          amount: 1,
          shop_price: teamFound.price,
          market_price: teamFound.goods_price,
          sku_key_name: teamFound.sku_key_name,
          sku_img: teamFound.sku_img,
          team_order: 2,
          team_id: that.data.team_id,
          found_id: teamFound.found_id
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
  },
  // 取消设置弹窗
  settingModalStatus: function () {
    this.setData({
      showSettingModalStatus: false
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
  /**
   * 用户分享
   */
  onShareAppMessage: function() {
    var that = this;
    return {
      title: that.data.teamFound.share_title,
      path: '/packageA/groupbuy/groupbuy?pickup_id=' + that.data.teamFound.pickup_id + '&found_id=' + that.data.teamFound.found_id + '&user_id=' + that.data.teamMsg.user_id,
      imageUrl: that.data.teamFound.share_img
    }
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
    // this.setData({
    //   canPurchase: this.checkCanPurchase()
    // })
    var min_sku_price = 9999999999;
    var min_sku_svip_price = 9999999999;
    for (var i = 0; i < product.stock.length; ++i) {
      var _goods_attr = product.stock[i].key.split('_');
      var _min_sku_price = product.stock[i].market_price,
          _min_sku_svip_price = product.stock[i].price;
      var hasDefaultFlag = false;

      if (min_sku_svip_price > _min_sku_svip_price) {
        var ids = [];
        if (product.is_goods_number > 0 && that.data.teamFoundStatus == 0 && product.stock[i].is_enough) { //商品能购买，并且该sku有库存 则更新最低价
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
        } else if (!product.is_goods_number > 0 || that.data.teamFoundStatus == 1) { //商品不能购买，则一定更新最低价，否则就是9999999999
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
    var skuSvipCurrent = this.data.teamFound.price;
    var skuCurrent = this.data.teamFound.goods_price;
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
  // 开团SKU
  delegation: function (e) {
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    if (!this.checkCanPurchase()) return;
    var that = this;
    if (that.data.itemData.shop_type == 1) {
      that.setzjModalStatus(e);
      return;
    }
    var product = that.data.teamFound;
    if (that.currentAttrs.length == product.properties.length && product.max_buy_amount < 2 || (that.data.team_sku_type == 1 && that.currentAttrs.length == product.properties.length)) {
      // 验证库存
      if (product.stock.length == 0) {
        common.toast('库存不足');
        return false
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

      var invurl = app.getPath.skuEnough;
      if (product.pre_info && product.pre_info.is_pre == 1) {
        invurl = app.getPath.skuEnough;
      }
      var invdata = {
        goods_id: product.goods_id,
        sku_key: product_id,
        amount: that.data.buynum
      };
      common.formIdUpdate(e);
      common.showLoad(this);
      common.ApiGateWayTest(invurl, invdata, true, function (ret) {
        if (!ret) return;
        if (ret.data.result.is_enough != 1) {
          common.hideLoad(that);
          common.toast(ret.data.result.msg);
          return;
        } else {
          // showSKUstatus 0关闭  1展开  重置为关闭
          that.setData({
            showModalStatus: false,
            showSKUstatus: 0
          });
          next(e)
        }
      })
    } else {
      if (that.data.showSKUstatus == 0) {
        that.setModalStatus();
        that.data.team_sku_type=1
        that.setData({
          showfwModalStatus: false,
          showShareModalStatus: false,
          showBonusModal: false
        })
      } else {
        common.toast('请选择商品款式');
      }
    }
    function next() {
      var checkOrderUri = app.getPath.preCheckOrder;
      var orderProduct = [{
        goods_id: that.confirmData[0].goods_id,
        sku_key: that.confirmData[0].sku_key,
        num: that.confirmData[0].amount
      }]
      orderProduct = JSON.stringify(orderProduct);
      var checkOrderData = {
        order_product: orderProduct,
        team_order: (that.data.teamFound.status==1 && that.data.order_id==0)?2:1,
        team_id: that.data.team_id,
        time_atitude: app.dataBase.userAtitude
      }
      common.ApiGateWayTest(checkOrderUri, checkOrderData, true, function (resData) {
        common.hideLoad(that);
        if (resData.data.success == 1) {
          that.confirmData[0]['team_order'] = (that.data.teamFound.status==1 && that.data.order_id==0)?2:1;
          that.confirmData[0]['team_id'] = that.data.team_id;
          if(that.data.teamFound.status==1 && that.data.order_id==0){
            that.confirmData[0]['found_id'] = that.data.teamFound.found_id;
          }
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
    var product = this.data.teamFound;
    var required = false;
    if (!product.stock || product.stock.is_enough == 0) {
      common.toast("抱歉，商品已售罄")
      return false
    }
    if (this.data.teamFoundStatus==1) {
      common.toast("抱歉，活动已结束")
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
    return true
  },
  // SKU弹窗
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
  setModalStatus: function (type) {
    var that = this;
    if (this.data.showSKUstatus == 0) {
      this.data.showSKUstatus = 1;
    } else {
      this.data.showSKUstatus = 0;
    }
    var animation = wx.createAnimation({
      duration:250,
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
    setTimeout(function () {
      if (that.data.iphoneXBottom == "68rpx") {
        animation.translateY(-34).step()
      } else {
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
  // 加减
  changeNum: function (e) {
    var that = this;
    common.formIdUpdate(e);
    var product = that.data.teamFound;
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
        if (that.data.buynum <= that.data.teamFound.min_buy_amount) {
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
        if (that.data.teamFound.max_buy_amount != 0 && that.data.buynum >= that.data.teamFound.max_buy_amount) {
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
  //设置choosed_sku
  set_choosed_sku: function () {
    var that = this;
    var product = that.data.teamFound;
    if (that.currentAttrs.length < product.properties.length) {
      that.data.sku_price = that.data.min_sku_price;
      that.data.sku_svip_price = that.data.min_sku_svip_price;
      that.setData({
        choosed_sku: '选择：商品规格',
        skuImages: product.sku_img,
        skuSvipCurrent: that.data.teamFound.price,
        skuCurrent: that.data.teamFound.price
      });
      that.setAttrsClass();
      return;
    }
    var choosed_sku = '';
    var sku_price = 0;
    var sku_svip_price = 0;
    var skuSvipCurrent = that.data.teamFound.price;
    var skuCurrent = that.data.teamFound.price;
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
    var product = this.data.teamFound;
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
    var product = this.data.teamFound;
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
      teamFound: product
    })
  },
});
