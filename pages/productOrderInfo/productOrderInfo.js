// packageA/pages/addLock/addLock.js
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx ? true : false,
    lat:'',
    lot:'',
    productOrderInfo:{}, // 商品订单详情
    storeId:'', // 门店id
    orderId:'', // 商品订单id
    isShowAll:false, // 长度超过3 可以点击展示更多
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      let that = this
      console.log(options)
      that.setData({
        storeId:options.storeId,
        orderId:options.orderId
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
    let that = this
    that.getLocation().then((res) => { });
    that.getOrderInfo()
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
  
  // 获取门店详情
  getStoreInfodata:function(){
    var that = this;
      http.request(
        "/member/index/getStoreInfo"+'/'+that.data.storeId,
        "1",
        "get", {
            "lat": that.data.lat,
            "lon": that.data.lon,
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info(info);
          if (info.code == 0) {
            if(null!=info.data){
              that.setData({
                storeInfo: info.data,
              });
            }else{
            }
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
  },
  // 获取当前位置
  getLocation: function () {
    return new Promise((r, t) => {
      let that = this;
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          const latitude = res.latitude
          const longitude = res.longitude
          that.setData({
            lat: latitude,
            lon: longitude,
          });
          // that.getMainListdata('refresh');
          // 处理位置信息，比如将位置信息显示在页面上
          // 示例中使用的是util.js中的函数，开发者可以根据需要自行编写
          //util.showLocation(latitude, longitude)
        },
        fail: function (res) {
          // that.getMainListdata('refresh');
          // 如果获取位置信息失败，可以处理错误情况
          //console.log('获取位置失败', res.errMsg)
        }
      })
    });
  },
  // 获取订单详情
  getOrderInfo:function(){
    var that = this;
      http.request(
        "/product/order/info"+'/'+that.data.orderId,
        "1",
        "post", {},
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info(info);
          if (info.code == 0) {
            const productOrderinfo = info.data
            let totalNumber = 0;
            productOrderinfo.productInfoVoList.forEach(product => {
              totalNumber += product.number;
            });
            productOrderinfo.productInfoVoListThree = productOrderinfo.productInfoVoList.slice(0, 3);
            productOrderinfo.productNum = totalNumber;

            that.setData({
              productOrderInfo: productOrderinfo,
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
  },
   // 默认展示两个，点击取反
   showMore:function(){
    let that = this
    let show = that.data.isShowAll
    that.setData({
        isShowAll: !show
    })
  },
})