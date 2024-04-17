// pages/setUserInfo/setUserInfo.js
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo:{},//用户信息
    isIpx: app.globalData.isIpx?true:false
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
    this.getuserinfo()
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
  // 获取用户信息
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
          // console.info('我的信息===');
          // console.info(info);
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
  closeUserInfo(){
    this.setData({
      photoShow: false
    })
  },
  // 修改昵称
  setUserName: function(){
    let name = this.data.userinfo.nickname ? this.data.userinfo.nickname : ''
    wx.navigateTo({
      url: '../setUserName/setUserName?name='+name,
    })
  },
  // 修改手机号
  setPhone: function(){
    let that = this
    let phone = this.data.userinfo.mobile ? this.data.userinfo.mobile : ''
    wx.navigateTo({
      url: '../setUserPhone/setUserPhone?phone='+phone,
    })
  },
  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    //console.log(avatarUrl);
    var that = this;
    wx.uploadFile({
      url: app.globalData.baseUrl+'/member/store/uploadImg',
      filePath: avatarUrl,
      name: 'file',
      header: {
        'tenant-id': app.globalData.tenantId,
        'Content-Type': 'application/json',
        'Authorization':'Bearer '+app.globalData.userDatatoken.accessToken,
      },
      success(res) {
        var data = JSON.parse(res.data)
        that.updateAvatar(data.data)
      },
    });
  },
  // 修改头像
  updateAvatar:function(avatarUrl){
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/updateAvatar?avatarUrl="+avatarUrl,
        "1",
        "post", {
          "avatarUrl": avatarUrl
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            wx.showToast({
              title: '修改成功',
              icon: 'success'
            })
            that.getuserinfo()
          }
        },
        function fail(info) {
          
        }
      )
    } else {
      //console.log('未登录失败！')
    }
  },
  // 退出登录
  exitLogin:function(){
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/auth/logout",
        "1",
        "post", {
        },
        app.globalData.userDatatoken.accessToken,
        "加载中...",
        function success(info) {
          if (info.code == 0) {
            wx.showToast({
              title: '已退出',
              icon: 'success'
            })
            app.globalData.userData = {}
            wx.setStorageSync("userDatatoken", "")
            app.globalData.isLogin = false
            app.globalData.userDatatoken = {}
            wx.navigateBack()
          }
        },
        function fail(info) {
          
        }
      )
    } else {
      //console.log('未登录失败！')
    }



  }
})