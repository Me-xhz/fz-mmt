var app = getApp();
const common = require('../../utils/common.js');
// pages/search/search.js
Page({
  data: {
    focus: true,
    hotKeyShow: true,
    historyKeyShow: true,
    searchValue: '',
    page: 1,
    shopList: [],
    historyKeyList: [],
    hotKeyList: [],
    page_size: 10,
    reachBottom: false,
    hotWord: [],
    keyword: '',
    showEmpty: false,
    sort: 'normal',
    hotAndHistoryHidden: false,
    iconUrl: app.dataBase.iconURL,
    hiddenTitle: true,
    ac_load_btn: true,
    priceSort: 'asc'
  },
  onLoad: function (options) {
    // if (options == undefined || options.keyWord == undefined) {
    //   common.toast("请求参数错误");
    //   return;
    // }
    if (options.keyWord != ''){
      this.setData({
        keyword: options.keyWord,
        placeholder: options.keyWord
      })
    }
    this.getHotWord();
    this.getHistroyList();
  },
  goHome: function (e) {
    wx.switchTab({
      url: '../index/index',
    })
  },
  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      shopList: []
    })
    this.searchProductData('downRefresh');
  },
  onReachBottom: function () {
    //下拉加载更多多...
    var key = this.data.searchValue;
    this.setData({
      page: (this.data.page + 1),
      keyword: key,
    })
    if(this.data.reachBottom){
      this.searchProductData();
    }
  },
  getHistroyList: function(){
    var data = common.getStorageSync('historyKeyList') || null;
    this.setData({
      historyKeyList: data
    })
  },
  doKeySearch: function (e) {
    var key = e.currentTarget.dataset.key;
    this.setData({
      searchValue: key,
      hotKeyShow: false,
      historyKeyShow: false,
      shopList: [],
      page: 1,
      hotAndHistoryHidden: true,
      keyword: key
    });
    
    this.data.shopList.length = 0;
    this.getOrSetSearchHistory(key);
    this.searchProductData();
  },
  //筛选切换
  filter: function(e){
    var that = this;
    if (!that.data.ac_load_btn) {
      return false;
    }  
    var type = e.currentTarget.dataset.type;
    that.setData({
      sort: type,
    })
    if(type == 'price'){
      this.data.priceSort = this.data.priceSort == 'asc' ? 'desc' : 'asc';
    }
    that.doSearch();
  },
  // 执行搜索事件
  doSearch: function () {
    var searchKey = this.data.searchValue.replace(/(^\s*)|(\s*$)/g, "");
    if (searchKey==''){
      common.toast('请输入您需要搜索的商品');
      return;
    }
    if (!searchKey && !this.data.keyword) {
      this.setData({
        focus: true,
        hotAndHistoryHidden: false
      });
      return;
    }else if(!searchKey && this.data.keyword){
      searchKey = this.data.keyword;
      this.setData({
        searchValue: this.data.keyword
      })
    }
    this.setData({
      keyword: searchKey,
      hotAndHistoryHidden: true,
      shopList: [],
      page:1,
    })
    this.searchProductData();
    this.getOrSetSearchHistory(searchKey);
  },
  // 获取历史搜索记录
  getOrSetSearchHistory: function (key) {
    var that = this;
    common.getStorage({
      key: 'historyKeyList',
    },function (res) {
      var data = res.data;
      var historyKeyList = [];
      var num = 1;
      //只取9个不包括key的最新数据
      for(var i in data){
        if(data[i] != key && num < 10){
          num++
          historyKeyList.push(data[i]);
        }
      }
      historyKeyList.unshift(key);
      common.setStorage({
        key: "historyKeyList",
        data: historyKeyList,
      },function(res){
        that.setData({
          historyKeyList: historyKeyList
        });
      });
    },
    //第一次storage中没有key时返回失败。
    function(res) {
      var historyList = []
      historyList.unshift(key);
      common.setStorage({
        key: 'historyKeyList',
        data: historyList
      })
    });
  },
  // 获取搜索内容
  searchValueInput: function (e) {
    var value = e.detail.value;
    this.setData({
      searchValue: value,
      placeholder: '请输入您的搜索内容'
    });
    if (!value && this.data.shopList.length == 0) {
      this.setData({
        hotKeyShow: true,
        historyKeyShow: true,
        keyword: '',
      });
    }
  },
  // 清除搜索内容
  cancelSearch: function(){
    this.setData({
      searchValue: '',
      shopList :[],
      showEmpty: false,
      hotAndHistoryHidden: false,
      hiddenTitle: true,
      keyword: '',
      placeholder: '请输入您的搜索内容'
    })
    this.getHistroyList();
  },
  // 清除搜索历史记录
  clearHistory: function() {
    var data = [];
    var that = this;
    common.showModal('是否清空历史记录？', '清空', function (res) {
      if (res.confirm) {
        // 清空
        common.setStorage({
          key: 'historyKeyList',
          data: data,
        },function (res) {
          that.setData({
            historyKeyList: data
          })
        })
      }
    })
    
  },
  // 获取热门搜索词条
  getHotWord: function(){
    var that = this;
    var uri = app.getPath.gethotword;
    var data = {
      is_default:0
    }
    common.ApiGateWayTest(uri, data, true, function(res){
      
      if(res && res.data){
        if(res.data.success == 1){
          that.setData({
            hotWord: res.data.result.data
          })
        }
      }
    })
  },
  // 搜索api，获取接口数据列表
  searchProductData: function (type) {
    var that = this;
    common.showLoad(that);
    // 关闭开关
    that.data.ac_load_btn = false;
    var uri = app.getPath.searchlist;
    var data = {
      page: this.data.page,
      page_size: this.data.page_size,
      keyword: this.data.keyword,
      sort: this.data.sort,
    }
    data.sort_asc = this.data.sort == 'price' ? this.data.priceSort : '';
    common.ApiGateWayTest(uri, data, true, function(res){
      if(res && res.data){
        if(res.data.success == 1){
          var data = res.data.result.data;
          if(type == 'downRefresh'){
            wx.stopPullDownRefresh();
          }
          if(data.length< that.data.page_size){
            that.setData({
              reachBottom: false
            })
          }else{
            that.setData({
              reachBottom: true
            })
          }
          if(data.length > 0){
            // var list = [];
            // var dataList = [];
            // for(var i in data){
            //   list.push(data[i]);
            //   if((Number(i)+1)%2 == 0){
            //     dataList.push(list);
            //     list = [];
            //   }
            //   if(i == data.length-1){
            //     if(list.length > 0){
            //       dataList.push(list);
            //     }
            //   }
            // }
            that.setData({
              shopList: that.data.shopList.concat(data),
              showEmpty: false,
              hiddenTitle: false
            })
          } else if (that.data.shopList.length <= 0){
            that.setData({
              showEmpty: true,
              hiddenTitle: true
            })
          }
        }else if(res.data.success == 0){
          that.setData({
            reachBottom: false
          })
        }
      }else{
        common.toast('网络加载错误，请稍后重试');
      }
      common.hideLoad(that);
      // 打开开关
      that.data.ac_load_btn = true;
      common.hideLoad(that);
    })
    
  },

});