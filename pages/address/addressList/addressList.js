// pages/address/addressList/addressList.js
var app = getApp();
var common = require("../../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_check:false,
    consignees: [],
    iconURL: app.dataBase.iconURL,
    consignee: "",
    mobile: "",
    fromWhere:'',
    ishide:true
  },

  // 获取收货地址接口
  loading:function(e){
    var that = this;
    common.showLoad(this);
    var uri = app.getPath.getaddresslist;
    var data = {
      is_default : '0',
    }
    common.ApiGateWayTest(uri , data, true , function(res){
      var data = res.data;
      if (res && res.data.success !== 1){
        common.toast('还未添加地址');
      } else if (res && data.success == 1){
        var address = data.result.consignees;
        that.setData({
          address: address,
        })
        common.hideLoad(that);
        common.setStorageSync('edit', address)
      }
    })
  },

  // 删除收货地址接口
  delAddress:function(e){
    var that = this;
    var addList = that.data.address;
    var content = '你确认删除吗';
    var confirmText = '确定';
    common.showModal(content, confirmText, function (res) {
      var uri = app.getPath.deladdress;
      var data = {
        address_ids: e.currentTarget.dataset.idcheck
      }
      res.confirm && common.ApiGateWayTest(uri, data, true, function (res) {
        if (res && res.data.success == 1) {
          that.setData({
            // address_id: that.data.address_id
          })
          that.loading();
          common.toast(res.data.msg)
        } else {
          common.toast(res.data.msg)
        }
      })
    })
  },

  // 编辑收货地址
  editAddress:function(e){
    var that = this;
    var datas = that.data.address[e.currentTarget.dataset.index];

    wx.navigateTo({
      url: '/pages/address/addressEdit/addressEdit?consignee=' + datas.consignee + '&mobile=' + datas.mobile + '&address=' + datas.address + '&is_default=' + datas.is_default + '&address_id=' + datas.address_id + '&pickup_id=' + datas.pickup_id + '&city=' + datas.regions.name + '&pickup_address=' + datas.pickup_address+'&address_extra='+datas.address_extra
    })

  },

  // 添加收货地址按钮
  addAddress:function(){
    wx.navigateTo({
      url:'/pages/address/address'
    })
  },
  // 跳转
  navTo: function (e) {
    if (this.data.fromWhere =='confirm'){
      var consignee = e.currentTarget.dataset.consignee;
      var pages = getCurrentPages()
      var prevPage = pages[pages.length - 1]  //当前界面
      var prevPage = pages[pages.length - 2]  //上一个页面
      prevPage.setData({
        consignee: consignee
      })
      wx.navigateBack({
        delta: 1
      })
    } else if (this.data.fromWhere == 'flashConfirm'){
      var consignee = e.currentTarget.dataset.consignee;
      var pages = getCurrentPages()
      var prevPage = pages[pages.length - 1]  //当前界面
      var prevPage = pages[pages.length - 2]  //上一个页面
      prevPage.setData({
        consignee: consignee
      })
      wx.navigateBack({
        delta: 1
      })
    }else{
      this.editAddress(e)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loading();
    if (options.hasOwnProperty('from')){
      this.setData({ fromWhere: options.from})
    }
    if (options.from == 'confirm' || options.from == 'flashConfirm'){
      this.setData({
        isshow:false
      })
    }else{
      this.setData({
        isshow: true
      })
    }
  },

  onShow:function(options){
    this.loading();
  }
})
