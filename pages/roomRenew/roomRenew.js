// pages/roomRenew/roomRenew.js
const app = getApp()
var http = require('../../utils/http');
var Moment = require('../../lib/moment.js');
Page({

  /**
   * 页面的初始数据
   */
   data: {
      isLogin: app.globalData.isLogin,
      storeId: '',
      roomId: '',
      OrderInfodata: '',
      newTime: '',
      totalPay: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this
    var storeId='';
    var roomId='';
    if(options.storeId){
      storeId=options.storeId;
    }
    if(options.roomId){
      roomId=options.roomId;
    }
    var query=wx.getEnterOptionsSync().query;
    if(query){
      if(query.storeId){
        storeId=query.storeId;
      }
      if(query.roomId){
        roomId=query.roomId;
      }
    }
    that.setData({
      storeId: storeId,
      roomId: roomId,
    });

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
    var that = this
    setTimeout(() => {
      that.setData({
        isLogin:app.globalData.isLogin
      })
    }, 200);
    that.getOrderInfo();
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
  getOrderInfo:function(){
      var that = this;
      http.request(
        "/member/order/getOrderByRoomId/"+that.data.roomId,
        "1",
        "post", {
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('订单信息===');
          // console.info(info);
          if (info.code === 0) {
            that.setData({
              OrderInfodata: info.data
            });
          }else{
            wx.showModal({
              title: '温馨提示',
              content: info.msg,
              showCancel: false,
              success (res) {
                if (res.confirm) {
                  let pages = getCurrentPages();
                  if (pages.length > 1) {
                    wx.navigateBack({//返回
                      delta: 1
                    });
                  }
                  if (pages.length == 1) {
                    wx.reLaunch({
                      url: '/pages/index/index',
                    })
                  }
                } 
              }
            })
          }
        },
        function fail(info) {
        }
      )
  },
    // 续费加时间
  onChange:function(event){
    var that = this
    var addTime = event.detail
    var newTime = Moment(that.data.OrderInfodata.endTime).add(addTime, "hours").format("YYYY/MM/DD HH:mm")
    //console.log(`newtime:${newTime}`)
    this.setData({
      newTime: newTime,
      totalPay: (addTime * that.getPrice(newTime)).toFixed(2)
    })
  },
  getPrice:function(startDate){
    var that=this;
    var day= new Date(startDate).getDay();
    switch (day) {
      case 1:
      case 2:
      case 3:
      case 4:
        return that.data.OrderInfodata.workPrice;
      case 0:
      case 5:
      case 6:
        return that.data.OrderInfodata.roomPrice;
    }
  },
  backHome: function(){
      wx.reLaunch({
        url: '/pages/index/index',
      })
  },
  renewOrder: function(){
    var that = this;
    if(!that.data.newTime){
      wx.showModal({
        title: '温馨提示',
        content: '请选择需要增加的时间！',
        showCancel: false,
        confirmText: "确定", 
        success (res) {
        }
      })
      return
    }
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/order/preOrder",
        "1",
        "post", {
          roomId:that.data.OrderInfodata.roomId,
          couponId:"", 
          startTime:that.data.OrderInfodata.endTime,
          endTime:that.data.newTime,
          orderId: that.data.OrderInfodata.orderId
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          console.info('支付信息===');
          console.info(info);
          if (info.code == 0) {
            that.data.renewOrderNo = info.data.orderNo;
            that.lockWxOrder(info);
          }else{
            wx.showModal({
              title: '温馨提示',
              content: info.msg,
              showCancel: false,
              confirmText: "确定", 
              success (res) {
              }
            })
          }
        },
        function fail(info) {
        }
      )
    }

  },
  // 锁定微信订单
  lockWxOrder:function(pay){
    var that = this;
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/order/lockWxOrder",
        "1",
        "post", {
          roomId:that.data.OrderInfodata.roomId,
          couponId:"", 
          startTime:that.data.OrderInfodata.endTime,
          endTime:that.data.newTime,
          orderId: that.data.OrderInfodata.orderId
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          if (info.code == 0) {
            console.log('锁定微信支付订单');
            that.payMent(pay);//微信支付
          }else{
            wx.showModal({
              title: '温馨提示',
              content: info.msg,
              showCancel: false,
              confirmText: "确定", 
              success (res) {
              }
            })
          }
        },
        function fail(info) {
        }
      )
    } 
  },
  //支付
  payMent: function(pay) {
    var that = this;
    wx.requestPayment({
        'timeStamp': pay.data.timeStamp,
        'nonceStr': pay.data.nonceStr,
        'package': pay.data.pkg,
        'signType': pay.data.signType,
        'paySign': pay.data.paySign,
        'success': function(res) {
            //console.log('*************支付成功');
            // setTimeout(function () {
            // }, 1000);
            // that.getOrderInfo()
        },
        'fail': function(res) {
            wx.showToast({
                title: '支付失败!',
                icon:'error'
            })
            //console.log('*************支付失败');
        },
        'complete': function(res) {
            //console.log('*************支付完成');
        }
    })
  },
  phone: function (e) {
    var that = this;
    //console.log('手机号码授权+++++++');
    if (e.detail.errMsg == "getPhoneNumber:fail user deny") {
      wx.showToast({ title: "已取消授权" });
    }
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      //console.log('手机号码授权+++++++');
      wx.login({
        success: function (res) {
          if (res.code != null) {
            http.request(
              "/member/auth/weixin-mini-app-login",
              "1",
              "post",
              {
                phoneCode: e.detail.code,
                loginCode: res.code,
              },
              "",
              "获取中...",
              function success(info) {
                console.info("返回111===");
                console.info(info);
                if (info.code == 0) {
                  if (info.data) {
                    app.globalData.userDatatoken = info.data;
                    app.globalData.isLogin = true;
                    that.setData({
                      isLogin: true,
                    });
                    //缓存服务器返回的用户信息
                    wx.setStorageSync("userDatatoken", info.data);
                  }
                }
              },
              function fail(info) {}
            );
          } else {
            //console.log('登录失败！' + res.errMsg)
          }
        },
      });
    }
  },
})