var http = require('../../../utils/http');
const app = getApp()

// pages/help/help.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    const { storeId } = options
    this.getStoreInfo(storeId)
  },

  getStoreInfo: function (storeId) {
    var that = this;
      http.request(
        "/member/index/getStoreInfo" + "/" + storeId,
        "1",
        "get",
        {},
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          if (info.code == 0) {
            if (
              null != info.data.storeEnvImg &&
              info.data.storeEnvImg.length > 0
            ) {
              var arr = info.data.storeEnvImg.split(",");
              that.setData({
                list: arr,
              });
            }
          } else {
            wx.showModal({
              content: "请求服务异常，请稍后重试",
              showCancel: false,
            });
          }
        },
        function fail(info) {}
      );
    
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

  }
})