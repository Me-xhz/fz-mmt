const app = getApp();
const common = require('../../utils/common.js')

Page({
  data: {
    orderSn: "",
    orderInfo: "",
    active_total_goods: 0,
    isButtonShow: false,
    isShowSubmit: false
  },
  onLoad: function (options) {
    this.data.orderSn = options.orderSn;
    this.getOrder()
  },
  getOrder(){
    common.showLoad(this);
    var that = this;
    var url = app.getPath.getOrder;
    var data = {
      order_sn: this.data.orderSn
    }
    common.ApiLogistics(url, data, true, function (res) {
      if (res.success == 1) {
        res.result.goods_info = res.result.goods_info.map(item => {
          item.chack = true;
          item.max_number = item.goods_num;
          return item
        })
        that.setData({
          orderInfo: res.result
        },()=>{
          that.onActiveTotleOrder();
        })
      } else {
        var content = res.msg;
        var confirmText = '确定';
        common.showRidoModal(content, confirmText, function (data) {
          if (data.confirm) {
            wx.navigateBack({
              delta: 1
            })
          }
        });
      }
      common.hideLoad(that);
    })
  },
  showSubmit(){
    this.setData({
      isShowSubmit: true
    })
  },
  touchDialogCancel(){
    this.setData({
      isShowSubmit: false
    })
  },
  submit(){
    var that = this;
    var goodsInfo = [];
    for (var i = 0; i < that.data.orderInfo.goods_info.length;i++){
      if (that.data.orderInfo.goods_info[i].chack){
        goodsInfo.push({
          goods_id: that.data.orderInfo.goods_info[i].goods_id,
          spec_key: that.data.orderInfo.goods_info[i].spec_key,
          goods_num: that.data.orderInfo.goods_info[i].goods_num
        })
      }
    }
    var url = app.getPath.takeConfirmorder;
    var data = {
      order_sn: that.data.orderInfo.order_sn,
      goodsInfo: JSON.stringify(goodsInfo)
    }
    common.showLoad(that);
    common.ApiLogistics(url, data, true, function (resData) {
      if (resData.success == 1) {
        that.setData({
          isShowSubmit: false
        })
        let pages = getCurrentPages(); 
        let prevPage = pages[pages.length - 2];
        prevPage.setData({ 
          order_text:resData.msg,
          checkText:true
        })
        wx.navigateBack({
          delta: 1
        })
      } else {
        common.toast(resData.msg);
      }
      common.hideLoad(that);
    })
  },
  onGoodsChack(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var chackGoods = 'orderInfo.goods_info['+ index +'].chack';
    var goods_info_goods_num = 'orderInfo.goods_info[' + index + '].goods_num';
    if (!that.data.orderInfo.goods_info[index].chack){
      this.setData({
        [chackGoods]: true,
        [goods_info_goods_num]: that.data.orderInfo.goods_info[index].max_number
      }, () => {
        that.onActiveTotleOrder();
      })
    }else{
      this.setData({
        [chackGoods]: false,
        [goods_info_goods_num]: 0
      }, () => {
        that.onActiveTotleOrder();
      })
    }
  },
  // 物品减少
  touchAmountSub(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var goods_info_goods_num = 'orderInfo.goods_info[' + index + '].goods_num';
    if (that.data.orderInfo.goods_info[index].goods_num > 1){
      that.setData({
        [goods_info_goods_num]: that.data.orderInfo.goods_info[index].goods_num - 1
      }, () => {
        that.onActiveTotleOrder();
      })
    } else if (that.data.orderInfo.goods_info[index].goods_num <= 1){
      that.setData({
        [goods_info_goods_num]: 0
      }, () => {
        that.onActiveTotleOrder();
      })
      var goods_info_chack = 'orderInfo.goods_info[' + index + '].chack';
      that.setData({
        [goods_info_chack]: false
      })
      common.toast('已经达到最小数量了！');
      return
    }
  },
  // 物品增加
  touchAmountAdd(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    if (that.data.orderInfo.goods_info[index].goods_num < that.data.orderInfo.goods_info[index].max_number) {
      var goods_info_chack = 'orderInfo.goods_info[' + index + '].chack';
      var goods_info_goods_num = 'orderInfo.goods_info[' + index + '].goods_num';
      that.setData({
        [goods_info_goods_num]: that.data.orderInfo.goods_info[index].goods_num + 1,
        [goods_info_chack]: true
      }, () => {
        that.onActiveTotleOrder();
      })
    } else {
      common.toast('已经达到最大数量了！');
      return
    }

  },
  // 选中订单数
  onActiveTotleOrder(){
    var that = this;
    var num = 0;
    var isButtonShow = false;
    var number = that.data.orderInfo.goods_info.map(item=>{
      if (item.chack){
        num += Number(item.goods_num);
        isButtonShow = true;
      }
      return num;
    })
    that.setData({
      active_total_goods: num,
      isButtonShow: isButtonShow
    })
  },
  // 滚动溢出
  bindtouchmove() {
    return false
  },
  // 拨打手机
  onCall(e) {
    var mobile = e.currentTarget.dataset.mobile;
    wx.makePhoneCall({
      phoneNumber: mobile
    })
  },
})
