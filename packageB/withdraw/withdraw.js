// packageB/withdraw/withdraw.js
var app = getApp();
const common = require("../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    red_packet_info: {},
    swiperList: [],
    rid: 0,
    iconURL: app.dataBase.iconURL,
    is_first: 0,
    popupShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.rid = options.rid;
    this.getCsShowRedPacketInfo();
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 获取提现信息
  getCsShowRedPacketInfo(){
    var that = this;
    var url = app.getPath.csShowRedPacketInfo;
    var data = {
      red_packet_id: that.data.rid
    }
    common.ApiCoordination(url,data,true,function(res){
      var resData = res.data;
      if(resData.success == 1){
        var swiperList = [];
        for (var i = 0; i < resData.result.invite_list.length; i += 3) {
          swiperList.push(resData.result.invite_list.slice(i, i + 3))
        }
        that.setData({
          red_packet_info: resData.result.red_packet,
          swiperList: swiperList
        })
      }
    })
  },
  // 立即提现
  onWithdraw(e){
    common.formIdUpdate(e);
    var that = this;
    common.showLoad(that);
    var pickupId = common.getStorageSync('getpickup');
    app.aldstat.sendEvent("withdraw_report", {
      "提货点": pickupId.cityName
    });
    var url = app.getPath.rpCashOut;
    var data = {
      red_packet_id: that.data.rid
    }
    common.ApiGateWayTest(url,data,true,function(res){
      var resData = res.data;
      common.hideLoad(that);
      if (resData.success == 1){
        if (resData.result.success) {
          that.setData({
            popupShow: true,
            is_first: resData.result.is_first
          })
        } else {
          common.toast(resData.msg);
          return
        }
      }else{
        common.setStorageSync('isOnWithdrawDate', new Date().getDate())
        common.toast(resData.msg);
        return
      }
    })
  },
  // 提现成功-返回
  onWithdrawOut(){
    var that = this;
    if (that.data.is_first == 1) {
      var pages = getCurrentPages()
      var prevPage = pages[pages.length - 1]  //当前界面
      var prevPage = pages[pages.length - 2]  //上一个页面
      prevPage.setData({
        showRedEnvel: true,
        showRedEnvelType: 2
      })
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
  },
  // 滚动溢出
  bindtouchmove() {
    return false
  },
})