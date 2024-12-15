// components/custom-tabbar/custom-tabbar.js
const app = getApp()
const defaultTabList = [
  {
    pagePath: "/pages/doorList/doorList",
    text: "首页",
    iconPath: "../pages/static/icon/home.png",
    selectedIconPath: "../pages/static/icon/home-in.png",
  },
  {
    pagePath: "/pages/recharge/recharge",
    text: "优惠中心",
    iconPath: "../pages/static/icon/bar-coupon.png",
    selectedIconPath: "../pages/static/icon/coupon-in.png",
  },
  {
    pagePath: "/pages/orderList/orderList",
    text: "我的订单",
    iconPath: "../pages/static/icon/order.png",
    selectedIconPath: "../pages/static/icon/order-in.png",
  },
  {
    pagePath: "/pages/user/user",
    text: "个人中心",
    iconPath: "../pages/static/icon/my.png",
    selectedIconPath: "../pages/static/icon/my-in.png",
  },
]

const selectedTabList = [
  {
    pagePath: "/pages/index/index",
    text: "首页",
    iconPath: "../pages/static/icon/home.png",
    selectedIconPath: "../pages/static/icon/home-in.png",
  },
  {
    pagePath: "/pages/recharge/recharge",
    text: "优惠中心",
    iconPath: "../pages/static/icon/bar-coupon.png",
    selectedIconPath: "../pages/static/icon/coupon-in.png",
  },
  {
    pagePath: "/pages/orderList/orderList",
    text: "我的订单",
    iconPath: "../pages/static/icon/order.png",
    selectedIconPath: "../pages/static/icon/order-in.png",
  },
  {
    pagePath: "/pages/user/user",
    text: "个人中心",
    iconPath: "../pages/static/icon/my.png",
    selectedIconPath: "../pages/static/icon/my-in.png",
  },
]

Component({
  data: {
    list: defaultTabList,
    color: "#BCBCBC",
    safeAreaInsetBottom: 0,
    selectedColor: "#6DA773",
    borderStyle: "white",
    selected: 0,
  },
  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset;
      console.log('path:',path);
      wx.switchTab({
        url: path,
      });
      this.setData({
        selected: index,
      });
    },
    updateTabTar() {
     const storeId = wx.getStorageSync('global_store_id');
     console.log('updateTabTar',storeId);
     if(storeId){
      console.log('selectedTabList')
      this.getTabBar((tabBar) => {
        tabBar.setData({
          list: selectedTabList,
        })
      })
     }else{
      console.log('defaultTabList')
      this.getTabBar((tabBar) => {
        tabBar.setData({
          list: defaultTabList,
        })
      })
     }
    },
    setSafeAreaInsetBottom() {
      if (app.globalData.isIpx) {
        this.setData({
          safeAreaInsetBottom: 44,
        });
      } else if (statusBarHeight > 20) {
        this.setData({
          safeAreaInsetBottom: (statusBarHeight - 20) * 2 + 4,
        });
      }
    },
  },
  
  attached() {
    this.updateTabTar()
    this.setSafeAreaInsetBottom();
  },
});
