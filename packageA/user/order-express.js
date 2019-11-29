// pages/user/order-express.js
var app = getApp();
var common = require("../../utils/common.js");
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {

  },
  onLoad: function (options) {
    if (options == undefined || options.order == undefined || options.delivery_id == undefined) {
      common.toast("请求参数错误");
      return;
    }
    this.setData({
      order: options.order,
      delivery_id: options.delivery_id
    })
    if (options.back_id) {
      this.setData({
        back_id: options.back_id,
      })
    }
    this.getexpress();
  },
  getexpress: function () {
    var that = this;
    common.showLoad(this);
    if (!that.data.back_id){
      var uriTop = app.getPath.orderShippingTop;
      var data = {
        delivery_id: that.data.delivery_id
      };
    }else{
      var uriTop = app.getPath.backShippingTop;
      var data = {
        back_id: that.data.back_id
      };
    }
    common.ApiGateWayTest(uriTop, data, true, function (res) {
      if (res.data.success == 1) {
        that.setData({
          topinfo: res.data.result
        })
        var uriProcess = app.getPath.shippingProcess;
        var processData = {
          shipping_code: that.data.topinfo.shipping_code,
          invoice_no: that.data.topinfo.invoice_no
        }
        common.ApiGateWayTest(uriProcess, processData, true, function (res) {
          if (res.data.success == 0) {
            return
          } else {
            var listinfo = res.data.result;
            for (var i in listinfo.process) {
              var _content = listinfo.process[i].content;
              var tel_reg = /\d{11}/g;
              var _match_tel = _content.match(tel_reg);
              // if (_match_tel){
              //   var replaceStr = '<block bindtap="opentel" data-tel="' + _match_tel[0] + '">' + _match_tel[0] + '</block>';;
              //   info.status[i].content = _content.replace(tel_reg, replaceStr);
              // }
            }
            that.setData({
              listinfo: listinfo.process
            })
          }
          common.hideLoad(that);
        })
      }
    })
  }
})