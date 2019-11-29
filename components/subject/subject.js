// components/subject/subject.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list:{
      type: Array
    },
    type: Number
  },
  attached:function(){

    var list = this.properties.list;
    list.forEach(function(item){
      if(item.type==1){
        item.subType = 3
      } else if (item.type == 2){
        item.subType = 4
      }
    })
    this.setData({
      subList:list
    })
  },
  /**
   * 组件的初始数据
   */
  data: {
    subList:[],
    subURL:'/pages/projectPage/projectPage',
    subType:3
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
