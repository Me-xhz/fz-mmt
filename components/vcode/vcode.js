// components/vcode/vcode.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    time: {
      type: Number,
      value: 60
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    yzm_text:'发送验证码',
    disabled:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getYzm:function(){
      var that = this;
      var time = this.properties.time;
      var yzmTimer = setInterval(function(){
        time--;
        if (time == 0) {
          clearInterval(yzmTimer);
          that.setData({
            yzm_text: '重新获取',
            disabled:false
          })
        }else{
          that.setData({
            yzm_text: '已发送(' + time + ')',
            disabled:true
          })
        }
      },1000)
      
    }
  }
})
