const app = getApp();
const common = require('../../utils/common.js')
const wxaSortPicker = require('../../utils/wxaSortPicker/wxaSortPicker.js');
Page({
  data: {
    deliveryOldnum: 0,
    wayNum: 0,
    addressName: "切换自提点",
    pickUpSelech: false,
    expressAuthList: {}
  },
  onLoad: function (options) {
    this.setData({
      addressName: options.pickupName,
      expressAuthList: common.getStorageSync('expressAuthList')
    })
  },
  onShow: function () {
    this.getUnclaimednum();
  },
  getUnclaimednum(){
    common.showLoad(this);
    var that = this;
    var url = app.getPath.unclaimednum;
    common.ApiLogistics(url,'',true,function(res){
      if (res.success == 1){
        that.setData({
          deliveryOldnum: res.result.data.num,
          wayNum: res.result.data.on_the_way_num
        })
      }else{
        common.toast('网络错误')
      }
      common.hideLoad(that);
    })
  },
  getUserPickUpApi(){
    var that = this;
    var uri = app.getPath.userPickUpList;
    common.ApiLogistics(uri, {}, true, function (res) {
      if (res.success == 1) {
        var cities_list = res.result.cities;
        cities_list.unshift({
          cityName: "全部提货点",
          pickup_id: 0,
          pinYin: "all",
          py: "all"
        })
        that.setData({
          cities_list: cities_list
        })
        wxaSortPicker.init(that.data.cities_list, that);
        that.setData({
          pickUpSelech: true
        })
      }
    })
  },
  wxaSortPickerItemTap(e){
    var city = e.target.dataset.citys;
    var pickup_id = city.pickup_id;
    common.setStorageSync('getExpressPickupId', pickup_id);
    this.setData({
      addressName: city.cityName,
      pickUpSelech: false
    })
    this.getUnclaimednum();
  },
  toRouter(e){
    var type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../../packageA/logistics/' + type,
    })
  },
  toNodelivery(e){
    var style = e.currentTarget.dataset.style;
    wx.navigateTo({
      url: '../../packageA/logistics/nodelivery?style=' + style,
    })
  }
})