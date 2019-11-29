var app = getApp();
var id = '';
var page = 1;
var reachBottom = true;
const common = require("../../utils/common.js");

// pages/user/shoucang.js
Page({
  data: {
    iconURL: app.dataBase.iconURL,
    page: 1,
    page_size: 10,
    productData: [],
    editType: true,
    left: false,
    choose: '',
    loaded: false,
    showEmpty: false
  },
  onLoad: function (options) {
    this.setData({
      productData: [],
      page: 1
    })
    this.loadProductData(1);
    var goodsList = [];
  },
  onShow: function () {
    // 页面显示
    // this.loadProductData();
  },
  onPullDownRefresh:function() {
    this.setData({
      productData: [],
      loaded: false
    })
    page = 1;
    this.loadProductData(page,'downRefresh');
  },
  onReachBottom: function () {
    if (reachBottom) {
      page++;
      this.loadProductData(page);
    }
  },
  loadProductData: function (page,type) {
    var that = this;
    var url = app.getPath.getGoodsLike;
    var data = {
      page: page,
      page_size: this.data.page_size,
    };
    common.ApiGateWayTest(url, data, true, function (res) {
      if(res && res.data && res.data.success == 1){
        var data = res.data.result.data;
        var attentionNum = res.data.result.total;
        if(type == 'downRefresh'){
          wx.stopPullDownRefresh();
        }
        if(data.length > 0){
          if (data.length < 10) {
            reachBottom = false;
            that.setData({
              loaded: true
            })
          } else {
            reachBottom = true;
          }
          for (var i in data) {
            data[i].checked = false;
          }
          that.setData({
            productData: that.data.productData.concat(data),
            attentionNum: attentionNum
          });
        }else{
          that.setData({
            showIcon: true
          })
        }
        if (that.data.productData.length <= 0) {
          that.setData({
            left: false,
            showEmpty: true
          })
        }
      }
    })
  },
  initProductData: function (data) {
    for (var i in data) {
      var item = data[i];
      item.Price = item.Price / 100;
      item.ImgUrl = app.dataBase.hostImg + item.ImgUrl;
    }
  },
  //选择状态
  ChooseActive: function (that, list, id) {
    var num = 0;
    var type;
    if (this.data.editType == false) {
      for (var i in list) {
        if (id == list[i].goods_id) {
          list[i].checked = !list[i].checked;
        }
        if (list[i].checked == false) {
          num++;
        }
      }
      if (num <= 0) {
        type = true;
      } else {
        type = false;
      }
      that.setData({
        checkbox: type,
        productData: list
      })
    }
  },
  //编辑
  edit: function () {
    var num = 0;
    var type;
    this.data.editType = !this.data.editType;
    this.data.left = !this.data.left;
    var list = this.data.productData;
    this.ChooseActive(this, list);
    this.setData({
      left: this.data.left,
      editType: this.data.editType,
    })
  },
  //选择
  choose: function (e) {
    var id = e.currentTarget.dataset.id;
    if (!this.data.editType) {
      var list = this.data.productData;
      this.ChooseActive(this, list, id);
    } else {
      wx.navigateTo({
        url: '../../pages/product/product?entryType=external&productId=' + id,
      })
    }
  },
  //全选
  chooseAll: function () {
    var type;
    var num = 0;
    var list = this.data.productData;
    for (var i in list) {
      if (list[i].checked == false) {
        num++;
      }
    }
    if (num > 0) {
      for (var i in list) {
        list[i].checked = true;
      }
      type = true;
    } else {
      for (var i in list) {
        list[i].checked = false;
      }
      type = false;
    }
    this.setData({
      productData: list,
      checkbox: type
    })
  },
  //取消收藏
  removeFavorites: function () {
    var that = this;
    var cancelList = [];
    var list = this.data.productData;
    for (var i in list) {
      if (list[i].checked == true) {
        cancelList.push(list[i].goods_id);
      }
    }
    var content = '确定取消收藏吗？';
    var confirmText = '确定';
    common.showModal(content, confirmText, function (res) {
      var url = app.getPath.goodsUnlike;
      var data = {
        goods_id: cancelList
      }
      common.ApiGateWayTest(url, data, true, function (res) {
        if(res && res.data && res.data.success == 1){
          that.onLoad();
          common.toast('取消收藏成功');
        }
      })
    })
  }
});