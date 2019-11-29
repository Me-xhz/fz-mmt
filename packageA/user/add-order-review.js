const app = getApp();
const common = require('../../utils/common.js')
Page({
  data: {
    iconURL: app.dataBase.iconURL,
    toast: true,
    commentsText: '',
    imgList: [],
    uploadImg: [],
    imgNowLength: 0,
    countNum: 0
  },
  onLoad: function (options) {
    if (options == undefined || options.order == undefined) {
      common.toast("请求参数错误");
      return;
    }
    this.setData({
      order_id: options.order,
    })
    this.getReviewInfo();
  },
  getReviewInfo: function() {
    var that = this;
    var uri = app.getPath.againCommentView;
    var data = {
      order_id: that.data.order_id
    }
    common.ApiGateWayTest(uri, data, true, function(res){
      if(res.data.success == 1){
        var data = res.data.result;
        var review = [];
        var reviewData = [];
        for(var i in data){
          // 追加评价的数据对象
          review[i] = {
            goods_id: data[i].goods_id,
            content: '',
            comment_id: data[i].comment.comment_id,
            img: [],
            checkedId: i
          };
          // 上一次评价的数据对象
          reviewData[i] = {
            goods_id: data[i].goods_id,
            goods_name: data[i].goods_name,
            comment_id: data[i].comment.comment_id,
            old_content: data[i].comment.content,
            comment_rank: data[i].comment.comment_rank,
            goods_img: data[i].img,
            review_img: data[i].comment.img,
            checkedId:　i,
            uploadImg: []
          };
        }
        that.setData({
          orderReview: reviewData,
          review: review
        })
      }
    })
  },
  // 获取追加的评论内容
  add_comments: function (e) {
      var commentsText = e.detail.value;
      var checkedId = e.currentTarget.dataset.checkedId;
      var data = this.data.orderReview;
      for(var i in data){
        if(checkedId == data[i].checkedId){
          this.data.review[i].content = commentsText;
        }
      }
  },
  // 提交数据到后端
  touchSubmit: function () {
    var that = this;
    var review = JSON.stringify(that.data.review);
    var uri = app.getPath.againComment;
    var data = {
      order_id: that.data.order_id,
      review: review,
    }
    common.ApiGateWayTest(uri, data, true, function(res){
      if(res.data.success == 1){
        common.toast(res.data.msg);
        setTimeout(function(){
          wx.navigateBack(1);
        },1500)
      }
    })
  },
  //选择图片
  updataimg: function (e) {
    var that = this;
    var checkedId = e.currentTarget.dataset.checkedId;
    var data = that.data.orderReview;
    for(var i in data){
      if(data[i].checkedId == checkedId){
        if (data[i].uploadImg.length <= 3) {
          var count = 3 - Number(data[i].uploadImg.length);
          that.chooseImg(i,count);
        }
      }
    }
  },
  //选择图片api
  chooseImg: function(i,count){
    var that = this;
    wx.chooseImage({
        count: count,
        success: function (res) {
          that.data.orderReview[i].uploadImg = that.data.orderReview[i].uploadImg.concat(res.tempFilePaths);
          that.setData({
            orderReview: that.data.orderReview
          })
        },
      })
  },
  //删除选中的图片
  delUploadImg: function (e) {
    var index = e.currentTarget.dataset.index;
    var checkedId = e.currentTarget.dataset.checkedId;
    var data = this.data.orderReview;
    for(var i in data){
      if(data[i].checkedId == checkedId){
        data[i].uploadImg.splice(index, 1);
      }
    }
    this.setData({
      orderReview: data
    })
  },
  // 点击提交事件
  submitImg: function(e,key){
    var that = this;
    for(var i in that.data.orderReview){
      if (that.data.review[i].content.length > 0 && that.data.review[i].content.length < 5) {
        wx.showToast({
          title: '评论字数不能少于5个',
          icon: 'none',
          duration: 　1000
        })
        return;
      }
    }
    var data = that.data.orderReview;
    var index = ''
    if(!key){
      index = 0;
    }else{
      index = key;
    }
    // 计算总的上传图片数量
    var num = 0;
    for(var i in data){
      for(var j = 0; j < data[i].uploadImg.length; j++){
        num++
      }
    }
    that.data.countNum = num;
    // 处理异步回调的递归
    that.uploadImg(index).then(function(res){
      if(res < that.data.orderReview.length - 1){
        var thisIndex = res + 1;
        that.submitImg('',thisIndex)
      }else if(res == that.data.orderReview.length - 1){
        wx.hideLoading();
        that.touchSubmit();
      }
    })
  },
  //上传图片到服务
  uploadImg: function (index) {
    var that = this;
    var imgData = that.data.orderReview[index].uploadImg;
    var header = {
      'accept': 'application/json',
      'content-type': 'multipart/form-data',
      'x-application': 'cilicili',
      'x-platform': 'wx',
      'x-useragent': 'host',
      'x-ver': 'v1.0',
    }
    header['X-Authorization'] = common.getStorageSync('token');
    return new Promise(function(resolve,reject){
      // 如果当前数组没有图片直接执行回调
      if(imgData.length <= 0){
        resolve(index);
        return;
      }
      for (var i = 0; i < imgData.length; i++) {
        var img = imgData[i];
        var data = {
          path: 'comment',
          img_type: 1
        };
        wx.uploadFile({
          url: app.dataBase.uploadFile,
          filePath: img,
          name: 'file',
          formData: data,
          header: header,
          success: function (res) {
            var res = JSON.parse(res.data);
            if(res.success == 1){
              that.data.review[index].img.push(res.result.url)
              // 当前全部上传完时执行回调
              if(that.data.review[index].img.length == that.data.orderReview[index].uploadImg.length){
                that.setData({
                  review: that.data.review
                })
                resolve(index);
              }
            }
          }
        })
        // 计算当前上传图片的数量
        that.setData({
          imgNowLength: that.data.imgNowLength + 1
        })
        // 显示当前上传的进度
        wx.showLoading({
          title: that.data.imgNowLength + '/' + that.data.countNum,
          mask: true
        })
      }
    })
  },
})