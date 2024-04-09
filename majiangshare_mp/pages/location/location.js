// pages/location/location.js
const app = getApp()
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    citylist:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getCityListdata();
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
  //获取城市列表
  getCityListdata:function(e){
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getCityList",
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            
            that.setData({
              citylist: info.data
            });
          }
        },
        function fail(info) {
          
        }
      )
    } 
    // else {
    //   //console.log('未登录失败！')
    // }
  },

  onclickcity:function(e){
    var that = this;
    var acityname = e.currentTarget.dataset.info;//获取当前点击的下标
    setTimeout(() => {
      const eventChannel = that.getOpenerEventChannel();
      // 通过触发相关事件传递数据
      if(acityname){
        eventChannel.emit('pageDataList', acityname);
      }
      wx.navigateBack({
        delta: 1,
      })
  })

  },

})