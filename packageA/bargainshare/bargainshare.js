// packageA/bargainshare/bargainshare.js
//获取应用实例
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isFace:false, //是否一刀砍成
    Qrcode:'',
    isQrcode:false,
    bargainData: "",
    iconURL: app.dataBase.iconURL,
    helpPriceMoudle: false,
    bargaining_id: 0,
    d: "00",
    h: "00",
    m: "00",
    s: "00",
    rankList: [],
    page: 1,
    page_size: 20,
    bargainStutar: "",
    rule: {},
    bargainByFriendInfo: {},
    showRules: true,
    iphoneXBottom: "0rpx",
    range_price: 0,
    shareMoudle: false,
    selfInfo: {},
    showCountMode: false,
    takeoutAnimation: false,
    helpEndMoudle: false,
    // 广告
    duration: 500,
    interval: 5000,
    indexAdcurrent: 0,
    indicatorColor: "#fff",
    indicatorActiveColor: "#eb3c39",
    circular: true,
    autoplay: false,
    adList: [],
    indicatorDots: false,
    rankListBarType: '0'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      //小程序上线后 处理携带后的参数
      if (options.scene) {   
        let strList = decodeURIComponent(options.scene).split('&')
        options={}
        strList.map((item,index)=>{
          let newStr=item.split('=')
          options[newStr[0].replace(/\s*/g,"")]=newStr[1]
        })
      }
      /**
       * 这里判断的是否一刀砍价携带过来的参数
       * 由于小程序码最大只能携带32个字符，尽量避免对原有逻辑进行改动
       * 所以对小程序携带的参数进行了缩写 对比如下
       * 目前为26位，一旦用户量超过百万 得继续缩小
       * bargaining_id =>bg
       * pickup_id   =>pk
       * user_id    =>us 
       * fc              新增 判断是否为一刀砍价 1 是 0 否
       */

       console.log(options,"原始参数")
      if (options.fc==1) {
        this.setData({
          isFace:true
        })
        options={
          bargaining_id:options.bg,
          pickup_id:options.pk,
          user_id:options.us,
          fc:options.fc
        }
       }

    console.log("砍价进入参数",options)
       
    var that = this;
    wx.showShareMenu({
      withShareTicket: true
    })
    that.getAd();
    that.data.bargaining_id = options.bargaining_id;
    if (options.self_info && options.self_info != ''){
      // 有self_info代表是提出砍价进入
      that.setData({
        selfInfo: JSON.parse(options.self_info),
        shareMoudle: true
      })
    }
    // 外部带商品店铺
    that.setData({
      entryData: options
    })
    var options = that.data.entryData;
    
    var pickupId = common.getStorageSync('getpickup');
    // 判断是否第一次进入 且是从外部进入，如二维码扫码 && app.firstlaunchApp
    if (options && (options.atitude || options.pickup_id) && !pickupId) {
        //如果有携带参数 且 参数有提货点ID 且小程序没有提货点id
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
    
    wx.getSystemInfo({
      success: function (res) {
        var model = res.model
        if (model.search('iPhone X') != -1) {
          that.setData({
            iphoneXBottom: '68rpx'
          })
        }
      }
    })


  },
  onHide(){
    clearInterval(this.timeStart);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    that.getBargainingInfo();
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
              'pickup_type': res.pickup_type,
            }}, function (res) {
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
  //获取广告图
  getAd: function () {
    var that = this;
    var uri = app.getPath.adlist;
    var data = {
      pid: 10
    }
    return new Promise(function (resolve, reject) {
      common.ApiGateWayTest(uri, data, true, function (res) {
        if (res && res.data && res.data.success == 1) {
          var data = res.data.result;
          if (data.length > 1) {
            that.setData({
              indicatorDots: true
            })
          } else {
            that.setData({
              indicatorDots: false
            })
          }
          that.setData({
            adList: data,
            indexAdcurrent: 0,
            // share_title: data.share_title,
            indicatorDots: data.length > 1 ? true : false,
            // keyWord: data.keyword
          })
          resolve('successAd');
        }
      })
    })
  },
  adclose: function (ad_id, is_close) {
    var that = this;
    var uri = app.getPath.adclose;
    var data = {
      ad_id,
      is_close
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
    })
  },
  // 跳转指定专题页
  goWebView: function (e) {
    common.goAdWebView(e);
  },
  // 获取砍价信息
  getBargainingInfo() {
    var that = this;
    common.showLoad(that);
    var uri = app.getPath.bargainInfo;
    var data = {
      activity_bargaining_id: that.data.bargaining_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
   
      var resData = res.data;
      if (resData.success == 1 && resData.result.activity_bargaining_id) {
        var bargainStutar = "";
        if (resData.result.is_self == 1 && resData.result.status == 0){
          var bargainStutar = "商品抢完后未能砍成即视为砍价失败";
        } else if (resData.result.is_self == 1 && resData.result.status == 2){
          var bargainStutar = "砍价超时，失败了";
        } else if (resData.result.is_self == 1 && resData.result.status == 1){
          var bargainStutar = "砍价成功，请在倒计时结束前购买";
        } else if (resData.result.is_self == 1 && resData.result.status == 3) {
          var bargainStutar = "砍价已完成";
        } else if (resData.result.is_self == 1 && resData.result.status == 4) {
          var bargainStutar = "支付已过期";
        }
        that.setData({
          bargainData: resData.result,
          floor_price:(resData.result.floor_price.toFixed(2)).split("."),
          activity_price:(resData.result.activity_price.toFixed(2)).split("."),
          bargaining_id: resData.result.activity_bargaining_id,
          bargainStutar: bargainStutar,
          range_price: (Number(resData.result.activity_price) - Number(resData.result.floor_price)).toFixed(2)
        })
        // 判断没有次数
        if (that.data.isFace && res.data.result.face_bargain_num == 0 && that.data.bargainData.status == 0 &&  that.data.bargainData.is_self == 0 && res.data.result.is_face_bargain == 0) {
          common.showRidoModal('今日面对面砍价次数已用完','确定',res=>{
          })
           that.setData({
             isFace:false
           })
        }
        if (that.data.bargainData.is_face_bargain == 1) {
          that.setData({
            isFace:false
          })
        }
        that.getRank();
        that.getTeamRule();
        // that.getIsShowShopCouponAd();
        var nowtime = new Date().getTime() / 1000;
        if (resData.result.end_time > nowtime){
          that.countDown(resData.result.end_time)
        }
      } else {

        return
      }
      common.hideLoad(that);
    })
  },
  exitQrcode:function(){
    this.setData({
      isQrcode:false,
      Qrcode:''
    })
  },
  // 面对面砍价 
  faceBargain:function(){
        var that=this
        let qrUrl= app.getPath.getFaceBargainCode
        var pickup = common.getStorageSync('getpickup');
        //  传递参数
        let  data={
          bg:that.data.bargaining_id,
          pk:pickup.pickup_id,
          us:that.data.bargainData.user_id,
          fc:1
        }
        common.showLoad(that)
        common.ApiGateWayTest(qrUrl, data, true, function(res){
            common.hideLoad(that)
            if (res.data.success == 1) {
              that.setData({
                isQrcode:true,
                Qrcode:res.data.result.Buffer
              })
            }else{
              common.toast('生成二维码失败！')
              
            }
        } )
        
  },
  // 帮朋友砍价
  getBargainByFriend() {
    var that = this;
    // var uri = app.getPath.bargainByFriend;
    var  uri ='/FaceBargain/FaceBargain'
    var checkOrderUri = app.getPath.checkDistance;
    
    // TODO  砍价 在这判断是否一刀砍价 1是面对面 0 是普通砍价
    let isFaceNow= that.data.isFace ? '1' :'0'
    

    var data = {
      activity_bargaining_id: that.data.bargaining_id,
      isFace:isFaceNow
    }
    var checkOrderData = {
      activity_bargaining_id: that.data.bargaining_id ? that.data.bargaining_id : 0,
      time_atitude: app.dataBase.userAtitude,
    }
    common.ApiGateWayTest(checkOrderUri, checkOrderData, true, function (disRes) {
      if (disRes.data.success == 1) {
        common.ApiGateWayTest(uri, data, true, function (res) {
          var resData = res.data;
          if (resData.success == 1) {
            that.setData({
              isFace:false
            })
            if (resData.result.status == 1){
              let achieve_url=app.getPath.achieveHelpBargain
              let achieve_data={
                activity_bargaining_id:that.data.bargaining_id
              }
              common.ApiGateWayTest(achieve_url,achieve_data,true,function (achieve_res) {
                if(achieve_res.data.result.state==0){
                  common.toast(achieve_res.data.result.state_desc)
                }
                that.setData({
                  bargainByFriendInfo: resData.result,
                  helpPriceMoudle: true
                })
                that.getBargainingInfo();
              })
            }else{
              that.setData({
                helpEndMoudle: true
              })
            }
          } else {
            common.toast(resData.msg);
            return
          }
        })
      } else {
        common.toast(disRes.data.msg);
        return
      }
    })
  },
  // 隐藏帮砍弹窗
  hideHelpPriceMoudle(e) {
    var that = this;
    common.formIdUpdate(e);
    that.setData({
      helpPriceMoudle: false
    })
  },
  // 隐藏帮砍次数用完弹窗
  hideHelpEndMoudle(e) {
    var that = this;
    common.formIdUpdate(e);
    that.setData({
      helpEndMoudle: false
    })
    that.getBargainingInfo();
  },
  // 分享隐藏
  shareFromId(e) {
    var that = this;
    common.formIdUpdate(e);
    common.showLoad(this);
    setTimeout(() => {
      common.hideLoad(that);
      that.setData({
        shareMoudle: false
      })
    }, 2000)
  },
  //  获取砍价排行榜
  getRank() {
    var that = this;
    var uri = app.getPath.bargainList;
    var data = {
      page: that.data.page,
      page_size: that.data.page_size,
      activity_bargaining_id: that.data.bargaining_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (resData.success == 1) {
        that.setData({
          rankList: resData.result
        })
      }
    })
  },
  //答谢
  toThank(e){
    let that=this
    let url=app.getPath.bargainRewardScore
    let item=e.currentTarget.dataset.item
    let data={
      id:item.id,
      user_id:item.user_id,
      activity_bargaining_id:item.activity_bargaining_id
    }
    common.ApiGateWayTest(url, data, true, function (res) {
      if(res.data.success==1){
        that.getRank();
      }else{
        common.toast(res.data.msg)
      }

    })
  },
  // 倒计时函数
  countDown(endtime) {
    var that = this;
    var nowtime = new Date().getTime() / 1000;
    var lesstime = endtime - nowtime;
    clearInterval(that.timeStart);
    that.timeStart = setInterval(()=>{
      if (lesstime > 0) {
        lesstime --;
        var d = parseInt(lesstime / 60 / 60 / 24);
        var h = parseInt(lesstime / 60 / 60 % 24) + d * 24;
        var m = parseInt(lesstime / 60 % 60);
        var s = parseInt(lesstime % 60);
        if (h < 10) {
          h = "0" + h
        }
        if (m < 10) {
          m = "0" + m
        }
        if (s < 10) {
          s = "0" + s
        }
        that.setData({
          h: h,
          m: m,
          s: s
        });
      } else {
        clearInterval(that.timeStart);
        that.getBargainingInfo();
      }
    },1000)
  },
  //规则的显示隐藏
  showRule(e) {
    var that = this;
    common.formIdUpdate(e);
    this.setData({
      showRules: !that.data.showRules
    })
  },
  //关闭自己砍价弹窗
  closeModal() {
    var that = this;
    that.setData({
      shareMoudle: false
    })
  },
  //获取拼团规则
  getTeamRule() {
    var that = this;
    var uri = app.getPath.bargainRule;
    var data = {
      activity_bargain_id: that.data.bargainData.activity_bargain_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      that.setData({
        rule: res.data.result.rule
      })
    })
  },
  // 分享获取上报
  onShare(e){
    var that = this;
    var moudel = e.currentTarget.dataset.moudel;
    common.formIdUpdate(e);
    if (moudel == 'self'){
      that.setData({
        shareMoudle: false
      })
    }
  },
  // 发起砍价
  launchBar(e){
    var that = this;
    common.formIdUpdate(e);
    that.setData({
      helpEndMoudle: false
    })
    var pickup = common.getStorageSync('getpickup');
    wx.navigateTo({
      url: '../bargain/bargain?activity_bargain_id=' + that.data.bargainData.activity_bargain_id + '&entryType=external' + '&termination=true',
    })
  },
  // 立即购买
  goPay(e){
    var that = this;
    common.formIdUpdate(e);
  },
  // 返回首页
  gotoHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 是否有可领取优惠券
  getIsShowShopCouponAd() {
    var that = this;
    var uri = app.getPath.isShowShopCouponAd;
    var data = {
      type: 1
    }
    common.ApiGateWayTest(uri, data, true, res => {
      var resData = res.data;
      if (resData.success == 1) {
        if (resData.result.status == 1) {
          that.shop_id = resData.result.shop_id;
          that.setData({
            showCountMode: true
          })
        } else {
          that.setData({
            showCountMode: false
          })
        }
      } else {
        common.toast(resData.msg);
        return
      }
    })
  },
  // 跳转店铺
  goTakeoutShop() {
    var that = this;
    wx.navigateTo({
      url: '/packageA/takeout-shop/takeout-shop?entryType=external&shop_id=' + that.shop_id,
    })
  },
  // 滚动判断
  onPageScroll(){
    if (!this.data.takeoutAnimation) {
      this.setData({
        takeoutAnimation: true
      })
    } else {
      clearTimeout(this.scroll);
      this.scroll = setTimeout(() => {
        if (this.data.takeoutAnimation){
          this.setData({
            takeoutAnimation: false
          })
        }
      }, 1000)
    }
  },
  // 单独购买
  goShop(e) {
    var that = this;
    // 未登录跳转
    if (!app.checkSessionKey) {
      common.goRegister();
      return false;
    }
    common.formIdUpdate(e);
    if (that.data.bargainData.is_floor_price == 0) {
      common.showModal('砍价成功后，您可以用更低的价格进行购买，您还确定要购买吗？', '继续购买', function (res) {
        if (res.confirm) {
          next();
        }
      })
    } else {
      next();
    }

    function next() {
      var bargainData = that.data.bargainData;
      var checkOrderUri = app.getPath.preCheckOrder;
      var orderProduct = [{
        goods_id: bargainData.goods_id,
        sku_key: bargainData.stock[0].key,
        num: 1
      }]
      orderProduct = JSON.stringify(orderProduct);
      var checkOrderData = {
        order_product: orderProduct,
        activity_bargaining_id: bargainData.activity_bargaining_id ? bargainData.activity_bargaining_id : 0,
        time_atitude: app.dataBase.userAtitude,
      }
      common.ApiGateWayTest(checkOrderUri, checkOrderData, true, function (resData) {
        if (resData.data.success == 1) {
          // 缓存跳转确认订单页面
          var datas = [{
            goods_id: bargainData.goods_id,
            sku_key: bargainData.stock[0].key,
            amount: 1,
            team_order: 0,
            activity_bargaining_id: bargainData.activity_bargaining_id,
            activity_bargain_id: bargainData.activity_bargain_id,
            channel: 1
          }];
          common.setStorage({
            key: "nowPay",
            data: datas
          })
          wx.navigateTo({
            url: '/pages/confirm/confirm',
          })
        } else {
          common.toast(resData.data.msg);
          return
        }
      })
    }
  },
  // 切换帮砍列表选项
  rankListBar(e){
    var type = e.currentTarget.dataset.type;
    this.setData({
      rankListBarType: type
    })
  },
  // 滚动溢出
  bindtouchmove() {
    return false
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    return {
      title: that.data.bargainData.share_title,
      path: '/packageA/bargainshare/bargainshare?bargaining_id=' + that.data.bargaining_id + '&pickup_id=' + pickup.pickup_id + '&user_id=' + that.data.bargainData.user_id,
      imageUrl: that.data.bargainData.share_img
    }
  }
})
