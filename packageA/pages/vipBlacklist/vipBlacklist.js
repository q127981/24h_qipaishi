// pages/user/user.js
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    titleBarHeight: 0,
    isLogin:app.globalData.isLogin,
    storeId: '',
    showAddBlack: false,
    showremove: false,
    userPhone: '',
    vipBlacklist:[],  // 黑名单列表
    id:'',
    currentPage: 1,
    hasMore: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
        storeId: options.storeId
    })
    that.getVipBlacklist(true)
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
    let that = this;
    if (that.data.hasMore) {
        that.getVipBlacklist(false)
    } else {
      wx.showToast({
        title: '没有更多了...',
        icon: 'none'
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
 

  //到登录界面
  gotologin(){
    wx.navigateTo({
      url: '../login/login',
    })
  },
  // 获取详情
getVipBlacklist: function (refuse = false) {
    let that = this;
    if (app.globalData.isLogin) {
      let currentPage = refuse ? 1 : that.data.currentPage + 1; 
      that.setData({ currentPage });
      http.request(
        "/member/store/vip/blacklist",
        "1",
        "post",
        {
          "storeId": that.data.storeId,
          "pageSize": 10,
          "pageNo": currentPage
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            const vipBlacklistFormatted = info.data.list.map((item) => ({
              ...item,
              addTimeFormatted: that.formatDate(item.addTime),
            }));
            if (!refuse) {
              that.setData({
                vipBlacklist: that.data.vipBlacklist.concat(vipBlacklistFormatted), 
                hasMore: that.data.currentPage * 10 < info.data.total,
              });
              console.log(that.data.hasMore)
            } else {
              that.setData({
                vipBlacklist: vipBlacklistFormatted,
                hasMore: that.data.currentPage * 10 < info.data.total,
              });
              console.log(that.data.currentPage * 10)
              console.log(that.data.hasMore)
            }
            wx.stopPullDownRefresh(); 
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {
          wx.stopPullDownRefresh();
        }
      );
    } else {
      that.gotologin();
    }
  },
  showAdd:function(){
      let that = this
      that.setData({
          showAddBlack: true
      })
  },
  showRemove:function(e){
    let that = this
    that.setData({
        showremove: true,
        id: e.currentTarget.dataset.id
    })
    console.log(e.currentTarget.dataset.id)
},
  addBlackList:function(){
      let that = this
      console.log(that.data.userPhone)
      if (!that.data.userPhone || that.data.userPhone < 11) {
        wx.showToast({
          title: '手机号格式错误',
          icon: 'error'
        })
        return;
      }
      http.request(
        "/member/store/addBlackList",
        "1",
        "post",
        {
        "phone" : that.data.userPhone,
        "storeId": that.data.storeId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          that.setData({
            userPhone: ''
          })
          that.getVipBlacklist(true)
        },
        function fail(info) {
        }
      )
  },
  // 时间戳换为yyyy-MM-dd HH:mm:ss
   formatDate:function(timestamp) {
    const date = new Date(timestamp); 
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },
  remove:function(){
    let that = this
    
    http.request(
      "/member/store/remove/"+that.data.id,
      "1",
      "post",{
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        that.setData({
          id: ''
        })
        that.getVipBlacklist(true)
      },
      function fail(info) {
      }
    )
  },

})