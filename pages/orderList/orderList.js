// pages/orderList/orderList.js
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    appName: app.globalData.appName,
    statusBarHeight: '',
    titleBarHeight: '',
    option1: [
      { text: '全部状态', value: -1},
      { text: '未开始', value: 0},
      { text: '进行中', value: 1},
      { text: '已取消', value: 3},
      { text: '已完成', value: 2},
    ],
    option2: [
      { text: '默认排序', value: '0' },
      { text: '下单时间', value: '1' },
      { text: '预约时间', value: '2' },
    ],
    value1: -1,
    value2: '0',
    renewShow: false, //续费弹窗
    cancelOrderShow: false, //订单取消弹窗
    cancelOrderSucShow: false, //取消成功弹窗
    status:"",//订单状态筛选
    orderColumn:"",//排序
    orderlist:[],//订单列表数组
    isLogin:app.globalData.isLogin,
    userinfo:{},//用户信息
    orderInfo: '', //选择操作的订单
    isIos: app.globalData.isIos,
    pageindex:1,//分页的page
    canLoadMore: true,//是否还能加载更多
    mainColor: app.globalData.mainColor
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    this.setData({
      statusBarHeight: wx.getStorageSync('statusBarHeight'),
      titleBarHeight: wx.getStorageSync('titleBarHeight')
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
    let that = this;
    that.setData({
      isLogin:app.globalData.isLogin,
    })
    if(app.globalData.isLogin){
      this.getOrderListdata("refresh");
      that.getuserinfo();
    }
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
      orderlist:[],//列表数组
      canLoadMore: true,//是否还能加载更多
      pageNo: 1,
    })
    this.getOrderListdata("refresh");
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.getOrderListdata('');
    } else {
      wx.showToast({
        title: '我是有底线的...',
      })
    }
  },
  //状态下拉菜单发生变化
  OrderStatusDropdown(event){
    let that = this
    //console.log('选择的值')
    this.data.option1.map(it => {
      if(it.value == event.detail){
        //console.log(it.value)
        if(it.value == -1){
          that.setData({
            status: '',
          })
        }else{
          that.setData({
            status: it.value,
          })
        }
        that.getOrderListdata("refresh");
      }
    })
  },
  //
  orderColumnDropdown(event){
    let that = this
    //console.log('选择的值')
    this.data.option2.map(it => {
      if(it.value == event.detail){
        //console.log(it.value)
        if(it.value == 0){
          that.setData({
            orderColumn:'',//排序
          })
        }else if(it.value == 1){
          that.setData({
            orderColumn: 'createTime',
          })
        }else if(it.value == 2){
          that.setData({
            orderColumn: 'startTime',
          })
        }
        that.getOrderListdata("refresh");
      }
    })
  },
  openDoor(e){
    var that = this;
    let aindex = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?OrderNo='+aindex+'&toPage=true',
    })
  },
  // 续费弹窗
  renewClick(){
    this.setData({
      renewShow: true
    })
  },
  // 取消弹窗
  cancelOrder(e){
    var orderInfo = e.currentTarget.dataset.info
    this.setData({
      cancelOrderShow:true,
      orderInfo: orderInfo
    })
  },
  // 确认取消
  cancelConfirm(){
    var that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/order/cancelOrder/"+that.data.orderInfo.orderId,
        "1",
        "post", {
          "orderId": that.data.orderInfo.orderId,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              cancelOrderSuccess: true
            })
            that.getOrderListdata("refresh")
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
  // 取消成功关闭弹窗
  cancelSuccessConfirm(){
    this.setData({cancelOrderSucShow: false})
  },

  getOrderListdata:function(e){
    var that = this;
    if (app.globalData.isLogin) {
      let message = "";
      if (e == "refresh") { //刷新，page变为1
        that.setData({
          orderlist:[],//列表数组
          canLoadMore: true,//是否还能加载更多
          pageindex: 1,
        })
        message = "获取中..."
      }
      http.request(
        "/member/order/getOrderPage",
        "1",
        "post", {
          "pageNo": that.data.pageindex,
          "pageSize": 10,
          "status": that.data.status,
          "orderColumn": that.data.orderColumn
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info('订单列表===');
          console.info(info);
          if (info.code == 0) {
            if(info.data.list.length === 0){
              that.setData({
                canLoadMore: false
              })
            }else{
               //有数据
              if(that.data.orderlist){
                //列表已有数据  那么就追加
                let arr = that.data.orderlist;
                let arrs = arr.concat(info.data.list);
                that.setData({
                  orderlist: arrs,
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total
                })
              }else{
                that.setData({
                  orderlist: info.data.list,
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
    } else {
      //console.log('未登录失败！')
    }
  },
  phone:function(e){
    //console.log("授权用户手机号");
    var that = this;
    if(e.detail.errMsg=="getPhoneNumber:fail user deny"){
      wx.showToast({title: '已取消授权'})
    }
    if(e.detail.errMsg=="getPhoneNumber:ok"){
      //console.log('手机号码授权+++++++');
      //console.log(e.detail);
      //console.log('手机号码授权+++++++');
      wx.login({
        success: function(res) {
            //console.log('111++++==');
            //console.log(res);
            //console.log('111++++==');
            if (res.code != null) {
              http.request(
                "/member/auth/weixin-mini-app-login",
                "1",
                "post", {
                  "phoneCode": e.detail.code,
                  "loginCode": res.code
                },
                "",
                "获取中...",
                function success(info) {
                  console.info('返回111===');
                  console.info(info);
                  if (info.code == 0) {
                      if(info.data){
                        app.globalData.userDatatoken = info.data;
                        app.globalData.isLogin=true;
                        that.setData({
                          isLogin:true,
                        })
                        //缓存服务器返回的用户信息
                        wx.setStorageSync("userDatatoken", info.data)
                        that.getOrderListdata("refresh");
                      }
                  }
                },
                function fail(info) {
                  
                }
              )
            } else {
              //console.log('登录失败！' + res.errMsg)
            }
          }
        })
    }
  },
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

})