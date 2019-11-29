// components/goodList3/goodList3.js
/**
 * type为2为两列列表
 * type为3为三列列表
 */
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array,
      value: [],
      observer: function(newVal, oldVal, changedPath) {
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
        if (newVal.length > 0) {
          var recommend_goods = this.rowFormat(this.properties.type, newVal);
          this.setData({
            recommend_goods
          })
        }
      }
    },
    align: {
      type: String,
      value: "left"
    },
    type: {
      type: Number,
      value: 3
    },
    symbolSize: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    recommend_goods: []
  },
  attached: function() {
    var type = this.properties.type;
    var symbolSize = this.properties.symbolSize;

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 格式化一维数组为二维数组
     * colNum: 列数
     * arr：传入的总数组数
     * **/
    rowFormat(colNum, arr) {
      let FormatArr = [];
      let rowNum = arr.length / colNum;

      for (var i = 0; i < rowNum; i++) {
        FormatArr.push(new Array());
        for (var j = i * colNum; j < (colNum * (i + 1)); j++) {
          if (arr[j] != undefined) {
            FormatArr[i].push(arr[j]);
          }
        }
      }
      return FormatArr;
    },
    // 跳转商品页
    goToProduct(e) {
      var goodsid = e.currentTarget.dataset.goodsid;
      wx.navigateTo({
        url: '/pages/product/product?entryType=external&productId=' + goodsid
      })
    },
  }
})