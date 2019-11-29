// packageA/credits-record/credits-record.js
//获取应用实例
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL:app.dataBase.iconURL,
    changeList:[],
  },
  getChangeList(){
    let that=this;
    let url= app.getPath.scoreChangeList
    common.ApiGateWayTest(url,'',true,function (res) {
      if(res.data.success==1){
        that.setData({
          changeList:res.data.result.list
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getChangeList()
  },
})
