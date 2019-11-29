const app = getApp();
const common = require('../../utils/common.js')

Page({

  data: {
    dateValue: "",
    searchValue: "",
    page: 1,
    page_size: 20,
    showEnd: false,
    boxOrderInfo: [],
    boxOrderNumber: 0,
    numberModelStatus: false,
    numberList: [],
    pickerArray: ['全部', '已售后','未提货'],
    pickerIndex: 0,
    pageStyle: 1,
    boxGoodsInfoCount: 0
  },

  onLoad: function (options) {
    this.setData({
      pageStyle: options.style
    })
    wx.setNavigationBarTitle({
      title: options.style == 2 ? '在途中订单' : options.style == 3 ? '售后到库订单' : '未提货订单'
    })
    this.searchSubmit();
    this.getNumberBox();
  },
  bindTimeChange(e){
    this.setData({
      dateValue: e.detail.value
    })
    this.data.page = 1;
    this.data.page_size = 20;
    this.data.boxOrderInfo = [];
    this.searchSubmit();
    this.getNumberBox();
  },
  searchInput(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  searchCifim(){
    this.data.page = 1;
    this.data.page_size = 20;
    this.data.boxOrderInfo = [];
    this.searchSubmit();
    this.getNumberBox();
  },
  searchSubmit(){
    common.showLoad(this);
    var that = this;
    var url = app.getPath.unclaimedInfo;
    var date = new Date(that.data.dateValue).getTime();
    var data = {
      key_word: that.data.searchValue,
      page: that.data.page,
      page_size: that.data.page_size,
      search_time: date,
      unclaimed_status: Number(that.data.pickerIndex),
      list_type: Number(that.data.pageStyle)
    }
    common.ApiLogistics(url,data,true,function(res){
      if (res.success == 1){
        if (res.result.boxOrderInfo && res.result.boxOrderInfo.length > 0) {
          that.data.boxOrderInfo = that.data.boxOrderInfo
            ? that.data.boxOrderInfo.concat(res.result.boxOrderInfo)
            : res.result.boxOrderInfo;
        }
        that.setData({
          boxOrderInfo: that.data.boxOrderInfo,
          boxOrderNumber: res.result.count
        })
      }
      common.hideLoad(that);
    })
  },
  onReachBottom: function () {
    if (this.data.boxOrderInfo && this.data.boxOrderInfo.length % this.data.page_size == 0) {
      this.data.page = this.data.boxOrderInfo.length / this.data.page_size + 1;
      this.searchSubmit();
    } else {
      this.setData({
        showEnd : true
      })
      common.toast('没有更多了~')
    }
  },
  getNumberBox(){
    var that = this;
    var url = app.getPath.unclaimedGoodsInfo;
    var date = new Date(that.data.dateValue).getTime();
    var data = {
      key_word: that.data.searchValue,
      search_time: date,
      unclaimed_status: Number(that.data.pickerIndex),
      list_type: Number(that.data.pageStyle)
    }
    common.ApiLogistics(url, data, true, function (resData) {
      if (resData.success == 1){
        that.setData({
          numberList: resData.result.boxGoodsInfo,
          boxGoodsInfoCount: resData.result.count
        })
      }
    })
  },
  showNumberModel(){
    this.setData({
      numberModelStatus: true
    })
  },
  hideNumberModel(){
    this.setData({
      numberModelStatus: false
    })
  },
  bindPickerChange(e) {
    this.setData({
      pickerIndex: e.detail.value
    })
    this.searchCifim();
  },
  onCall(e){
    var mobile = e.currentTarget.dataset.mobile;
    wx.makePhoneCall({
      phoneNumber: mobile
    })
  },
  goDetail(e){
    var order_sn = e.currentTarget.dataset.orderSn;
    wx.navigateTo({
      url: './nodelivery_detail?orderSn=' + order_sn
    })
  },  
  // 滚动溢出
  bindtouchmove() {
    return false
  },
})