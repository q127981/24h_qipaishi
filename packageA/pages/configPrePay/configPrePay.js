// packageA/pages/configPrePay/configPrePay.js
const app = getApp();
var http = require('../../../utils/http');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomId: '',
    prePrice: '',
    preUnit: '',
    minCharge: '',
    isIpx: app.globalData.isIpx ? true : false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;    
    if(options&&options.roomId){
      that.setData({
        roomId: options.roomId,
      })
    }else{
      wx.navigateBack();
    }
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
      this.getPrePayConfig();
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
  getPrePayConfig(){
    var that = this;
    http.request(
      "/member/store/getPrePayConfig/"+that.data.roomId,
      "1",
      "post", {
        },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          that.setData({
            prePrice: info.data.prePrice,
            preUnit: info.data.preUnit,
            minCharge: info.data.minCharge,
          })
        } 
      },
      function fail(info) {
        wx.showToast({
          title: '操作失败',
          icon: 'error'
        })
      }
    )

  },
  setPrePayConfig(){
    var that = this;
    http.request(
      "/member/store/setPrePayConfig",
      "1",
      "post", {
        roomId: that.data.roomId,
        prePrice: that.data.prePrice,
        preUnit: that.data.preUnit,
        minCharge: that.data.minCharge,
        },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          wx.showToast({
            title: '操作成功',
          })
          setTimeout(() => {
            wx.navigateBack();
          }, 200);
        }else{
          wx.showModal({
            title: '失败',
            content: info.msg,
            showCancel: false,
            complete: (res) => {
              if (res.cancel) {
                
              }
          
              if (res.confirm) {
                
              }
            }
          })
        }
      },
      function fail(info) {
        wx.showToast({
          title: '操作失败',
          icon: 'error'
        })
      }
    )
  },
  cancel(){
    setTimeout(() => {
      wx.navigateBack();
    }, 100);
  },
})