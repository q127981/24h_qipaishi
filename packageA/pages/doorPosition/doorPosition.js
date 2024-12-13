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
    storeInfo:'',
    lagitude:'',
    longitude:'',
    markers: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
        storeId: options.storeId
    })
    that.getData();
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
  getData: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/getDetail/"+that.data.storeId,
        "1",
        "get", {
          "storeId": that.data.storeId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info(info);
          if (info.code == 0) {
            let marker = {
                id: info.data.storeId,
                latitude: info.data.lat >90 ? 90 : info.data.lat,
                longitude: info.data.lon,
                callout: {
                  // 点击marker展示title
                  content: info.data.storeName
                },
                fontSize: 20,
                width: 20, // 这里假设设置宽度为30像素，你可以根据实际需求修改
                height: 20
              }
              let allMarkers = [];
              allMarkers.push(marker)
            that.setData({
                storeInfo: info.data,
                markers: allMarkers
            })
          }else{
            wx.showModal({
              content: info.msg,
              showCancel: false,
            })
          }
        },
        function fail(info) {
          
        }
      )
    } 
  },
  // 点击地图获取经纬度
  mapclick: function() {
    var that = this;
    console.log("地图点击");
    wx.chooseLocation({
      success: function(res) {
        var user_longitude = res.longitude;
        var user_lagitude = res.latitude;

        let marker = {
            id: that.data.storeId,
            latitude: user_lagitude,
            longitude: user_longitude,
            callout: {
              // 点击marker展示title
              content: that.data.storeName
            },
            fontSize: 20,
            width: 20, // 这里假设设置宽度为30像素，你可以根据实际需求修改
            height: 20
          }
          let allMarkers = [];
          allMarkers.push(marker)

        that.setData({
          lagitude: user_lagitude,
          longitude: user_longitude,
          markers: allMarkers
        });
        that.data.storeInfo.lat = user_lagitude
        that.data.storeInfo.lon = user_longitude
      },
      fail: function(res) {  
        console.log("点击地图fail:" + JSON.stringify(res));     
      }
    })
  },
  updatePositon(){
      let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/save",
        "1",
        "post", that.data.storeInfo,
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            wx.showToast({
              title: '设置成功',
              icon: 'success'
            })
            setTimeout(() => {
              wx.navigateBack()
            }, 1000);
          }else{
            wx.showModal({
              content: info.msg,
              showCancel: false,
            })
          }
        },
        function fail(info) {
          
        }
      )
    } else{
        this.gotologin()
    }
  },
  callback(){
    wx.navigateBack({
        delta: 1
      });
  },
})