var app = getApp();
var common = require("../../utils/common.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    page:1,
    page_size:10,
    bargainList:[],
  },
  onLoad:function(){
    this.getBargainList();
  },
  onShow:function(){
    
  },
  //获取砍价数据
  getBargainList(){
    var that=this;
    var url=app.getPath.bargaining;
    var data={
      page:this.data.page,
      page_size:this.data.page_size,
    };
    common.ApiGateWayTest(url,data,true,function (res) {
      var res=res.data;
      if(res.success===1){
        that.data.bargainList = that.data.bargainList.length > 0 ? [...that.data.bargainList, ...res.result] : res.result
        that.setData({
          bargainList: that.data.bargainList
        })
      }
      wx.stopPullDownRefresh()
    })
  },
  //跳转砍价页面
  loadProduct(e){
    var that = this;
    var activity_bargain_id = e.currentTarget.dataset.activityBargainId;
    common.formIdUpdate(e);
    wx.navigateTo({
      url: '../../packageA/bargain/bargain?activity_bargain_id=' + activity_bargain_id +'&entryType=external'
    })
  },
  // 跳转砍价详情
  loadBrangin(e){
    var that = this;
    var bargaining_id = e.currentTarget.dataset.id;
    common.formIdUpdate(e);
    wx.navigateTo({
      url: '../../packageA/bargainshare/bargainshare?bargaining_id=' + bargaining_id + '&entryType=external'
    })
  },
  //下拉刷新
  onPullDownRefresh(){
    this.data.bargainList = [];
    this.data.page = 1,
    this.getBargainList();
  },

//  上拉获取数据
  onReachBottom(){
    if (this.data.bargainList&&this.data.bargainList.length%this.data.page_size==0){
      this.data.page = this.data.bargainList.length / this.data.page_size + 1;
      this.getBargainList();
    }
  }
})