// pages/problem/feedBook/feedBook.js
var app = getApp();
var common = require("../../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    feedback: [],
    feedbackContent: '',
    feedbackPhone: ''
  },

  // 获取textarea的值
  inputs: function (e) {
    var that = this;
    var value = e.detail.value;
    var len = parseInt(value.length);
    //最多字数限制
    // if (len > that.data.max) return;
    // 当输入框内容的长度大于最大长度限制（max)时，终止setData()的执行
    that.setData({
      currentWordNumber: len ,
      'feedbackContent': value
    });
  },

  // 获取电话号码的input值
  feedbackPhone:function(e){
    var that = this;
    that.setData({
      'feedbackPhone': e.detail.value
    })
  },

  // 
  feedBackAdd:function(){
    var that = this;
    var reg = 11 && /^((13|14|15|17|18)[0-9]{1}\d{8})$/;
    if (that.data.feedbackContent == '' || that.data.feedbackPhone == '') {
      common.toast('内容或手机号不能为空');
      return;
    }
    if (that.data.feedbackContent.length < 6){
      common.toast('反馈内容不得少于6个字');
      return;
    }
    if (!reg.test(that.data.feedbackPhone)) {
      common.toast('请输入正确的手机号');
      return;
    };
    var uri = app.getPath.feedbackadd;
    var data = {
      content: that.data.feedbackContent,
      mobile: that.data.feedbackPhone,
      msg_type:1
    }
    // console.log(data)
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res && res.data.success == 1) {
        var res = res.data.result;
        wx.showModal({
          title: '反馈成功',
          content: '（客服会尽快为您处理）',
          success: function (res) {
            if (res.confirm) {
              // console.log('用户点击确定')
              wx.navigateBack({
                delta: 2
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        
      }

    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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