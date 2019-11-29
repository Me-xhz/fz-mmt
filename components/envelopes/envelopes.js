// components/envelopes/envelopes.js
var app = getApp();
const common = require("../../utils/common.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    rid: {
      value: 0,
      type: Number
    },
    tiketId: {
      value: 0,
      type: Number,
      observer: function (newVal, oldVal) {
        var that = this;
        if(newVal != oldVal){
          this.getCsShowRedPacketInfo()
        }
      }
    },
    show: {
      value: false,
      type: Boolean
    },
    showType: {
      value: 1,
      type: String
    },
    status:{
      value: 1,
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tiketshow:false,
    show:false,
    iconURL: app.dataBase.iconURL,
    shareInfo: {
      fromButton: 'envelopes'
    },
    guideIsShowBtn: true,
    guideIsShow: false,
    // //
    promptStatus: false,
    showaward: true,
  },
  attached() {
  
    this.setData({
      tiketacount: this.data.tiketId
    })
   
  },
 
  pageLifetimes: {
    show: function () {
      var promptStatus = common.getStorageSync('promptStatus');
      if (promptStatus) {
        this.setData({
          guideIsShowBtn: false
        })
      }
    },
    hide(){
      if (Boolean(this.data.show)){
        this.setData({
          show: false
        })
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击确认
    goback() {
      var that = this;
      var url = app.getPath.sendCoupon;
      var data = {
        coupon_id: that.data.tiketId
      }
      common.ApiCoordination(url, data, true, function (res) {
        var resData = res.data;
        if (resData.success == 1) {
          common.toast(resData.msg);
          that.triggerEvent('click', { a: 1 })
          that.setData({
            show: false
          })
        }
      })
    },
    // 获取代金券信息
    getCsShowRedPacketInfo() {
      var that = this;
      var url = app.getPath.getcoupon;
      var data = {
        coupon_id: that.data.tiketId
      }
      that.setData({
        tiketacount: that.data.tiketId
      })

      common.ApiCoordination(url, data, true, function (res) {
        var resData = res.data;
        if (resData.success == 1) {
          that.setData({
            description: resData.result.description,
            tiketName: resData.result.name,
            bonus: resData.result.money.bonus,
            deadline: resData.result.time,
            limit: resData.result.limit
          })
        }

        if (resData.result.money.type == 0) {
          // 满减
          that.setData({
            moneytype: true
          })
        }
      })
    },
    hide() {
      var that = this;
      that.setData({
        show: false
      })
    },
    goWithdraw() {
      var that=this
      var that = this;
      var pickupId = common.getStorageSync('getpickup');
      app.aldstat.sendEvent("order_red_envelopes", {
        "提货点": pickupId.cityName
      });
      if (!that.data.tiketId == 0) {
        that.setData({
          tiketshow: true,
          show: false
        })
        return false
      } else {
        that.setData({
          show: false,
          tiketshow: false
        }, () => {
          wx.navigateTo({
            url: '/packageB/withdraw/withdraw?rid=' + that.data.rid,
          })

        })
      }

    },
    parentEvent(){
    
      this.triggerEvent('click',{b:2})
    },
    // 点击显示邀请提示
    showShareGuide(e) {
      common.formIdUpdate(e);
      this.setData({
        guideIsShow: true,
        show: false
      })
    },
    // 分享后隐藏
    hideShare(e) {
      common.formIdUpdate(e);
      var pickupId = common.getStorageSync('getpickup');
      app.aldstat.sendEvent("share_red_envelopes", {
        "提货点": pickupId.cityName
      });
      this.setData({
        show: false
      })
    }
  }
})
