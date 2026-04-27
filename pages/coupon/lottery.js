var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    isLogin:app.globalData.isLogin,
    // 抽奖活动信息
    lotteryInfo: {},
    // 奖品名称映射
    prizeNames: {
      1: '一等奖',
      2: '二等奖',
      3: '三等奖',
      4: '保底奖'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let id = options.id;
    if(!id){
      var query = wx.getEnterOptionsSync().query;
      if (query) {
        if (query.id) {
          id = query.id;
        }
      }
    }
    this.setData({
      id: id
    })
  },
  onShow(){
    this.setData({
      isLogin:app.globalData.isLogin,
    })
    this.getInfo();
  },

  /**
   * 获取抽奖活动信息
   */
  getInfo() {
    var that = this;
    http.request(
      "/member/lottery/getInfo/" + that.data.id,
      "1",
      "post",
      {},
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          that.setData({
            lotteryInfo: info.data
          });
        } else {
          wx.showToast({
            title: "加载失败，请重试",
            icon: "none",
            duration: 2000,
          });
        }
      },
      function fail(info) {
        console.error("Failed to fetch coupon info:", info);
        wx.showToast({
          title: "加载失败，请重试",
          icon: "none",
          duration: 2000,
        });
      }
    );

  },

  /**
   * 处理活动数据
   */
  handleLotteryData(data) {
    // 更新奖品名称映射，使用实际奖品名称
    const prizeNames = {
      1: data.prize1 || '一等奖',
      2: data.prize2 || '二等奖',
      3: data.prize3 || '三等奖',
      4: data.prize4 || '保底奖'
    };

    // 检查当前用户是否已参与
    const currentUserId = wx.getStorageSync('userId');
    let hasJoined = false;
    let myWinCount = 1;

    if (data.detailList && data.detailList.length > 0 && currentUserId) {
      const myDetail = data.detailList.find(item => item.userId === currentUserId);
      if (myDetail) {
        hasJoined = true;
        myWinCount = myDetail.winCount || 1;
      }
    }

    this.setData({
      lotteryInfo: data,
      prizeNames,
      hasJoined,
      myWinCount
    });

    // 设置页面标题
    wx.setNavigationBarTitle({
      title: data.title || '抽奖活动'
    });
  },

  /**
   * 点击立即参加
   */
  handleJoin() {
    // 检查是否已登录
    if (!app.globalData.isLogin) {
      // 跳转到登录页面
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    // 已登录，参加活动
    var that = this;
    http.request(
      "/member/lottery/join/"+ that.data.id,
      "1",
      "post", {
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          wx.showToast({
            title: '操作成功',
          })
          that.getInfo();
        }else{
          wx.showToast({
            title: info.msg,
            icon: 'none'
          })
        }
      },
      function fail(info) {
        
      }
    )
  },

  /**
   * 页面下拉刷新
   */
  onPullDownRefresh() {
    this.fetchLotteryInfo(this.data.lotteryInfo.id);
    wx.stopPullDownRefresh();
  },

  /**
   * 分享给朋友
   */
  onShareAppMessage() {
    return {
      title: '快来参与抽奖活动~',
      path: '/pages/coupon/lottery?id=' + this.data.id
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '快来参与抽奖活动',
      query: 'id=' + this.data.id
    };
  }
});
