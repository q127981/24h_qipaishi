// pages/user/user.js
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:app.globalData.isLogin,
    sysinfo: '',
    userinfo:{
      couponCount:0,
      giftBalance:0,
      balance:0
    },//用户信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSysInfo();
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
      isLogin:app.globalData.isLogin,
    })

    if(!app.globalData.isLogin){
      that.setData({
        couponCount:0,
        giftBalance:0,
        balance:0
      })
    }
    that.getuserinfo();
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
  phone:function(e){
    //console.log("授权用户手机号");
    var that = this;
    if(e.detail.errMsg=="getPhoneNumber:fail user deny"){
      wx.showToast({title: '已取消授权'})
    }
    if(e.detail.errMsg=="getPhoneNumber:ok"){
      //console.log('手机号码授权+++++++');
      //console.log(e.detail);
      //console.log('手机号码授权+++++++');
      wx.login({
        success: function(res) {
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
                      if(info.data){
                        app.globalData.userDatatoken = info.data;
                        app.globalData.isLogin=true;
                        that.setData({
                          isLogin:true,
                        })
                        //缓存服务器返回的用户信息
                        wx.setStorageSync("userDatatoken", info.data)
                        that.getuserinfo()
                      }
                  }
                },
                function fail(info) {
                  
                }
              )
            } else {
              //console.log('登录失败！' + res.errMsg)
            }
          }
        })
    }
  },
  getuserinfo:function(){
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
              userinfo:info.data,
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
  getSysInfo:function(){
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
            sysinfo:info.data,
          })
        }
      },
      function fail(info) {
        
      }
    )
  },
  gotosetuserinfo:function(){
    wx.navigateTo({
      url: '../setUserInfo/setUserInfo',
    })
  },
  goOrder:function(){
    wx.switchTab({
      url: '../orderList/orderList',
    })
  },
  //到登录界面
  gotologin(){
    wx.navigateTo({
      url: '../login/login',
    })
  },
})