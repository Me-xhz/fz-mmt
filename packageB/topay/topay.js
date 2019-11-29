// pages/topay/topay.js
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    focus:true,
    price:"",
    now_price:"",
    check_price:false,
    show_price:false,
    disabled:false,
    discount:1,
    priceMaxLength: 9,
    show_discount:true,
  },
  //输入框获取焦点
  bindPriceFocus: function(e){
    var animation = wx.createAnimation({
      duration: 150,
      timingFunction: "ease",
      delay: 0
    })
    animation.translateY(-30).step();

    this.setData({
      animationView: animation.export(),
    })
  },
  bindPriceBlur: function(e){
    var animation = wx.createAnimation({
      duration: 150,
      timingFunction: "ease",
      delay: 0
    })
    animation.translateY(0).step();

    this.setData({
      animationView: animation.export(),
    })
  },
  //获取输入框的金额
  bindPriceInput:function(e){
    var num=e.detail.value;
    // this.data.priceMaxLength = -1;
    if(num.toString().split(".")[1]!==undefined){
      if(num.toString().split(".")[1].length>2){
        this.setData({
          price:this.data.price,
        })
      }else{
        this.setData({
          price:num,
        })
      }
    }
    if(e.detail.value>=0){
      if(e.detail.value===''){
        this.setData({
          show_price:false,
          check_price:false,
        });
        return
      }
      this.setData({
        check_price:true,
        show_price:true,
        now_price:Math.floor(num*this.data.discount*100)/100
      })
    }else{
      this.setData({
        price:"",
        check_price:false,
        show_price:false
      })
    }

  },
  //获取折扣信息
  getDiscount:function(){
    var that=this;
    var uri=app.getPath.shopPayDiscount;
    var pickup = common.getStorageSync('getpickup');
    var data={
      pickup_id:pickup.pickup_id
    };
    common.ApiGateWayTest(uri, data, true, function(res){
      var data=res;
      if(data.success===1){
        if(data.result.discount===100){
          that.setData({
            show_discount:false
          })
        }
        that.setData({
          discount:(data.result.discount/100)
        })
      }
    })
  },
  //支付
  toPay:function(e){
    var that=this;
    var payprice=e.currentTarget.dataset.payprice;
    if (that.data.check_price == false){
      return;
    }
    if(payprice==0){
      wx.showToast({
        title:"请输入正确金额",
        icon:"none"
      });
    }else{
      common.showLoad("正在为您跳转支付");
      var uri=app.getPath.toPayShopOrder;
      var data={order_amount:that.data.now_price*100};
      common.ApiGateWayTest(uri,data,true, function(res){
          var data=res.data;
          if(data.success===1){
            var order_id=data.result.order_id;
            var url=app.getPath.doPay;
            var msg={ order_id:order_id,order_type:1}
            common.ApiGateWayTest(url,msg,true, function(res){
              wx.hideLoading();
              if (res.data.success === 1){
                var data = res.data.result;
                common.doWechatPay(data,function () {
                  var payurl=app.getPath.checkPay;
                  common.ApiGateWayTest(payurl,msg,true, function(res){
                    if(res.data.success===1){
                      wx.showToast({
                        title:"支付成功",
                        icon:"none"
                      });
                      this.setData({
                        price:"",
                        check_price:false,
                        show_price:false
                      })
                    }else{
                      wx.showToast({
                        title:"支付失败",
                        icon:"none"
                      });
                    }
                  })
                },function (failres){
                  wx.hideLoading();
                  wx.showToast({
                    title:"取消支付",
                    icon:"none"
                  });
                })
              } else {
                common.toast(res.data.msg);
                that.data.isTopaydis = false;
                return;
              }
            })
          }
      });
      setTimeout(()=>wx.hideLoading(), 1000)
    }
  },
  onShow:function(){
    this.getDiscount();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    // 外部带商品店铺
    this.setData({
      entryData: options
    });
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
            },
          },function(res) {
            resolve('获取id成功')
          });
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
    });
  },
});