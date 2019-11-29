// packageB/share-page/share-page.js
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  toShare(e){
    let url=e.currentTarget.dataset.url
    wx.navigateTo({
      url:url
    })
  },
})
