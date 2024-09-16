// packageA/pages/setStoreSound/setStoreSound.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: '',
    welcomeText: '',
    endText30: '',
    endText5: '',
    nightText: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      storeId: Number(options.storeId)
    })
    this.getInfoData();
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
  getInfoData:function(){
    return new Promise((r,t)=>{
      var that = this;
      //if (app.globalData.isLogin) 
      {
        http.request(
          "/member/store/getStoreSoundInfo/"+that.data.storeId,
          "1",
          "get", {
          },
          app.globalData.userDatatoken.accessToken,
          "",
          function success(info) {
            console.info(info);
            if (info.code == 0) {
             that.setData({
                welcomeText: info.data.welcomeText,
                endText30: info.data.endText30,
                endText5: info.data.endText5,
                nightText:info.data.nightText,
             })
            }else{
              wx.showModal({
                content: '请求服务异常，请稍后重试',
                showCancel: false,
              })
            }
          },
          function fail(info) {
          }
        )
      } 
    })
    
  },
   // 保存
   submit: function(){
      let that = this
      if (app.globalData.isLogin) 
      {
        http.request(
          "/member/store/saveStoreSoundInfo",
          "1",
          "post", {
            "storeId": that.data.storeId,
            "welcomeText": that.data.welcomeText,
            "endText30": that.data.endText30,
            "endText5": that.data.endText5,
            "nightText": that.data.nightText,
          },
          app.globalData.userDatatoken.accessToken,
          "",
          function success(info) {
            console.info(info);
            if (info.code == 0) {
              wx.showToast({
                title: '设置成功',
                icon: 'success'
              })
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1,
                })
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
      } 
  },
})