Component({
  data: {
    selected: 0,
    cartBadge: 0,
    backgroundColor: "#fff",
    color: "#888",
    selectedColor: "#555",
    swiperImgBl: false,
    showPage: true,
    tabType: 0,
    list: [{
      pagePath: "/pages/index/index",
      iconPath: "/images/icons/tab_indexoff.png",
      selectedIconPath: "/images/icons/tab_indexon.png",
      text: "首页"
    },
    {
      pagePath: "/pages/category/category",
      iconPath: "/images/icons/tab_searchCaroff.png",
      selectedIconPath: "/images/icons/tab_searchCaron.png",
      text: "分类"
    },
    {
      pagePath: "/pages/cart/cart",
      iconPath: "/images/icons/tab_cartoff.png",
      selectedIconPath: "/images/icons/tab_carton.png",
      text: "购物车"
    },
    {
      pagePath: "/pages/user/user",
      iconPath: "/images/icons/tab_myoff.png",
      selectedIconPath: "/images/icons/tab_myon.png",
      text: "我的"
    }],
    newList: [{
      pagePath: "/pages/index/index",
      iconPath: "/images/icons/tab_indexoff.png",
      selectedIconPath: "/images/icons/tab_indexon.png",
      text: "首页"
    },
    {
      pagePath: "/pages/user/user",
      iconPath: "/images/icons/tab_myoff.png",
      selectedIconPath: "/images/icons/tab_myon.png",
      text: "我的"
    }]
  },
  ready(){
    var that = this;
    if (that.data.swiperImgBl == false){
      that.setData({
        swiperImgBl: true
      })
    }
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    }
  }
})