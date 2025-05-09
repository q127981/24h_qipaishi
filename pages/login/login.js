// pages/login/login.js
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appName: app.globalData.appName,
    fastLogin: true,
    username: '',
    password: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    var that = this;
    //进入页面就进行自动登录尝试
    wx.showLoading({
      title: 'Loding...',
    })
    wx.login({
      success: function (res) {
        if (res.code != null) {
          http.request(
            "/member/auth/wxLoginByCode?code=" + res.code,
            "1",
            "post", {
          },
            "",
            "",
            function success(info) {
              console.info(info);
              if (info.code == 0 && info.data) {
                app.globalData.userDatatoken = info.data;
                  app.globalData.isLogin = true;
                  that.setData({
                    isLogin: true,
                  })
                  //缓存服务器返回的用户信息
                  wx.setStorageSync("userDatatoken", info.data)
                  wx.hideLoading();
                  wx.showToast({
                    title: '自动登录成功',
                    icon: 'success'
                  })
                  setTimeout(function () {
                    wx.navigateBack({
                      delta: 1,
                    })
                  }, 500);
              }else{
                wx.hideLoading();
              }
            },
            function fail(info) {
              wx.hideLoading();
            }
          )
        } else {
          console.log('获取微信信息失败' + res.errMsg)
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  phone: function (e) {
    console.log("授权用户手机号");
    var that = this;
    if (e.detail.errMsg == "getPhoneNumber:fail user deny") {
      wx.showToast({ title: '已取消授权' })
    }
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      //console.log('手机号码授权+++++++');
      //console.log(e.detail);
      //console.log('手机号码授权+++++++');
      wx.login({
        success: function (res) {
          //console.log('111++++==');
          //console.log(res);
          //console.log('111++++==');
          if (res.code != null) {
            http.request(
              "/member/auth/weixin-mini-app-login",
              "1",
              "post", {
              "phoneCode": e.detail.code,
              "loginCode": res.code
            },
              "",
              "获取中...",
              function success(info) {
                console.info('返回111===');
                console.info(info);
                if (info.code == 0) {
                  if (info.data) {
                    app.globalData.userDatatoken = info.data;
                    app.globalData.isLogin = true;
                    that.setData({
                      isLogin: true,
                    })
                    //缓存服务器返回的用户信息
                    wx.setStorageSync("userDatatoken", info.data)
                    wx.showToast({
                      title: '登录成功',
                      icon: 'none'
                    })
                    setTimeout(function () {
                      wx.navigateBack({
                        delta: 1,
                      })
                    }, 2000);
                  }
                }
              },
              function fail(info) {

              }
            )
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    } else {
      console.log(e.detail.errMsg);
    }
  },
  wxLogin: function () {
    this.setData({
      fastLogin: true
    })
  },
  pwdlogin: function () {
    this.setData({
      fastLogin: false,
      password: '',
    })
  },
  userLogin: function () {
    var that = this;
    if (!that.data.username || that.data.username.length != 11) {
      wx.showToast({
        title: '账号格式不正确',
        icon: 'none'
      })
      return
    }
    if (!that.data.password || that.data.password.length < 6) {
      wx.showToast({
        title: '密码格式不正确',
        icon: 'none'
      })
      return
    }
    //登录
    http.request(
      "/member/auth/login",
      "1",
      "post", {
      "mobile": that.data.username,
      "password": that.data.password
    },
      "",
      "获取中...",
      function success(info) {
        console.info('返回111===');
        console.info(info);
        if (info.code == 0) {
          if (info.data) {
            app.globalData.userDatatoken = info.data;
            app.globalData.isLogin = true;
            that.setData({
              isLogin: true,
            })
            //缓存服务器返回的用户信息
            wx.setStorageSync("userDatatoken", info.data)
            wx.showToast({
              title: '登录成功',
              icon: 'none'
            })
            setTimeout(function () {
              wx.navigateBack({
                delta: 1,
              })
            }, 2000);
          }
        } else {
          wx.showModal({
            title: '登录失败',
            content: info.msg,
            showCancel: false,
            complete: (res) => {

            }
          })
        }
      },
      function fail(info) {

      }
    )

  },
  backHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
})