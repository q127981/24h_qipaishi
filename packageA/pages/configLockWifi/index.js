// packageA/pages/configLockWifi/index.js
const app = getApp()
var lock = require('../../../utils/lock');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx ? true : false,
    lockData: '',
    wifiSSid: '',
    wifiPwd: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      lockData: options.lockData,
    })
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
  configLock(e) {
    var that = this;
    if (!that.data.wifiSSid || !that.data.wifiPwd || that.data.wifiPwd.length < 8) {
      wx.showToast({
        title: 'WIFI信息不正确',
        icon: 'error'
      })
      return;
    }
    if (that.data.lockData) {
      lock.configLockWifi(that.data.lockData, that.data.wifiSSid, that.data.wifiPwd);
    }
  },
})