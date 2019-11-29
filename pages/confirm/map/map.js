// pages/confirm/map/map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    common.getStorage({
      key: 'pickup_img',
    },function(res) {
      that.setData({
        pickup_img: res.data
      })
    })
    // var atitude = options.atitude.split(',');
    // var markers = [{
    //   latitude: atitude[1],
    //   longitude: atitude[0]
    // }]
    // this.setData({
    //   atitude: atitude,
    //   markers
    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('myMap')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})