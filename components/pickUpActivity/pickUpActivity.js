// components/pickUpActivity/pickUpActivity.js
//获取应用实例
var app = getApp();
var common = require("../../utils/common.js");
var event = require("../../utils/event.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsList: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal, changedPath) {
        if (newVal.length > 0 && newVal.length > oldVal.length){
          this.setData({
            goodsList: newVal
          })
        }
      }
    },
    /* 判断列表的状态
      type:0  参加拼团
      type:1  正在砍价
      type:2  即将开团
    */
    type:{
      type: Number,
    },
    // 获取授权立即提醒
    getRemind:{
      type:Boolean,
      observer: function (newVal, oldVal, changedPath) {
        if(newVal==true){
          this.data.remind_notice=1
          this.toChangeRemind()
        }
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    goodsList:[],
    remind_check:false,
    remind_team_id:"",
    remind_notice:"",
    remind_index:"",
    iconURL:app.dataBase.iconURL,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转拼团end砍价
    goProduct(e){
      var goodsid = e.currentTarget.dataset.goods_id
      var type = e.currentTarget.dataset.type
      if (type == 0 || type == 2){
        wx.navigateTo({
          url: '/packageA/team-product/team-product?entryType=external&teamId=' + goodsid
        })
      }else{
        wx.navigateTo({
          url: '/packageA/bargain/bargain?entryType=external&activity_bargain_id=' + goodsid
        })
      }

    },
    // 切换提醒未提醒
    change_team(e){
      let that=this;

      let index=e.currentTarget.dataset.index;
      let check=e.currentTarget.dataset.check;
      let team_id=e.currentTarget.dataset.team_id;
      that.data.remind_notice = check == 1 ? '0' : '1'
      that.data.remind_team_id = team_id
      this.data.remind_index = index
      this.toChangeRemind();
    },
    // 切换提醒
    toChangeRemind(){
      let that=this;
      common.showLoad(this);
      let url = app.getPath.remindTeam;
      let data = {
        team_id: that.data.remind_team_id,
        is_notice: that.data.remind_notice
      }
      common.ApiGateWayTest(url, data, true, function (res) {
        var res = res.data;
        common.hideLoad(that);
        if (res.success == 1) {
          if (res.result.status == 1) {
            that.data.goodsList[that.data.remind_index].is_notice = that.data.remind_notice
            that.setData({
              goodsList: that.data.goodsList
            });
            common.toast(res.result.msg)
          } else if (res.result.status == 0) {
            common.toast(res.result.msg)
          } else if (res.result.status == 2) {
            that.triggerEvent('showPhoneModal');
          } else if (res.result.status ==3){
            that.data.goodsList[that.data.remind_index].is_notice = that.data.remind_notice
            that.setData({
              goodsList: that.data.goodsList
            });
          }
        }
      })
    }
  }
})
