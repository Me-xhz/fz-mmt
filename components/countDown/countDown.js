// components/countDown/countDown.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    timestamp:{
      type: Number,
      value: 0,
      observer: function (newVal, oldVal, changedPath) {
        var that = this;
        clearInterval(this.date);
        this.date = setInterval(function(){
          var now = new Date().getTime();
          that.countTime(now, newVal);
        },1000)
      }
    },
    type: {
      type: Number,
      value: 1
    },
    isShowMs: {
      type: Boolean,
      value: false
    }
  },
  externalClasses: ['time-text','doc-text'],
  /**
   * 组件的初始数据
   */
  data: {
    d: '00',
    h: '00',
    m: '00',
    s: '00',
    ms: '0',
  },
  attached(){
    if (this.data.isShowMs){
      this.countTimeMs();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    countTime:function(now,end){
      if(this.data.type == 1){
        var leftTime = end - now;
        var d, h, m, s;
        if (leftTime >= 0) {
          d = Math.floor(leftTime / 1000 / 60 / 60 / 24, 10);
          h = Math.floor((leftTime / 1000 / 60 / 60) % 24);
          m = Math.floor((leftTime / 1000 / 60) % 60);
          s = Math.floor((leftTime / 1000) % 60);
        } else {
          clearInterval(this.date);
          this.triggerEvent('countTimeOver');
          return false;
        }
        d = d > 9 ? d : ('0' + d);
        h = h > 9 ? h : ('0' + h);
        m = m > 9 ? m : ('0' + m);
        s = s > 9 ? s : ('0' + s);
        this.setData({
          d, h, m, s
        })
      }else{
        var leftTime = end - now;
        var d, h, m, s;
        if (leftTime >= 0) {
          h = Math.floor(leftTime / 1000 / 60 / 60);
          m = Math.floor((leftTime / 1000 / 60) % 60);
          s = Math.floor((leftTime / 1000) % 60);
        } else {
          clearInterval(this.date);
          this.triggerEvent('countTimeOver');
          return false;
        }
        d = d > 9 ? d : ('0' + d);
        h = h > 9 ? h : ('0' + h);
        m = m > 9 ? m : ('0' + m);
        s = s > 9 ? s : ('0' + s);
        this.setData({
          h, m, s
        })
      }
    },
    // 毫秒倒计时
    countTimeMs() {
      var ms = 9;
      this.dataMs = setInterval(() => {
        if (ms > 1) {
          ms--;
        } else {
          ms = 9
        }
        this.setData({
          ms: ms
        })
      }, 100)
    },
  }
})
