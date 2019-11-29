// packageA/take-out-shop/takeout-shop.js
var app = getApp();
var common = require("../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconURL: app.dataBase.iconURL,
    showGoodstatus:0,
    showModalStatus:false,
    showSearchModal: false,
    showProductStatus:0,
    showSearchstatus: 0,
    showCountModel: false,
    showCountIcon: false,
    showProductModal:false,
    shopInfo: {},
    categoryInfo: [],
    categoryList: [],
    cartList: [],
    gallery: [],
    goodInfo: {},
    seletTag: 0,
    cartNum: 0,
    viewHeight: 0,
    shop_id: 1,
    animationActive: false,
    page: 1,
    page_size: 20,
    search_page: 1,
    search_page_size: 20,
    searchValue: '',
    searchList: [],
    cartTotals: {},
    leftScrollTop: 0,
    startingprice: 0,
    rightScrollTop: 0,
    showNotice: false,
    notice: '',
    noticeMarqueePace: 1,
    noticeMarqueeDistance: 20,
    noticeSize: 15,
    noticeInterval: 20,
    btnDisplay: false,
    btnText: "去结算",
    isShowGoHome: false,
    shopCouponImg: '',
    packet_id:"",
    activity_red_packet_id:"",
    ordernum: {},
    showCouponFlex: false,
    showCouponPopup: false,
    couponPopupInfo: {},
    showBottomLoading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.data.shop_id = options.shop_id;
    if (options.give_platform && options.give_platform != undefined){
      that.give_platform = options.give_platform
    }else{
      that.give_platform = "";
    }
    // 从外部分享进入时，显示左上角回到首页  改动带external时为内部进入携带参数，外部进入不带参数
    if (options && options.entryType && options.entryType == 'external') {
      that.setData({
        isShowGoHome: false
      })
    } else {
      that.setData({
        isShowGoHome: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    clearInterval(this.noticeIntervalFun);
    this.getShopCartList();
    this.getShopInfo();
    this.getordernum();
    this.setData({
      leftScrollTop: 0,
      rightScrollTop: 0,
    })
  },

  //购物车弹窗显示
  showShop(){
    if (this.data.showGoodstatus == 0) {
      this.data.showGoodstatus = 1;
    } else {
      this.data.showGoodstatus = 0;
    }
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    animation.translateY(300).opacity(1).step();
    this.setData({
      animationData: animation.export()
    })
    if (this.data.showGoodstatus == 1) {
      this.setData({
        showModalStatus: true,
        showSearchModal: false,
        showProductModal: false,
      });
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
      if (this.data.showGoodstatus == 0) {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)
  },
  // 搜索弹窗显示
  showSearch() {
    if (this.data.showSearchstatus == 0) {
      this.data.showSearchstatus = 1;
    } else {
      this.data.showSearchstatus = 0;
    }
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    animation.translateY(300).opacity(1).step();
    this.setData({
      animationSearch: animation.export()
    })
    if (this.data.showSearchstatus == 1) {
      this.setData({
        showSearchModal: true
      });
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationSearch: animation.export()
      })
      if (this.data.showSearchstatus == 0) {
        this.setData({
          showSearchModal: false
        });
      }
    }.bind(this), 200)
  },
  // 领券弹窗隐藏
  hideConut() {
    this.setData({
      showCountModel: false
    })
  },
  //商详弹窗
  showProduct(e){
    if (this.data.showProductStatus == 0) {
      this.data.showProductStatus = 1;
    } else {
      this.data.showProductStatus = 0;
    }
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    animation.translateY(600).opacity(1).step();
    this.setData({
      animationDatas: animation.export()
    })
    if (this.data.showProductStatus == 1) {
      this.getShopGoodsImages(e);
      this.setData({
        showProductModal: true
      });
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationDatas: animation.export()
      })
      if (this.data.showProductStatus == 0) {
        this.setData({
          showProductModal: false
        });
      }
    }.bind(this), 200)
  },
  // 店铺信息
  getShopInfo(){
    var that = this;
    var uri = app.getPath.shopInfo;
    var data = {
      shop_id: that.data.shop_id
    }
    common.ApiGateWayTest(uri,data,true,function(res){
      var resData = res.data;
      if (res.data.success == 1){
        that.setData({
          shopInfo: resData.result
        })
        wx.setNavigationBarTitle({
          title:resData.result.name
        });
        if (resData.result.is_close_shop == 1){
          that.setData({
            btnDisplay: true,
            btnText: resData.result.close_button_desc
          })
        }
        that.getShopGoodsCategory();
        that.getShopCartList();
        that.getShopNotice();
        that.getIsShowShopCouponAd();
      }else{
        common.toast(resData.msg)
      }
    })
  },
  // 店铺公告
  getShopNotice(){
    var that = this;
    var uri = app.getPath.shopNotice;
    var data = {
      shop_id: that.data.shop_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (res.data.success == 1) {
        if (resData.result != '' && resData.result.content) {
          var sizeLength = Number(resData.result.content.length) * that.data.noticeSize;
          var windowWidth = wx.getSystemInfoSync().windowWidth;
          that.setData({
            sizeLength,
            windowWidth,
            showNotice: true,
            notice: resData.result.content,
          });
          that.noticeRun();
        }
      } else {
        common.toast(resData.msg)
      }
      wx.getSystemInfo({
        success: function (res) {
          var model = res.model
          if (model.search('iPhone X') != -1) {
            that.setData({
              viewHeight: res.windowHeight - (!that.data.showNotice ? 240 : 276)
            })
          } else {
            that.setData({
              viewHeight: res.windowHeight - (!that.data.showNotice ? 196 : 232)
            })
          }
        },
      })
    })
  },
  // 滚动公告
  noticeRun() {
    var that = this;
    that.noticeIntervalFun = setInterval(function () {
      if (-that.data.noticeMarqueeDistance < that.data.sizeLength) {
        that.setData({
          noticeMarqueeDistance: that.data.noticeMarqueeDistance - that.data.noticeMarqueePace,
        });
      } else {
        clearInterval(that.noticeIntervalFun);
        that.setData({
          noticeMarqueeDistance: 0
        });
        that.noticeRun();
      }
    }, that.data.noticeInterval);
  },
  // 公告弹窗
  noticeToast(){
    common.showRidoModal(this.data.notice,'知道了',function(res){
      return
    });
  },
  // 分类列表
  getShopGoodsCategory(seletTag){
    var that = this;
    var uri = app.getPath.shopGoodsCategory;
    var data = {
      shop_id: that.data.shop_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (res.data.success == 1) {
        that.setData({
          categoryInfo: resData.result,
          seletTag: seletTag ? seletTag : resData.result[0].id
        })
        if (!seletTag){
          that.getShopGoods();
        }
      } else {
        common.toast(resData.msg)
      }
    })
  },
  // 分类商品列表
  getShopGoods(){
    var that = this;
    var uri = app.getPath.shopGoods;
    var data = {
      shop_id: that.data.shop_id,
      shop_goods_category_id: that.data.seletTag,
      page: 1,
      page_size: 20
    }
    common.showLoad(this);
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (res.data.success == 1) {
        that.setData({
          rightScrollTop: 0
        })
        that.setData({
          categoryList: resData.result
        })
        common.hideLoad(that);
      } else {
        common.toast(resData.msg);
        common.hideLoad(that);
      }
    })
  },
  // 下拉加载更多分类商品
  moreShopGoods() {
    var that = this;
    var uri = app.getPath.shopGoods;
    var data = {
      shop_id: that.data.shop_id,
      shop_goods_category_id: that.data.seletTag,
      page: that.data.page,
      page_size: that.data.page_size
    }
    common.showLoad(this);
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (res.data.success == 1) {
        if (resData.result.length > 0){
          var list = that.data.categoryList.concat(resData.result)
          that.setData({
            showBottomLoading:false,
            categoryList: list
          })
        }else{
          common.toast('亲~已经全部加载了哦！')
        }
        common.hideLoad(that);
      } else {
        common.hideLoad(that);
        common.toast(resData.msg);
      }
    })
  },
  // 分类选择
  seletedCategory(e){
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    this.data.page = 1;
    this.setData({
      seletTag: id
    })
    if (index > 3){
      this.setData({
        leftScrollTop: (index - 3) * 108 + 'rpx'
      })
    }else{
      this.setData({
        leftScrollTop: 0
      })
    }
    this.getShopGoods();
  },
  // 加入购物车
  addCart(e){
    var item = e.currentTarget.dataset.item;
    var type = e.currentTarget.dataset.type;
    var that = this;
    var uri = app.getPath.shopCart;
    var data = {
      shop_id: that.data.shop_id,
      shop_goods_id: item.shop_goods_id,
      goods_num: type == 'reduce' && item.in_cart_num > 0 ? item.in_cart_num - 1 : item.in_cart_num + 1
    }
    if(that.data.shopInfo.is_close_shop == 1){
      common.toast('店铺歇业中,无法加购哦~');
      return;
    }
    common.showLoad(this);
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (res.data.success == 1) {
        common.hideLoad(that);
        var newCategoryList = that.data.categoryList.map(items=>{
          if (items.shop_goods_id == item.shop_goods_id) {
            if (type == 'reduce' && items.in_cart_num > 0) {
                items.in_cart_num--;
              }else{
                items.in_cart_num++;
              }
            }
            return items
        })
        if (that.data.showSearchModal == true) {
          var newSearchList = that.data.searchList.map(items => {
            if (items.shop_goods_id == item.shop_goods_id) {
              if (type == 'reduce' && items.in_cart_num > 0) {
                items.in_cart_num--;
              } else {
                items.in_cart_num++;
              }
            }
            return items
          })
          that.setData({
            searchList: newSearchList
          })
        }
        if (that.data.showProductStatus == true){
          that.showProduct();
        }
        if (type == 'reduce'){
          that.setData({
            categoryList: newCategoryList
          })
        }else{
          that.setData({
            animationActive: true,
            cartAnimationImg: item.original_img,
            categoryList: newCategoryList
          })
          setTimeout(() => {
            that.setData({
              animationActive: false
            })
          }, 1000)
        }
        that.getShopCartList();
        that.getShopGoodsCategory(that.data.seletTag);
      } else {
        common.hideLoad(that);
        common.toast(resData.msg);
      }
    })
  },
  // 获取购物车列表
  getShopCartList(){
    var that = this;
    var uri = app.getPath.shopCartList;
    var data = {
      shop_id: that.data.shop_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (res.data.success == 1) {
        that.setData({
          cartList: resData.result
        })
        that.getShopGoodsNum();
      } else {
        common.toast(resData.msg)
      }
    })
  },
  // 清空购物车
  onShopCartClean(){
    var that = this;
    var uri = app.getPath.shopCartClean;
    var data = {
      shop_id: that.data.shop_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (res.data.success == 1) {
        common.toast("清空成功");
        var newCategoryList = that.data.categoryList.map(items => {
          items.in_cart_num = 0;
          return items
        })
        that.setData({
          categoryList: newCategoryList
        })
        that.getShopCartList();
        that.getShopGoodsCategory(that.data.seletTag);
      } else {
        common.toast(resData.msg)
      }
    })
  },
  // 获取商品轮播图
  getShopGoodsImages(e){
    var that = this;
    var shop_goods_id = e.currentTarget.dataset.id;
    var uri = app.getPath.shopGoodsImages;
    var data = {
      shop_goods_id: shop_goods_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (res.data.success == 1) {
        that.setData({
          gallery: resData.result
        })
        that.getShopGoodsInfo(e);
      } else {
        common.toast(resData.msg)
      }
    })
  },
  // 获取商品详情
  getShopGoodsInfo(e){
    var that = this;
    var shop_goods_id = e.currentTarget.dataset.id;
    var uri = app.getPath.shopGoodsInfo;
    var data = {
      shop_goods_id: shop_goods_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (res.data.success == 1) {
        that.setData({
          goodInfo: resData.result
        })
      } else {
        common.toast(resData.msg)
      }
    })
  },
  // 获取购物车数量
  getShopGoodsNum(){
    var that = this;
    var uri = app.getPath.shopGoodsNum;
    var data = {
      shop_id: that.data.shop_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (res.data.success == 1) {
        that.setData({
          cartNum: resData.result.total_num
        })
        that.getShopHotWard();
      } else {
        common.toast(resData.msg)
      }
    })
  },
  // 获取店铺商品计算金额
  getShopHotWard(){
    var that = this;
    var uri = app.getPath.shopCartCalculateFees;
    var data = {
      shop_id: that.data.shop_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (res.data.success == 1) {
        that.setData({
          cartTotals: resData.result
        })
        if (that.data.shopInfo.is_close_shop != 1){
          if (resData.result.diff_price != 0) {
            if (resData.result.diff_price == that.data.shopInfo.start_shipping_price) {
              that.setData({
                btnDisplay: true,
                btnText: '¥' + that.data.shopInfo.start_shipping_price + '起送'
              })
            } else {
              that.setData({
                btnDisplay: true,
                btnText: '差¥' + resData.result.diff_price + '起送'
              })
            }
          } else if (resData.result.total_price == 0 && that.data.cartNum == 0) {
            that.setData({
              btnDisplay: true,
              btnText: '¥' + that.data.shopInfo.start_shipping_price + '起送'
            })
          } else {
            that.setData({
              btnDisplay: false,
              btnText: '去结算'
            })
          }
        }
      } else {
        common.toast(resData.msg)
      }
    })
  },
  // 获取搜索内容
  searchValueInput: function (e) {
    this.data.searchValue = e.detail.value;
  },
  // 店铺搜索商品列表
  searchProductData: function (type) {
    var that = this;
    var searchKey = that.data.searchValue.replace(/(^\s*)|(\s*$)/g, "");
    if (searchKey == '') {
      common.toast('请输入您需要搜索的商品');
      return;
    }
    var uri = app.getPath.shopSearch;
    var data = {
      page: 1,
      page_size: 20,
      keywords: that.data.searchValue,
      shop_id: that.data.shop_id
    }
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (resData.success == 1) {
        if (resData.result.length > 0){
          that.setData({
            searchList: resData.result
          })
          that.showSearch();
        }else{
          common.toast('亲~本店铺没有您要搜索的商品!');
        }
      } else {
        common.toast('网络加载错误，请稍后重试');
      }
    })
  },
  // 店铺搜索商品列表-下拉加载更多
  moreSearchProductData(){
    var that = this;
    var uri = app.getPath.shopSearch;
    var data = {
      page: that.data.search_page,
      page_size: that.data.search_page_size,
      keywords: that.data.searchValue,
      shop_id: that.data.shop_id
    }
    common.showLoad(this);
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if (res.data.success == 1) {
        if (resData.result.length > 0) {
          var list = that.data.searchList.concat(resData.result)
          that.setData({
            searchList: list
          })
        } else {
          common.toast('亲~已经全部加载了哦！')
        }
        common.hideLoad(that);
      } else {
        common.hideLoad(that);
        common.toast(resData.msg);
      }
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    that.data.page ++;
    if (that.data.categoryList.length % that.data.page_size == 0){
      that.setData({
        showBottomLoading:true
      })
      that.moreShopGoods();
    }
  },
  // 搜索结果加载更多
  searchReachBottom: function(){
    var that = this;
    that.data.search_page++;
    if (that.data.searchList.length % that.data.search_page_size == 0) {
      that.moreSearchProductData();
    }
  },
  // 去结算
  goSettlement(){
    var that = this;
    var uri = app.getPath.shopPreCheckOrder;
    var data = {
      shop_id: that.data.shop_id,
      time_atitude: app.dataBase.userAtitude
    }
    common.showLoad(this);
    common.ApiGateWayTest(uri, data, true, function (res) {
      var resData = res.data;
      if(resData.success == 1){
        wx.navigateTo({
          url: '../takeout-order/check-takeout-order?shop_id=' + that.data.shop_id,
        })
      }else{
        common.showRidoModal(resData.msg, '确定')
      }
      common.hideLoad(that);
    })

  },
  // 是否有可领取优惠券
  getIsShowShopCouponAd(){
    var that = this;
    var uri = app.getPath.isShowShopCouponAd;
    var data = {
      shop_id: that.data.shop_id,
      give_platform: that.give_platform
    }
    common.ApiGateWayTest(uri,data,true,res=>{
      var resData = res.data;
      if(resData.success == 1){
        that.shopCouponAd = resData.result;
        if (resData.result.status != 0){
          if (resData.result.status == 1) {
            that.setData({
              showCountModel: true,
              showCouponPopup: false,
              shopCouponImg: resData.result.coupon_img
            })
          } else if (resData.result.status == 2) {
            common.showRidoModal(resData.result.status_desc, '确定')
          }
        }
        if (resData.result.activityRedPacketInfo.status != 0){
          that.data.activity_red_packet_id = resData.result.activityRedPacketInfo.activity_red_packet_id;
          that.data.packet_id = resData.result.activityRedPacketInfo.activity_red_packet_bargaining_id;
          that.setData({
            showCountIcon: true
          })
        }
      }else{
        common.toast(resData.msg);
        return
      }
    })
  },
  // 领取店铺优惠券
  getSpecialCoupon(){
    var that = this;
    var uri = app.getPath.getSpecialCoupon;
    var data = {
      shop_id: that.data.shop_id,
      give_platform: that.give_platform,
      time_atitude: app.dataBase.userAtitude
    }
    common.showLoad(this);
    common.ApiGateWayTest(uri, data, true, res => {
      var resData = res.data;
      common.hideLoad(that);
      that.setData({
        showCountModel: false
      })
      if (resData.success == 1) {
        if (resData.result.data.state == 0) {
          if (resData.result.data.lists){
            if (resData.result.data.lists.length > 1){
              that.setData({
                showCouponPopup: true,
                couponPopupInfo: resData.result.data
              })
            }else{
              common.showRidoModal(resData.result.data.state_desc, '确定');
            }
          }else{
            common.showRidoModal(resData.result.data.state_desc, '确定');
          }
          that.getordernum();
        } else {
          common.showRidoModal(resData.result.data.state_desc, '确定')
          return
        }
      } else {
        common.toast(resData.msg);
        return
      }
    })
  },
  // 前往助力红包详情
  getAssistanceCoupon(){
    let that=this;
    if (that.data.packet_id != ''){
      wx.navigateTo({
        url: '../packet/packet?packet_id=' + that.data.packet_id + '&shop_id=' + that.data.shop_id
      })
    }else{
      var pUri = app.getPath.packetCheckDistance;
      var pData = {
        time_atitude: app.dataBase.userAtitude,
        shop_id: that.data.shop_id
      }
      common.ApiGateWayTest(pUri, pData, true, function (pRes) {
        if (pRes.data.success == 1) {
          let url = app.getPath.createPacket;
          let data = {
            activity_red_packet_id: that.data.activity_red_packet_id,
            shop_id: that.data.shop_id
          }
          common.ApiGateWayTest(url, data, true, function (res) {
            if (res.data.success == 1) {
              that.setData({
                showCountModel: false
              })
              wx.navigateTo({
                url: '../packet/packet?packet_id=' + res.data.result.activity_red_packet_bargaining_id + '&shop_id=' + that.data.shop_id + '&packet_bargaining=true'
              })
            }
          })
        } else {
          common.toast(pRes.data.msg);
          return;
        }
      })
    }
  },
  // 拨打商家电话
  makePhoneCall(){
    wx.makePhoneCall({
      phoneNumber: this.data.shopInfo.mobile,
    })
  },
  // 返回首页
  gotoHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 获取优惠券数量
  getordernum: function () {
    var that = this;
    var uri = app.getPath.getordernum;

    common.ApiGateWayTest(uri, '', true, function (res) {
      if (res.data.success == 1) {
        clearTimeout();
        that.setData({
          ordernum: res.data.result,
          showCouponFlex: true
        })
        setTimeout(()=>{
          that.setData({
            showCouponFlex: false
          })
        },15000)
      }
    })
  },
  // 前往我的优惠券
  toShopCoupon() {
    this.setData({
      showCouponFlex: false
    })
    wx.navigateTo({
      url: '/packageA/takeout-coupon/takeout-coupon?entryType=external',
    })
  },
  // 隐藏领取优惠券展示
  hideCouponPopup(){
    this.setData({
      showCouponPopup: false
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    var pickup = common.getStorageSync('getpickup');
    return {
      title: that.data.shopInfo.share_title,
      path: '/pages/index/index?pickup_id=' + pickup.pickup_id,
      imageUrl: that.data.shopInfo.share_img
    }
  }
})
