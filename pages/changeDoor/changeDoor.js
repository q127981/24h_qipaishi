// pages/changeDoor/changeDoor.js
const app = getApp()
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
var Moment = require('../../lib/moment.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo: '',
    orderInfo: '',
    doorList: [],
    roomId: '',
    roomType:'',//房间类型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var orderInfo = JSON.parse(options.orderInfo)
    console.info('房间信息111===');
    console.info(orderInfo);
    this.setData({orderInfo: orderInfo})
    this.getuserinfo()
    this.getDoorList()
    if(options.roomType){
      this.setData({
        roomType: orderInfo.roomType
      })
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
  
  getuserinfo:function(){
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/get",
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('我的信息===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              userinfo:info.data,
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
  //获取房间列表
  getDoorList:function(e){
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getRoomInfoList/"+that.data.orderInfo.storeId,
        "1",
        "post", {
          "storeId": that.data.orderInfo.storeId
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('房间数组===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              doorList: info.data
            });
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
  call:function () {
    let that = this
    if(that.data.orderInfo.kefuPhone.length>0){
      //console.log("拨打电话+++")
      wx.makePhoneCall({
        phoneNumber:that.data.orderInfo.kefuPhone,
        success:function () {
          //console.log("拨打电话成功！")
        },
        fail:function () {
          //console.log("拨打电话失败！")
        }
      })
    }
  },
  choose: function(e){
    var that = this
    var info = e.currentTarget.dataset.info
    var roomId = info.roomId
    //禁用状态无法更换
    if(that.data.roomType>=info.type || info.status==0 || info.type>this.data.orderInfo.roomType){
      return
    }
    this.setData({
      roomId: roomId
    })
  },
  submit: function(){
    var that = this
    var roomId = that.data.roomId
    var orderId = that.data.orderInfo.orderId
    if(roomId===''){
      wx.showToast({
        title: '请选择房间',
        icon: 'none'
      })
      return
    }
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/order/changeRoom/"+orderId+"/"+roomId,
        "1",
        "post", {
          "orderId": orderId,
          "roomId": roomId,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            wx.showToast({
              title: '更换房间成功',
            })
            setTimeout(() => {
              wx.navigateBack()
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
  }
})