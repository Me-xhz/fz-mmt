var app = getApp();
var common = require("../../utils/common.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    autoplay: true,
    interval: 3000,
    duration: 500,
    indicatorDots: true,
    indicatorColor: "rgba(0,0,0,.2)",
    indicatorActiveColor: "#FF7F95",
    shareContent: {},
    iconURL: app.dataBase.iconURL,
    showPhoneModal: false,
    join_id: 0,
    joinName: "",
    joinPhone: "",
    joinAge: "",
    joinFactory: "",
    showSkuDrawer:false,
    field_data:[],
    field_upd_data:[],
    selectedSkuArr:[],
    selected_field_idx:0,
    skuArr:[],
    countTimeDate: 0,
    countTimeType: 0,
    user_id: 0
  },
  onLoad: function (options) {
    var that = this;
    wx.showShareMenu({
      withShareTicket: true
    })
    common.showLoad(this);
    this.data.ad_id = options.ad_id;
    this.data.activity_id = options.activity_id;
    this.getActivity();
    // 从外部分享进入时，显示左上角回到首页  改动带external时为内部进入携带参数，外部进入不带参数
    if (options && options.entryType && options.entryType == 'external') {
      this.setData({
        isShowGoHome: false
      })
    } else {
      this.setData({
        isShowGoHome: true
      })
    }

    // 外部带商品店铺
    this.setData({
      entryData: options
    })
    var options = that.data.entryData;
    var pickupId = common.getStorageSync('getpickup');
    // 判断是否第一次进入 且是从外部进入，如二维码扫码 && app.firstlaunchApp
    if (options && (options.atitude || options.pickup_id) && !pickupId) {
      that.getExternal(options.pickup_id).then(function () {
        // 关闭开关，让app知道已经不是第一次进入当前页
        app.firstlaunchApp = false;
        // 清空data内携带参数
        that.data.entryData = {};
        // 外部已带经纬度定位，无需再调用定位接口，所以将缓存定位改为真，让页面可以显示
        common.setStorageSync('authSetting', {
          'scope.userLocation': true
        });
      })
    }
  },
  onReady(){
    common.hideLoad(this);
  },
  onShow(){
    // 上报关系链-存在token才上报
    var token = common.getStorageSync('token');
    if (token && token != '') {
      common.setInviteShareLogin()
    }
  },
  // 从外部二维码扫码，带经纬度和外部标识external
  getExternal: function (pickup_id) {
    var that = this;
    var uri = app.getPath.getpickup;
    var data = {
      pickup_id: pickup_id
    }
    return new Promise(function (resolve, reject) {
      // 获取提货点
      common.ApiGateWayTest(uri, data, true, function (res) {
        if (res && res.data && res.data.success == 1) {
          var res = res.data.result.cities.pick_up;
          common.setStorage({
            key: 'getpickup',
            data: {
              'pickup_id': res.pickup_id,
              'cityName': res.pickup_name,
              'pickup_address': res.pickup_address,
              'pickup_contact': res.pickup_contact,
              'pickup_phone': res.pickup_phone,
              'pickup_type': res.pickup_type
            }
          },function(res) {
            resolve('获取id成功')
          })
          common.setStorage({
            key: 'city',
            data: {
              'pickup_id': res.pickup_id,
              'warehouse_id': res.warehouse_id,
              'cityName': res.city_name,
              'is_pick_up': 1
            }
          })
        }
      })
    })
  },
  // 返回首页
  gotoHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  getActivity: function(){
    let that = this;
    wx.request({
      //正式服
      // url: 'https://api.activity.haoyousheng.com.cn/api/ActivityApi/activityList',
      //测试服
      url: 'https://api.t-activity.surex.cc/api/ActivityApi/activityList',
      data: {
        id: that.data.activity_id
      },
      header:{
        'X-Authorization' : common.getStorageSync('token')
      },
      method: 'post',
      success:function(res){
        let item = res.data;
        let ItemsJson = JSON.stringify(item.pageList.items);
        let Items = ItemsJson.replace(/px/g, "");
        that.setData({
          ConfigStyle: item.pageList.config.style,
          Items: JSON.parse(Items),
          shareContent: item.pageList.config,
          user_id: item.user_id
        })
        wx.setNavigationBarTitle({
          title: item.pageList.title
        })
        for (var i = 0; i < that.data.Items.length; i++){
          for (var k = 0; k < that.data.Items[i].children.length;k++){
            if (that.data.Items[i].children[k].type == "countdown"){
              var newDate = new Date().getTime();
              var startDate = new Date(that.data.Items[i].children[k].data.time.value[0]).getTime();
              var endDate = new Date(that.data.Items[i].children[k].data.time.value[1]).getTime();
              if (newDate < startDate){
                that.setData({
                  countTimeType: 0,
                  countTimeDate: startDate
                })
              }else{
                that.setData({
                  countTimeType: 1,
                  countTimeDate: endDate
                })
              }
            }
          }
        }
      },
      fail: function(res){
        wx.hideLoading()
      },
    })
  },
  imagesLoad: function(event){
    var that = this;
    var data = event.detail;
    that.setData({
      preImageWidth: data.width,
      preImageHeight: data.height
    })
  },
  hotpotLink: function(e){
    var that = this;
    var typeId = e.target.dataset.type;
    var id = e.target.dataset.id;
    if (typeId == 1){
      var uri = app.getPath.addCoupon;
      // 判断是否登录
      if (!app.checkSessionKey) {
        common.goRegister();
        return false;
      }
      var data = {
        coupon_id: id,
      }
      common.ApiGateWayTest(uri, data, true, function (res) {
        if (res.statusCode == 200 && !res.data.result.error_desc) {
          
          if (res.data.result) {
            common.toast(res.data.result.state_desc);
            that.adclose(that.data.ad_id, 1)
          }else{
            common.toast(res.data.msg);
          }
        }else{
          common.toast(res.data.result.error_desc);
        }
      });
    } else if (typeId == 2){
      wx.navigateTo({
        url: '../../pages/product/product?entryType=external&productId=' + id,
      })
    } else if (typeId == 3){
      wx.navigateTo({
        url: '../../pages/listdetail/listdetail?brand_id=' + id,
      })
    } else if (typeId == 5) {
      wx.navigateTo({
        url: '../../pages/projectPage/projectPage?entryType=external&type=3&id=' + id,
      })
    } else if (typeId == 6) {
      wx.navigateTo({
        url: '../../pages/projectPage/projectPage?entryType=external&type=5&id=' + id,
      })
    } else if (typeId == 7){
      wx.switchTab({
        url: '/pages/index/index'
      })
    } else if (typeId == 8) {
      // 判断是否登录
      if (!app.checkSessionKey) {
        common.goRegister();
        return false;
      }
      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: "linear",
        delay: 0
      })
      animation.translateY(300).opacity(1).step();
      that.setData({
        animationData: animation.export()
      })
      let uri = app.getPath.enrolluser;
      let data = {
        type: 1,
        activity_id: id
      }
      common.ApiGateWayTest(uri, data, true, function (res) {
        if (res.statusCode == 200) {
          if (res.data.result.status == 0) {
            var animation = wx.createAnimation({
              duration: 300,
              timingFunction: "linear",
              delay: 0
            })
            animation.translateY(300).opacity(1).step();
            that.setData({
              animationData: animation.export()
            })

            that.setData({
              join_id: id,
              showPhoneModal: true
            })
            setTimeout(function () {
              animation.translateY('-150px').translateX('-50%').step()
              that.setData({
                animationData: animation
              })
              if (e.currentTarget.dataset.status == 0) {
                that.setData({
                  showPhoneModal: false
                });
              }
            }.bind(that), 200)
            // 是否data内有数据，无则为正常信息填写，有则为配置信息填写
            that.setData({
              field_data:res.data.result.data
            })

          } else {
            common.toast(res.data.result.msg);
          }
        } else {
          common.toast("网络错误请重试！");
        }
      });
    } else if (typeId == 10) {
      wx.navigateTo({
        url: '../../packageA/team-product/team-product?entryType=external&teamId=' + id,
      })
    } else if (typeId == 11) {
      wx.navigateTo({
        url: '../../packageA/bargain/bargain?entryType=external&activity_bargain_id=' + id,
      })
    }
  },
  adclose: function (ad_id, is_close) {
    var that = this;
    var uri = app.getPath.adclose;
    var data = {
      ad_id, is_close
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
    })
  },
  countdown: function(){
    var that = this;

  },
  onShareAppMessage: function () {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    return {
      title: that.data.shareContent.shareTitle.value,
      path: '/pages/activity/activity?activity_id=' + that.data.activity_id + '&pickup_id=' + pickup.pickup_id + '&user_id=' + that.data.user_id,
      imageUrl: that.data.shareContent.shareImage.value,
      success: function (res) {
        console.log("转发成功");
      },
      fail: function (res) {
        console.log("转发失败");
      }
    }
  },
  phoneMaskSubmit: function() {
    let that = this;
    if (that.data.joinName.length == 0) {
      common.toast('请填写姓名');
      return;
    }
    if (that.data.joinPhone.length == 0) {
      common.toast('请填写手机号码');
      return;
    }
    if (that.data.joinAge.length == 0) {
      common.toast('请填写年龄');
      return;
    }
    if (that.data.joinFactory.length == 0) {
      common.toast('请填写工厂名称');
      return;
    }
    let uri = app.getPath.enrolluser;
    let data = {
      type: 2,
      real_name: that.data.joinName,
      mobile: that.data.joinPhone,
      factory_name: that.data.joinFactory,
      age: that.data.joinAge,
      activity_id: that.data.join_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res.statusCode == 200) {
        that.setData({
          joinName: "",
          joinPhone: "",
          joinAge: "",
          joinFactory: "",
          showPhoneModal: false
        });
        common.toast(res.data.result.msg);
      } else {
        common.toast("网络错误请重试！");
      }
    });
  },
  phoneMaskCancel: function() {
    this.setData({
      joinName: "",
      joinPhone: "",
      joinAge: "",
      joinFactory: "",
      showPhoneModal: false
    })
  },
  inputInfo: function(e) {
    if (e.currentTarget.dataset.item == 1) {
      this.setData({
        joinName: e.detail.value
      });
    } else if (e.currentTarget.dataset.item == 2) {
      this.setData({
        joinPhone: e.detail.value
      });
    } else if (e.currentTarget.dataset.item == 3) {
      this.setData({
        joinAge: e.detail.value
      });
    } else if (e.currentTarget.dataset.item == 4) {
      this.setData({
        joinFactory: e.detail.value
      });
    }
  },
  // 弹窗动画js
  showSkuDrawerHandle:function(){
    const animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    if (!this.data.showSkuDrawer){
      animation.bottom(0).step();
    }else{
      animation.bottom(-700).step();
    }
    this.setData({
      skuAnimationData: animation.export(),
      showSkuDrawer: !this.data.showSkuDrawer
    })
  },
  // 选择规格  弹窗
  showSku:function(e){
    var idx = e.currentTarget.dataset.idx;
    let field_list = this.data.field_data[idx].field_list;
    this.setData({
      select_label_name: this.data.field_data[idx].label_name,
      goods_id: this.data.field_data[idx].field_list[0].goods_id,
      selectedSkuArr: field_list,
      selected_field_idx:idx
    })
    this.showSkuDrawerHandle();
    this.selectGood();
  },
  selectGood:function(e){
    if(e){
      var index = e.currentTarget.dataset.index;
      var goods_id = e.currentTarget.dataset.goodid;
    }else{
      var index = 0;
      var goods_id = this.data.goods_id;
    }
    let properties = this.data.selectedSkuArr[index];
    this.setData({
      goods_id,
      good_idx:index,
      properties: properties,
      skuArr:[]
    })
    let maybeStock = [];
    // 将所有规格提取成数组
    for (var i = 0; i < properties.spec_name.length; ++i) {
      var property = properties.spec_name[i];
      maybeStock[i] = [];
      for (var j = 0; j < property.attrs.length; j++) {
        maybeStock[i].push(property.attrs[j].id);
      }
    }
    // 获取笛卡尔积组合
    maybeStock = common.multiCartesian(maybeStock);
    this.data.maybeStock = maybeStock;
  },
  selectAttr:function(e){
    // skuArr 当前选择的规格组合的存放数组
    // 规格组名index
    let idx = e.currentTarget.dataset.idx;
    let skuId = e.currentTarget.dataset.attr.id;
   
    var skuArr = this.data.skuArr.concat();  // 防止引用
    skuArr[idx] = skuId;
    if (this.data.properties.spec_name.length==skuArr.length){
      var skuStr = skuArr.join('_');
      var btn = false;
      this.data.properties.spec_key.forEach(function(item){
        if(item==skuStr){
          btn = true;
        }
      })
      if(!btn){
        common.toast('商品无库存');
        return false;
      }
    }
    
    this.setData({
      skuArr
    })
  },
  affirm:function(){
    var skuArr = this.data.skuArr;
    var str = this.data.properties.goods_name;
    if (skuArr.length < this.data.properties.spec_name.length){
      common.toast('请选择规格');
      return false;
    }
    this.data.properties.spec_name.forEach(function(item,index){
      for(var i in item.attrs){
        if(item.attrs[i].id==skuArr[index]){
          str += '/' + item.attrs[i].item;
        }
      }
    })


    var field_data = this.data.field_data;
    field_data[this.data.selected_field_idx].val = str;
    var field_upd_data = this.data.field_upd_data;
    field_upd_data[this.data.selected_field_idx] = this.data.goods_id + '+' +skuArr.join('_');

    // return
    this.setData({
      field_upd_data,
      field_data
    })
    this.showSkuDrawerHandle()
  },
  // 输入框双向绑定
  inputBind:function(e){
    let val = e.detail.value;
    let idx = e.target.dataset.idx;
    
    var field_upd_data = this.data.field_upd_data;
    field_upd_data[idx] = val;
    this.setData({
      field_upd_data
    })
  },
  // 提交
  field_upd:function(){
    var that = this;
    var fLen1 = this.data.field_upd_data.length;
    var fLen2 = this.data.field_data.length;
    // 判断是否为空
    if (fLen1 < fLen2){
      common.toast('请填写所有数据');
      return false;
    }
    for (var i = 0;i<fLen2;i++){  
      if (this.data.field_upd_data[i] == undefined || this.data.field_upd_data[i]==''){
        common.toast('请填写所有数据');
        return false;
      }
    }

    var field_data = this.data.field_data;
    var name_key = [];
    field_data.forEach(function(item){
      name_key.push(item.field_id);
    })
    // return;
    let uri = app.getPath.enrolluser;
    let data = {
      type: 2,
      name_key: name_key.join(','),
      name: this.data.field_upd_data.join(','),
      activity_id: that.data.join_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      if (res.statusCode == 200) {
        that.setData({
          joinName: "",
          joinPhone: "",
          joinAge: "",
          joinFactory: "",
          showPhoneModal: false
        });
        that.adclose(that.data.ad_id, 1)
        common.toast(res.data.result.msg);
      } else {
        common.toast("网络错误请重试！");
      }
    });
  },
  goProduct(e){
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../../pages/product/product?entryType=external&productId=' + id,
    })
  }
})