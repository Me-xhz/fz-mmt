// packageA/team-list/team-list.js
//获取应用实例
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods_id:0,
    isShowGoHome: false,
    teamList:[],
    teamFound: {},
    team_id: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if(options.goods_id){
      this.data.goods_id=options.goods_id
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
    this.getTeamList();

  },

  //获取拼团列表
  getTeamList(){
    var that=this;
    var url=app.getPath.teamList;
    var data={
      goods_id:this.data.goods_id
    };
    common.ApiGateWayTest(url, data, true,function (res) {
      var res=res.data;
      if(res.success==1){
        that.setData({
          teamList:res.result.data
        })
      }
    })
  },
  // 返回首页
  gotoHome: function (e) {
    common.formIdUpdate(e);
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  countDown(endtime) {
    var that = this;
    var nowtime = new Date().getTime() / 1000;
    that.data.teamList.forEach((val, index) => {
      var lesstime = val.found_end_time - parseInt(nowtime);
      var timeout = [];
      timeout[index] = setInterval(() => {
        lesstime--;
        if (lesstime > 0) {
          var d = parseInt(lesstime / 60 / 60 / 24);
          var h = parseInt(lesstime / 60 / 60 % 24) + d * 24;
          var m = parseInt(lesstime / 60 % 60);
          var s = parseInt(lesstime % 60);
          if (d < 10) {
            d = "0" + d
          }
          if (h < 10) {
            h = "0" + h
          }
          if (m < 10) {
            m = "0" + m
          }
          if (s < 10) {
            s = "0" + s
          }
          var data = {
            d,
            h,
            m,
            s
          };
          that.data.teamList[index]['timeData'] = {
            d: d,
            h: h,
            m: m,
            s: s,
          };
          if ((index + 1) == that.data.teamList.length) {
            that.setData({
              teamList: that.data.teamList
            })
          }
        } else {
          var d = "00";
          var h = "00";
          var m = "00";
          var s = "00";
          var data = {
            d,
            h,
            m,
            s
          };
          that.data.teamList[index]['timeData'] = {
            d: d,
            h: h,
            m: m,
            s: s,
          };
          if ((index + 1) == that.data.teamList.length) {
            that.setData({
              teamList: that.data.teamList
            })
          }
          clearInterval(timeout[index]);
        }
      }, 1000)
    })
  },
  toAddTeam(e) {
    var that = this;
    let fond_id = e.currentTarget.dataset.found_id;
    this.data.team_id = e.currentTarget.dataset.team_id;
    common.formIdUpdate(e);
    wx.navigateTo({
      url:'/packageA/groupbuy/groupbuy?pickup_id=' + that.data.teamFound.pickup_id + '&found_id=' + fond_id
    })
    // that.getGroupInfo(fond_id).then(res => {
    //   that.toAdd(res)
    // })
  },
  //获取拼团详情并下单
  getGroupInfo(found_id) {
    var that = this;
    var uri = app.getPath.teamFound;
    var data = {
      found_id: found_id
    }
    return new Promise((resolve, reject) => {
      common.ApiGateWayTest(uri, data, true, function(res) {
        var res = res.data;
        var data = {
          teamFound: res.result.teamFound,
          team_id: res.result.team_id
        }
        resolve(data)
      })
    })
  },
  //参团
  toAdd(msg) {
    var that = this;
    var teamFound = that.data.teamFound;
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    var checkOrderUri = app.getPath.preCheckOrder;
    var orderProduct = [{
      goods_id: msg.teamFound.goods_id,
      sku_key: msg.teamFound.sku_key,
      num: 1
    }]
    orderProduct = JSON.stringify(orderProduct);
    var checkOrderData = {
      order_product: orderProduct,
      team_order: 2,
      team_id: msg.team_id,
      found_id: msg.teamFound.found_id,
      time_atitude: app.dataBase.userAtitude,
    }
    common.ApiGateWayTest(checkOrderUri, checkOrderData, true, function(resData) {
      if (resData.data.success == 1) {
        // 缓存跳转确认订单页面
        var datas = [{
          goods_name: msg.teamFound.goods_name,
          goods_id: msg.teamFound.goods_id,
          sku_key: msg.teamFound.sku_key,
          amount: 1,
          shop_price: msg.teamFound.price,
          market_price: msg.teamFound.goods_price,
          sku_key_name: msg.teamFound.sku_key_name,
          sku_img: msg.teamFound.sku_img,
          team_order: 2,
          team_id: msg.team_id,
          found_id: msg.teamFound.found_id
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
        let detail = {
          msg: 1
        }
        that.triggerEvent("getinfo", detail)
        return
      }
    })
  },
})
