// components/invitationGuide/invitationGuide.js
var app = getApp();
const common = require("../../utils/common.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow:{
      value: false,
      type: Boolean
    },
    imgUrl: {
      value: false,
      type: Boolean
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    promptStatus: false,
    shareInfo: {
      fromButton: 'envelopes'
    },
    showaward:true
  },
  show(){
    this.getCsInviteList()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取邀请信息
    getCsInviteList() {
      var that = this;
      var url = app.getPath.csInviteList;
      common.ApiCoordination(url, '', true, function (res) {
        var resData = res.data;
        //判断显示奖励内容的标识fzc
         that.showaward= false;
      })
    },
    setPrompt(){
      var that = this;
      var pickupId = common.getStorageSync('getpickup');
      app.aldstat.sendEvent("no_guide_share_report", {
        "提货点": pickupId.cityName
      });
      that.setData({
        promptStatus: !that.data.promptStatus
      })
      common.setStorageSync('promptStatus', that.data.promptStatus)
    },
    goShare(e){
      common.formIdUpdate(e);
      var pickupId = common.getStorageSync('getpickup');
      app.aldstat.sendEvent("guide_share_report", {
        "提货点": pickupId.cityName
      });
      setTimeout(()=>{
        this.setData({
          isShow: false
        })
      },1000)
    },
    hide(){
      this.setData({
        isShow: false
      })
    }
  }
})
