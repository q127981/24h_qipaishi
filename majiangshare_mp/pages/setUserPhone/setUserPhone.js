var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let phone = options.phone ? options.phone : ''
    this.setData({
      phone: phone
    })
  },
  onInputChange: function(e){
    this.setData({phone: e.detail.value})
  },
  submit: function(){
    if(this.data.phone == ''){
      wx.showToast({
        title: '请填写手机号',
        icon: 'none'
      })
      return
    }
    if(!util1.checkPhone(this.data.phone)){
      wx.showToast({
        title: '请填写正确的手机号',
        icon: 'none'
      })
      return
    }
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/update-mobile",
        "1",
        "post", {
          mobile: that.data.phone
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            wx.showToast({
              title: '修改成功',
              icon: 'none'
            })
            wx.navigateBack()
          }
        },
        function fail(info) {
          wx.showToast({
            title: '修改失败，请重试',
            icon:'none'
          })
        }
      )
    } else {
      //console.log('未登录失败！')
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