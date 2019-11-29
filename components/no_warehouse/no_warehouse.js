// components/no_warehouse/no_warehouse.js
var app = getApp();
var common = require("../../utils/common.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    city:{
      type:Object,
      value:{}
    },
    isAuthorization:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    navBarHeight: app.globalData.navBarHeight,
    check_city:false
  },
  observers: {
    'city': function (newVal,oldVal) {
      if (newVal != oldVal){
        let cityMsg = common.getStorageSync("city")
        let citys = common.getStorageSync("getpickup")
        if (cityMsg.is_pick_up && cityMsg.is_pick_up === 1 || citys.is_pick_up && citys.is_pick_up === 1) {
          this.setData({
            check_city: true
          })
        }
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    openSet: function () {
      var that = this;
      wx.openSetting({
        success: function (res) {
          common.getSetting();
          // that.setData({
          //   isAuthorization: res.authSetting["scope.userLocation"]
          // })
          that.triggerEvent('openevent', {
            isAuthorization: res.authSetting["scope.userLocation"]
          })
        },
        fail: function (res) {
        }
      })
      // var content = '拒绝授权将无法体验完整功能，建议打开地理位置授权';
      // var confirmText = '去设置';
      // common.showModal(content, confirmText, function (res) {
      //   if (res.confirm) {

      //   }
      // })
    }
  }
})
