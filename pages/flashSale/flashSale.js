// pages/flashSale/flashSale.js
var app = getApp();
var common = require("../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    actived_idx:1,
    activity_id: 0, 
    page:1,
    page_size:10,   
    activitylist:[],
    good_list:[],
    total:0,
    timer_btn:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getActivitylist();
  },
  // 时间
  getDate:function(){
    var that = this;
    var timer = setInterval(function(){
      var timestamp = (new Date()).getTime();
      var btn1 = that.data.activitylist[1].progress.start_time - timestamp;
      var btn2 = that.data.activitylist[1].progress.end_time - timestamp;
      if(btn1 <=0 && btn2 >= 0){
        common.showLoad(that);
        that.setData({
          good_list:[],
          timer_btn:true
        })
        that.getActivitygoodslist();
        clearInterval(timer)
      }
      
    },1000)
  },
  // 判断选中
  actived:function(e){
    var that = this;
    var d = e.currentTarget.dataset;
    that.setData({
      activity_id: d.activity_id,
      actived_idx: d.actived_idx,
      page:1,
      good_list:[]
    })
    that.getActivitygoodslist();
  },
  // 获取上面部分信息
  getActivitylist(){
    var that = this;
    var uri = app.getPath.activitylist;
    common.ApiGateWayTest(uri, {}, true, function (res) {
      var res = res.data;
      if(res.success==1){
        var activity_id = 0;
        var activityListStart = res.result.lists.filter(item => {
          return item.progress.state == 1;
        })
        var activityListSoon = res.result.lists.filter(item => {
          return item.progress.state == 2;
        })
        if (activityListStart.length > 0){
          activity_id = activityListStart[0].activity_id
        }else{
          activity_id = activityListSoon[0].activity_id
        }
        that.setData({
          activitylist: res.result.lists,
          activity_id: activity_id
        })
        that.getDate();
      }
    })
  },
  // 获取商品列表信息
  getActivitygoodslist(callback){
    var that = this;
    var uri = app.getPath.activitygoodslist;
    var data = {
      page: this.data.page,
      page_size: this.data.page_size,
      activity_id: this.data.activity_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var res = res.data;
      var lists = res.result.lists;
      // var nowState = that.data.activitylist[that.data.actived_idx];
      for (let i in that.data.activitylist){
        if (that.data.activitylist[i].activity_id == that.data.activity_id){
          var nowState = that.data.activitylist[i].progress.state;
        }
      }
      if (res.success == 1) {
        // 给所有的商品列表项添加状态
        for (var i = 0; i < lists.length; i++){
          lists[i].state = nowState;
        }
        that.setData({
          good_list: [...that.data.good_list,...lists],
          total: res.result.total
        })
        common.hideLoad(that);
      }
    })
  },
  // 跳转商品页
  goToProduct(e) {
    var goodsid = e.currentTarget.dataset.goodsid;
    if (app.checkSessionKey) {
      common.formIdUpdate(e);
    }
    wx.navigateTo({
      url: '/pages/product/product?entryType=external&productId=' + goodsid
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if (that.data.total != that.data.good_list.length){
      that.setData({
        page: this.data.page + 1
      })
      that.getActivitygoodslist();
    }
    
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
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})