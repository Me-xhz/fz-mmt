var app = getApp();
var common = require("../../utils/common.js");
Page({
  data: {
    iconURL: app.dataBase.iconURL,
    showDialog: false,
    order_confirm_show: false,
    selectedGoods: {},
    // 闪送地址
    consignee: {consignee: ""},
    isTopaydis: false,
    //商品信息
    productInfo: {},
    // 后台筛选返回后商品信息
    order_info: {},
    orderSn: "",
    //发票信息
    invoiceData: {},
    //地址
    cashgift: {},
    address_extra: '',
    //去支付默认
    canPurchase: false,
    // 优惠券展示
    showBonusModal: false,
    tip_show: {
      tip1: true,
      tip2: true
    },
    // 是否从缓存里读取地址
    storageAddr: false,
    // 是否需要修改地址
    isEditAddr: false,
    message: '',
    iphoneXBottom: '0rpx',
    shop_id: 0,
    address_tag: [],
    tag_num: -1,
    label_id: 0,
    label_name:"",
    has_shop:'',
    showOrderWindow:false,
    orderTimeId:0,
    orderTimeText:{},
    title_text:[],
    timeOrderCheck:true,
    checkShowOrder:false,
    showChooseTag:false,
    checkChoose:false
  },

  onLoad: function(options) {
    var that = this;
    that.data.shop_id = options.shop_id;
    wx.getSystemInfo({
      success: function(res) {
        var model = res.model
        if (model.search('iPhone X') != -1) {
          that.setData({
            iphoneXBottom: '68rpx'
          })
        }
      }
    })
    this.checkUser();
    app.aldstat.sendEvent("进入闪购确认订单");
  },
  onShow: function() {
    var that = this;
    this.data.tag_num=-1;
    this.data.label_id=0;
    Promise.all([that.getaddresslist(), that.getOrderCouponList()]).then(function(val) {
      that.getcheckOrderinfo()
    })

  },
  // 判断用户是否为黑名单
  checkUser: function() {
    var that = this;
    var uri = app.getPath.checkUser;
    common.ApiGateWayTest(uri, '', true, function(res) {
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
  isShow: function(e) {
    var name = e.currentTarget.dataset.name;
    var tip_show = this.data.tip_show;
    tip_show[name] = false;
    this.setData({
      tip_show
    })
  },
  // 获取地理位置
  getaddresslist: function() {
    var that = this;
    var addressUri = app.getPath.getaddresslist;
    var addressData = {
      is_default: '1'
    }

    // 地理位置请求
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(addressUri, addressData, true, function(res) {
        if (res.statusCode == 200) {
          var res = res.data.result.consignees;
          if (that.data.consignee && that.data.consignee.address_id) {
            that.setData({
              consignee: that.data.consignee,
              storageAddr: false
            })
            that.getAddressTag()
          } else {
            if (res.length > 0) {
              that.setData({
                consignee: res[0],
                storageAddr: false
              })
              that.getAddressTag()
            } else {
              // 无地址时，取缓存自提点地址
              common.getStorage({
                key: 'getpickup',
              },function(res) {
                if (res.data.pickup_id && res.data.pickup_id > 0) {
                  that.setData({
                    consignee: res.data,
                    storageAddr: true
                  })
                  that.getAddressTag()
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
  addAddress: function(callback) {
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
    if (this.data.consignee.address_extra == "" && that.data.has_shop == 1) {
      common.toast('请输入闪送地址');
      return;
    };
    if (that.data.address_tag.length > 0 && that.data.has_shop == 1) {

      if (that.data.label_id == 0) {
        common.toast('请选择闪送地址');
        return;
      };
    }
    var uri = app.getPath.addaddress;
    var data = {
      consignee: that.data.consignee.consignee,
      mobile: that.data.consignee.mobile,
      pickup_id: that.data.consignee.pickup_id,
      address_extra: that.data.consignee.address_extra,
      is_default: 1,
      pick_up_label_id: that.data.label_id
    }
    common.ApiGateWayTest(uri, data, true, function(res) {
      if (res && res.data.success == 1) {
        var res = res.data.result;

        that.setData({
          consignee: res.consignees
        });
        (callback && typeof(callback) === "function") && callback();
      }

    })
  },
  // 修改收货地址
  editAddress: function(callback) {
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
    if (this.data.consignee.address_extra == "" && that.data.has_shop == 1) {
      common.toast('请输入闪送地址');
      return;
    };

    if (that.data.address_tag.length > 0 && that.data.has_shop == 1) {

      if (that.data.label_id == 0) {
        common.toast('请选择闪送地址');
        return;
      };
    }
    that.data.isEditAddr = false;
    var uri = app.getPath.alteraddress;
    var data = {
      consignee: that.data.consignee.consignee,
      mobile: that.data.consignee.mobile,
      address_id: that.data.consignee.address_id,
      pickup_id: that.data.consignee.pickup_id,
      address_extra: that.data.consignee.address_extra,
      is_default: that.data.consignee.is_default,
      pick_up_label_id: that.data.label_id
    }

    common.ApiGateWayTest(uri, data, true, function(res) {
      if (res && res.data.success == 1) {
        var res = res.data.result;
        that.getAddressTag();
        (callback && typeof(callback) === "function") && callback();
      }
    })
  },
  // 输入框双向绑定
  editInput: function(e) {
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
  getcheckOrderinfo: function() {
    var that = this;
    // 当前仓库
    var city = common.getStorageSync('city');
    var uri = app.getPath.shopCheckOrderInfo;
    if (that.data.coupon_id == undefined) {
      that.data.coupon_id = 0;
      // that.data.coupon_id = that.data.cashgift.id;
    }
    if (that.data.selectedGoods.use_balance == undefined) {
      that.data.selectedGoods.use_balance = 0;
    }
    if (that.data.consignee.address_id == undefined) {
      that.data.consignee.address_id = 0;
    }

    // 确认订单接口提交数据
    var data = {
      coupon_id: that.data.coupon_id,
      address_id: that.data.consignee.address_id,
      use_balance: that.data.selectedGoods.use_balance,
      shop_id: that.data.shop_id,
    };
    // 获取确认订单信息
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function(res) {
        if (res.statusCode == 200) {
          var res = res.data.result;
          that.setData({
            selectedGoods: res,
            cashgift: res.coupon_info,
            coupon_id: res.coupon_info.id,
            order_info: res.order_info
          })
         
          if(res.is_in_shipping_time===0){
            if (!that.data.checkShowOrder) {
              var time = common.getStorageSync('tackoutOrderTime');
              var timeFilter = res.shipping_time.filter(item=>{
                return item.shopping_time_text == time.shopping_time_text;
              })
              if (timeFilter.length > 0){
                that.setData({
                  showOrderWindow: true,
                  orderTimeId: timeFilter[0].shop_shipping_time_id,
                  orderTimeText: timeFilter[0],
                  title_text: res.is_in_shipping_time_text.split('，')
                })
              }else{
                common.setStorageSync('tackoutOrderTime', res.shipping_time[0]);
                that.setData({
                  showOrderWindow: true,
                  orderTimeId: res.shipping_time[0].shop_shipping_time_id,
                  orderTimeText: res.shipping_time[0],
                  title_text: res.is_in_shipping_time_text.split('，')
                })
              }
              that.data.checkShowOrder = true
            }
          }
          // if (res.is_in_shipping_time == 0){
          //   common.showRidoModal(res.is_in_shipping_time_text,'确定',function(res){
          //     return;
          //   })
          // }
        }
        var btn = true;
        var order_info = that.data.order_info;

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
  touchAddress: function() {
    var that = this;
    wx.navigateTo({
      url: '/pages/address/addressList/addressList?from=flashConfirm',
    })
  },
  // 新增地址
  newAddress: function() {
    var that = this;
    wx.navigateTo({
      url: '/pages/address/address',
    })
  },
  // 优惠券选择
  touchCashgift: function(e) {
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
  getOrderCouponList: function() {
    var that = this;
    var uri = app.getPath.shopOrderCouponList;
    var data = {
      shop_id: that.data.shop_id,
    }
    return new Promise(function(resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function(res) {
        if (res.data.errorCode != 1) {
          var res = res.data.result;
          that.setData({
            cashgifts: res.lists
          })
          resolve('getOrderCouponList')
        } else {
          common.toast(res.data.msg)
        }
      })
    })

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
  // 领券弹窗
  setModalBonus: function() {
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
    setTimeout(function() {
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
  refreshOrderPrice: function() {

  },
  // 留言
  refreshComment: function(event) {
    var value = event.detail.value;
    this.setData({
      user_note: value
    })
  },
  // 显示支付弹窗
  showConfirm: function(e) {
    var that = this;
    common.getStorage({
      key: 'getpickup',
    },function(res) {
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
        if (that.data.consignee.address_extra == '' && that.data.has_shop == 1) {
          common.toast('请输入闪送地址');
          return;
        };
        if (that.data.address_tag.length > 0 && that.data.has_shop == 1){
          if (that.data.label_id == 0) {
            common.toast('请选择闪送地址');
            return;
          };
        }

        that.beforeSubmit();
      } else {
        that.touchSubmit(e);
      }
    })
  },
  // 隐藏支付弹窗
  hideConfirm: function(e) {
    common.formIdUpdate(e);
    this.setData({
      order_confirm_show: false
    })
  },
  //阻止冒泡事件
  unLoad(){

  },
  // 支付前地址分析
  beforeSubmit: function(e) {
    // 没收货地址，从缓存取到地址
    var that = this;
    if (this.data.storageAddr) {
      that.setData({
        order_confirm_show: true
      })
      that.addAddress(function() {
        that.getaddresslist()
      })
    } else {
      if (this.data.isEditAddr == true) {
        that.editAddress(function() {
          that.setData({
            order_confirm_show: true
          })
        })
      } else {
        that.setData({
          order_confirm_show: true
        })
      }
    }
  },
  //获取留言信息
  getMessage(e) {
    this.data.message = e.detail.value;
    this.setData({
      message:e.detail.value
    })
  },
  // 去支付
  touchSubmit: function(e) {
    var that = this;
    var productInfo = that.data.productInfo;
    var uri = app.getPath.shopConfirmOrder;
    if (that.data.consignee && !that.data.consignee.address_id) {
      var content = '您还未设置收货地址';
      var confimText = '去设置';
      common.showModal(content, confimText, function(res) {
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
    var shop_shipping_time_id=0;
    if(that.data.selectedGoods.is_in_shipping_time===0){
      shop_shipping_time_id=that.data.orderTimeText.shop_shipping_time_id
    }
      var data = {
        coupon_id: that.data.coupon_id,
        address_id: that.data.consignee.address_id,
        shop_id: that.data.shop_id,
        payment_code: that.data.selectedGoods.payment_code[0],
        user_note: that.data.message,
        use_balance: that.data.selectedGoods.use_balance,
        time_atitude: app.dataBase.userAtitude,
        shop_shipping_time_id:shop_shipping_time_id
      }
      common.formIdUpdate(e);
      common.ApiGateWayTest(uri, data, true, function(res) {
        var res = res.data;
        if (data.shop_id && data.shop_id.length > 0 && res.success == 1) {
          var payUri = app.getPath.doPay;
          var payData = {
            order_type: 2,
            order_id: res.result.order_id,
            payment_code: that.data.selectedGoods.payment_code[0]
          }
          common.hideLoad(that);
          if (res.result.status == 1){
            // 实付为0，不走支付接口
            wx.redirectTo({
              url: './order-detail?order_id=' + payData.order_id + '&entryType=external'
            })
          }else{
            // 调用支付
            common.ApiGateWayTest(payUri, payData, true, function (res) {
              if (res.data.success == 1) {
                var data = res.data.result;
                common.doWechatPay(data, function (res) {
                  common.hideLoad(that);
                  that.checkPay(payData.order_id).then(res => {
                    wx.showToast({
                      title: '支付成功',
                      duration: 2000
                    })
                    wx.redirectTo({
                      url: './order-detail?order_id=' + payData.order_id + '&entryType=external'
                    })
                  })
                }, function (failres) {
                  common.hideLoad(that);
                  that.checkPay(payData.order_id).then(res => {
                    wx.showToast({
                      title: '支付失败',
                      icon: 'cancel',
                      duration: 2000
                    })
                    wx.redirectTo({
                      url: './order-detail?order_id=' + payData.order_id + '&entryType=external'
                    })
                  })
                }, function (completeres) {
                  common.hideLoad(that);
                })
              } else {
                common.hideLoad(that);
                common.toast(res.data.msg);
                return
              }
            })
          }
        }else{
          common.hideLoad(that);
          common.toast(res.msg);
          return
        }
      })
    }
  },
  // 支付确认是否回调
  checkPay: function (orderId) {

    var that = this;
    var uri = app.getPath.checkPay;
    var data = {
      order_id: orderId,
      order_type: 2
    }
    return new Promise((resolve,reject)=>{
      common.ApiGateWayTest(uri, data, true, function (res) {
        if(res.data.success == 1){
          resolve(true)
        }else{
          resolve(false)
        }
      })
    })
  },
  // 获取提货点楼号标签
  getAddressTag() {
    var that = this;
    var url = app.getPath.pickupLabel;
    var data = {
      pickup_id: this.data.consignee.pickup_id,
      address_id: this.data.consignee.address_id
    }
    common.ApiGateWayTest(url, data, true, function (res) {
      var res = res.data
      if (res.success == 1) {
        res.result.list.forEach((val, index) => {
          if (val.is_selected == 1) {
            that.data.tag_num = index
            that.data.label_id = val.pick_up_label_id
            that.data.label_name=val.name
            if (!that.data.checkChoose){
      
              that.data.showChooseTag = true
              that.data.checkChoose=true
            }
            
          }
        })
        that.setData({
          address_tag: res.result.list,
          tag_num: that.data.tag_num,
          label_name: that.data.label_name,
          has_shop: res.result.has_shop,
          showChooseTag: that.data.showChooseTag
        })
      }
    })
  },
  // 选择标签
  changeChooseTag(){
    this.setData({
      showChooseTag:false
    })
  },
  // 切换标签
  change_tag(e) {
    this.data.label_id = e.currentTarget.dataset.label_id;
    this.data.label_name = e.currentTarget.dataset.label_name
    this.data.isEditAddr = true;
    this.setData({
      tag_num: e.currentTarget.dataset.tagnum
    })
  },
//  隐藏弹窗
  hideWindow(){
    var that=this;
    that.setData({
      showOrderWindow:false,
      timeOrderCheck: false
    })
  },
  showWindow() {
    var that = this;
    that.setData({
      showOrderWindow: true,
      timeOrderCheck: true
    })
  },
//  选择时间
  changeOrderTime(e){
    let num = e.currentTarget.dataset.num;
    let item = e.currentTarget.dataset.item;
    common.setStorageSync('tackoutOrderTime', item);
    this.setData({
      orderTimeId: item.shop_shipping_time_id,
      orderTimeText: item
    })
  },
  // 阻止父级冒泡
  stopMove(){
    return true;
  }
})
