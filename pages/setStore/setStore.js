// pages/store/store.js
// 获取应用实例
const app = getApp()
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    MainList:[],//列表数组
    canLoadMore: true,//是否还能加载更多
    pageNo: 1,
    name: '',
    isIpx: app.globalData.isIpx?true:false,
    foldIndex: -1
  },
  foldTap (e) {
    console.log(e)
    const {target: {dataset = {}} = {}} = e
    this.setData({
      foldIndex: this.data.foldIndex === dataset.index ? -1 : dataset.index
    })
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
    this.getListData('refresh');
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
      MainList:[],//列表数组
      canLoadMore: true,//是否还能加载更多
      pageNo: 1,
    })
    this.getListData('refresh');
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
  //获取列表数据
  getListData:function(e){
    var that = this;
    let message = "";
    if (app.globalData.isLogin) 
    {
      if (e == "refresh") { //刷新，page变为1
        message = "正在加载"
        that.setData({pageNo:1})
      }

      http.request(
        "/member/store/getPageList",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": 10,
          "name": that.data.name
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            if (e == "refresh"){
              that.setData({
                MainList: info.data.list
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
              let arr = that.data.MainList;
              let arrs = arr.concat(info.data.list);
              that.setData({
                MainList: arrs,
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
    } else{
      wx.showModal({
        content: '请您先登录，再重试！',
        showCancel: false,
      })
    }
  },
  // 搜索
  search: function(){
    this.getListData("refresh")
  },
  // 图片预览
  previewImage:function(e){
    let storeId = e.currentTarget.dataset.info.storeId
    let that = this
    if (app.globalData.isLogin) {
      http.request(
        "/member/store/getDetail/"+storeId,
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            //console.log(info)
            let urls = info.data.storeEnvImg.split(',')
            wx.previewImage({
              current: info.data.headImg, // 当前显示图片的http链接
              urls: urls // 需要预览的图片http链接列表
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
    } else{
      wx.showModal({
        content: '请您先登录，再重试！',
        showCancel: false,
      })
    }
  },
  // 获取门店详情
  getData:function(storeId){
    var that = this;
  },
  //美团授权跳转
  meituanScope:function(e){
    let url = e.currentTarget.dataset.info
    wx.showModal({
      title: '提示',
      content: '请点击复制按钮,然后打开系统浏览器,并粘贴打开!',
      confirmText: '复制',
      complete: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: url,
            success: function (res) {
                wx.showToast({ title: '已复制到剪贴板！' })
            }
          })
        } else if (res.cancel) {
          //console.log('用户点击取消')
        }
      }
    })
  },
  // 打开大门
  openStoreDoor:function(e){
    let id = e.currentTarget.dataset.info
    var that = this;
    // console.info(id);
    http.request(
      "/member/store/openStoreDoor/"+id,
      "1",
      "post", {
        "id": id,
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        console.info(info);
        if (info.code == 0) {
          wx.showToast({
            title: "操作成功",
            icon: 'success'
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
  },
  // 查看地图
  goTencentMap(e){
    var store = e.currentTarget.dataset.info
    this.goMap(store)
  },
  // 打开地图
  goMap(store) {
    let that = this
    wx.openLocation({
      latitude: store.lat,
      longitude: store.lon,
      name: store.storeName,
      address: store.address,
      scale: 28
    })
  },
})