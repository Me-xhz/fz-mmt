var app = getApp();
var common = require("../../../utils/common.js");

Page({
  data:{
    paperInvoice: false,
    typeTap: 'none',
    upTap: 'personal',
    companyName: '',
    taxesCode: ''
  },
  onLoad:function(option){
    if (option == undefined || option.invoiceData == undefined) {
      common.toast("请求参数错误");
      return;
    }
    var that = this;
    if(option && option.invoiceData){
      var data = JSON.parse(option.invoiceData);
      if(Object.keys(data).length >0){
        that.setData({
          typeTap: data.type,
          upTap: data.up,
          companyName: data.companyName,
          taxesCode: data.taxesCode
        })
      }
    }
    that.getInvoiceConfig()
  },
  // 获取发票信息
  getInvoiceConfig : function(){
    var that = this;
    var uri = app.getPath.getInvoiceConfig;
    common.ApiGateWayTest(uri, '', true,function(res){
      if (res.statusCode == 200){
        var res = res.data.result;
        that.setData({
          Invoicedata: res
        })
      }
    })
  },
  invoiceType: function(e){
    var tap = e.currentTarget.dataset.type;
    this.setData({
      typeTap: tap
    })
    if(tap == 'none'){
      this.emptyContent(this);
    }
  },
  invoiceUp: function(e){
    var tap = e.currentTarget.dataset.type;
    this.setData({
      upTap: tap
    })
    if(tap == 'personal'){
      this.emptyContent(this);
    }
  },
  //选择不开票或者个人时，清空单位名称与纳税识别号
  emptyContent: function(that){
    that.setData({
      companyName: '',
      taxesCode: ''
    })
  },
  nuitName: function(e){
    var name = e.detail.value;
    this.setData({
      companyName: name
    })
  },
  taxesCode: function(e){
    var code = e.detail.value;
    this.setData({
      taxesCode: code
    })
  },
  saveInvoice: function(){
    if(this.data.upTap == 'unit' && this.data.companyName == ''){
      common.toast('单位名称不能为空');
      return
    }
    if(this.data.upTap == 'unit' && this.data.taxesCode == ''){
      common.toast('纳税识别号不能为空');
      return
    }
    var invoiceData = {
      type: this.data.typeTap == 'paper' ? '1' : '0',
      up: this.data.upTap,
      upName: this.data.upTap == 'unit'? '单位' : '个人',
      upId: this.data.upTap == 'unit' ? '2' : '1',
      companyName: this.data.companyName,
      taxesCode: this.data.taxesCode
    }
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.setData({
      invoiceData: invoiceData
    })
    wx.navigateBack();
  }
})