// components/specifications/specifications.js
var app = getApp();
var common = require("../../utils/common.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsInfo: {
      type: Object,
      value: '',
      observer: function (newVal, oldVal) {
        if (newVal != null && newVal != oldVal && !this.onStop){
          this.onStop = true;
          var that = this;
          var skutitle = [];
          that.data.shopItemInfo = [];
          that.data.skutitlenamelist = [];
          for (var i of newVal.stock) {
            that.data.shopItemInfo[i.key] = i;
            //修改数据结构格式，改成键值对的方式，以方便和选中之后的值进行匹配
          }
          for (var j of newVal.properties) {
            that.data.skutitlenamelist.push(j.spec_name)
            //存储规格标题
          }
          that.setData({
            buynum: newVal.min_buy_amount
          })
          that.checkItem();
        }
      }
    },
    showSKUstatus: {
      value: false,
      type: Boolean
    },
    isShowNumber: {
      value: true,
      type: Boolean
    }
  },
  
  /**
   * 组件的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    buynum: 1,//购买数量
    goodsInfoNew: {},//当规格选择完成时重新覆盖商品信息
    skutitlename: '',//提示用户例如：请选择温度，口味；或者提示用户已选择温度，口味
    skutitlenamelist: [],//存储规格标题
    selectArr: [], //存放被选中的值
    shopItemInfo: {}, //存放要和选中的值进行匹配的数据
    subIndex: [], //是否选中 因为不确定是多规格还是单规格，所以这里定义数组来判断
    skuId: '',//规格id
  },
  pageLifetimes:{
    hide: function() {
      this.onStop = false
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 选择规格
    specificationBtn: function (e) {
      var id = e.currentTarget.dataset.spec_value_id;
      var pindex = e.currentTarget.dataset.n;
      var index = e.currentTarget.dataset.index;
      var disable = e.currentTarget.dataset.isshow;
      var pname = e.currentTarget.dataset.spec_name;
      var that = this;
      if (!disable) {
        return '';
      }
      var newSelectArr = 'selectArr['+ pindex +']';
      var newSubIndex = 'subIndex[' + pindex +']';
      var newSkutitlenamelist = 'skutitlenamelist[' + pindex + ']';
      if (that.data.selectArr[pindex] != id) {
        that.setData({
          [newSelectArr]: id,
          [newSubIndex]: index,
          [newSkutitlenamelist]: ''
        })
      } else {
        that.setData({
          [newSelectArr]: '',
          [newSubIndex]: -1,
          [newSkutitlenamelist]: pname
        })
      }
      that.checkItem();
    },
    // 处理数据
    checkItem: function () {
      var that = this;
      var option = that.data.goodsInfo.properties;
      var result = []; //定义数组存储被选中的值
      for (let i = 0; i < option.length; i++) {
        result[i] = that.data.selectArr[i] ? that.data.selectArr[i] : '';
      }
      for (let i = 0; i < option.length; i++) {
        var last = result[i]; //把选中的值存放到字符串last去
        for (var k = 0; k < option[i].attrs.length; k++) {
          result[i] = option[i].attrs[k].id; //赋值，存在直接覆盖，不存在往里面添加id值
          option[i].attrs[k].isShow = that.isMay(result); //在数据里面添加字段isShow来判断是否可以选择
        }
        result[i] = last; //还原，目的是记录点下去那个值，避免下一次执行循环时避免被覆盖
      }
      //重绘
      that.data.goodsInfo.properties = [];
      that.setData({
        'goodsInfo.properties': option
      })
      that.getinfo(that.data.selectArr);
    },
    // 获取选择的值
    getinfo: function (item) {
      var that = this;
      var checked = item.join('_');
      if (that.data.shopItemInfo[checked]) {
        that.setData({
          goodsInfoNew: that.data.shopItemInfo[checked],
          skutitlename: '已选择：' + that.data.shopItemInfo[checked].spec_name,
          skuId: that.data.shopItemInfo[checked].key
        })
      } else {
        that.data.goodsInfoNew = {};
        var skutitle = [];
        for (var i = 0; i < that.data.skutitlenamelist.length; i++) {
          if (that.data.skutitlenamelist[i]) {
            skutitle.push(that.data.skutitlenamelist[i]);
          }
        }
        that.setData({
          skutitlename: '请选择 ' + skutitle.toString(','),
          skuId: ''
        })
      }
    },
    // 判断库存是否为0
    isMay: function (result) {
      for (var i in result) {
        if (result[i] == '') {
          return true; //如果数组里有为空的值，那直接返回true
        }
      }
      result = result.join('_');
      if (!this.data.shopItemInfo[result]) {
        return false;
      }
      return this.data.shopItemInfo[result].is_enough == 0 ? false : true; //匹配选中的数据的库存，若不为空返回true反之返回false
    },
    // 加减
    changeNum: function (e) {
      var that = this;
      common.formIdUpdate(e);
      var product = that.data.goodsInfo;
      var invurl = app.getPath.skuEnough;
      if (that.data.skuId) {
        // alpha-beta 0  减
        if (e.currentTarget.dataset.alphaBeta == 0) {
          // Lin start
          if (that.data.buynum <= product.min_buy_amount) {
            common.toast('不能小于最小购买数量')
            return;
          }
          // Lin end
          if (that.data.buynum <= 1) {
            // buynum: 1
          } else if (that.data.buynum === 2) {
            that.setData({
              buynum: that.data.buynum - 1,
              undel: true
            })
          } else {
            that.setData({
              buynum: that.data.buynum - 1,
            })
          }
          // 验证库存
          if (that.data.buynum != 1) {
            var invdata = {
              goods_id: product.goods_id,
              sku_key: that.data.skuId,
              amount: that.data.buynum
            };
            common.ApiGateWayTest(invurl, invdata, true, function (ret) {
              if (!ret) return;
              if (ret.data.result.is_enough != 1) {
                common.toast(ret.data.result.msg);
                return;
              }
            })
          }
        } else {
          // alpha-beta 1  加      max_buy_amount==0不限制数量
          // Lin start
          if (product.max_buy_amount != 0 && that.data.buynum >= product.max_buy_amount) {
            common.toast('不能在多啦~')
            return;
          }
          // Lin end
          that.setData({
            buynum: that.data.buynum + 1,
            undel: false
          })
          if (that.data.buynum > 1) {
            var invdata = {
              goods_id: product.goods_id,
              sku_key: that.data.skuId,
              amount: that.data.buynum
            };
            common.ApiGateWayTest(invurl, invdata, true, function (ret) {
              if (!ret) return;
              if (ret.data.result.is_enough != 1) {
                common.toast(ret.data.result.msg);
                that.setData({
                  buynum: that.data.buynum - 1,
                })
                return;
              }
            })
          }
        }
      } else {
        if (!that.data.showSKUstatus) {
          that.setData({
            showSKUstatus: true
          })
        } else {
          common.toast('请选择商品款式');
        }
      }
    },
    // 点击完成事件
    submitnew: function () {
      var that = this;
      if (that.data.skuId) {
        that.setData({
          showSKUstatus: false
        })
        var submitData = {
          shopItemInfo: that.data.shopItemInfo[that.data.skuId],
          buynum: that.data.buynum
        }
        that.triggerEvent('submitnew', submitData)
      } else {
        common.toast(that.data.skutitlename);
        return
      }
    },
    // SKU弹窗隐藏
    skuPopupHide: function () {
      var that = this;
      that.setData({
        showSKUstatus: false
      });
      that.triggerEvent('skuPopupHide', false)
    },
    // 滚动溢出
    bindtouchmove() {
      return false
    },
  }
})
