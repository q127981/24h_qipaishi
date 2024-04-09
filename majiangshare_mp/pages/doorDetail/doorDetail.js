// pages/doorDetail/doorDetail.js

const app = getApp()
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    doorinfodata:{},//门店信息
    storeId:'',
    storeEnvImg:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;
    if(options.storeId){
      that.setData({
        storeId: options.storeId
      });
      console.info('options===');
      console.info(options.storeId);
      this.getDoorInfodata();
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

  },
  //获取房间相信信息
  getDoorInfodata:function(e){
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getStoreInfo"+'/'+that.data.storeId,
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('房间信息===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              doorinfodata: info.data
            });
            if(info.data.storeEnvImg.length>0){
              var arr=info.data.storeEnvImg.split(",");
              that.setData({
                storeEnvImg: arr
              });
            }
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
  },
})