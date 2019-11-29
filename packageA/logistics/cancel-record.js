const app = getApp();
const common = require('../../utils/common.js')

Page({

  data: {
    dateValue: "",
    searchValue: "",
    page:1,
    page_size:10,
    showEnd: false,
    boxOrderInfo: [],
    boxOrderNumber: 0,
    numberModelStatus: false,
    cancelList:[],
    numberList: [],
    pickup_id:'',
    pickerArray: [],
    pickerIndex: 0,
    showBottomLoading: false,
  },

  onLoad: function (options) {
    this.data.pickup_id=common.getStorageSync('getExpressPickupId');
    this.getAlreadyWriteOffOrderList();
    this.getNowDate()
  },
  // 获取日期
  getNowDate(){
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    this.setData({
      dateValue: currentdate
    })
  },
  bindTimeChange(e){
    this.setData({
      dateValue: e.detail.value
    })
    this.data.boxOrderInfo = {};
    this.data.page = 1
    this.getAlreadyWriteOffOrderList();
  },
  searchInput(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  searchCifim(){
    this.data.boxOrderInfo = {};
    this.data.page=1
    this.getAlreadyWriteOffOrderList();
  },
  onReachBottom: function () {

  },
  showNumberModel(){
        this.setData({
          numberModelStatus: true
        })
  },
  //获取弹窗列表
  getModelList(){
    let url=app.getPath.getAlreadyWriteOffGoodsCount
    let that=this
    let date = new Date(that.data.dateValue).getTime();
    let data={
      pickup_id:this.data.pickup_id,
      search_time:date,
      key_word:that.data.searchValue
    }
    common.ApiLogistics(url,data,true,function (res) {
      if(res.success==1){
        that.setData({
          numberList:res.result
        })
      }
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
    this.data.page = 1
    this.data.boxOrderInfo = {};
    this.data.pickup_id=this.data.pickerArray[e.detail.value].pickup_id
    this.getAlreadyWriteOffOrderList()
  },
  onCall(e){
    console.log(e)
    var mobile = e.currentTarget.dataset.mobile;
    wx.makePhoneCall({
      phoneNumber: mobile
    })
  },
  // 上拉加载
  onReachBottom: function () {
    this.getMoreList()
  },
  // 上拉获取更多
  getMoreList(){
    if (this.data.cancelList.length > 0 && this.data.cancelList.length%this.data.page_size==0){
      console.log(this.data.cancelList.length % this.data.page_size)
      let url = app.getPath.getAlreadyWriteOffOrderList
      let that = this
      let date = new Date(that.data.dateValue).getTime();
      let data = {
        page: this.data.cancelList.length / this.data.page_size+1,
        page_size:this.data.page_size,
        pickup_id: this.data.pickup_id,
        search_time: date,
        key_word: that.data.searchValue
      }
      this.setData({
        showBottomLoading: true
      })
      common.ApiLogistics(url, data, true, function (res) {
        if (res.success == 1) {
          that.setData({
            cancelList: [...that.data.cancelList, ...res.result.list],
            showBottomLoading:false
          })
        }
      })
    }
  },
  //获取已核销订单
  getAlreadyWriteOffOrderList(){
    let url=app.getPath.getAlreadyWriteOffOrderList
    let that=this
    let date = new Date(that.data.dateValue).getTime();
    let data={
      page: this.data.page,
      page_size: this.data.page_size,
      pickup_id:this.data.pickup_id,
      search_time:date,
      key_word:that.data.searchValue
    }
    common.ApiLogistics(url,data,true,function (res) {
      if(res.success==1){
        let all={
          pickup_name:'全部',
          pickup_id:''
        }
        res.result.pickupInfo.unshift(all)
        res.result.pickupInfo.forEach((val,key)=>{
          if(val.pickup_id==that.data.pickup_id){
            that.setData({
              pickerIndex:key
            })
          }
        })
        that.setData({
          boxOrderInfo:res.result,
          cancelList: res.result.list,
          pickerArray:res.result.pickupInfo,
          showBottomLoading: false
        })
        that.getModelList()
      }
    })
  },
  // 滚动溢出
  bindtouchmove() {
    return false
  },
})
