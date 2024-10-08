// pages/taskManager/taskManager.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    option2: [
      { text: '全部状态', value: '' },
      { text: '待接单', value: 0 },
      { text: '已接单', value: 1 },
      { text: '已开始', value: 2 },
      { text: '已完成', value: 3 },
      { text: '已取消', value: 4 },
      { text: '被驳回', value: 5 },
      { text: '已结算', value: 6 },
    ],
    status: '',
    storeId: '', //列表搜索门店id
    stores: [],
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,//是否还能加载更多
    list: [],
    userinfo: {},
    startTime: '',
    endTime:'',
    mainColor: app.globalData.mainColor
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(options.status){
      this.setData({status: Number(options.status)})
    }
    if(options.startTime){
      this.setData({startTime: options.startTime})
    }
    if(options.endTime){
      this.setData({endTime: options.endTime})
    }
    this.getuserinfo()
    this.getXiaLaListAdmin()
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
    this.getMainListdata("refresh")
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
      this.getMainListdata('')
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
  //管理员获取门店下拉列表数据
  getXiaLaListAdmin:function(e){
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/getStoreList",
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('下拉门店数据===');
          console.info(info);
          if (info.code == 0) {
            let stores = []
            info.data.map(it => {
              stores.push({text:it.key,value:it.value})
            })
            stores.unshift({text:"全部门店",value:""})
           that.setData({
             stores: stores,
             storeId: stores[0].value
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
        "/member/manager/getClearManagerPage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
          "storeId": that.data.storeId,
          "userId": '',
          "status": that.data.status,
          "startTime": that.data.startTime,
          "endTime": that.data.endTime
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
  //门店下拉菜单发生变化
  storeDropdown(event){
    //console.log(event)
    this.data.stores.map(it => {
      if(it.value === event.detail){
        this.setData({
          storeId: it.value,
        })
      }
    })
    this.getMainListdata("refresh")
  },
  //状态下拉菜单发生变化
  statusDropdown(event){
    this.data.option2.map(it => {
      if(it.value === event.detail){
        this.setData({
          status: it.value
        })
      }
    })
    this.getMainListdata("refresh")
  },
  // 接单
  take:function(e){
    let id = e.currentTarget.dataset.info
    var that = this;
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/clear/jiedan/"+id,
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
                title: '接单成功',
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
          
        }
      )
    } 
  },
  // 取消接单
  cancelTake:function(e){
    let id = e.currentTarget.dataset.info
    var that = this;
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/clear/cancel/"+id,
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
                title: '取消成功',
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
          
        }
      )
    } 
  },
  // 开始任务
  begin:function(e){
    let id = e.currentTarget.dataset.info
    var that = this;
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/clear/start/"+id,
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
                title: '开始成功',
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
          
        }
      )
    } 
  },
  // 开大门
  open:function(e){
    let id = e.currentTarget.dataset.info
    var that = this;
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
                that.getMainListdata("refresh")
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
  // 开房间门
  openDoor:function(e){
    let id = e.currentTarget.dataset.info
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
                that.getMainListdata("refresh")
              }, 500);
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
  // 详情页
  goTaskDetail(e){
    var id = e.currentTarget.dataset.info
    wx.navigateTo({
      url: '../taskDetail/taskDetail?id='+id,
    })
  },
  //撤销订单
  cancelOrder(e){
    var id = e.currentTarget.dataset.info
    var that = this;
wx.showModal({
      title: '提示',
      content: '是否确认取消该保洁订单？',
      confirmText: '确认',
      complete: (res) => {
        if (res.cancel) {
          
        }
        if (res.confirm) {
         if (app.globalData.isLogin) 
        {
          http.request(
            "/member/manager/cancelClear/"+id,
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
                  setTimeout(() => {
                    that.getMainListdata("refresh")
                  }, 500);
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
  }
})