// pages/taskStatics/taskStatics.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
var Moment = require('../../../lib/moment.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: '',
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,//是否还能加载更多
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getData()
    this.getMainListdata("refresh")
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
    let that = this;
    that.setData({
        pageNo: 1,
        canLoadMore:true,
        list:[]
    })
    that.getMainListdata('refresh');
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.getMainListdata('')
    } else {
      wx.showToast({
        title: '我是有底线的...',
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  // 获取详情
  getData: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/clear/getChartData",
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              info: info.data
            })
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
  //获取列表数据
  getMainListdata:function(e){
    var that = this;
    let message = "";
    if (app.globalData.isLogin) 
    {
      if (e == "refresh") { //刷新，page变为1
        message = "正在加载"
        that.setData({
          pageNo:1,
          list:[]
        })
      }
      http.request(
        "/member/clear/getClearBillPage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            if(info.data.list.length === 0){
              that.setData({
                canLoadMore: false
              })
            }else{
               //有数据
              if(that.data.list){
                //列表已有数据  那么就追加
                let arr = that.data.list;
                let arrs = arr.concat(info.data.list);
                that.setData({
                  list: arrs,
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total
                })
              }else{
                that.setData({
                  list: info.data.list,
                  pageNo: that.data.pageNo + 1,
                });
              }
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
  golist: function(e){
    var time = e.currentTarget.dataset.time
    var status = e.currentTarget.dataset.status
    var startTime = ''
    var endTime = ''
    if(time == 'today'){
      startTime = Moment().format('YYYY-MM-DD')
      endTime = Moment().format('YYYY-MM-DD')
    }else if(time == 'month'){
      startTime = Moment().startOf('months').format('YYYY-MM-DD')
      endTime = Moment().endOf('months').format('YYYY-MM-DD')
    }
    wx.navigateTo({
      url: '../task/task?status='+status+'&startTime='+startTime+'&endTime='+endTime,
    })
  }
})