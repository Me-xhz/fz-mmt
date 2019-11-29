// pages/address/address.js
var app = getApp();
var common = require("../../utils/common.js");
var thisArr = [];
var thisData;
var thisAdd = [];
var addArray;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    consignee: "",
    mobile: "",
    checkes: false,
    is_pick_up:0 ,
    warehouseId:'',
    city:{
      cityname:''
    },
    pickup:{
      cityname: ''
    },
    address_extra:'',
    address_tag:[],
    tag_num:-1,
    label_id:"",
    has_shop:''
  },

  // 获取收货人input的值
  nameInput:function(e){
    this.setData({
      'consignee': e.detail.value
    })

  },
  //获取闪送地址
  addressInput(e){
    this.setData({
      'address_extra': e.detail.value
    })
  },
  // 获取收货人手机号input的值
  phoneInput:function(e){
    this.setData({
      'mobile': e.detail.value
    })
  },
  switchChange:function(e){
    this.setData({
      'checkes': e.detail.value
    })
  },

  addAddress: function () {
    var that = this;
    if (that.data.consignee == '' || that.data.mobile == ''){
      common.toast('收货人或手机号不能为空');
      return;
    }
    if (this.data.address_extra == "" && that.data.has_shop == 1){
      common.toast('请输入闪送地址');
      return;
    };
    if (that.data.city.cityName == '') {
      common.toast('请选择城市');
      return;
    }
    if (that.data.is_pick_up == 0){
      common.toast('该城市暂无工厂');
      return;
    }
    if (!that.data.pickup.pickup_id||that.data.pickup.cityName == '') {
      common.toast('请选择工厂');
      return;
    }
    if (that.data.address_tag.length > 0 && that.data.has_shop == 1){
      if (that.data.label_id == "") {
        common.toast('请选择闪送地址');
        return;
      }
    }
   
    var uri = app.getPath.addaddress;
    
    var data = {
      consignee: that.data.consignee,
      mobile: that.data.mobile,
      pickup_id: that.data.pickup.pickup_id,
      is_default: that.data.checkes ? 1 : 0,
      address_extra:that.data.address_extra,
      pick_up_label_id: that.data.label_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res && res.data.success == 1) {
        var res = res.data.result;
        wx.navigateBack({
          delta:1
        })
      }

    })
  },
  getpickuplistr: function () {
    var that = this;
    var uri = app.getPath.pickuplistr;
    var city = that.data.city
    var data = {
      warehouse_id: that.data.city.warehouse_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var res = res.data;
      if (res.result.cities.length > 0) {
        that.setData({
          is_pick_up: 1
        })
      } else {
        that.setData({
          is_pick_up: 0
        })
      }
    })
  },
  // 获取提货点楼号标签
  getAddressTag(){
    var that=this;
    var url = app.getPath.pickupLabel;
    var data={
      pickup_id: this.data.pickup.pickup_id
    }
    common.ApiGateWayTest(url, data, true,function(res){
      var res=res.data
      if(res.success==1){
        if (res.result.has_shop != 1){
          that.setData({
            address_extra: "",
            address_tag: [],
            tag_num: -1,
            label_id: "",
            has_shop: ""
          })
        }else{
          that.setData({
            address_tag: res.result.list,
            has_shop: res.result.has_shop
          })
        }
      }
    })
  },
  // 切换标签
  change_tag(e){
    this.data.label_id = e.currentTarget.dataset.label_id;
    this.setData({
      tag_num: e.currentTarget.dataset.tagnum
    })
  },
  onLoad: function (options) {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    var city = common.getStorageSync('city');
    that.setData({
      pickup : pickup,
      city : city,
    })
    this.getpickuplistr()
  },
  onShow: function () {
    this.getAddressTag()
  },
})
