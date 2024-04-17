// pages/join/join.js
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: '',
    success: false,
    name: '',
    phone: '',
    message: '',
    tele: '', //加盟电话
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
    this.getInfo()
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
  selectCity(){

  },
  onChange(event) {
    const { picker, value, index } = event.detail;
    picker.setColumnValues(1, citys[value[0]]);
  },
  bindRegionChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
  submit:function(){
    var that = this;
    if(that.data.phone == '' || that.data.name == '' || that.data.region.length==0){
      wx.showToast({
        title: '请填写完整',
      })
      return
    }
    if(!util1.checkPhone(that.data.phone)){
      wx.showToast({
        title: '请填写正确的手机号',
        icon: 'none'
      })
      return
    }

    if (app.globalData.isLogin) {
      http.request(
        "/member/user/saveFranchiseInfo",
        "1",
        "post", {
          "city": that.data.region[1],
          "contactName": that.data.name,
          "contactPhone": that.data.phone,
          "message": that.data.message,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('加盟信息===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              success:info.data,
            })
          }
        },
        function fail(info) {
          
        }
      )
    } else {
      //console.log('未登录失败！')
    }
  },
  getInfo: function(){
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/getFranchiseInfo",
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('加盟信息===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              tele: info.data.franchise,
              success:info.data.isCommit,
            })
          }
        },
        function fail(info) {
          
        }
      )
    } else {
      //console.log('未登录失败！')
    }
  },
  call:function () {
    let that = this;
    //console.log("拨打电话+++")
    wx.makePhoneCall({
      phoneNumber: that.data.tele,
      success:function () {
        //console.log("拨打电话成功！")
      },
      fail:function () {
        //console.log("拨打电话失败！")
      }
    })
  },
})