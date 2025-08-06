// pages/searchOrder/index.js
const app = getApp()
var http = require('../../utils/http');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    previewImgUrl: '/img/dingdanhao.jpg',
    orderNo: ''
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
  onPreviewImage() {
    wx.previewImage({
      urls: ['/img/dingdanhao.jpg']
    })
  },
  bindInputCode: function (e) {
    var that = this;
    if (e.detail.value.length >= 20) {
      that.setData({
        orderNo: e.detail.value,
      });
    }
  },
  onQuery(){
    var that = this;
    if(!that.data.orderNo||that.data.orderNo.length<20){
      wx.showToast({
        title: '错误的编号长度',
        icon:'error'
      })
      return
    }else{
      //把订单查询出来
      http.request(
        "/member/order/getOrderInfoByNo?orderKey=" + that.data.orderNo,
        "1",
        "get", {
      },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          if (info.code === 0) {
            //跳转订单详情
            wx.navigateTo({
              url: '../orderDetail/orderDetail?toPage=true&orderKey=' + that.data.orderNo,
            })
          } else {
            wx.showModal({
              title: '温馨提示',
              content: info.msg,
              showCancel: false,
              success(res) {
                if (res.confirm) {
                }
              }
            })
          }
        },
        function fail(info) {
        }
      )
    }
  }
})