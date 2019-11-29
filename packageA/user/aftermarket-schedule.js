// pages/user/aftermarket-schedule.js
var app = getApp();
var common = require("../../utils/common.js");
Page({
  data: {
    iconURL: app.dataBase.iconURL,
    pickerData: ['顺丰速运', '圆通快递', '申通快递', '中国邮政', 'EMS', '其他'],
    shipping_sn: '',
    shipping_name: '',
    uploadInfo: {},
    uploadImg: [],
    submitImg: [],
    LogisticsDs: true
  },
  onLoad: function (options) {
    if (options == undefined || options.id == undefined) {
      common.toast("请求参数错误");
      return;
    }
    this.setData({
      id: options.id
    })
    this.getInfo();
  },
  // 获取售后进度信息
  getInfo: function () {
    var that = this;
    common.showLoad(this);
    var url = app.getPath.backHistory;
    var data = {
      back_id: that.data.id
    };
    common.ApiGateWayTest(url, data, true, function (res) {
      if (res.data.success == 1) {
        var res = res.data.result
        that.setData({
          listinfo: res.data
        })
      } else {
        common.toast('网络错误');
      }
      common.hideLoad(that);
      wx.hideLoading();
    })
  },
  // 显示物流公司弹层
  showLogistics: function () {
    var that = this;
    if (that.data.LogisticsDs) {
      wx.showActionSheet({
        itemList: that.data.pickerData,
        success: function (res) {
          that.setData({
            shipping_name: that.data.pickerData[res.tapIndex]
          })
          if (res.tapIndex == 5) {
            that.setData({
              LogisticsDs: false
            })
          }
        }
      })
    } else {
      return
    }
  },
  // 物流公司选择其他
  LogisticsTxt: function (e) {
    var value = e.detail.value;
    this.setData({
      shipping_name: value
    })
  },
  // 物流单号
  LogisticsSn: function (e) {
    var value = e.detail.value;
    this.setData({
      shipping_sn: value
    })
  },
  // 选择图片
  updataimg: function () {
    var that = this;
    if (that.data.uploadImg.length < 3) {
      var count = parseInt(3) - parseInt(that.data.uploadImg.length);
      wx.chooseImage({
        count: count,
        success: function (res) {
          that.data.uploadImg = that.data.uploadImg.concat(res.tempFilePaths);
          that.setData({
            uploadImg: that.data.uploadImg
          })
        },
      })
    }
  },
  // 删除上传图片
  delUploadImg: function (e) {
    var index = e.currentTarget.dataset.index;
    this.data.uploadImg.splice(index, 1);
    this.setData({
      uploadImg: this.data.uploadImg
    })
  },
  // 提交图片
  submitImg: function (successCallback) {
    var that = this;
    var uploadImg = that.data.uploadImg;
    var header = {
      'accept': 'application/json',
      'content-type': 'multipart/form-data',
      'x-application': 'cilicili',
      'x-platform': 'wx',
      'x-useragent': 'host',
      'x-ver': 'v1.0',
    }
    header['X-Authorization'] = common.getStorageSync('token');
    if (uploadImg.length > 0) {
      for (var i in uploadImg) {
        var img = that.data.uploadImg[i];
        var data = {
          path: 'order_back',
          img_type: 1
        };
        wx.uploadFile({
          url: app.dataBase.uploadFile,
          filePath: img,
          name: 'img',
          formData: data,
          header: header,
          success: successCallback
        })
        that.setData({
          imgLenth: uploadImg.length,
          imgNowLength: Number(i) + 1
        })
        wx.showLoading({
          title: that.data.imgNowLength + '/' + that.data.imgLenth,
          mask: true
        })
      }
    } else {
      successCallback(false);
    }
  },
  // 提交售后单的物流信息
  submitShipping: function () {
    var that = this;
    if (that.data.shipping_name == '' || that.data.shipping_sn == '') {
      common.toast('物流信息不能为空');
      return
    }
    var uri = app.getPath.submitShippingInfo
    var data = {
      back_id: that.data.id,
      shipping_name: that.data.shipping_name,
      invoice_no: that.data.shipping_sn,
    }
    that.submitImg(function (res) {
      if (res != false) {
        var res = JSON.parse(res.data);
        that.data.submitImg.push(res.result.url);
      }
      if (that.data.uploadImg.length == that.data.submitImg.length) {
        data['pic_info'] = JSON.stringify(that.data.submitImg);
        common.ApiGateWayTest(uri, data, true, function (res) {
          if (res.data.success == 1) {
            common.toast(res.data.msg);
            that.getInfo();
          }
        })
      }
    })
  },
  // 取消申请
  showwithdrawDialog: function () {
    var that = this;
    var content = '确定取消售后申请吗';
    var confirmText = '确定';
    common.showModal(content, confirmText, function (res) {
      var uri = app.getPath.backCancel;
      var data = {
        back_id: that.data.id
      }
      res.confirm && common.ApiGateWayTest(uri, data, true, function (res) {
        if (res.data.success == 1) {
          common.toast(res.data.msg);
          wx.navigateBack()
        }
      })
    })
  },
  // 查看详情
  go_order_return_detail: function () {
    var that = this;
    wx.redirectTo({
      url: '../user/order-return-detail?id=' + that.data.id,
    })
  },
  // 查看物流
  go_order_return_shipping: function () {
    var that = this;
    wx.navigateTo({
      url: '../user/order-express?back_id=' + that.data.listinfo.back_cnt.back_id,
    })
  },
  // 确认收货
  showConfirmDialog: function () {
    var that = this;
    var content = '请确定是否收到商品';
    var confirmText = '确定';
    common.showModal(content, confirmText, function (res) {
      var uri = app.getPath.changeConfirm;
      var data = {
        back_id: that.data.listinfo.back_cnt.back_id
      }
      res.confirm && common.ApiGateWayTest(uri, data, true, function (res) {
        if (res.data.success == 1) {
          common.toast(res.data.msg)
          that.getInfo();
        } else {
          common.toast(res.data.msg)
        }
      })
    })
  }
})