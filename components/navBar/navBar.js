// components/navBar/navBar.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showHome:{
      type: Boolean,
      value: false
    },
    showBack:{
      type: Boolean,
      value: true
    },
    title:{
      type: String,
      value: '买买提团购'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight
  },
  /**
   * 组件的方法列表
   */
  methods: {
    backHome: function () {
      wx.switchTab({
        url: '/pages/index/index',
      })
    },
    back: function () {
      wx.navigateBack({
        delta: 1
      })
    }
  }
})
