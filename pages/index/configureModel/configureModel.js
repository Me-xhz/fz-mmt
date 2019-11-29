// components/goodList3/goodList3.js
/**
 * type为2为两列列表
 * type为3为三列列表
 */
var app = getApp();
var common = require("../../../utils/common.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list:{
      type: Array,
      value:[],
      observer: function (newVal, oldVal, changedPath) {
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
        var that = this;
        newVal.forEach(function(data){
          data.forEach(function(item){
            if(item.sortype==2){
              item.goods = that.rowFormat(3,item.goods)
            }
          })
        })
        if(newVal.length>0){
          this.setData({ block_list: newVal })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    block_list:[]
  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    goThePage(e) {
      
      var item = e.target.dataset.route;
      var itemType = e.target.dataset.type;
      var pickup = common.getStorageSync('getpickup');
      if (itemType == 4){
        app.aldstat.sendEvent("on_index_combination_" + item.sort, {
          "提货点": pickup.cityName
        });
      }
      if (item.url == '' || item.param == '' || item.param.length == 0) return;
      if (item.url == 'url') {
        let url = "";
        let title = "";
        for (let i = 0; i < item.param.length; i++) {
          if (item.param[i].key == 'url') url = item.param[i].value;
          if (item.param[i].key == 'title') title = item.param[i].value;
        }
        window.open(url);
        return;
      }
      let jsonParams = {};
      for (let i = 0; i < item.param.length; i++) {
        jsonParams[item.param[i].key] = item.param[i].value;
      }
      // return
      if (item.url == "jumpindexmodel"){
        // 跳转聚合
        wx.navigateTo({
          url: '/pages/index/configureModelPage/configureModelPage?position=' + jsonParams.position
        })
      }else{
        if (jsonParams.type == 1) {
          // 专题
          wx.navigateTo({
            url: '/pages/projectPage/projectPage?entryType=external&type=3&id=' + jsonParams.id
          })
        } else {
          // 活动
          wx.navigateTo({
            url: '/pages/activity/activity?entryType=external&activity_id=' + jsonParams.id
          })
        }
      }
    },
    // 一键领取
    akeyToGet(e) {
      // console.log(e.target.dataset.ad_id);
      // return
      // 跳转登录
      if (!app.checkSessionKey) {
        common.goRegister();
        return false;
      }
      var that = this;
      var param = e.target.dataset.param;
      var ad_id = e.target.dataset.ad_id;
      var coupon_id = [];
      param.forEach(function (item) {
        coupon_id.push(item.id);
      })
      var uri = app.getPath.addCoupon;
      var data = {
        coupon_id: coupon_id
      }
      common.ApiGateWayTest(uri, data, true, function (res) {
        if (res && res.data && res.data.success == 1) {
          var result = res.data.result;
          common.toast(result.state_desc);
          that.triggerEvent('toGet', {},{})
          // if (result.state == 0) {
          //   that.adclose(ad_id, 1)
          // }
        }
      })
    },
    /**
   * 格式化一维数组为二维数组
   * colNum: 列数
   * arr：传入的总数组数
   * **/
    rowFormat(colNum, arr) {
      let FormatArr = [];
      let rowNum = arr.length / colNum;

      for (var i = 0; i < rowNum; i++) {
        FormatArr.push(new Array());
        for (var j = i * colNum; j < (colNum * (i + 1)); j++) {
          if (arr[j] != undefined) {
            FormatArr[i].push(arr[j]);
          }
        }
      }
      return FormatArr;
    }
  }
})
