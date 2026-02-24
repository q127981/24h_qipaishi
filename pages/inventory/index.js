const app = getApp();
var http = require('../../utils/http');
Page({
  data: {
    currentTab: 0, // 0-待取, 1-已取, 2-过期
    storeNameFilter: '', // 门店名称筛选
    dataList: [], // 所有数据从这儿读取
   
  },

  onLoad() {
   
  },
  onShow() {
    this.getList();
  },
  getList(){
    var that = this;
    if (app.globalData.isLogin)
    {
      http.request(
        "/member/inventory/getInventoryList" ,
        "1",
        "post",
        {
          storeName: that.data.storeNameFilter,
          status: that.data.currentTab,

        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            that.setData({
              dataList: info.data,
            });
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {}
      );
    }
  },

  
  // 门店名称输入
  onStoreNameInput(e) {
    this.setData({
      storeNameFilter: e.detail.value
    });
    this.getList();
  },

  // 切换标签
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      currentTab: index,
      dataList: []
    });
    this.getList();
  },

  // 下拉刷新
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom() {
    console.log('加载更多');
  }
});