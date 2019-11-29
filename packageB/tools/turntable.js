var app = getApp();
var common = require("../../utils/common.js");

Page({
  data: {
    iconURL: app.dataBase.iconURL,
    circleList: [], //圆点数组
    awardList: [], //奖品数组
    colorCircleFirst: '#FFDF2F', //圆点颜色1
    colorCircleSecond: '#FE4D32', //圆点颜色2
    colorAwardDefault: '#F5F0FC', //奖品默认颜色
    colorAwardSelect: 'red', //奖品选中颜色
    indexSelect: 0, //被选中的奖品index
    isRunning: false, //是否正在抽奖
    free: 0,
    showRuleModalStatus: false, //弹窗状态
    showBonusModal: false, //中奖记录弹层
    imageAward: [], //奖品图片数组
    marquee: 0, //每次移动Y坐标
    windowHeight: 0, //开始位置
    maxScroll: 0, //文本框总高度
    textScroll: 32, //单个文本区域高度
    points: 0, //积分余额
    needPoints: 0, //需要积分
    rules: {}, //规则
    prize: [], //中奖信息
    myPrize: [], //我的中奖信息
    page: 1,
    page_size: 5
  },

  onLoad: function() {

  },
  onShow: function(){
    this.getPointsGameInfo();
    this.getPublicAwardLog();
    this.circleList();
  },
  // 获取数据
  getPointsGameInfo: function() {
    var _this = this;
    var url = app.getPath.getPointsGameInfo;
    common.ApiGateWayTest(url, '', true, function(res) {
      var resData = res.data;
      if (resData.success == 1) {
        _this.data.imageAward = resData.result.awardInfo;
        //奖品item设置
        var awardList = [];
        //间距,怎么顺眼怎么设置吧.
        var topAward = 25;
        var leftAward = 25;
        for (var j = 0; j < 8; j++) {
          if (j == 0) {
            topAward = 25;
            leftAward = 25;
          } else if (j < 3) {
            topAward = topAward;
            //166.6666是宽.15是间距.下同
            leftAward = leftAward + 166.6666 + 15;
          } else if (j < 5) {
            leftAward = leftAward;
            //150是高,15是间距,下同
            topAward = topAward + 150 + 15;
          } else if (j < 7) {
            leftAward = leftAward - 166.6666 - 15;
            topAward = topAward;
          } else if (j < 8) {
            leftAward = leftAward;
            topAward = topAward - 150 - 15;
          }
          var imageAward = _this.data.imageAward[j].list_img;
          awardList.push({
            topAward: topAward,
            leftAward: leftAward,
            imageAward: imageAward
          });
        }
        _this.setData({
          awardList: awardList,
          prize: _this.data.prize,
          rules: resData.result.rules,
          points: resData.result.points,
          free: resData.result.free,
          needPoints: resData.result.need
        })
      } else {
        common.toast(resData.msg);
      }
    })
  },
  // 获取中奖信息
  getPublicAwardLog: function() {
    var that = this;
    var url = app.getPath.getPublicAwardLog;
    common.ApiGateWayTest(url, '', true, function(res) {
      var resData = res.data;
      if (resData.success == 1) {
        that.data.prize = resData.result.logInfo.concat(resData.result.logInfo);
        that.data.maxScroll = Number(resData.result.logInfo.length) * that.data.textScroll;
        that.scrolltxt();
        that.setData({
          prize: that.data.prize
        })
      } else {
        common.toast(resData.msg);
      }
    })
  },
  // 获取我的中奖信息
  getAwordLog: function() {
    var that = this;
    var url = app.getPath.getAwordLog;
    var data = {
      page: that.data.page,
      page_size: that.data.page_size
    }
    common.ApiGateWayTest(url, data, true, function(res) {
      var resData = res.data;
      if (resData.success == 1 && resData.result.logInfo.length > 0) {
        that.setData({
          myPrize: resData.result.logInfo
        })
      } else {
        common.toast('没有更多中奖信息了');
        that.data.page = that.data.page - 1;
      }
    })
  },
  // 我的中奖信息上一页
  myPrizeUp: function() {
    if (this.data.page > 1) {
      this.data.page = this.data.page - 1;
      this.getAwordLog();
    } else {
      common.toast('已经是第一页了哇')
    }
  },
  // 我的中奖信息下一页
  myPrizeDown: function() {
    if (this.data.page >= 1) {
      this.data.page = this.data.page + 1;
      this.getAwordLog();
    }
  },
  // 圆点
  circleList: function () {
    var _this = this;
    //圆点设置
    var leftCircle = 7.5;
    var topCircle = 7.5;
    var circleList = [];
    for (var i = 0; i < 24; i++) {
      if (i == 0) {
        topCircle = 15;
        leftCircle = 15;
      } else if (i < 6) {
        topCircle = 7.5;
        leftCircle = leftCircle + 102.5;
      } else if (i == 6) {
        topCircle = 15
        leftCircle = 620;
      } else if (i < 12) {
        topCircle = topCircle + 94;
        leftCircle = 620;
      } else if (i == 12) {
        topCircle = 565;
        leftCircle = 620;
      } else if (i < 18) {
        topCircle = 570;
        leftCircle = leftCircle - 102.5;
      } else if (i == 18) {
        topCircle = 565;
        leftCircle = 15;
      } else if (i < 24) {
        topCircle = topCircle - 94;
        leftCircle = 7.5;
      } else {
        return
      }
      circleList.push({
        topCircle: topCircle,
        leftCircle: leftCircle
      });
    }
    _this.setData({
      circleList: circleList
    })
    //圆点闪烁
    setInterval(function () {
      if (_this.data.colorCircleFirst == '#FFDF2F') {
        _this.setData({
          colorCircleFirst: '#FE4D32',
          colorCircleSecond: '#FFDF2F',
        })
      } else {
        _this.setData({
          colorCircleFirst: '#FFDF2F',
          colorCircleSecond: '#FE4D32',
        })
      }
    }, 500)
  },
  //开始游戏
  startGame: function(e) {
    common.formIdUpdate(e);
    if (this.data.isRunning) return
    if (this.data.points < this.data.needPoints && this.data.free == 0){
      common.showRidoModal('每次积分游戏消耗8积分，您当前积分不足~快去签到和购物获得积分吧~','确定');
      return;
    }
    this.setData({
      isRunning: true
    })
    var _this = this;
    var url = app.getPath.turnplateGame;
    common.ApiGateWayTest(url, '', true, function(res) {
      var resData = res.data;
      if (resData.success == 1) {
        var indexSelect = 0
        var i = 0;
        // var s = Math.random();
        var timer = setInterval(function() {
          indexSelect++;
          i += 100;
          if (i > 2000 && indexSelect == resData.result.award.id){
            //去除循环
            indexSelect--;
            clearInterval(timer);
            //获奖提示
            wx.showModal({
              title: '抽奖结果',
              content: resData.result.award.name,
              showCancel: false, //去掉取消按钮
              success: function (res) {
                if (res.confirm) {
                  _this.setData({
                    isRunning: false
                  })
                  _this.getPointsGameInfo();
                }
              }
            })
          }
          if (i > 8000){
            clearInterval(timer);
            wx.showModal({
              title: '抽奖结果',
              content: '网络异常，奖品中奖信息请稍后在我的优惠券或者积分里面查看~',
              showCancel: false, //去掉取消按钮
              success: function (res) {
                if (res.confirm) {
                  _this.setData({
                    isRunning: false
                  })
                  _this.getPointsGameInfo();
                }
              }
            })
          }
          indexSelect = indexSelect % 8;
          _this.setData({
            indexSelect: indexSelect
          })
        }, (100 + i))
      }else{
        common.toast(resData.msg);
        _this.setData({
          isRunning: false
        })
      }
    })
  },
  // 文本开始滚动
  scrolltxt: function() {
    var that = this;
    var data = that.data;
    var interval = setInterval(function() {
      var next = data.marquee - 1; //每次移动距离
      if (next < 0 && Math.abs(next) > data.maxScroll) {
        next = data.windowHeight;
        clearInterval(interval);
        that.scrolltxt();
      }
      that.setData({
        marquee: next
      });
    }, 80);
  },
  // 弹窗
  setRuleModalStatus: function(e) {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })

    animation.translateY(300).opacity(1).step();
    this.setData({
      animationData: animation.export()
    })

    this.setData({
      showRuleModalStatus: true
    });
    setTimeout(function() {
      animation.translateY('-150px').translateX('-50%').step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showRuleModalStatus: false
        });
      }
    }.bind(this), 200)
  },
  // 弹层
  setModalBonus: function() {
    if (this.data.showBonusModal == 0) {
      this.data.showBonusModal = 1;
      this.getAwordLog();
    } else {
      this.data.showBonusModal = 0;
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

    if (this.data.showBonusModal == 1) {

      this.setData({
        showBonusModal: true
      });
    }
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (this.data.showBonusModal == 0) {
        this.setData({
          showBonusModal: false
        });
      }
    }.bind(this), 200)
  },
})
