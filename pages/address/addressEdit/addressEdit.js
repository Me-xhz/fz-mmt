// pages/address/address.js
var app = getApp();
var common = require("../../../utils/common.js");
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
    pickupName: "...",
    atitudes: '',
    pickuplist: '',
    pickup: null,
    is_default:false,
    is_pick_up: 1,
    disabled:true,
    city: {
      cityname: ''
    },
    pickup: {
      cityname: ''
    },
    address_extra:'',
    address_tag: [],
    tag_num: -1,
    label_id: "",
    has_shop:""
  },

  // 获取收货人input的值
  nameInput: function (e) {
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
  phoneInput: function (e) {
    this.setData({
      'mobile': e.detail.value
    })
  },
  switchChange: function (e) {
    this.setData({
      'is_default': e.detail.value
    })
  },

  // 修改地址接口
  editAddress: function () {
    var that = this;
    if (that.data.consignee == '' || that.data.mobile == '') {
      common.toast('收货人或手机号不能为空');
      return;
    }
    if (that.data.city.cityName == '') {
      common.toast('请选择城市');
      return;
    }
    if (this.data.address_extra == "" && that.data.has_shop == 1){
      common.toast('请输入闪送地址');
      return;
    };
    if (that.data.is_pick_up == 0) {
      common.toast('该城市暂无提货点');
      return;
    }
    if (that.data.pickup.cityName == '') {
      common.toast('未选择提货点或提货点错误');
      return;
    }
    if (that.data.label_id == ""&& that.data.has_shop==1) {
      common.toast('请选择闪送地址');
      return;
    }
    var uri = app.getPath.alteraddress;
    var data = {
      consignee: that.data.consignee,
      mobile: that.data.mobile,
      address_id: that.data.address_id,
      pickup_id: that.data.pickup.pickup_id,
      is_default: that.data.is_default ? 1 : 0,
      address_extra:that.data.address_extra,
      pick_up_label_id: that.data.label_id
    }

    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res && res.data.success == 1) {
        var res = res.data.result;
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      'consignee': options.consignee,
      'mobile': options.mobile,
      'is_default': Number(options.is_default),
      'address_id': options.address_id,
      'city':{
        'cityName': options.city
      },
      'pickup':{
        'pickup_id': options.pickup_id,
        'cityName': options.address,
        'pickup_address': options.pickup_address
      },
      'address_extra':options.address_extra
    })
  },

  onShow: function (options) {
    var that = this;
    this.getAddressTag();
    // if(!typeof(options)=="undefined"){
      // that.setData({
      //   pickup: wx.getStorageSync('getpickup')
      // });
    // }
  },
  // 获取提货点楼号标签
  getAddressTag() {
    var that = this;
    var url = app.getPath.pickupLabel;
    var data = {
      pickup_id: this.data.pickup.pickup_id,
      address_id: this.data.address_id
    }
    common.ApiGateWayTest(url, data, true, function (res) {
      var res = res.data
      if (res.success == 1) {
        
        res.result.list.forEach((val,index)=>{
          if (val.is_selected==1){
            that.data.tag_num=index
            that.data.label_id = val.pick_up_label_id
          }
        })
        if (res.result.has_shop != 1) {
          that.setData({
            address_extra: "",
            address_tag: [],
            tag_num: -1,
            label_id: "",
            has_shop: ""
          })
        } else {
          that.setData({
            address_tag: res.result.list,
            tag_num: that.data.tag_num,
            has_shop: res.result.has_shop
          })
        }
      }
    })
  },
  // 切换标签
  change_tag(e) {
    this.data.label_id = e.currentTarget.dataset.label_id;
    this.setData({
      tag_num: e.currentTarget.dataset.tagnum
    })
  },
})
