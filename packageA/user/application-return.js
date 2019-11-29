var app = getApp();
var common = require("../../utils/common.js");
// pages/order/downline.js
Page({
  data: {
    iconURL: app.dataBase.iconURL,
    uploadInfo: {
      applyAmount: 1,
      reason: '',
      backStatus: '',
      desc: '',
      telphone: '',
    },
    submitImg: [],
    uploadImg: [],
    reasons: [],
    alertHidden:true,
    textareaHidden:false
  },
  preventTouchMove: function () { },
  onLoad: function (options) {
    // type 1 为退款   type 2 为 退款退货
    if (options == undefined || (options.rec_id == undefined && options.orderId == undefined)) {
      common.toast("请求参数错误");
      return;
    }
    
    if(options.type==1){
      this.setData({
        type:1,
        orderId: options.orderId,
        reasons: ['多拍/拍错/不想要', '缺货', '其他（请填写详细描述）']
      });
    } else if (options.type == 2){
      this.setData({
        type: 2,
        rec_id: options.rec_id,
        reasons: ['商品质量问题', '发错', '其他（请填写详细描述）']
      });
    }
    this.getApplyDetail();
  },
  //获取退换货数据
  getApplyDetail: function () {
    var that = this;
    var type = this.data.type;
    if(type==1){
      var url = app.getPath.applyBackMoney;
      var data = {
        order_id: that.data.orderId,
      };
    }else if(type==2){
      var url = app.getPath.applyback;
      var data = {
        rec_id: that.data.rec_id,
      };
    }
    
    common.ApiGateWayTest(url, data, true,function (res) {
      if (res.data.success == 1) {
        var res = res.data.result;
        // 1是退款  2是退换货
        if (that.data.type == 2) {
          that.data.uploadInfo.backStatus = 2;
          that.data.uploadInfo.applyAmount = res.products[0].amount;
        } else {
          that.data.uploadInfo.backStatus = 3;
        }
        // that.data.uploadInfo.backStatus = 2;
        that.setData({
          orderInfo: res,
          uploadInfo: that.data.uploadInfo
        })
        // 1是退款  2是退换货
        if(that.data.type==1){
          that.calculateBackAmount();
        }else{
          that.calculateBackAmount2();
        }
        
        wx.hideLoading();
      } 
      // else {
      //   wx.navigateBack();
      // }
    })
  },
  //设置退换货类型
  // setBackStatus: function (e) {
  //   var status = e.currentTarget.dataset.status;
  //   this.data.uploadInfo.backStatus = status;
  //   this.setData({
  //     uploadInfo: {
  //       applyAmount: this.data.uploadInfo.applyAmount,
  //       reason: this.data.reason,
  //       backStatus: status,
  //       desc: this.data.desc,
  //       telphone: this.data.telphone,
  //     }
  //   })
  // },
  //计算退款退货价格 type==2
  calculateBackAmount2: function() {
    //包邮阈值
    let shipping_threshold = parseFloat(this.data.orderInfo.shipping_free_price || 69);
    //可退款的商品的金额合计
    let order_goods_amount = 0;
    let order_goods_remain = this.data.orderInfo.calculate_source.order_goods_remain_product;
    for (let i = 0; i < order_goods_remain.length; i++) {
      order_goods_amount += parseFloat(order_goods_remain[i].goods_price) * order_goods_remain[i].goods_num;
    }
    
    //运费金额
    let shipping_fee = parseFloat(this.data.orderInfo.shipping_fee_should);
    //订单是否支付过邮费
    let shipping_fee_paied = (!(this.data.orderInfo.calculate_source.back_shipping_fee_paid == 0 && (this.data.orderInfo.shipping_fee) == 0));
    //当前准备退款的商品金额合计
    let current_amount = parseFloat(this.data.orderInfo.products[0].shop_price) * this.data.uploadInfo.applyAmount;
    //去除当前准备退款的商品金额后订单剩余金额
    let dis_amount = order_goods_amount - current_amount;
    //是否是最后一次退款
    let is_last_back = (this.data.orderInfo.calculate_source.sku_remain_num == 1 && this.data.uploadInfo.applyAmount == this.data.orderInfo.products[0].amount);
    //剩余订单合计是否大于包邮阙值
    let is_shipping_threshold = (dis_amount > shipping_threshold);
    //优惠抵扣的退款金额
    let prom_fee = 0;
    for (let i = 0, keys = Object.keys(this.data.orderInfo.prom_info); i < keys.length; i++) {
      prom_fee += parseFloat(this.data.orderInfo.prom_info[keys[i]]) * this.data.uploadInfo.applyAmount;
    }
    //开始逻辑计算
    this.showShippingPrice = 0;
    //不计算运费补收（退还）时的退款金额
    this.back_amount = current_amount - prom_fee;
    //如果退款该sku不可能存在补收或退还运费，则跳过后续计算
    if (this.data.orderInfo.post_free == 0) return;
    if (is_last_back) {
      if (shipping_fee_paied){
        //最后一次退款并且之前收取过运费，需要退还运费
        this.back_amount += shipping_fee;
        this.showShippingPrice = 1;
      }
    } else if (!shipping_fee_paied && !is_shipping_threshold) {
      //未收取过运费并非剩余订单商品总价小于包邮阈值，需要补收运费
      this.back_amount -= shipping_fee;
      this.showShippingPrice = 2;
    }
    this.shipping_fee = this.showShippingPrice == 0 ? 0 : shipping_fee;
    this.setData({
      back_amount: this.back_amount,
      shipping_fee: this.shipping_fee,
      showShippingPrice: this.showShippingPrice
    })
  },
  //计算退款价格 type==1
  calculateBackAmount: function () {
    this.setData({
      back_amount: parseFloat(this.data.orderInfo.order_amount).toFixed(2)
    })
  },
  //提交(提交申请Over)
  submitApply: function () {
    var that = this;
    var e = that.data;
    if (!e.uploadInfo.backStatus) {
      common.toast('请选择服务类型');
      return;
    }
    if (!e.uploadInfo.reason) {
      common.toast('请选择申请原因');
      return;
    }
    if (!e.uploadInfo.desc || e.uploadInfo.desc == '') {
      common.toast('请填写详细描述');
      return;
    } else if (e.uploadInfo.desc.length < 2) {
      common.toast('字数不能少于2个字');
      return;
    }
    // type1 退款  type2退货
    if(that.data.type==1){
      that.updtype1(e)
    }else{
      that.updtype2(e)
    }
  },
  tapBack() {
    var that = this;
    that.setData({
      alertHidden: true,
      textareaHidden:false
    })
    wx.navigateBack({
      delta: 1
    })
  },
  // 仅退款
  updtype1: function (e) {
    var that = this;
    var url = app.getPath.submitbackordersn;
    var data = {
      order_id: that.data.orderId,
      reason_detail: e.uploadInfo.desc,
      // back_status: e.uploadInfo.backStatus,
      reason: e.uploadInfo.reason
    };
    if (e.uploadInfo.telphone) {
      data['contact'] = e.uploadInfo.telphone
    }

    that.submitImg(function (res) {
      if (res != false) {
        var res = JSON.parse(res.data);
        if(res.success==0){
          common.toast(res.msg);
          return;
        }
        that.data.submitImg.push(res.result.url);
      }
      if (that.data.uploadImg.length == that.data.submitImg.length) {
        data['pic_info'] = JSON.stringify(that.data.submitImg);
        
        common.ApiGateWayTest(url, data, true, function (res) {
          if (res.data.success == 1) {
            var res = res.data.result;
            that.setData({
              back_sn: res.back_sn,
              alertHidden: false,
              textareaHidden:true
            })
            // common.toast(res.state_desc);
            // wx.navigateBack({
            //   delta: 1
            // })
          }
          wx.hideLoading();
        })
      }
    });
   },
  
  // 退款退货
  updtype2:function(e){
    var that = this;
    var url = app.getPath.submitbackorder;
    var data = {
      rec_id: that.data.rec_id,
      reason_detail: e.uploadInfo.desc,
      back_number: e.uploadInfo.applyAmount,
      back_status: e.uploadInfo.backStatus,
      reason: e.uploadInfo.reason
    };
    if (e.uploadInfo.telphone) {
      data['contact'] = e.uploadInfo.telphone
    }
    
    that.submitImg(function (res) {
      if (res != false) {
        var res = JSON.parse(res.data);
        that.data.submitImg.push(res.result.url);
      }
      if (that.data.uploadImg.length == that.data.submitImg.length) {
        data['pic_info'] = JSON.stringify(that.data.submitImg);
        
        common.ApiGateWayTest(url, data, true, function (res) {
          if (res.data.success == 1) {
            var res = res.data.result;
            that.setData({
              back_sn: res.back_sn,
              alertHidden: false,
              textareaHidden: true
            })
            // common.toast(res.state_desc);
            // wx.navigateBack({
            //   delta: 1
            // })
            // wx.redirectTo({
            //   url: '../user/order-return-detail?id=' + res.back_id,
            // })
          }
          wx.hideLoading();
        })
      }
    });
  },
  
  //选择图片
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
        }
      })
    }
  },
  //删除上传图片
  delUploadImg: function (e) {
    var index = e.currentTarget.dataset.index;
    this.data.uploadImg.splice(index, 1);
    this.setData({
      uploadImg: this.data.uploadImg
    })
  },
  //提交图片
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
          name: 'file',
          formData: data,
          header: header,
          success: successCallback
        })
        that.setData({
          imgLenth: uploadImg.length,
          imgNowLength: Number(i) + 1
        })
        common.showLoad(that.data.imgNowLength + '/' + that.data.imgLenth);
      }
    } else {
      successCallback(false);
    }
  },
  //前往商品详情
  go_product: function (e) {
    var productId = e.currentTarget.dataset.productId;
    wx.navigateTo({
      url: '../../pages/product/product?entryType=external&productId=' + productId,
    })
  },
  //前往常见问题
  GoretrunSQA: function (e) {
    wx.navigateTo({
      url: '../user/returnSQA',
    })
  },
  //申请原因弹层
  setModalStatus: function (e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step();

    this.setData({
      animationData: animation.export()
    })

    this.setData({
      showfwModalStatus: true,
      textareaHidden: true
    });
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showfwModalStatus: false,
          textareaHidden: false
        });
      }
    }.bind(this), 200)
  },
  //选择申请原因
  setReasonBefore: function (e) {
    if (e.currentTarget.dataset.item){
      var item = e.currentTarget.dataset.item;
    }else{
      var item = this.data.reasons[e.detail.value["0"]] 
    }
    this.setData({
      uploadInfo: {
        applyAmount: this.data.uploadInfo.applyAmount,
        reason: item,
        backStatus: this.data.uploadInfo.backStatus,
        desc: this.data.uploadInfo.desc,
        telphone: this.data.uploadInfo.telphone,
      }
    })
    if (e.currentTarget.dataset.status == 0) {
      this.setModalStatus(e);
      return false;
    }
    
  },
  //数量递减
  touchAmountSub: function () {
    var e = this.data;
    if (e.orderInfo.show_back_btn_allow == 1) return;
    if (e.uploadInfo.applyAmount > 1) {
      e.uploadInfo.applyAmount--;
    }
    this.setData({
      uploadInfo: {
        applyAmount: e.uploadInfo.applyAmount,
        reason: this.data.uploadInfo.reason,
        backStatus: this.data.uploadInfo.backStatus,
        desc: this.data.uploadInfo.desc,
        telphone: this.data.uploadInfo.telphone,
      }
    })
    this.calculateBackAmount();
  },
  //数量递增
  touchAmountAdd: function () {
    var e = this.data;
    if (e.orderInfo.show_back_btn_allow == 1) return;
    if (e.uploadInfo.applyAmount < e.orderInfo.products[0].amount) {
      e.uploadInfo.applyAmount++;
    }
    this.setData({
      uploadInfo: {
        applyAmount: e.uploadInfo.applyAmount,
        reason: this.data.uploadInfo.reason,
        backStatus: this.data.uploadInfo.backStatus,
        desc: this.data.uploadInfo.desc,
        telphone: this.data.uploadInfo.telphone,
      }
    })
    this.calculateBackAmount();
  },
  //申请数量输入框改变时
  back_amount_change: function (res) {
    var e = this.data;
    e.uploadInfo.applyAmount = Number(res.detail.value);
    if (e.uploadInfo.applyAmount >= e.orderInfo.products[0].amount) {
      this.setData({
        uploadInfo: {
          applyAmount: e.orderInfo.products[0].amount,
          reason: this.data.uploadInfo.reason,
          backStatus: this.data.uploadInfo.backStatus,
          desc: this.data.uploadInfo.desc,
          telphone: this.data.uploadInfo.telphone,
        }
      })
    }
  },
  //申请数量输入框离开
  back_amount_blur: function (res) {
    var e = this.data;
    e.uploadInfo.applyAmount = Number(res.detail.value);
    if (e.uploadInfo.applyAmount <= 0 || isNaN(e.uploadInfo.applyAmount)) {
      this.setData({
        uploadInfo: {
          applyAmount: 1,
          reason: this.data.uploadInfo.reason,
          backStatus: this.data.uploadInfo.backStatus,
          desc: this.data.uploadInfo.desc,
          telphone: this.data.uploadInfo.telphone,
        }
      })
    }
    if (e.uploadInfo.applyAmount >= e.orderInfo.products[0].amount) {
      this.setData({
        uploadInfo: {
          applyAmount: e.orderInfo.products[0].amount,
          reason: this.data.uploadInfo.reason,
          backStatus: this.data.uploadInfo.backStatus,
          desc: this.data.uploadInfo.desc,
          telphone: this.data.uploadInfo.telphone,
        }
      })
    }
    this.calculateBackAmount();
  },
  //格式 RegExp("[在中间定义特殊过滤字符]")
  filterSpecialCharacters: function (e) {
    var value = e.detail.value;
    value = value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
    var pattern = new RegExp("[%--`~#$^&*=|{}\\[\\]<>/~#……&*——|{}【】]")
    var rs = "";
    for (var i = 0; i < value.length; i++) {
      rs = rs + value.substr(i, 1).replace(pattern, '');
    }
    this.setData({
      uploadInfo: {
        applyAmount: this.data.uploadInfo.applyAmount,
        reason: this.data.uploadInfo.reason,
        backStatus: this.data.uploadInfo.backStatus,
        desc: rs,
        telphone: this.data.uploadInfo.telphone,
      }
    })
  },
  
  //电话号码过滤
  limittelphonelen: function (e) {
    var value = e.detail.value;
    var pattern = new RegExp("[%--`~#$^&*=|{}\\[\\]<>/~#……&*——|{}【】]")
    var rs = "";
    for (var i = 0; i < value.length; i++) {
      rs = rs + value.substr(i, 1).replace(pattern, '');
    }
    if (rs && rs.length > 15) {
      rs = rs.substring(0, 15);
    }
    this.setData({
      uploadInfo: {
        applyAmount: this.data.uploadInfo.applyAmount,
        reason: this.data.uploadInfo.reason,
        backStatus: this.data.uploadInfo.backStatus,
        desc: this.data.uploadInfo.desc,
        telphone: rs
      }
    })
  },
  //电话号码置空
  delemphonelen: function () {
    this.setData({
      uploadInfo: {
        applyAmount: this.data.uploadInfo.applyAmount,
        reason: this.data.uploadInfo.reason,
        backStatus: this.data.uploadInfo.backStatus,
        desc: this.data.uploadInfo.desc,
        telphone: '',
      }
    })
  },
  
})