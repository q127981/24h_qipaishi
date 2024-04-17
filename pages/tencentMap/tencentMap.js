// pages/tencentMap/tencentMap.js
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    store: '', 
    markers: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this
    var store = JSON.parse(options.store)
    //console.log('地图参数======');
    //console.log(store);
    that.setData({
      store: store,
      markers: [{
        id:1,
        latitude: store.lat,
        longitude: store.lon,
      }]
    })
    that.goMap()
    // 实例化API核心类
    // qqmapsdk = new QQMapWX({
    //   key: 'FQGBZ-OY4CQ-XM35H-BWLYV-2U2V2-SRBZ6'
    // });
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
  goMap() {
    let that = this
    wx.openLocation({
      latitude: that.data.store.lat,
      longitude: that.data.store.lon,
      name: that.data.store.storeName,
      address: that.data.store.address,
      scale: 28
    })
  },
})