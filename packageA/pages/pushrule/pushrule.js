// packageA/pages/addLock/addLock.js
const app = getApp()
var http = require('../../../utils/http');
var lock = require('../../../utils/lock');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx ? true : false,
    orderMode: 0,  // 接单方式
    refundable: 0, // 是否允许取消订单
    refundTime: 0, // 可退款时间
    preOrderTime: 0, // 提前预定时间
    intervalTime: 5, // 允许间隔时间
    notifyPhone: '', // 联系方式
    irregularRefund:false, // 是否支持非规则退款
    showRefund:true,
    storeId:'',
    // 最晚延迟时间点
    latestPeriodRulePointSelect:'',
    latestPeriodRulePoint: '', // 预定时间，格式为 yyyy-MM-dd HH:mm:ss
    showtimefalge:false, // 显示时间选择
    formatter(type, value) {
        if (type === "year") {
          return `${value}年`;
        }
        if (type === "month") {
          return `${value}月`;
        }
        if (type === "day") {
          return `${value}日`;
        }
        if (type === "hour") {
          return `${value}时`;
        }
        if (type === "minute") {
          return `${value}分`;
        }
        return value;
      },
      minDay: new Date().getTime(),
      maxDay: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).getTime(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    that.setData({
        storeId: options.storeId
    })
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

  increaseRefundTime:function() {
    this.setData({ refundTime: this.data.refundTime + 1 });
  },
  decreaseRefundTime:function() {
    this.setData({ refundTime: Math.max(0, this.data.refundTime - 1) });
  },

  increasePreOrderTime:function() {
    this.setData({ preOrderTime: this.data.preOrderTime + 1 });
  },
  decreasePreOrderTime:function() {
      this.setData({ preOrderTime: Math.max(0, this.data.preOrderTime - 1) });
  },


  increaseIntervalTime:function() {
    this.setData({ intervalTime: this.data.intervalTime + 1 });
  },
  decreaseIntervalTime:function() {
      this.setData({ intervalTime: Math.max(0, this.data.intervalTime - 1) });
  },
  // 取消订单按钮控制
  radioCancelChange:function(e){
      let that = this
       let num =  that.data.refundable == 0 ? 1 :0
      that.setData({
        refundable: num,
        showRefund: !that.data.showRefund
      })
  },

  // 是否支持非规则退款
  irregularRefundChange:function(){
    let that = this
    that.setData({
        irregularRefund: !that.data.irregularRefund
      })
  },

  saveSettings:function() {
      let that = this
      console.log(that.data)

      if(that.data.refundable==0&&that.data.refundTime>120){
        wx.showModal({
            title: '提示',
            content: '退款时间最大为120分钟，请输入。',
            showCancel: false, 
            confirmText: '我知道了',
            success (res) {
            }
          })
          return
      }

      if (app.globalData.isLogin) 
      {
        http.request(
          "/reserve/push/rule",
          "1",
          "post", {
              "storeId":that.data.storeId,
              "refundable":that.data.refundable,
              "addOrderBefore":that.data.preOrderTime,
              "refundBefore": that.data.refundTime,
              "notifyPhone":that.data.notifyPhone,
              "irregularRefund":that.data.irregularRefund,
              "latestPeriodRulePoint":that.data.latestPeriodRulePoint
          },
          app.globalData.userDatatoken.accessToken,
          "",
          function success(info) {
            console.log(info)
          },
          function fail(info) {
            
          }
        )
      }
  },

  // 延迟时间选择
  setshowSelectHour: function () {
    let that = this;
    that.setData({
      showtimefalge: true,
    });
  },
  //时间选择，点击确定
  timeChange: function (event) {
    const { year, month, day, hour, minute } = this.formatDate(event.detail);
    let that = this;
    var latestPeriodRulePointSelect = year + "-" + month + "-" + day + " " + `${hour}:${minute}:00`;
    that.setData({
        latestPeriodRulePoint:latestPeriodRulePointSelect,
        showtimefalge: false,
    });
  },
  //时间选择，点击取消
  timeCancel: function () {
    let that = this;
    that.setData({
      showtimefalge: false,
    });
  },
  formatDate(dateTime) {
    const date = new Date(dateTime);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    if (minute < 10) {
      minute = `0${minute}`;
    }
    if (hour < 10) {
      hour = `0${hour}`;
    }
    if (day < 10) {
      day = `0${day}`;
    }
    if (month < 10) {
      month = `0${month}`;
    }
    return {
      text: `${year}/${month}/${day} ${hour}:${minute}`,
      year,
      month,
      day,
      hour,
      minute,
    };
  },
})