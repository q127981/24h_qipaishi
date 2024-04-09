// pages/cashOut/cashOut.js
const app = getApp()
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sdt: '',
    edt: '',
    show: false, //日期控件
    minDate: new Date(2023, 0, 1).getTime(),
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,//是否还能加载更多
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getMainListdata('refresh');
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
    this.setData({
        pageNo: 1,
        canLoadMore:true,
        list:[]
    })
    this.getMainListdata('refresh');
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.data.pageNo++;
      this.getListData('')
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
  goSearch() {
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  formatDate(date) {
    date = new Date(date);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },
  onConfirm(event) {
    const [start, end] = event.detail;
    this.setData({
      show: false,
      sdt: this.formatDate(start),
      edt: this.formatDate(end),
    });
    this.getMainListdata("refresh")
  },
  //获取列表数据
  getMainListdata:function(e){
    var that = this;
    let message = "";
    if (app.globalData.isLogin) 
    {
      if (e == "refresh") { //刷新，page变为1
        message = "正在加载"
        that.setData({pageNo:1})
      }
      http.request(
        "/member/manager/getWithdrawalPage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
          "startTime": that.data.sdt,
          "endTime": that.data.edt
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            if (e == "refresh"){
              that.setData({
                list: info.data.list
              });
              if(info.data.list.length === 0){
                that.setData({
                  canLoadMore: false
                })
              }
            }else{
              if (info.data != null && info.data.list.length < 10) {
                that.setData({
                  canLoadMore: false
                })
              }
              let arr = that.data.list;
              let arrs = arr.concat(info.data.list);
              that.setData({
                list: arrs,
              })
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
    } 
  },
})