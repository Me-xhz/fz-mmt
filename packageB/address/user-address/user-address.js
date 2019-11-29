// pages/address/user-address/user-address.js
var common = require('../../../utils/common.js');
var app = getApp()
Page({
  data: {
    iconURL: app.dataBase.iconURL,
    radioindex: '',
    pro_id: 0,
    num: 0,
    cartId: 0,
    editType: true,
    hiddenAddress: true
  },
  onLoad: function (options) {
    if (options == undefined || options.address_id == undefined) {
      common.toast("请求参数错误");
      return;
    }
    var that = this;
    if (options && options.address_id) {
      that.setData({
        address_id: options.address_id
      })
    }
  },
  onShow: function(){
    if (this.data.address_id == undefined) {
      common.toast("请求参数错误");
      return;
    }
    this.loading()
  },
  loading: function () {
    var that = this;
    var url = app.getPath.getAddressList;
    var data = {
      is_default: '0',
    }
    common.showLoad(this);
    common.ApiGateWayTest(url, data, true, function (res) {
      var data = res.data;
      if (res && data.success != 1) {
        common.toast('还未添加地址');
      } else if (res && data.success == 1) {
        var address = data.result.consignees;
        for (var i in address) {
          address[i].checked = false;
        }
        if (address == '') {
          var address = []
        }
        that.setData({
          address: address,
          cartId: that.data.cartId,
        })
        common.hideLoad(that);
      }
    })
  },
  edit: function () {
    var num = 0;
    var type;
    this.data.editType = !this.data.editType;
    var list = this.data.attList;
    this.setData({
      editType: this.data.editType,
    })
  },
  choose: function (e) {
    var that = this;
    if (that.data.address_id && that.data.editType){
      var item = e.currentTarget.dataset.item;
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];
      prevPage.setData({
        consignee: item
      })
      wx.navigateBack();
    }else{
      var addid = e.currentTarget.dataset.addid;
      var addList = that.data.address;
      var thisAdd;
      for (var i in addList) {
        if (addList[i].address_id == addid) {
          thisAdd = addList[i];
          if (that.data.editType == false) {
            addList[i].checked = !addList[i].checked;
            that.setData({
              address: addList
            })
          } else {
            var addList = [];
            for (var i in thisAdd.regions) {
              addList.push(thisAdd.regions[i].name);
            }
            var disabled = that.data.address.length > 1 ? false : true;
            var addData = JSON.stringify(thisAdd);
            wx.navigateTo({
              url: '../address?addressData=' + addData + '&disabled=' + disabled
            })
            // wx.navigateTo({
            //   url: '../address?address_id=' + addid + "&consignee=" + thisAdd.consignee + "&mobile=" + thisAdd.mobile + "&address=" + thisAdd.address +
            //   "&qu_id=" + thisAdd.regions[2].id + "&is_default=" + thisAdd.is_default + "&addList=" + addList
            // })
          }
        }
      }
    }
  },
  delAddress: function (e) {
    var that = this;
    var addList = that.data.address;
    var viewList = [];
    var addrId = [];
    for (var i in addList) {
      if (addList[i].checked == true) {
        addrId.push(addList[i].address_id);
      }else{
        viewList.push(addList[i])
      }
    }
    var content = '你确认删除吗';
    var confirmText = '确定';
    common.showModal(content, confirmText, function (res) {
      var url = app.getPath.delAddress;
      var data = {
        address_ids: addrId
      }
      res.confirm && common.ApiGateWayTest(url, data, true, function (res) {
          if (res && res.data.success == 1) {
            that.setData({
              editType: 　true,
              address: viewList
            })
            that.setData({
              address_id: that.data.address_id
            })
            that.loading();
            common.toast(res.data.msg)
          } else {
            common.toast(res.data.msg)
          }
      })
    })
  },
  add_address: function () {
    var defaults = this.data.address.length > 0 ? '0' : '1';
    var data = {
      address_id: -1,
      is_default: defaults
    }
    var newData = JSON.stringify(data);
    wx.navigateTo({
      url: '../address?addressData='+newData
    })
  }
})