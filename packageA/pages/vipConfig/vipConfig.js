// packageA/pages/vipConfig/vipConfig.js
const app = getApp()
var http = require('../../../utils/http');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false, //添加规则弹窗
    storeId: '', //门店id
    canLoadMore: true,//是否还能加载更多
    list: [],
    vipId: '',
    vipName: '',
    vipDiscount: '',
    score: '',
    beforeCloseFunction: null,
    isIpx: app.globalData.isIpx ? true : false,
    mainColor: app.globalData.mainColor
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ beforeCloseFunction: this.beforeClose() })
    this.setData({
      storeId: Number(options.storeId),
    })
    this.getListdata();
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
  //获取列表数据
  getListdata: function (e) {
    var that = this;
    let message = "";
    if (app.globalData.isLogin) {
      http.request(
        "/member/store/getVipConfig/"+that.data.storeId,
        "1",
        "post", {
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          if (info.code == 0) {
            that.setData({
              list: info.data,
            })
          } else {
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
   // 修改弹窗
   edit: function(e){
    if(e.currentTarget.dataset.info){
      let vipInfo = e.currentTarget.dataset.info;
      this.setData({
        vipId: vipInfo.vipId,
        vipName: vipInfo.vipName,
        vipDiscount: vipInfo.vipDiscount,
        score: vipInfo.score,
      })
    }else{
      this.setData({
        vipId: '',
        vipName: '',
        vipDiscount: '',
        score: '',
      })
    }
    this.setData({
      show: true
    })
  },
   // 保存
  submit: function () {
    var that = this;
    if(!that.data.vipName&&!that.data.vipDiscount&&!that.data.score){
      wx.showToast({
        title: '请填写完整',
        icon: "none"
      })
      return false;
    }else{
      this.updateData()
    }
  },
  // 取消
  cancel: function(){
    this.setData({
        vipId: '',
        vipName: '',
        vipDiscount: '',
        score: '',
    })
  },
  // 修改调接口
  updateData: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/saveVipConfig",
        "1",
        "post", {
          "vipId": that.data.vipId,
          "storeId": that.data.storeId,
          "vipName": that.data.vipName,
          "vipDiscount": that.data.vipDiscount,
          "score": that.data.score,
        },
        app.globalData.userDatatoken.accessToken,
        "保存中",
        function success(info) {
          console.info('返回111===');
          if (info.code == 0) {
            wx.showToast({
              title: '设置成功',
            })
            that.getListdata();
            that.setData({show:false})
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
  deleteConfig(e){
    var that = this;
    let id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '温馨提示',
      content: '您是否确认删除此会员规则？删除后该等级会员权益将会失效！',
      complete: (res) => {
        if (res.cancel) {
          
        }
        if (res.confirm) {
          http.request(
            "/member/store/deleteVipConfig/"+id,
            "1",
            "post", {
            },
            app.globalData.userDatatoken.accessToken,
            message,
            function success(info) {
              if (info.code == 0) {
                that.getListdata();
              } else {
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

  },
})