// pages/taskDetail/taskDetail.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: [],
    info: {},
    clearId: '',
    userinfo: {},
    complaintDesc: '', //驳回原因
    lat: '',
    lon: '',
  },
  afterRead(event) {
    let that = this
    const { file } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    wx.uploadFile({
      url: app.globalData.baseUrl+'/member/store/uploadImg',
      filePath: file.url,
      name: 'file',
      header: {
        'tenant-id': app.globalData.tenantId,
        'Content-Type': 'application/json',
        'Authorization':'Bearer '+app.globalData.userDatatoken.accessToken,
      },
      success(res) {
        var data = JSON.parse(res.data)
        // 上传完成需要更新 fileList
        var data = JSON.parse(res.data)
        const { fileList = [] } = that.data;
          fileList.push({ url: data.data });
          that.setData({ fileList: fileList });
      },
    });
  },
  delete(event){
    let index = event.detail.index
    const { fileList = [] } = this.data;
    fileList.splice(index,1)
    this.setData({fileList})
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getuserinfo()
    this.getLocation()
    if(options.id){
      this.setData({clearId: parseInt(options.id)})
      this.getData()
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
  // 获取用户信息
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
  // 获取详情
  getData: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/clear/getDetail/"+that.data.clearId,
        "1",
        "get", {
          "clearId": that.data.clearId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            var fileList = []
            if(info.data.imgs){
              info.data.imgs = info.data.imgs.split(",")
              info.data.imgs.map(it => {
                fileList.push({url:it})
              })
            }
            that.setData({
              info: info.data,
              fileList: fileList
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
  // 开大门
  open:function(e){
    let id = this.data.info.clearId
    var that = this;
    console.log("id"+id)
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/clear/openStoreDoor/"+id,
        "1",
        "post", {
          "id": id,
        },
        app.globalData.userDatatoken.accessToken,
        '',
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
              wx.showToast({
                title: '开大门成功',
              })
              setTimeout(() => {
                that.getData()
              }, 1000);
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
  },
  // 开房间门
  openDoor:function(){
    let id = this.data.info.clearId
    var that = this;
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/clear/openRoomDoor/"+id,
        "1",
        "post", {
          "id": id,
        },
        app.globalData.userDatatoken.accessToken,
        '',
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
              wx.showToast({
                title: '开房间门成功',
              })
              setTimeout(() => {
                that.getData()
              }, 5000);
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
  // 获取定位
  getLocation: function() {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        console.info('位置信息===');
        console.info(res);
        const latitude = res.latitude
        const longitude = res.longitude
        that.setData({
          lat: latitude,
          lon:longitude,
        });
      },
      fail: function(res) {
        // 如果获取位置信息失败，可以处理错误情况
        //console.log('获取位置失败', res.errMsg)
      }
    })
  },
  // 完成任务
  finish:function(){
    let id = this.data.info.clearId
    var that = this;
    if(!that.data.fileList.length){
      wx.showToast({
        title: '请上传图片',
        icon: 'error'
      })
      return
    }
    var urls = []
    that.data.fileList.map(it => {
      urls.push(it.url)
    })
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/clear/finish/"+id,
        "1",
        "post", {
          "id": id,
          "lat": that.data.lat,
          "lon": that.data.lon,
          "imgs": urls.join(",")
        },
        app.globalData.userDatatoken.accessToken,
        '',
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
              wx.showToast({
                title: '完成成功',
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
  },
  // 驳回
  complaint:function(){
    let id = this.data.info.clearId
    var that = this;
    var complaint = true
    if(that.data.info.status === 3){
      complaint = true
      if(!this.data.complaintDesc){
        wx.showToast({
          title: '请填写驳回原因',
          icon: 'error'
        })
        return
      }
    }else if(that.data.info.status === 5){
      complaint = false
    }
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/manager/complaintClearInfo",
        "1",
        "post", {
          "clearId": id,
          "complaint": complaint,
          "complaintDesc": that.data.complaintDesc
        },
        app.globalData.userDatatoken.accessToken,
        '',
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
              wx.showToast({
                title: '操作成功',
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
  },
  // 返回
  back: function(){
    wx.navigateBack()
  }
})