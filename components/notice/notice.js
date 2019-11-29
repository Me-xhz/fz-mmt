// components/notice/notice.js
var app = getApp();
var common = require("../../utils/common.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      value: 1, //1.自定义顶部2.原生顶部end无顶部
      type: String
    },
    unload: {
      value: false,
      type: Boolean
    }
  },
  observers: {
    'unload': function(unload) {
      if (unload) {
        clearInterval(this.data.noticeInterval);
        clearInterval(this.data.timeInterval);
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    showNotice: false,
    showRedEnvel: false,
    evelop:false,
    rid: 0,
    notice: '',
    navBarHeight: app.globalData.navBarHeight,
    noticeInterval: '',
    timeInterval: '',
    shareInfo: {
      fromButton: 'notice'
    }
  },
  pageLifetimes: {
    show: function() {
      this.getPresentNewMsg();
    },
    hide: function() {
      clearInterval(this.data.noticeInterval);
      clearInterval(this.data.timeInterval);
      if (this.data.showNotice && this.time != 0) {
        common.setStorageSync('noticeConutTime', this.time);
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    parentEvent() {
      this.triggerEvent('click', {
        b: 2
      })
    },
    getPresentNewMsg() {
      var that = this;
      var url = app.getPath.surePresentNewMsg;
      clearInterval(this.data.noticeInterval);
      clearInterval(this.data.timeInterval);
      var getNoticeMsg = common.getStorageSync('noticeMsg');
      var getNoticeConutTime = common.getStorageSync('noticeConutTime');
      // 已存在未到时间的提示信息，显示缓存内容
      if (getNoticeMsg && getNoticeMsg != '') {
        var getCountTime = Number(getNoticeConutTime) > 3000 || getNoticeConutTime == 0 ? Number(getNoticeConutTime) : 3000;
        that.setData({
          showNotice: true,
          notice: getNoticeMsg,
          //读缓存的是哪个按钮
          topbtnShow: common.getStorageSync('storagetopbtnShow'),
          tiketID: common.getStorageSync('storagetiketID'),
          notice: common.getStorageSync('storagenotice')
        })
        // 控制显示大红包或代金券/////
        if (that.data.tiketID>0){
          that.setData({
            showRedEnvelType:3
          })
        }else{
          that.setData({
            showRedEnvelType: 1
          })
        }
        // /////
        setTimeout(() => {
          common.setStorageSync('noticeMsg', '');
          that.setData({
            showNotice: false
          })
          that.getPresentNewMsg();
        }, getCountTime)
      } else {
        that.data.noticeInterval = setInterval(() => {
          common.ApiGateWayTest(url, '', true, function(res) {
            var resData = res.data;
            if (resData.result.is_show == 1) {
              if (resData.result.list.length > 0 && (resData.result.list[0].coupon_id > 0 || resData.result.list[0].red_packet_id > 0)) {
                common.setStorageSync('noticeMsg', resData.result.list[0]);
                that.setData({
                  showNotice: true,
                  notice: resData.result.list[0],
                  tiketID: resData.result.list[0].coupon_id
                })
                common.setStorageSync('storagetiketID', that.data.tiketID);
                common.setStorageSync('storagenotice', that.data.notice);
                // 顶部弹出的按钮文案
                if (that.data.notice.red_packet_id == 0) {
                  that.setData({
                    topbtnShow: false
                  })
                  //把按钮缓存到本地
                  common.setStorageSync('storagetopbtnShow', false);
                } else {
                  that.setData({
                    topbtnShow: true
                  })
                  //把按钮缓存到本地
                  common.setStorageSync('storagetopbtnShow', true);
                }
                // 判断是否播放完
                that.time = 8000;
                that.data.timeInterval = setInterval(() => {
                  if (that.time <= 0) {
                    clearInterval(that.data.timeInterval);
                    that.time = 0;
                  } else {
                    that.time -= 1000;
                  }
                }, 1000)
              } else if (resData.result.list[0].status==1){
                // 这层判断是邀请用户未下单的情况，弹出催单
                    common.setStorageSync('noticeMsg', resData.result.list[0]);
                    that.setData({
                      showNotice: true,
                      notice: resData.result.list[0]
                    })
                common.setStorageSync('storagenotice', that.data.notice);
                      // 判断是否播放完
                      that.time = 8000;
                      that.data.timeInterval = setInterval(() => {
                        if (that.time <= 0) {
                          clearInterval(that.data.timeInterval);
                          that.time = 0;
                        } else {
                          that.time -= 1000;
                        }
                      }, 1000)
              }
            } else {
              clearInterval(that.data.noticeInterval);
              clearInterval(that.data.timeInterval);
              return
            }
          })
          setTimeout(() => {
            common.setStorageSync('noticeMsg', '');
            that.setData({
              showNotice: false
            })
          }, 8000)
        }, 10000)
      }
    },
    getRedEnvel() {
      var that = this;
      if (that.data.tiketID>0){
        that.setData({
          showRedEnvel: true,
          showTiket: false,
          showRedEnvelType:3
        })
      }else{
        that.setData({
          showRedEnvel: true,
          showTiket: false,
          showRedEnvelType: 1
        })
      }
        
    },
    urgingReport(e) {
      common.formIdUpdate(e);
      var pickupId = common.getStorageSync('getpickup');
      app.aldstat.sendEvent("notice_urging_report", {
        "提货点": pickupId.cityName
      });
    },
    getEnvelopes() {
      wx.navigateTo({
        url: '/packageB/invitation-share/invitation-share?type=2',
      })
    }
  }
})