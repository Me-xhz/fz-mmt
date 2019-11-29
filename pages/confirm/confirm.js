// pages/confirm/confirm.js
var app = getApp();
var common = require("../../utils/common.js");
Page({
  data: {
    temporarye: {},
    newlocal: "",
    isPayShow: false,
    isNewUser: false,
    iconURL: app.dataBase.iconURL,
    showDialog: false,
    order_confirm_show: false,
    selectedGoods: {},
    // 默认地址
    consignee: {
      consignee: "" 
    },
    isTopaydis: false,
    //商品信息
    productInfo: {},
    // 后台筛选返回后商品信息
    order_info: {
      firstGoods: [],
      secondGoods: []
    },
    orderSn: "",
    //发票信息
    invoiceData: {},
    //地址
    cashgift: {},
    //去支付默认
    canPurchase: false,
    // 优惠券展示
    showBonusModal: false,
    // 可领取优惠券展示
    showGetBonusModal: false,
    tip_show: {
      tip1: true,
      tip2: true
    },
    // 是否从缓存里读取地址
    storageAddr: false,
    // 是否需要修改地址
    isEditAddr: false,
    // 可领取优惠券
    bounsList: [],
    // 可用优惠券
    cashgifts: [],
    // 不可用优惠券
    noCashgifts: [],
    // 是否绑定手机号
    is_bind_moble: 1,
    //是否周六下单  0否 1是
    is_saturday: 0,
    // //是否下单弹出通知框
    // order_confirm_notice: false,
    // 送达日期
    special_day_text: '送达时间'
  },

  onLoad: function (options) {
    var that = this;
    // 检测是否是新手
    common.showLoad(that);
    // this.weekShippingAd();
    this.checkUser();
    this.getPreData();
    app.aldstat.sendEvent("进入确认订单");
    // 判断用户是否绑定手机号
    // var url = app.getPath.checkMobile;
    // common.ApiGateWayTest(url,'',true,function(res){
    //   var resData = res.data;
    //   if(resData.success == 1){
    //     that.setData({
    //       is_bind_moble: resData.result.is_bind_moble
    //     })
    //   }
    // })
  },
  onShow: function () {
    var that = this;
    var data = common.getStorageSync('nowPay');
    if (data == undefined || data == '') {
      common.toast("请求参数错误");
      return;
    }
    Promise.all([this.getaddresslist(), this.getOrderCouponList(), this.getBounsList()]).then(function (val) {
      that.getcheckOrderinfo()
    })
  },

  // 去地图
  goMap: function (e) {
    var url = e.currentTarget.dataset.url;
    var pickup_img = e.currentTarget.dataset.pickup_img;
    common.setStorage({
      key: 'pickup_img',
      data: pickup_img,
    }, function (res) {
      wx.navigateTo({
        url: url
      })
    })
  },
  // 判断用户是否为黑名单
  checkUser: function () {
    var that = this;
    var uri = app.getPath.checkUser;
    common.ApiGateWayTest(uri, '', true, function (res) {
      if (res.data.success == 1) {
        return
      } else {
        wx.showModal({
          title: '用户禁用下单提示',
          content: res.data.msg,
          confirmText: '确定',
          confirmColor: '#eb3c39',
          showCancel: false,
          cancelColor: '#030303',
          success(res) {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      }
    })
  },
  // 提示显示隐藏
  isShow: function (e) {
    var name = e.currentTarget.dataset.name;
    var tip_show = this.data.tip_show;
    tip_show[name] = false;
    this.setData({
      tip_show
    })
  },
  getPreData: function () {
    var that = this;
    // 缓存数据
    var productInfo = common.getStorageSync('nowPay');
    var order_product = [];
    // 将商品转为后台所需json字符串
    for (var i in productInfo) {
      order_product.push({
        goods_id: productInfo[i].goods_id,
        sku_key: productInfo[i].sku_key,
        num: productInfo[i].amount
      })
    }
    order_product = JSON.stringify(order_product);
    that.setData({
      productInfo: productInfo,
      order_product: order_product,
      'order_info.firstGoods': productInfo
    });
    this.cartBuyCheck();
  },
  // 获取地理位置
  getaddresslist: function () {
    var that = this;
    var addressUri = app.getPath.getaddresslist;
    var addressData = {
      is_default: '1'
    }

    // 地理位置请求
    return new Promise(function (resolve, reject) {
      common.ApiGateWayTest(addressUri, addressData, true, function (res) {
        if (res.statusCode == 200) {
          var res = res.data.result.consignees;
          if (that.data.consignee && that.data.consignee.address_id) {

            that.setData({
              consignee: that.data.consignee,
              storageAddr: false
            })
          } else {
            if (res.length > 0) {
              that.setData({
                consignee: res[0],
                storageAddr: false
              })
            } else {
              // 无地址时，取缓存自提点地址
              common.getStorage({
                key: 'getpickup',
              }, function (res) {
                if (res.data.pickup_id && res.data.pickup_id > 0) {
                  that.setData({
                    consignee: res.data,
                    storageAddr: true
                  })
                }
              })
              resolve('无地址')
              return;
            }
          }
          resolve('getAddress success')
        }

      })
    })

  },
  // 新增收货地址
  addAddress: function (callback) {
    var that = this;
    var reg = /^[0-9]{11}$/;
    if (that.data.consignee.consignee == undefined || that.data.consignee.consignee == '') {
      common.toast('请输入提货人姓名');
      return;
    }
    if (!reg.test(this.data.consignee.mobile)) {
      common.toast('请输入正确的手机号');
      return;
    };
    var uri = app.getPath.addaddress;
    var data = {
      consignee: that.data.consignee.consignee,
      mobile: that.data.consignee.mobile,
      pickup_id: that.data.consignee.pickup_id,
      is_default: 1
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res && res.data.success == 1) {
        var res = res.data.result;

        that.setData({
          consignee: res.consignees
        });
        (callback && typeof (callback) === "function") && callback();
      }

    })
  },
  // 修改收货地址
  editAddress: function (callback) {
    var that = this;
    var reg = /^[0-9]{11}$/;
    if (that.data.consignee.consignee == undefined || that.data.consignee.consignee == '') {
      common.toast('请输入提货人姓名');
      return;
    }
    if (!reg.test(this.data.consignee.mobile)) {
      common.toast('请输入正确的手机号');
      return;
    };
    that.data.isEditAddr = false;
    var uri = app.getPath.alteraddress;
    var data = {
      consignee: that.data.consignee.consignee,
      mobile: that.data.consignee.mobile,
      address_id: that.data.consignee.address_id,
      pickup_id: that.data.consignee.pickup_id,
      is_default: that.data.consignee.is_default
    }

    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res && res.data.success == 1) {
        var res = res.data.result;
        (callback && typeof (callback) === "function") && callback();
      }
    })
  },
  // 输入框双向绑定
  editInput: function (e) {
    var keyName = e.target.dataset.keyname;
    var val = e.detail.value;
    var consignee = this.data.consignee;
    consignee[keyName] = val;
    this.data.isEditAddr = true;
    this.setData({
      consignee
    })
  },

  // 获取信息接口
  getcheckOrderinfo: function () {
    var that = this;
    common.showLoad(that);
    // 当前仓库
    var city = common.getStorageSync('city');
    var uri = app.getPath.checkOrderInfo;
    if (that.data.coupon_id == undefined) {
      that.data.coupon_id = 0;
      // that.data.coupon_id = that.data.cashgift.id;
    }
    if (that.data.selectedGoods.use_balance == undefined) {
      that.data.selectedGoods.use_balance = 1;
    }
    if (that.data.consignee.address_id == undefined) {
      that.data.consignee.address_id = 0;
    }
    // 确认订单接口提交数据
    var data = {
      coupon_id: that.data.coupon_id,
      address_id: that.data.consignee.address_id,
      use_balance: that.data.selectedGoods.use_balance,
      order_product: that.data.order_product,
      team_order: that.data.productInfo[0].team_order ? that.data.productInfo[0].team_order : 0,
      channel: that.data.productInfo[0].channel ? that.data.productInfo[0].channel : 0,
      team_id: that.data.productInfo[0].team_id ? that.data.productInfo[0].team_id : 0,
      found_id: that.data.productInfo[0].found_id ? that.data.productInfo[0].found_id : '',
      activity_bargaining_id: that.data.productInfo[0].activity_bargaining_id ? that.data.productInfo[0].activity_bargaining_id : '',
      activity_bargain_id: that.data.productInfo[0].activity_bargain_id ? that.data.productInfo[0].activity_bargain_id : '',
    };

    // 获取确认订单信息
    return new Promise(function (resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function (res) {
        if (res.statusCode == 200) {
          var res = res.data.result;
          that.setData({
            selectedGoods: res,
            cashgift: res.coupon_info,
            coupon_id: res.coupon_info.id,
            order_info: res.order_info,
            special_day_text: !res.special_day_text.length ? '次日达' : res.special_day_text
          }, () => {
            common.hideLoad(that);
          })
          for (var i in res.order_info.firstGoods) {
            app.aldstat.sendEvent("点击下单", {
              "商品名称": res.order_info.firstGoods[i].goods_name
            })
          }
          for (var i in res.order_info.secondGoods) {
            app.aldstat.sendEvent("点击下单", {
              "商品名称": res.order_info.secondGoods[i].goods_name
            })
          }
        }
        var btn = true;
        var order_info = that.data.order_info;
        order_info.firstGoods.forEach(function (item) {
          if (item.is_disable == 1 || item.is_enough == 0 || item.is_on_sale == 0) {
            btn = false;
          }
        })
        order_info.secondGoods.forEach(function (item) {
          if (item.is_disable == 1 || item.is_enough == 0 || item.is_on_sale == 0) {
            btn = false;
          }
        })
        // that.data.consignee && that.data.consignee.address_id
        if (btn) {
          that.setData({
            canPurchase: true
          })
        } else {
          that.setData({
            canPurchase: false
          })
          wx.showModal({
            content: '商品被抢光咯，小提正在补货中喔~',
            showCancel: false,
            confirmText: '取消',
            confirmColor: '#575757'
          })
        }
        resolve('getcheckOrderinfo success')
      })
    })
  },
  // 地址选择
  touchAddress: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/address/addressList/addressList?from=confirm',
    })
  },
  // 新增地址
  newAddress: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/address/address',
    })
  },
  // 优惠券选择
  touchCashgift: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;

    if (that.data.coupon_id == id) {
      that.setModalBonus();
      return false;
    } else {
      that.data.coupon_id = id;
      that.getcheckOrderinfo();
    }
    that.setModalBonus();
  },
  // 优惠券列表信息
  getOrderCouponList: function () {
    var that = this;
    var uri = app.getPath.ordercouponList;
    var data = {
      order_product: that.data.order_product,
      team_order: that.data.productInfo[0].team_order ? that.data.productInfo[0].team_order : 0,
      team_id: that.data.productInfo[0].team_id ? that.data.productInfo[0].team_id : 0,
      activity_bargaining_id: that.data.productInfo[0].activity_bargaining_id ? that.data.productInfo[0].activity_bargaining_id : '',
    }
    return new Promise(function (resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function (res) {
        if (res.data.errorCode != 1) {
          var res = res.data.result;
          that.setData({
            cashgifts: res.lists,
            noCashgifts: res.no_lists
          })
          resolve('getOrderCouponList')
        } else {
          common.toast(res.data.msg)
        }
      })
    })
  },
  // 可领取优惠券信息
  getBounsList: function () {
    var that = this;
    var uri = app.getPath.canGetCouponList;
    var data = {
      order_product: that.data.order_product,
      team_order: that.data.productInfo[0].team_order ? that.data.productInfo[0].team_order : 0,
      team_id: that.data.productInfo[0].team_id ? that.data.productInfo[0].team_id : 0,
      activity_bargaining_id: that.data.productInfo[0].activity_bargaining_id ? that.data.productInfo[0].activity_bargaining_id : '',
    }
    return new Promise(function (resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function (res) {
        if (res.data.errorCode != 1) {
          var res = res.data.result;
          that.setData({
            bounsList: res.lists
          })
          resolve('getBounsList')
        } else {
          common.toast(res.data.msg)
        }
      })
    })
  },
  // 点击领取优惠券
  getBouns: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var uri = app.getPath.addCoupon;
    var data = {
      coupon_id: id
    }
    common.ApiGateWayTest(uri, data, true, res => {
      var resData = res.data;
      if (resData.success == 1) {
        that.getBounsList();
        that.getOrderCouponList();
        common.toast(resData.result.state_desc);
      } else {
        common.toast(resData.result.state_desc);
        return;
      }
    })
  },
  // 可领取优惠券-去使用
  onSetBouns: function () {
    var that = this;
    that.data.coupon_id = 0;
    that.getModalBonus();
    that.getcheckOrderinfo();
    that.getOrderCouponList();
  },
  //发票
  // touchInvoice: function () {
  //   var newData;
  //   if (this.data.invoiceData) {
  //     newData = JSON.stringify(this.data.invoiceData)
  //   } else {
  //     newData = undefined;
  //   }
  //   wx.navigateTo({
  //     url: './invoice/invoice?invoiceData=' + newData
  //   })
  // },
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
  // 已领取优惠券弹窗
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
  refreshOrderPrice: function () {

  },
  // 可领取优惠券弹窗
  getModalBonus: function () {
    if (this.data.showGetBonusModal == 0) {
      this.data.showGetBonusModal = 1;
    } else {
      this.data.showGetBonusModal = 0;
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

    if (this.data.showGetBonusModal == 1) {

      this.setData({
        showGetBonusModal: true,
        showBonusModal: false
      });
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (this.data.showGetBonusModal == 0) {
        this.setData({
          showGetBonusModal: false
        });
      }
    }.bind(this), 200)
  },
  //  是否使用余额
  use_balance: function () {
    var that = this;
    var selectedGoods = this.data.selectedGoods;
    if (selectedGoods.use_balance == 1) {
      selectedGoods.use_balance = 0
    } else {
      selectedGoods.use_balance = 1
    }
    that.setData({
      selectedGoods
    })
    // 重新获取信息
    that.getcheckOrderinfo();
  },
  // 留言
  refreshComment: function (event) {
    var value = event.detail.value;
    this.setData({
      user_note: value
    })
  },
  // 检测新人礼包
  cartBuyCheck: function (callback) {
    var that = this;
    var uri = app.getPath.cartBuyCheck;
    var data = {
      order_product: that.data.order_product
    }
    common.ApiGateWayTest(uri, data, true, function (res) {

      if (res.data.success == 1) {

        if (res.data.result.state == 1) {
          wx.showModal({
            title: '',
            content: res.data.result.msg,
            showCancel: false,
            confirmText: '确认',
            confirmColor: '#eb3c39',
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              }
              // (callback && typeof (callback) === "function") && callback(res);
            }
          })
          // common.showModal(res.data.result.msg);
        }
      }
    })
  },
  cancal: function () {
    this.setData({
      isPayShow: false
    })
  },
  confim: function () {
    this.setData({
      isPayShow: false
    })
    this.showConfirm(this.data.temporarye)
  },
  // 增加一个弹窗 组件化  测试用户是否在当前厂区范围内
  // isNewLocation
  isNewLocation: function (e) {
    var _this = this
    common.isNewUser({ time_atitude: app.dataBase.userAtitude,pickup_id: _this.data.consignee.pickup_id }, (res) => {
      let newlocal = common.getStorageSync('getpickup').cityName
      if (res) {
        _this.setData({
          isPayShow: true,
          temporarye: e,
          newlocal: _this.data.consignee.address  || newlocal
        })
      } else {
        _this.showConfirm(e)
      }
    })
  },

  // 显示支付弹窗
  showConfirm: function (e) {
    var that = this;
    common.getStorage({
      key: 'getpickup',
    }, function (res) {
      if (res.data.pickup_id && res.data.pickup_id > 0) {
        var reg = /^[0-9]{11}$/;
        if (that.data.consignee.consignee == undefined || that.data.consignee.consignee == '') {
          common.toast('请输入提货人姓名');
          return;
        }
        if (!reg.test(that.data.consignee.mobile)) {
          common.toast('请输入正确的手机号');
          return;
        };
        that.beforeSubmit();
      } else {
        that.touchSubmit(e);
      }
    })
  },
  // 隐藏支付弹窗
  hideConfirm: function (e) {
    common.formIdUpdate(e);
    this.setData({
      order_confirm_show: false
    })
  },
  // 支付前地址分析
  beforeSubmit: function (e) {
    // 没收货地址，从缓存取到地址
    var that = this;
    if (this.data.storageAddr) {
      that.setData({
        order_confirm_show: true
        // order_confirm_notice: true
      })
      that.addAddress(function () {
        that.getaddresslist()
      })
    } else {
      if (this.data.isEditAddr == true) {
        that.editAddress(function () {
          that.setData({
            order_confirm_show: true
            // order_confirm_notice: true
          })
        })
      } else {
        that.setData({
          // order_confirm_notice: true
          order_confirm_show: true
        })
      }
    }
  },

  // 去支付1
  touchSubmit: function (e) {
    var that = this;
    var productInfo = that.data.productInfo;
    var uri = app.getPath.confirmOrder;
    var carturi = app.getPath.confirmCartOrder;
    if (that.data.consignee && !that.data.consignee.address_id) {
      var content = '您还未设置收货地址';
      var confimText = '去设置';
      common.showModal(content, confimText, function (res) {
        if (res.confirm) {
          that.newAddress()
        } else {
          return
        }
      })
    } else {
      common.showLoad(that);
      if (that.data.selectedGoods.coupons_can_use == 0) {
        that.data.coupon_id = -1;
      }
      var data = {
        coupon_id: that.data.coupon_id,
        address_id: that.data.consignee.address_id,
        // shipping_code: that.data.selectedGoods.shipping_info.code,
        cart_ids: [],
        payment_code: that.data.selectedGoods.payment_code[0],
        // invoice_content: that.data.invoiceData.companyName == undefined ? '' : that.data.invoiceData.companyName,
        // invoice_type: that.data.invoiceData.type == undefined ? '' : that.data.invoiceData.type,
        // invoice_title: that.data.invoiceData.upId == undefined ? '' : that.data.invoiceData.upId,
        // taxpayer: that.data.invoiceData.taxesCode == undefined ? '' : that.data.invoiceData.taxesCode,
        user_note: that.data.user_note == undefined ? '' : that.data.user_note,
        use_balance: that.data.selectedGoods.use_balance,
        time_atitude: app.dataBase.userAtitude,
        team_order: productInfo[0].team_order ? productInfo[0].team_order : 0,
        channel: productInfo[0].channel ? productInfo[0].channel : 0,
        team_id: productInfo[0].team_id ? productInfo[0].team_id : 0,
        found_id: productInfo[0].found_id ? productInfo[0].found_id : '',
        activity_bargaining_id: productInfo[0].activity_bargaining_id ? productInfo[0].activity_bargaining_id : '',
        activity_bargain_id: productInfo[0].activity_bargain_id ? productInfo[0].activity_bargain_id : '',
      }
      for (var i in productInfo) {
        if (productInfo[i].cart_id && productInfo[i].cart_id > 0) {
          data.cart_ids.push(productInfo[i].cart_id);
        }
      }
      common.formIdUpdate(e);
      if (!that.data.isTopaydis) {
        that.data.isTopaydis = true;
        if (data.cart_ids && data.cart_ids.length > 0) {
          // 从购物车进入
          if (that.data.orderSn == "") {
            common.ApiGateWayTest(carturi, data, true, function (res) {
              if (res.data.success == 1) {
                var res = res.data.result;
                that.data.orderSn = res.order_id;
                var payUri = app.getPath.doPay;
                var payData = {
                  order_id: res.order_id,
                  payment_code: that.data.selectedGoods.payment_code[0]
                }
                that.data.isTopaydis = false;
                if (res.status == 1) {
                  common.hideLoad(that);
                  for (var i in that.data.order_info.firstGoods) {
                    app.aldstat.sendEvent("支付成功", {
                      "商品名称": that.data.order_info.firstGoods[i].goods_name
                    })
                  }
                  for (var i in that.data.order_info.secondGoods) {
                    app.aldstat.sendEvent("支付成功", {
                      "商品名称": that.data.order_info.secondGoods[i].goods_name
                    })
                  }
                  // 直接用账户余额支付
                  wx.redirectTo({
                    url: './paymentStatus/paymentStatus?order_id=' + payData.order_id + '&consignee=' + JSON.stringify(that.data.consignee) + '&payment_code=' + payData.payment_code,
                  })
                } else {
                  common.hideLoad(that);
                  // 下单成功，调用支付
                  common.ApiGateWayTest(payUri, payData, true, function (res) {
                    if (res.data.success == 1) {
                      var data = res.data.result;
                      common.doWechatPay(data, function (res) {
                        for (var i in that.data.order_info.firstGoods) {
                          app.aldstat.sendEvent("支付成功", {
                            "商品名称": that.data.order_info.firstGoods[i].goods_name
                          })
                        }
                        for (var i in that.data.order_info.secondGoods) {
                          app.aldstat.sendEvent("支付成功", {
                            "商品名称": that.data.order_info.secondGoods[i].goods_name
                          })
                        }
                        // wx.redirectTo({
                        //   url: './paymentStatus/paymentStatus?order_id=' + payData.order_id + '&consignee=' + JSON.stringify(that.data.consignee) + '&payment_code=' + payData.payment_code,
                        // })
                      }, function (failres) {
                        for (var i in that.data.order_info.firstGoods) {
                          app.aldstat.sendEvent("支付失败", {
                            "商品名称": that.data.order_info.firstGoods[i].goods_name
                          })
                        }
                        for (var i in that.data.order_info.secondGoods) {
                          app.aldstat.sendEvent("支付失败", {
                            "商品名称": that.data.order_info.secondGoods[i].goods_name
                          })
                        }
                        // common.toast("支付失败");
                      }, function (completeres) {
                        // + '&payment_type=true'
                        wx.redirectTo({
                          url: './paymentStatus/paymentStatus?order_id=' + payData.order_id + '&consignee=' + JSON.stringify(that.data.consignee) + '&payment_code=' + payData.payment_code,
                        })
                      })
                    } else {
                      common.toast(res.data.msg);
                      that.data.isTopaydis = false;
                      return
                    }
                  })
                }
              } else {
                common.toast(res.data.msg);
                that.data.isTopaydis = false;
                return
              }
            })
          } else {
            var payUri = app.getPath.doPay;
            var payData = {
              order_id: parseInt(that.data.orderSn),
              payment_code: that.data.selectedGoods.payment_code[0]
            }
            common.hideLoad(that);
            that.data.isTopaydis = false;
            // 下单成功，调用支付
            common.ApiGateWayTest(payUri, payData, true, function (res) {
              if (res.data.success == 1) {
                var data = res.data.result;
                common.doWechatPay(data, function (res) {
                  for (var i in that.data.order_info.firstGoods) {
                    app.aldstat.sendEvent("支付成功", {
                      "商品名称": that.data.order_info.firstGoods[i].goods_name
                    })
                  }
                  for (var i in that.data.order_info.secondGoods) {
                    app.aldstat.sendEvent("支付成功", {
                      "商品名称": that.data.order_info.secondGoods[i].goods_name
                    })
                  }
                  // wx.redirectTo({
                  //   url: './paymentStatus/paymentStatus?order_id=' + payData.order_id + '&consignee=' + JSON.stringify(that.data.consignee) + '&payment_code=' + payData.payment_code,
                  // })
                }, function (failres) {
                  for (var i in that.data.order_info.firstGoods) {
                    app.aldstat.sendEvent("支付失败", {
                      "商品名称": that.data.order_info.firstGoods[i].goods_name
                    })
                  }
                  for (var i in that.data.order_info.secondGoods) {
                    app.aldstat.sendEvent("支付失败", {
                      "商品名称": that.data.order_info.secondGoods[i].goods_name
                    })
                  }
                  // common.toast("支付失败");
                }, function (completeres) {
                  wx.redirectTo({
                    url: './paymentStatus/paymentStatus?order_id=' + payData.order_id + '&consignee=' + JSON.stringify(that.data.consignee) + '&payment_code=' + payData.payment_code,
                  })
                })
              } else {
                common.toast(res.data.msg);
                that.data.isTopaydis = false;
                return
              }
            })
          }
        } else {
          if (that.data.orderSn == "" || productInfo[0].team_order == 1 || productInfo[0].team_order == 2) {
            // 从商品详情  立即购买进入
            data['order_product'] = [({
              goods_id: productInfo[i].goods_id,
              sku_key: productInfo[i].sku_key,
              num: productInfo[i].amount
            })]
            data.order_product = JSON.stringify(data.order_product);
            common.ApiGateWayTest(uri, data, true, function (res) {
              if (res.data.success == 1) {
                var res = res.data.result;
                that.data.orderSn = res.order_id;
                var payUri = app.getPath.doPay;
                var payData = {
                  order_id: res.order_id,
                  payment_code: that.data.selectedGoods.payment_code[0]
                }
                common.hideLoad(that);
                that.data.isTopaydis = false;
                if (res.status == 1) {
                  for (var i in that.data.order_info.firstGoods) {
                    app.aldstat.sendEvent("支付成功", {
                      "商品名称": that.data.order_info.firstGoods[i].goods_name
                    })
                  }
                  for (var i in that.data.order_info.secondGoods) {
                    app.aldstat.sendEvent("支付成功", {
                      "商品名称": that.data.order_info.secondGoods[i].goods_name
                    })
                  }
                  // 余额支付，实付为0，不走支付接口
                  wx.redirectTo({
                    url: './paymentStatus/paymentStatus?order_id=' + payData.order_id + '&consignee=' + JSON.stringify(that.data.consignee) + '&payment_code=' + payData.payment_code,
                  })
                } else {
                  // 走支付接口
                  common.ApiGateWayTest(payUri, payData, true, function (res) {
                    if (res.data.success == 1) {
                      var data = res.data.result;
                      if (productInfo[0].team_order == 1 || productInfo[0].team_order == 2) {
                        var found_id = data.found_id;
                      }
                      common.showLoad(that);
                      common.doWechatPay(data, function (res) {
                        var pickupId = common.getStorageSync('getpickup');
                        // if (that.data.consignee.is_default == 1 && pickupId != that.data.consignee.pickup_id) {
                        //   that.getExternal(that.data.consignee.pickup_id)
                        // }
                        for (var i in that.data.order_info.firstGoods) {
                          app.aldstat.sendEvent("支付成功", {
                            "商品名称": that.data.order_info.firstGoods[i].goods_name
                          })
                        }
                        for (var i in that.data.order_info.secondGoods) {
                          app.aldstat.sendEvent("支付成功", {
                            "商品名称": that.data.order_info.secondGoods[i].goods_name
                          })
                        }
                        if (productInfo[0].team_order == 1 || productInfo[0].team_order == 2) {
                          var checkPayUri = app.getPath.checkPay;
                          var checkPayData = {
                            order_id: that.data.orderSn,
                            payment_code: payData.payment_code
                          }
                          common.ApiGateWayTest(checkPayUri, checkPayData, true, function (resData) {
                            if (resData.data.success == 1) {
                              wx.redirectTo({
                                url: '../../packageA/groupbuy/groupbuy?found_id=' + resData.data.result.found_id + '&entryType=external' + '&teamType=' + productInfo[0].team_order
                              })
                              common.hideLoad(that);
                            } else {
                              common.toast("支付失败");
                              common.hideLoad(that);
                            }
                          })
                        } else {
                          wx.redirectTo({
                            url: './paymentStatus/paymentStatus?order_id=' + payData.order_id + '&consignee=' + JSON.stringify(that.data.consignee) + '&payment_code=' + payData.payment_code,
                          })
                        }
                      }, function (failres) {
                        for (var i in that.data.order_info.firstGoods) {
                          app.aldstat.sendEvent("支付失败", {
                            "商品名称": that.data.order_info.firstGoods[i].goods_name
                          })
                        }
                        for (var i in that.data.order_info.secondGoods) {
                          app.aldstat.sendEvent("支付失败", {
                            "商品名称": that.data.order_info.secondGoods[i].goods_name
                          })
                        }
                        if (productInfo[0].team_order == 1 || productInfo[0].team_order == 2) {
                          var checkPayUri = app.getPath.checkPay;
                          var checkPayData = {
                            order_id: that.data.orderSn,
                            payment_code: payData.payment_code
                          }
                          common.ApiGateWayTest(checkPayUri, checkPayData, true, function (resData) {
                            if (resData.data.success == 1) {
                              wx.redirectTo({
                                url: '../../packageA/groupbuy/groupbuy?found_id=' + resData.data.result.found_id + '&entryType=external' + '&teamType=' + productInfo[0].team_order
                              })
                              common.hideLoad(that);
                            } else {
                              common.toast("支付失败");
                              common.hideLoad(that);
                            }
                          })
                        } else {
                          wx.redirectTo({
                            url: './paymentStatus/paymentStatus?order_id=' + payData.order_id + '&consignee=' + JSON.stringify(that.data.consignee) + '&payment_code=' + payData.payment_code,
                          })
                          common.hideLoad(that);
                        }
                      })
                    } else {
                      common.toast(res.data.msg);
                      that.data.isTopaydis = false;
                      return
                    }
                  })
                }

              } else {
                common.toast(res.data.msg);
                common.hideLoad(that);
                that.data.isTopaydis = false;
                return
              }
            })
          } else {
            var payUri = app.getPath.doPay;
            var payData = {
              order_id: parseInt(that.data.orderSn),
              payment_code: that.data.selectedGoods.payment_code[0]
            }
            common.hideLoad(that);
            that.data.isTopaydis = false;
            // 走支付接口
            common.ApiGateWayTest(payUri, payData, true, function (res) {
              if (res.data.success == 1) {
                var data = res.data.result;
                common.doWechatPay(data, function (res) {
                  for (var i in that.data.order_info.firstGoods) {
                    app.aldstat.sendEvent("支付成功", {
                      "商品名称": that.data.order_info.firstGoods[i].goods_name
                    })
                  }
                  for (var i in that.data.order_info.secondGoods) {
                    app.aldstat.sendEvent("支付成功", {
                      "商品名称": that.data.order_info.secondGoods[i].goods_name
                    })
                  }
                  // wx.redirectTo({
                  //   url: './paymentStatus/paymentStatus?order_id=' + payData.order_id + '&consignee=' + JSON.stringify(that.data.consignee) + '&payment_code=' + payData.payment_code,
                  // })
                }, function (failres) {
                  for (var i in that.data.order_info.firstGoods) {
                    app.aldstat.sendEvent("支付失败", {
                      "商品名称": that.data.order_info.firstGoods[i].goods_name
                    })
                  }
                  for (var i in that.data.order_info.secondGoods) {
                    app.aldstat.sendEvent("支付失败", {
                      "商品名称": that.data.order_info.secondGoods[i].goods_name
                    })
                  }
                  // common.toast("支付失败");
                }, function (completeres) {
                  wx.redirectTo({
                    url: './paymentStatus/paymentStatus?order_id=' + payData.order_id + '&consignee=' + JSON.stringify(that.data.consignee) + '&payment_code=' + payData.payment_code,
                  })
                })
              } else {
                common.toast(res.data.msg);
                that.data.isTopaydis = false;
                return
              }
            })
          }
        }
      }
    }
  },
  // 返回上级弹窗
  leaveModal() {
    // if (this.data.showGetBonusModal == 0) {
    //   this.data.showGetBonusModal = 1;
    // } else {
    //   this.data.showGetBonusModal = 0;
    // }
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })

    animation.translateY(300).opacity(1).step();

    this.setData({
      animationData: animation.export()
    })

    if (this.data.showGetBonusModal == 1) {

      this.setData({
        showGetBonusModal: false,
        showBonusModal: true
      });
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (this.data.showGetBonusModal == 0) {
        this.setData({
          showBonusModal: true
        });
      }
    }.bind(this), 200)
  },
  // 获取用户手机号
  getPhoneNumber(e) {
    var that = this;
    if (!(e.detail.encryptedData && e.detail.iv)) {
      that.setData({
        is_bind_moble: 1
      })
      return false
    }
    var mobileUri = app.getPath.getWXMobile;
    // 重新获取code获取手机号
    wx.login({
      success: function (res) {
        var Mobiledata = {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          code: res.code
        };
        common.ApiGateWayTest(mobileUri, Mobiledata, true, function (res) {
          var resData = res.data;
          if (resData.success == 1) {
            that.setData({
              'consignee.mobile': resData.result.mobile,
              is_bind_moble: 1
            })
          } else {
            return
          }
        })
      }
    })
  },
  // 阻止父级冒泡
  stopMove() {
    return true;
  }
  // changeOrderNotice() {
  //   this.setData({
  //     order_confirm_show: true,
  //     order_confirm_notice: false
  //   })
  // }
})