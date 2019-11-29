// pages/comment/comment.js
var app = getApp();
var common = require("../../utils/common.js");
Page({
  data: {
    iconURL: app.dataBase.iconURL,
    productId: 0,
    subtotal: {},
    comments: {},
    commentsList: [],
    grade: 0,
    page: 0,
    page_size: 5,
    limitWords: "展开",
    isLoading: true,
    isLastPage: false
  },

  onLoad: function (options) {
    if (options == undefined || options.productId == undefined) {
      common.toast("请求参数错误");
      return;
    }
    this.data.productId = options.productId;
    this.getCommentsNum();
    this.getComments();
  },

  getCommentsNum: function () {
    var that = this;
    common.showLoad(that);
    var url = "/Api/api.product.seeCommentsNum";
    var data = { product: this.data.productId }
    common.ApiGateWayTest(url, data, function (res) {
      var error_code = res.error_code;
      if (error_code == 0) {
        var subtotal = res.subtotal;
        that.setData({
          subtotal: subtotal
        });
        common.hideLoad(that);
      } else {
        common.hideLoad(that);
        common.toast("网络错误");
      }
    })
  },
  getComments: function () {
    if (this.data.comments.paged && this.data.comments.paged.more == 0) return
    if (this.data.comments.length > 0) {
      this.setData({
        isLoading: true
      });
    }
    var that = this;
    var url = "/Api/api.product.seeComments";
    that.data.page = that.data.page + 1;
    var data = {
      grade: that.data.grade,
      page: that.data.page,
      page_size: that.data.page_size,
      product: that.data.productId
    }
    common.ApiGateWayTest(url, data, function (res) {
      var error_code = res.error_code;
      if (error_code == 0) {
        var comments = res;
        var commentsList = that.data.commentsList;
        var listlen = commentsList.length ? commentsList.length : 0;
        for (var key in comments.reviews) {
          if (comments.reviews[key]) {
            commentsList.push(comments.reviews[key]);
          }
          if (commentsList[listlen].content.length > 248) {
            commentsList[listlen].words = true;
            commentsList[listlen].wordsCut = true;
          } else {
            commentsList[listlen].words = false;
            commentsList[listlen].wordsCut = false;
          }
          listlen++;
        }
        that.setData({
          comments: comments,
          commentsList: commentsList,
          isLoading: false,
          isLastPage: res.paged.more == 0 ? true : false
        });
      } else {
        common.toast("网络错误");
      }
    })
  },
  // 评论图
  setCommentImage: function (e) {
    var commentList = this.data.commentsList;
    var current = e.currentTarget.dataset.current;
    var idx = e.currentTarget.dataset.idx;
    var imgUrl = [];
    for (var i = 0; commentList[idx].imgInfo.length > i; i++) {
      imgUrl.push(commentList[idx].imgInfo[i].img);
    }
    wx.previewImage({
      current: current,
      urls: imgUrl,
    })
  },
  setAgainImage: function (e) {
    var commentList = this.data.commentsList;
    var current = e.currentTarget.dataset.current;
    var idx = e.currentTarget.dataset.idx;
    var imgUrl = [];
    for (var i = 0; commentList[idx].again_info.imgInfo.length > i; i++) {
      imgUrl.push(commentList[idx].again_info.imgInfo[i].img);
    }
    wx.previewImage({
      current: current,
      urls: imgUrl,
    })
  },
  limitWord: function (e) {
    var iscut = e.currentTarget.dataset.iscut;
    var infoidx = e.currentTarget.dataset.listnum;
    this.data.comment[infoidx].wordsCut = !iscut;
    if (iscut) {
      this.setData({
        comment: this.data.comment,
        limitWords: "收起"
      });
    }
    else {
      this.setData({
        comment: this.data.comment,
        limitWords: "展开"
      });
    }
  },
  getCommentType: function (e) {
    var typegrade = e.currentTarget.dataset.type;
    this.setData({
      grade: typegrade,
      page: 0,
      isLoading: true,
      comments: {},
      commentsList: []
    });
    this.getComments();
  }
})