// components/payPu/paypu.js
var app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow:{
      type:Boolean,
      value:false,
      observe:function(oldvalue,newValue,changePath){
        console.log(oldvalue,newValue,changePath)
      }
    },
    loacl:{
      type:String,
      value:''
      
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
      isImg:false,
      iconURL: app.dataBase.iconURL
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setImg:function(){
        this.setData({
          isImg:!this.data.isImg
        })
    },
  
    confim:function(){
        this.triggerEvent('confim', true)
    },
    cancal:function(){
        this.triggerEvent('cancal', false)
    },
    touchHandler:function(){
      return
    }
  }
  
})
