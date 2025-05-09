// pages/admin/admin.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: '',
    storeName: '',
    stores: [],
    show: false, //添加弹窗
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,//是否还能加载更多
    list: [],
    mobile: '',
    name: '',
    beforeCloseFunction:null,
    isIpx: app.globalData.isIpx?true:false,
    mainColor: app.globalData.mainColor,
    isAdmin:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      storeId: options.storeId,
      storeName: options.storeName,
    })
    this.setData({beforeCloseFunction: this.beforeClose()})
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
    this.getMainListdata('refresh');
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
    this.getMainListdata('refresh');
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
  //获取列表数据
  getMainListdata:function(e){
    var that = this;
    let message = "";
    if (app.globalData.isLogin) 
    {
      if (e == "refresh") { //刷新，page变为1
        message = "正在加载"
        that.setData({
          list:[],
          canLoadMore: true,//是否还能加载更多
          pageNo:1
        })
      }
      http.request(
        "/member/manager/getAdminUserPage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
          "storeId": that.data.storeId
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info('返回111===');
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
  // 删除管理员
  delete: function(e){
    let info = e.currentTarget.dataset.info
    wx.showModal({
      title: '提示',
      content: '删除后该员工将不再拥有该门店的管理权限！请确认！',
      confirmText: '确认删除',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          let that = this
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/manager/deleteAdminUser/"+info.storeId+"/"+info.userId,
              "1",
              "post", {
                "storeId": info.storeId,
                "userId": info.userId,
              },
              app.globalData.userDatatoken.accessToken,
              "操作中",
              function success(info) {
                console.info('返回111===');
                console.info(info);
                if (info.code == 0) {
                  wx.showToast({
                    title: '删除成功',
                  })
                  that.getMainListdata("refresh")
                }else{
                  wx.showModal({
                    content: info.msg,
                    showCancel: false,
                  })
                }
              },
              function fail(info) {
                wx.showModal({
                  content: info.msg,
                  showCancel: false,
                })
              }
            )
          } 
        }
      }
    })
  },
  // 添加
  add(){
    this.setData({
      show: true,
      mobile: '',
    })
  },
  // 保存
  submit: function () {
    if(this.data.name && this.data.mobile){
      this.updateData()
    }else{
      wx.showToast({
        title: '请输入完整',
        icon: 'none'
      })
    }
  },
  // 取消
  cancel: function(){
    this.setData({
      name: '',
      mobile:'',
    })
  },
  beforeClose() {
    // 这里一定要用箭头函数，否则访问不到this
    return (type) => {
        //console.log(type)
        if (type === 'cancel') {
            // 点击取消
            return true
        }else {
            // 点击确定
        }
    }
  },
  // 修改调接口
  updateData: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/manager/saveAdminUser",
        "1",
        "post", {
          "storeId": that.data.storeId,
          "name": that.data.name,
          "mobile": that.data.mobile,
          "isAdmin": that.data.isAdmin,
        },
        app.globalData.userDatatoken.accessToken,
        "保存中",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            wx.showToast({
              title: '保存成功',
            })
            that.setData({show: false})
            that.getMainListdata("refresh")
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
  changeSwitchStatus: function() {
    this.setData({
      isAdmin: !this.data.isAdmin // 根据当前状态取反
    });
  },
})