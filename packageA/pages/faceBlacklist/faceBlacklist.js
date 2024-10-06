const app = getApp()
var http = require('../../../utils/http');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx?true:false,
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,
    storeId: '',
    list:[],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      this.setData({
        storeId: options.storeId
      })
      this.getList('refresh');
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
      list:[],//列表数组
      canLoadMore: true,//是否还能加载更多
      pageNo: 1,
    })
    that.getList('refresh');
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.getList();
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
  // 获取黑名单列表
  getList: function(e){
    let that = this
    if (app.globalData.isLogin) 
    {
      if (e == "refresh") { //刷新，page变为1
        that.setData({
          list:[],
          pageNo:1,
          canLoadMore: true
        })
      }
      http.request(
        "/member/store/getFaceBlacklistPage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
          "storeId": that.data.storeId,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
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
  moveBlacklist: function(e){
    var that=this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '是否将该用户移出黑名单?',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/store/moveFaceById/"+id,
              "1",
              "post", {
              },
              app.globalData.userDatatoken.accessToken,
              '',
              function success(info) {
                if (info.code == 0) {
                    wx.showToast({
                      title: '操作成功',
                    })
                    that.getList('refresh');
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
      }
    })
  },
})