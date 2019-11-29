// components/teamList/teamList.js
//获取应用实例
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    teamList: {
      type: Array,
      value: [],
      observer: function(newVal, oldVal, changedPath) {
        if (newVal.length > 0 && newVal.length > oldVal.length) {
          this.setData({
            teamList: newVal
          })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    teamList: [],
    teamFound: {},
    team_id: 0,
  },

  /**
   * 组件的方法列表
   */
  attached() {
    var that = this;
  },
  methods: {
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
  }
})
