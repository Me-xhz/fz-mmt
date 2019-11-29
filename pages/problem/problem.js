// pages/problem/problem.js
var app = getApp();
var common = require("../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    subindex:0,
    questionList: [],
    moblie:'10086',
    showVideo: false,
    videoSrc: ''
  },

  showToggle(e) {
    var id = e.currentTarget.dataset.id;
    var key = "questionList.textList[" + id + "].isSubShow"
    var val = this.data.questionList.textList[id].isSubShow;
    this.setData({
      'subindex': id
    })
    this.data.questionList.textList.forEach((i, index) => {
      var k = "questionList.textList[" + index + "].isSubShow"
      this.setData({
        [k]: false
      })
      if (index == id) {
        this.setData({
          [key]: !val
        })
      }
      
      i.subItems.forEach((j, subindex) => {
        var k = "questionList.textList[" + index + "].subItems[" + subindex + "].isThirdShow"
        this.setData({
          [k]: false
        })
      })
    });
  },
 
  showThirdToggle(e) {
    var id = e.currentTarget.dataset.id;
    var val = this.data.questionList.textList[this.data.subindex].subItems[id].isThirdShow;
    var key = "questionList.textList[" + this.data.subindex + "].subItems[" + id + "].isThirdShow"
    this.data.questionList.textList[this.data.subindex].subItems.forEach((i, index) => {
      var k = "questionList.textList[" + this.data.subindex + "].subItems[" + index + "].isThirdShow"
      this.setData({
        [k]: false
      })
      if (index == id) {
        this.setData({
          [key]: !val
        })
      }
    })

  },

  callPhone:function(){
    common.phoneCall(app.globalData.hotline);
  },

  toFeedBook:function(){
    wx.navigateTo({
      url: '/pages/problem/feedBook/feedBook',
    })
  },

  getQuestionList: function() {
    var that = this;
    var uri = app.getPath.questionlist;
    var data = {}
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res && res.data && res.data.success == 1) {
        let question_list = res.data.result;
        for (let i = 0; i < question_list.textList.length; i++) {
          question_list.textList[i].isSubShow = false;
          for (let j = 0; j < question_list.textList[i].subItems.length; j++) {
            question_list.textList[i].subItems[j].isThirdShow = false;
          }
        }
        that.setData({
          questionList: question_list
        })
      }
    })
  },

  openVideo: function(e) {
    var src = e.currentTarget.dataset.src;
    this.setData({
      videoSrc: src,
      showVideo: true
    });
  },

  closeVideo: function() {
    this.setData({
      showVideo: false,
      videoSrc: '',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getQuestionList();
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