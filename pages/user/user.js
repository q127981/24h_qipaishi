// pages/user/user.js
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    titleBarHeight: 0,
    isLogin: app.globalData.isLogin,
    sysinfo: '',
    userinfo: {
      couponCount: 0,
      giftBalance: 0,
      balance: 0
    },//用户信息
    cardList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSysInfo();
    this.setData({
      statusBarHeight: wx.getStorageSync("statusBarHeight"),
      titleBarHeight: wx.getStorageSync("titleBarHeight"),
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    that.setData({
      isLogin: app.globalData.isLogin,
    })

    if (!app.globalData.isLogin) {
      that.setData({
        couponCount: 0,
        giftBalance: 0,
        balance: 0
      })
    }
    that.getuserinfo();
    // that.getTabBar().updateTabTar();
    // this.getTabBar().setData({
    //   selected: 3
    // })
    // this.getCardPage();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getuserinfo: function () {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/get",
        "1",
        "get", {
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('我的信息===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              userinfo: info.data,
            })
          }
        },
        function fail(info) {

        }
      )
    } else {
      //console.log('未登录失败！')
    }
  },
  getSysInfo: function () {
    var that = this;
    http.request(
      "/member/index/getSysInfo",
      "1",
      "get", {
    },
      "",
      "",
      function success(info) {
        console.info(info);
        if (info.code == 0) {
          that.setData({
            sysinfo: info.data,
          })
        }
      },
      function fail(info) {

      }
    )
  },
  gotosetuserinfo: function () {
    wx.navigateTo({
      url: '../setUserInfo/setUserInfo',
    })
  },
  goOrder: function () {
    wx.switchTab({
      url: '../orderList/orderList',
    })
  },
  //到登录界面
  gotologin() {
    wx.navigateTo({
      url: '../login/login',
    })
  },
  getCardPage() {
    const that = this
    if (app.globalData.isLogin) {
      http.request(
        `/member/card/getMyCardPage`,
        "1",
        "post",
        {
          "pageNo": 1,
          "pageSize": 100,
          userId: app.globalData.userDatatoken.userId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            that.setData({
              cardList: info.data.list
            })
          } else {
            wx.showModal({
              content: info.msg || "请求服务异常，请稍后重试",
              showCancel: false,
            });
          }
        },
        function fail(info) { }
      );
    }
  },
  goScore() {
    wx.showToast({
      title: '暂不支持',
      icon: 'none'
    })
  },
  goCoupon() {
    wx.navigateTo({
      url: '../coupon/coupon',
    })
  }
})