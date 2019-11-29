// components/invitationGuide/invitationGuide.js
var app = getApp();
const common = require("../../utils/common.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      value: false,
      type: Boolean
    },
    rid: {
      value: 0,
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    promptStatus: false,
    shareInfo: {
      fromButton: 'envelopes'
    },
    showaward: true,
  
  },
  onload:function(){
    this.getCsShowRedPacketInfo();
  },
 

  // 加载组件直接执行
  attached(){
     this.setData({
       tiketacount: this.data.rid
     })
    // 获取代金券信息
    this.getCsShowRedPacketInfo()

   },
    /**
   * 组件的方法列表
   */
  methods: {
    // 点击确认
    goback(){
      var that = this;
      var url = app.getPath.sendCoupon;
      var data = {
        coupon_id: that.data.rid
      }
      common.ApiCoordination(url, data, true, function (res) {
        var resData = res.data;
        if (resData.success == 1) {
          common.toast(resData.msg);
          that.triggerEvent('parentEvent', { a: 1 })
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
        coupon_id: that.data.rid
      }

      that.setData({
        tiketacount: that.data.rid
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

        if (resData.result.money.type==0){
          // 满减
          that.setData({
            moneytype: true
          })
        }
      })
    },
    hide() {
      var that = this;
      // that.triggerEvent('parentEvent', { a: 1 })
      that.setData({
        show: false
      })
    }
  }
})
