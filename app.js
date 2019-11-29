// app.js
var common = require("./utils/common.js");
var event = require('./utils/event.js');
var aldstat = require("./utils/ald-stat.js");
// var push = require('./utils/pushsdk.js');
//统计sdk
// var trackstat = require('./utils/wxTrack/track-stat.min.js');
// trackstat.init()
App({
  dataBase: {
    // 外部页面链接
    pageUrl: "",
    // 图片上传 测试服
    uploadFile: 'https://api-t.st-llshop.surex.cc/v1/image/imgUpload',
    // 图片上传 正式服
    // uploadFile: 'https://wx.shop.haoyousheng.com.cn/v1/image/imgUpload',
    // 图标OSS
    iconURL: "https://img.shop.haoyousheng.com.cn/wechat_icons",
    isRefresh: false,
    userAtitude: ""
  },
  ORDER_STATUS: {
    ALL: 0, //全部
    CREATED: 1, // 待支付
    PAID: 2, // 待发货
    PREPARING: 3, // 配货中
    PICKING: 4, // 待提货
    COMMENTING: 5, // 待评价
    FINISHED: 6, // 已完成
    CANCELLED: 7, // 已取消
    COMPLETE: 8, // 交易完毕

    // DEPOSIT_CREATED: 10, // 定金状态待付
    // DEPOSIT_PAID: 11, // 定金状态已付
    // DEPOSIT_CANCELLED: 15, // 定金状态取消
    // TAIL_CREATED: 20, // 尾款状态待付
    // TAIL_PAID: 21, // 尾款状态已付
    // TAIL_CANCELLED: 25  // 尾款状态已取消
  },
  // 是否需要登录(未注册end用户信息过期)
  checkSessionKey: false,
  // 是否刚进入app
  firstlaunchApp: true,
  // 是否需要在商品详情页面弹出售罄提示
  isShowISEnough: false,
  // 是否分享回调(积分游戏)
  isOnShareSuccess: false,
  // 小程序跟新弹窗显示
  updateModalShow: false,
  onLaunch: function(options) {
    var that = this;
    // 设置第一次启动默认弹出售罄框
    that.isShowISEnough = true;
    // 存放用户场景值
    common.setStorageSync('userScene', options.scene)
    // 存放用户进入小程序页面
    common.setStorageSync('userPage', options.path + JSON.stringify(options.query))
    // 设置自定义导航栏高度
    wx.getSystemInfo({
      success: res => {
        //导航高度
        that.globalData.navBarHeight = res.statusBarHeight + 46;
      }, fail(err) {
        console.log(err);
      }
    })
    // 缓存用户手机信息
    if (common.getStorageSync('systemInfo') == '' || !common.getStorageSync('systemInfo')) {
      common.setStorageSync('systemInfo', JSON.stringify(wx.getSystemInfoSync()));
    }
    // 如果从分享链接过来，存下分享者的user_id
    if (options && options.query.inviteId) {
      common.setStorageSync('inviteId', options.query.inviteId)
    }
    //判断用户是否需要登录
    common.checkSession(that.aldstat).then(function(v) {
      if (v == 'fail') {
        that.checkSessionKey = false;
        event.emit('checkSessionKey', false);
      } else {
        that.checkSessionKey = true;
        event.emit('checkSessionKey', that.checkSessionKey);
      }
    })

    //获取客服电话
    that.sethotline();
    that.overShare()
  },
  onShow: function (options) {
    var that = this;
    // 存放转发详情
    if (options.query.user_id && options.query.user_id != '') {
      common.setStorageSync('shareTicket_info', options)
    } else {
      common.setStorageSync('shareTicket_info', '')
    }
    // 存放邀请码转发详情
    if (options.query.invite_activity_id) {
      common.setStorageSync('invite_activity_shareTicket', options)
    } else {
      common.setStorageSync('invite_activity_shareTicket', '')
    }
    // 玉米商城分享监听返回回调
    if (that.isOnShareSuccess) {
      that.isOnShareSuccess = false;
      let uri = that.getPath.achieveShare
      common.ApiGateWayTest(uri, '', true, function (res) {
        if (res.data.success == 1) {
          if (res.data.result.state == 0) {
            common.toast(res.data.result.state_desc)
          }
        }
      })
    }
    event.emit('show', "切换前台显示");
    var atitude = '';
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        atitude = [longitude, latitude].join(',');
        common.setStorageSync('atitude', atitude);
        that.dataBase.userAtitude = atitude;
      },
      fail(res) {
        var atitudeStorage = common.getStorageSync('atitude');
        if (atitudeStorage && atitudeStorage != ''){
          that.dataBase.userAtitude = atitudeStorage;
        }else{
          that.dataBase.userAtitude = '';
        }
      }
    })
  },
  onHide: function() {
    var that = this;
    event.emit('hide', "切换后台");
    // 领取纸巾避免用户一直停留在领取界面，返回到首页
    // var pages = getCurrentPages();
    // if (pages['0'].route == 'pages/index/index') {
    //   if (this.dataBase.pageUrl == 'https://share.lltjs.com/app/index.php?i=2&c=entry&from=account&account=a450f613484aea3458ac7a7eba952d720d671557&xid=&do=entry&m=llt_afan') {
    //     wx.navigateBack({
    //       delta: 1
    //     })
    //   }
    // }
  },
  getOrBindTelPhone: function(returnUrl) {
    var user = this.globalData.userInfo;
    if (!user.tel) {
      wx.navigateTo({
        url: 'pages/binding/binding'
      });
    }
  },
  sethotline: function() {
    var that = this;
    that.globalData.hotline = '0591-62751447';
  },
  //设置全局分享方法
  overShare: function() {
    //监听路由切换
    let that=this
    if (wx.onAppRoute){
      wx.onAppRoute(function (res) {
        //get加载的页面
        let pages = getCurrentPages(),
          //获取当前页面的对象
          view = pages[pages.length - 1],
          data;
        if (view) {
          data = view.data;
          //这里可以过滤不需要复用的内容
          if (!data.isOverShare) {
            data.isOverShare = true;
            let share = view.onShareAppMessage
            view.onShareAppMessage = function (resData) {
              that.isOnShareSuccess = true;
              return share(resData)
            }
          }
        }
      })
    }
  },
  getPath: {
    // 买买提Api
    // 首页
    goodsRecommend: '/goods/goodsRecommend',
    indexShare: '/indexmodel/share',
    subjuctList: '/index/subjuctList',
    activityindex: '/activity/activityindex',
    barList: '/index/barList',
    usersign: '/sign/usersign',
    usersignInfo: '/sign/usersignInfo',
    activitynewperson: '/activity/activitynewperson',
    usersigncount: '/sign/usersigncount',
    newFactory: '/index/newFactory',
    indexShareInfo: '/ShareConfig/shareInfo',
    pickupActivity:'/PickUpActivity/index',
    getShopPickUp:'/PickUp/getShop',
    getTeamActivity:'/TeamActivity/index',
    getBargainActivity:'/ActivityBargain/index',
    activityAdIndex: '/IndexActivityAd/index',
    indexGetStock: '/IndexActivityAd/getStock',
    couponEntry:'/coupon/entry',
    // 商详
    goodsInfo: '/goods/goodsInfo',
    skuEnough: '/goods/skuEnough',
    sameCategoryGoods: '/goods/sameCategoryGoods',
    goodsLabel: '/GoodsLabel/index',
    fastbuy: '/SubscribeNotice/fastbuy',
    sellOutNotice: '/ActivityAd/sellOutNotice',
    // 评价
    addComment: '/comment/addComment',
    againComment: '/comment/againComment',
    againCommentView: '/comment/againCommentView',
    // 确认订单
    confirmReceive: '/Order/confirmReceive',
    checkOrderInfo: '/Order/checkOrderInfo',
    getInvoiceConfig: '/Invoice/getInvoiceConfig',
    confirmCartOrder: '/Order/confirmCartOrder',
    cartBuyCheck: '/Order/cartBuyCheck',
    confirmOrder: '/Order/confirmOrder',
    paySuccessCoupon: '/coupon/paySuccessCoupon',
    canGetCouponList: '/coupon/canGetCouponList',
    // 订单
    orderList: '/Order/orderList',
    orderDetail: '/Order/orderDetail',
    cancelOrder: '/Order/cancelOrder',
    // 购物车
    addCartnew: '/Cart/addCartnew',
    isnewpersongoods: '/Cart/isnewpersongoods',
    cartList: '/Cart/cartList',
    addCart: '/Cart/addCart',
    getSkuAmount: '/Cart/getSkuAmount',
    changCartNum: '/Cart/changCartNum',
    delCart: '/Cart/delCart',
    clearCart: '/Cart/clearCart',
    clearLoseCart: '/Cart/clearLoseCart',
    cartGoodsRecommend: '/goods/cartGoodsRecommend',
    calculateCart: '/Cart/calculateFees',
    // 活动
    activitylist: '/activity/activitylist',
    activitygoodslist: '/activity/activitygoodslist',
    activitydetail: '/activity/activitydetail',
    enrolluser: '/activity/enrolluser',
    //通用活动
    normalActivityList: '/NormalActivityGoods/index',
    normalActivityDetail: '/NormalActivity/detail',
    // 限时秒杀活动列表
    scKill: '/Activity/secKill',
    // 支付
    highSaleGoods: '/goods/highSaleGoods',
    doPay: '/Payment/doPay',
    checkPay: '/payment/checkPay',
    // 图片
    imgUpload: '/image/imgUpload',
    // 账户系统
    accountLog: '/index/accountLog',
    sendValidateCode: '/sms/sendValidateCode',
    accountLog: '/index/accountLog',
    thirdLogin: '/user/thirdLogin?oauth=wxm',
    oauthlogin: '/oauth/login?oauth=wxm',
    getWXUserInfo: '/user/getWXUserInfo',
    getWXMobile: '/user/getWXMobile',
    // 专题
    subjectgoods: '/subject/subjectgoods',
    subjectInfo: '/subject/subjectInfo',
    // 优惠券
    sendCoupon:'/redPacket/sendCoupon',
    getrule: '/redPacket/rule',
    getcoupon: '/redPacket/coupon',
    share: '/coupon/share',
    bonuslist: '/coupon/bonuslist',
    exchange: '/coupon/exchange',
    couponList: '/coupon/couponList',
    addCoupon: '/coupon/addCoupon',
    ordercouponList: '/coupon/ordercouponList',
    getallcouponlist: '/coupon/getallcouponlist',
    goodscouponlist: '/coupon/goodscouponlist',
    paycoupon: '/coupon/paycoupon',
    addAdCoupon: '/coupon/addAdCoupon',
    pickUpConponShare:'/coupon/pickUpConponShare',
    // 反馈
    feedbackadd: '/feedback/feedbackadd',
    questionlist: '/feedback/questionlist',
    // 提货点
    pickuplist: '/pickup/pickuplist',
    pickupregionlist: '/pickup/pickupregionlist',
    pickuplistr: '/pickup/pickuplistr',
    pickupInfo: '/PickUp/info',
    // 广告
    adclose: '/ad/adclose',
    adlist: '/ad/adlist',
    adpickuplist: '/ad/adpickuplist',
    indexmodel: '/index/indexmodel',
    weekShippingAd: '/ad/weekShippingAd',
    // 搜索
    searchlist: '/search/searchlist',
    gethotword: '/search/gethotword',
    // 地址
    getaddresslist: '/address/getaddresslistr',
    addaddress: '/address/addaddress',
    alteraddress: '/address/alteraddress',
    deladdress: '/address/deladdress',
    getregionlist: '/address/getregionlist',
    getpickup: '/pickup/getpickup',
    getpickupr: '/pickup/getpickupr',
    pickupLabel:'/PickUpLabel/index',
    // 个人中心
    getordernum: '/order/getordernum',
    outofdate: '/coupon/outofdate',
    lowPriceGoods: '/goods/lowPriceGoods',
    userInfo: '/index/userInfo',
    bindTel: '/user/bindTel',
    //  分类
    categorynav: '/category/categorynav',
    goodscategory: '/category/goodscategory',
    categoodslist: '/category/categoodslist',
    // 售后
    applyBackMoney: '/orderback/applyBackMoney',
    backReturnPickup: '/orderback/backReturnPickup',
    applyback: '/orderback/applyback',
    submitbackorder: '/orderback/submitbackorder',
    getbackdetail: '/orderback/getbackdetail',
    getbackorderlist: '/orderback/getbackorderlist',
    backcancel: '/orderback/backcancel',
    submitbackordersn: '/orderback/submitbackordersn',
    // 签到
    signcheck: '/sign/signcheck',
    usersign: '/sign/usersign',
    usersignInfo: '/sign/usersignInfo',
    usersigncount: '/sign/usersigncount',
    newGoodsRecommend: '/goods/newGoodsRecommend',
    openmsg: '/sign/openmsg',
    pointsinfo: '/sign/pointsinfo',
    gameGuide: '/game/gameGuide',
    // 推送上报
    submitFormId: '/FormCollect/submitFormId',
    // 物流端接口
    unclaimednum: '/takedelivery/unclaimednum',
    getOrder: '/takedelivery/getOrder',
    expressUserUri: '/user/getExpressUserInfo',
    getboxlist: '/takedelivery/getboxlist',
    confirmbox: '/takedelivery/confirmbox',
    takeConfirmorder: '/takedelivery/confirmorder',
    unclaimedInfo: '/takedelivery/unclaimedInfo',
    boxInfo: '/box/boxInfo',
    userPickUpList: '/pickup/userPickUpList',
    unclaimedGoodsInfo: '/takedelivery/unclaimedGoodsInfo',
    takeOrderDetail: '/takedelivery/orderDetail',
    unclaimedBackToWare: '/takedelivery/unclaimedBackToWare',
    inviteActivityReceiveList: '/InviteActivityReceiveList/exchange',
    getAllGoodsList:'/order/getAllGoodsList',
    getAlreadyWriteOffList:'/order/getAlreadyWriteOffList',
    flashUserCode:'/user/flashUserCode',
    getUserPickUp:'/order/getUserPickUp',
    getAlreadyWriteOffOrderList:'/order/getAlreadyWriteOffOrderList',
    getAlreadyWriteOffGoodsCount:'/order/getAlreadyWriteOffGoodsCount',
    // 分享二维码
    getWXACodeUnlimit: '/goods/getWXACodeUnlimit',
    // 获取邀请注册信息
    getInviteInfo: '/index/getInviteInfo',
    // 用户是否冻结
    checkUser: '/index/checkUser',
    // 积分游戏
    getPointsGameInfo: '/game/getPointsGameInfo',
    getPublicAwardLog: '/game/getPublicAwardLog',
    getAwordLog: '/game/getAwordLog',
    turnplateGame: '/game/turnplateGame',
    //打点上报
    reportLog: '/report/reportLog',
    //  门店支付
    shopPayDiscount: '/pickup/getDiscount',
    toPayShopOrder: '/Order/doStoreOrder',
    //  拼团
    teamFound: '/teamOrder/found',
    teamRule: '/teamOrder/teamRule',
    teamLabel: '/teamLabel/index',
    teamList:'/teamOrder/waitTeamFoundList',
    remindTeam:'/TeamAppointmentNotice/TeamAppointment',
    getTeamGoodsInfo: '/Goods/getTeamGoodsInfo',
    // 预下单判断
    preCheckOrder: '/Order/preCheckOrder',
    // 砍价活动
    bargaining:'/ActivityBargaining/index',
    bargainList:'/ActivityBargainList/index',
    bargainByFriend: '/ActivityBargainList/bargainByFriend',
    getBargainGoodsInfo:'/goods/getBargainGoodsInfo',
    bargainBySelf:'/ActivityBargaining/bargainBySelf',
    bargainInfo:'/ActivityBargaining/info',
    bargainRule: '/ActivityBargain/rule',
    checkDistance: '/ActivityBargainList/checkDistance',
    checkMobile: '/user/checkMobile',
    bargainNotice: '/SubscribeNotice/bargain',
    getFaceBargainCode:'/FaceBargain/getFaceBargainCode', //获取二维码
    // 店铺订单
    shopOrderList:'/shopOrder/orderList',
    shopOrderDetail:'/shopOrder/orderDetail',
    shopCancelOrder:'/shopOrder/cancelOrder',
    shopPreCheckOrder:'/shopOrder/preCheckOrder',
    // 店铺商品
    shopInfo: '/Shop/info',
    shopNotice: '/ShopNotice/index',
    shopGoodsCategory: '/ShopGoodsCategory/index',
    shopGoods: '/ShopGoods/index',
    shopCart: '/ShopCart/add',
    shopCartList: '/ShopCart/ShopIndex',
    shopCartModify: '/ShopCart/modify',
    shopCartClean: '/ShopCart/clean',
    shopGoodsImages: '/ShopGoodsImages/index',
    shopGoodsInfo: '/ShopGoods/info',
    shopGoodsNum: '/ShopCart/getGoodsNum',
    shopCheckOrderInfo:'/shopOrder/checkOrderInfo',
    shopConfirmOrder:'/shopOrder/confirmOrder',
    shopSearch:'/ShopGoods/searchIndex',
    shopHotWard:'/ShopHotSearch/index',
    shopCartCalculateFees:'/ShopCart/calculateFees',
    shopOrderCouponList: '/shopCoupon/orderCouponList',
    shopOrderBack:'/shopOrderBack/getBackOrderList',
    shopOrderBackDetail:'/shopOrderBack/getBackDetail',
    shopRefund:'/ShopOrderBack/refund',
    shopCouponList: '/shopCoupon/userCouponList',
    getSpecialCoupon: '/shopCoupon/getSpecialCoupon',
    isShowShopCouponAd: '/shopCoupon/isShowShopCouponAd',
    // 助力红包
    packetList:'/ActivityRedPacketList/index',
    createPacket:'/ActivityRedPacketBargaining/create',
    packetMsg:'/ActivityRedPacketBargaining/info',
    packetHelp:'/ActivityRedPacketList/bargainByFriend',
    packetRule:'/ActivityRedPacket/rule',
    getPcketCoupon:'/shopCoupon/getActivityRedPacketCoupon',
    packetCheckDistance: '/ActivityRedPacketBargaining/checkDistance',
    // 拉新红包-协同接口
    csTopNotice: '/redPacket/CsTopNotice',
    sureHomeSituation: '/Redpacket/entry',
    surePresentNewMsg: '/Redpacket/getNewMessage',
    csInviteList: '/redPacket/CsInviteList',
    csClickKnow: '/redPacket/CsClickKnow',
    sendRpAfterOrder: '/Redpacket/sendRpAfterOrder',
    csShowRedPacketInfo: '/redPacket/CsShowRedPacketInfo',
    rpCashOut: '/Redpacket/cashOut',
    inviteShareLogin: '/Redpacket/inviteShareLogin',
    csLatestUrgeLog: '/redPacket/CsLatestUrgeLog',
    cslist: '/redPacket/Cslist',
    inviteActivity: '/InviteActivity/index',
    createCode: '/InviteActivity/createCode',
    checkIsVailed: '/InviteActivityReceiveList/checkIsVailed',
    // 积分商城
    scoreGoods:'/ScoreGoods/list',
    getUserScoreGoodsPoint: '/ScoreGoods/getUserScoreGoodsPoint',
    scoreGoodsInfo: '/ScoreGoods/info',
    scorePreCheckOrder:'/ScoreOrder/preCheckOrder',
    scoreChangeList:'/ScoreGoodsRecord/changeList',
    checkScoreOrderInfo:'/ScoreOrder/checkOrderInfo',
    scoreRule:'/ScoreGoodsRecord/changeRule',
    doPayPoint:'/ScoreOrder/doPayPoint',
    scoreConfirmOrder:'/ScoreOrder/confirmOrder',
    getScoreGoodsNotice:'/ScoreGoods/getScoreGoodsNotice',
    confirmAddCoupon:'/ScoreOrder/confirmAddCoupon',
  //  积分商城任务模块
    scoreTaskList:'/ScoreTask/getList',
    achieveSign:'/ScoreTask/achieveSign',
    achieveOrder:'/ScoreTask/achieveOrder',
    achieveShare:'/ScoreTask/achieveShare',
    achieveHelpBargain:'/ScoreTask/achieveHelpBargain',
    bargainRewardScoreList:'/ScoreThankLog/bargainRewardScoreList',
    changeThankLogIsshow:'/ScoreThankLog/changeThankLogIsshow',
    bargainRewardScore:'/ScoreThankLog/bargainRewardScore',
    scoreTaskAdList:'/ScoreTask/indexAdList'
  },
  globalData: {
    userInfo: {},
    navBarHeight: 0,
    hotline: '0591-62751447'
  },

  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
  },
});

export default App;
