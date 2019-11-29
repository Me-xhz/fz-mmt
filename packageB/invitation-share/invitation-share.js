// packageB/invitation-share/invitation-share.js
var app = getApp();
const common = require("../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //未领取代金券的id数组
    tiketList:[],
    requestNum:0,
    iconURL: app.dataBase.iconURL,
    headerTitle: '邀请好友成功下单可再开启现金红包',
    maxRedEnvelopes: '3',
    invitationRecord: {},
    swiperNotice:[],
    swiperCurrent: 0,
    csInviteList: {},
    red_packet_id: 0,
    showRedEnvel: false,
    evelop:false,
    sclType: 1,
    shareInfoInvite: {
      fromButton: 'envelopes'
    },
    shareInfoUrge: {
      fromButton: 'notice'
    },
    guideIsShow: false,
    guideIsShowBtn: true,
    invite_list: [],
    invite_list_urge: [],
    swiperNoticeTime: '',
    swiperNoticeTimeout: '',
    redLogShow: false,
    redActivityShow: false,
    popupShow: false,
    redLogList: [],
    rule_img: '',
    
    // showaword:false//控制邀请奖励的显示内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.sclType = options.type;
    var entry_share_info = common.getStorageSync('entry_share_info');
    this.setData({
      rule_img: entry_share_info.rule_img
    })
    wx.showShareMenu({
      withShareTicket: true
    })
    this.getCsTopNotice();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getCsInviteList();
  },
  onHide: function(){
    var promptStatus = common.getStorageSync('promptStatus');
    if (promptStatus){
      this.setData({
        guideIsShowBtn: false
      })
    }
  },
  onUnload: function(){
    clearTimeout(this.data.swiperNoticeTime);
    clearTimeout(this.data.swiperNoticeTimeout);
  },
  getCsTopNotice(){
    var that = this;
    var url = app.getPath.csTopNotice;
    this.setData({
      swiperNotice: []
    })
    that.data.swiperNoticeTime = setTimeout(()=>{
      common.ApiCoordination(url, '', true, function (res) {
        var resData = res.data;
        if (resData.result) {
          if (resData.result.length == 1) {
            that.data.swiperNoticeTimeout = setTimeout(() => {
              that.getCsTopNotice();
            }, 3000)
          }
          that.setData({
            swiperNotice: resData.result,
            swiperCurrent: 0
          })
        }
      })
    },3000)
  },
  swiperBindchange(e){
    var index = e.detail.current;
    if (index + 1 == this.data.swiperNotice.length){
      setTimeout(()=>{
        this.getCsTopNotice();
      },3000)
    }
  },
  parentEvent(){
    this.getCsInviteList();
  },
  // 获取邀请信息
  getCsInviteList(){
    var that = this;
    var url = app.getPath.csInviteList;
    common.ApiCoordination(url,'',true,function(res){
      var resData = res.data;
      var results = resData.result.invite_list;
      if (that.data.requestNum == 0) {
        for (var i = 0; i < results.length; i++) {
          if (results[i].coupon_id > 0) {
            that.data.tiketList.push(results[i].coupon_id)
          }
        }
        that.setData({
          requestNum: 1
        })
      }
      //判断显示奖励内容的标识fzc
      that.setData({
        // showaword: res.data.is_redpack_max
        // tiket_id: res.data.result.invite_list[0].coupon_id,
        showaword: res.data.result.is_redpack_max,
       
      })
      if (resData.result.invite_list.length !== 0 && that.data.tiketList.length!==0){
        that.setData({
          tiketBtnshow: true
        })
      }else{
        that.setData({
          tiketBtnshow: false
        })
      }
      if (that.data.showaword){
        that.setData({
          award_name: "领取代金券",
          award_type: "代金券",
          award_type_c: "代金券",
          // 保留字段，邀请红包的金额
          tiket_limit: res.data.result.coupon.money.bonus
        })
      }else{
        that.setData({
          award_name: "打开红包",
          award_type: "红包",
          award_type_c: "现金红包"
        })
      }
      //判断显示奖励内容的标识fzc
      that.setData({
        // showaword: res.data.is_redpack_max
        // tiket_id: res.data.result.invite_list.coupon_id,
        showaword: res.data.result.is_redpack_max
      })
      if (that.data.showaword){
        that.setData({
          award_name: "领取代金券",
          award_type: "代金券",
          award_type_c: "代金券"
        })
      }else{
        that.setData({
          award_name: "打开红包",
          award_type: "红包",
          award_type_c: "现金红包"
        })
      }
      if (resData.success == 1){
        var invite_list = resData.result.invite_list.filter(item=>{
          return item.status == 2
        })
        var invite_list_urge = resData.result.invite_list.filter(item => {
          return item.status != 2
        })
        that.setData({
          csInviteList: resData.result,
          invite_list: invite_list,
          invite_list_urge: invite_list_urge,
          rule_img: resData.result.rule_img
        })

        if (that.data.sclType == 2){
          wx.pageScrollTo({
            selector: '#invitation'
          })
        }
      }
    })
  },
  gettiket(){
    var that = this;
    if (that.data.tiketList.length !== 0) {
      var rid = that.data.tiketList[0];
      // 代金券
      this.setData({
        tiket_id: rid,
        showRedEnvel: true,
        showRedEnvelType: 3,
        tiketshow: true
      })
      that.data.tiketList.splice(0,1);
    }else{
      that.setData({
        tiketBtnshow: false
      })
    }

  },
  // 开红包
  getEnvelopes(e){

    var that = this;
    var rid = e.currentTarget.dataset.rid;
    var award_n = e.currentTarget.dataset.name;
    // fzc
    if (award_n =='tiket'){
      // 代金券
      this.setData({
        tiket_id: rid,
        showRedEnvel: true,
        showRedEnvelType:3,
        tiketshow: true
      })
    }else{
      this.setData({
        red_packet_id: rid,
        showRedEnvel: true,
        showRedEnvelType: 1,
        evelop:true
      })
    }
  },
  // 点击-知道了按钮
  getCsClickKnow(e){
    var that = this;
    var id = e.currentTarget.dataset.id;
    var url = app.getPath.csClickKnow;
    var data = {
      id: id
    }
    common.ApiCoordination(url,data,true,function(res){
      var resData = res.data;
      if (resData.result.success){
        that.data.invite_list_urge = that.data.invite_list_urge.filter(item=>{
          return item.id != id
        })
        that.setData({
          invite_list_urge: that.data.invite_list_urge
        })
      }else{
        common.toast(resData.msg);
        return;
      }
    })
  },
  // 点击显示邀请提示
  showShareGuide(e){
    common.formIdUpdate(e);
    this.setData({
      guideIsShow: true
    })
  },
  // 邀请上报
  invitationShare(){
    var pickupId = common.getStorageSync('getpickup');
    app.aldstat.sendEvent("invitation_share_report", {
      "提货点": pickupId.cityName
    });
  },
  // 催促上报
  urgingReport(e) {
    common.formIdUpdate(e);
    var pickupId = common.getStorageSync('getpickup');
    app.aldstat.sendEvent("invitation_urging_report", {
      "提货点": pickupId.cityName
    });
  },
  // 红包记录
  getCslist(){
    var that = this;
    var url = app.getPath.cslist;
    common.ApiCoordination(url,'',true,function(res){
      var resData = res.data;
      if(resData.success == 1){
        that.setData({
          redLogList: resData.result,
          redLogShow: true
        })
      }else{
        common.toast(resData.msg);
        return
      }
    })
  },
  // 隐藏红包记录
  hideRedLog(){
    this.setData({
      redLogShow: false
    })
  },
  // 隐藏活动规则
  hideRedActivity(){

    this.setData({
      redActivityShow: false
    })

  },
  // 显示活动规则
  showActivityModel(){
    var that = this;
    var url = app.getPath.getrule;
    common.ApiCoordination(url, '', true, function (res) {
      var resData = res.data;
     
      that.setData({
        rules:resData.result
      })
    })
    this.setData({
      redActivityShow: true
    })
  },
  // 隐藏引导弹窗
  hidePopup(){
    this.setData({
      popupShow: false
    })
  },
  // 返回首页
  goHome(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 滚动溢出
  bindtouchmove(){
    return false
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    var entry_share_info = common.getStorageSync('entry_share_info');
    if (res.target && res.target.dataset.shareinfo) {
      let shareInfo = res.target.dataset.shareinfo;
      if (shareInfo && shareInfo.fromButton == 'envelopes') {
        setTimeout(() => {
          that.setData({
            popupShow: true
          })
        }, 2000)
      } else {
        setTimeout(() => {
          that.setData({
            popupShow: true
          })
        }, 1000)
      }
      if (shareInfo && shareInfo.fromButton == 'notice') {
        return {
          title: entry_share_info.urge_share_text,
          path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
          imageUrl: entry_share_info.urge_share_img
        }
      } else if (shareInfo && shareInfo.fromButton == 'envelopes') {
        return {
          title: entry_share_info.invite_share_text,
          path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
          imageUrl: entry_share_info.invite_share_img
        }
      } else {
        return {
          title: entry_share_info.invite_share_text,
          path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
          imageUrl: entry_share_info.invite_share_img
        }
      }
    } else {
      return {
        title: entry_share_info.invite_share_text,
        path: '/pages/index/index?pickup_id=' + pickup.pickup_id + '&user_id=' + entry_share_info.user_id,
        imageUrl: entry_share_info.invite_share_img
      }
    }
  }
})