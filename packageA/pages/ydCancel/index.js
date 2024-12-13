// packageA/pages/ydCancel/index.js
const app = getApp();
var http = require("../../../utils/http.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: '',
    list: [],
    isIpx: app.globalData.isIpx ? true : false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("onLoad");
    this.setData({
      storeId: options.storeId
    })
    this.getMainListdata('refresh');
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
  //获取列表数据
  getMainListdata: function (e) {
    var that = this;
    that.setData({
      list: []
    })
    let message = "";
    if (app.globalData.isLogin) {
      http.request(
        "/member/manager/getYDCancelAuthList/" + that.data.storeId,
        "1",
        "post", {
      },
        app.globalData.userDatatoken.accessToken,
        "正在加载",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              list: info.data
            })
          } else {
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
  setStatus: function (e) {
    let status = e.currentTarget.dataset.status;
    let orderId = e.currentTarget.dataset.info.orderId;
    let that = this
    if (app.globalData.isLogin) {
      http.request(
        "/member/manager/auditYD",
        "1",
        "post", {
        auditResult: status,
        storeId: that.data.storeId,
        orderId: orderId
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            wx.showToast({
              title: '操作成功',
            })
            setTimeout(() => {
              that.getMainListdata("refresh")
            }, 1000);
          } else {
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
})