//城市选择
var app = getApp();
const common = require("../../utils/common.js");
var thisArr = [];
var thisData;
var thisAdd = [];
var addArray;
Page({
  data: {
    hidden: true,
    cartId: 0,
    textNum: 120,
    defaulAddress: false,
    is_default: '0',
    scrollTop: 0,
    thisAdd: []
  },
  formSubmit: function (e) {
    var adds = e.detail.value;
    //前端验证手机号格式
    var reg = new RegExp(/^1[0-9]{10}$/);
    var mobileReg = reg.test(adds.phone);
    if(!adds.consignee){
      common.toast('收货人不能为空');
      return;
    }
    if(!mobileReg){
      common.toast('请输入正确的手机号');
      return;
    }
    if(!this.data.regions || !adds.address){
      common.toast('地址不能为空');
      return;
    }
    var url;
    var data = {
      address: adds.address,
      is_default: this.data.is_default,
      mobile: adds.phone,
      consignee: adds.consignee,
      region: this.data.regions,
      tel: '',
      zip_code: '',
    }
    if (this.data.address_id == -1) {
      url = app.getPath.addAddress;
    } else {
      url = app.getPath.alterAddress;
      data.address_id = this.data.address_id;
    }
    common.ApiGateWayTest(url, data,true, function (res) {
      if (res && res.data.success == 1) {
        common.toast('保存成功!');
        wx.navigateBack(1);
      } else {
        common.toast(res.data.msg);
      }
    })
  },
  onLoad: function (options) {
    if (options == undefined || options.addressData == undefined) {
      common.toast("请求参数错误");
      return;
    }
    // 生命周期函数--监听页面加载
    var that = this;
    //获取省级城市
    var addData = JSON.parse(options.addressData);
    var is_default = addData.is_default == '1' ? true : false; //是否默认地址
    var tNumber = addData.address ? addData.address.length : 0; //地址字数
    if(addData.regions){
      var regionsList = [];
      for(var i in addData.regions){
        regionsList.push(addData.regions[i].id)
      }
    }
    //address_id=-1是新增地址，！=-1是编辑地址
    if(addData.address_id != -1){
      that.setData({
        consignee: addData.consignee,
        address_id: addData.address_id,
        mobile: addData.mobile,
        address: addData.address,
        is_default: String(addData.is_default),
        chooseAdd: addData.regions,
        regions: regionsList,
        textNum: 120 - tNumber,
        defaulAddress: is_default,
        disabled: options.disabled
      })
    }else{
      that.setData({
        address_id: addData.address_id,
        is_default: String(addData.is_default),
        disabled: addData.is_default,
        defaulAddress: addData.is_default == 1 ? true : false
      })
    }
    var url = app.getPath.getRegionList;
    common.ApiGateWayTest(url, '',true, function (res) {
      if (res && res.data.success == 1) {
        addArray = res.data.result.regions;
        for (var i in res.data.result.regions) {
          thisArr.push({
            name: addArray[i].name,
            id: addArray[i].id,
            type: 1
          })
        }
        //初始渲染省份，并将省份保存用于下次打开时显示
        that.setData({
          addressArr: thisArr,
          shengArr: thisArr
        })
      }
    })
  },
  //选择地址
  chooseAdd: function (e) {
    var thisArr = [];
    var thisItem = e.currentTarget.dataset.item;
    thisAdd.push({
      name:thisItem.name,
      id: thisItem.id,
    });
    var addData = addArray;
    //获取当前选择的下一级内容
    for (var i in addData) {
      for (var j in addData[i].regions) {
        if (thisItem.id == addData[i].id) {
          thisArr.push({
            name: addData[i].regions[j].name,
            id: addData[i].regions[j].id,
            type: 2
          })
          //获取三级内容
        } else if (thisItem.id == addData[i].regions[j].id) {
          for (var k in addData[i].regions[j].regions) {
            thisArr.push({
              name: addData[i].regions[j].regions[k].name,
              id: addData[i].regions[j].regions[k].id,
              type: 3
            })
          }
        }
      }
    }
    this.setData({
      addressArr: thisArr,
      scrollTop: 0,
      chooseAdd: thisAdd,
      thischooseAdd: thisAdd
    })
    if (thisItem.type == 3) {
      //选完省市区后把三个id存入数组，用于发送后端
      var regionsList = [];
      for(var i in thisAdd){
        regionsList.push(thisAdd[i].id)
      }
      this.setData({
        chooseAdd: thisAdd,
        regions: regionsList
      })
      this.hiddendrop();
    }
  },
  cancelChoose: function (e) {
    this.setData({
      showType: false
    })
  },
  //详细地址字符计数
  addressNumber: function (e) {
    var tNumber = e.detail.value.length;
    this.setData({
      textNum: 120 - tNumber
    })
  },
  switchChecked: function (e) {
    var checked = e.detail.value;
    var defaul;
    if (checked) {
      defaul = '1';
    } else {
      defaul = '0';
    }
    this.setData({
      is_default: defaul
    })
  },
  //显示选择地址列表
  showScrollView: function (e) {
    this.setData({
      hidden: false,
      addressArr: this.data.shengArr,
      thischooseAdd: ''
    })
  },
  //隐藏选择地址列表
  hiddendrop: function () {
    thisAdd = [];
    this.setData({
      hidden: true,
    })
  },
  deleteAdd: function (e) {
    var content = '是否要删除该地址？';
    var confirmText = '确定';
    common.showModal(content, confirmText, function (res) {
      if (res.confirm) {
        var url = app.getPath.delAddress;
        var data = {
          address_ids: this.data.address_id
        }
        common.ApiGateWayTest(url, data, true, function (res) {
          if (res.data.success == 1) {
            wx.navigateBack(1);
            common.toast('地址删除成功');
          }
        })
      }
    })
  }
})