// pages/coupon/coupon.js
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{id:0,name:'未使用'},{id:1,name:'已使用'},{id:2,name:'已过期'}],
    status: 0,
    userinfo:{},//用户信息
    MainList:[],//列表数组
    canLoadMore: true,//是否还能加载更多
    pageNo: 1,
    from: false, //跳转来源（使用和展示）
    roomType: '', //房间类型
    roomId: '', //房间
    storeId: '', //门店Id
    couponId: '', //选取的优惠券
    pricestring:0,
    submit_order_hour:0,
    nightLong: false,
    startTime:'',
    endTime:'',
    orderHour:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    console.log(options)
    this.setData({from: options.from ? options.from : false})
    if(options.roomId){
      that.setData({
        roomId: options.roomId,
        submit_order_hour: options.orderHours,
        nightLong: options.nightLong,
        startTime: options.startTime,
        endTime: options.endTime,
      })
    }
    this.getListData('refresh');
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
    this.getuserinfo();
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
        canLoadMore: true,//是否还能加载更多
        MainList:[]
    })
    that.getListData('refresh');
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.getListData('')
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
  // tab切换
  tabChange:function(e){
    var status = e.currentTarget.dataset.status;//获取当前点击的下标
    this.setData({status: status})
    this.getListData('refresh');
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
  //获取列表数据
  getListData:function(e){
    var that = this;
    let message = "";
    if (app.globalData.isLogin) 
    {
      if (e == "refresh") { //刷新，page变为1
        message = "正在加载"
        that.setData({
          pageNo:1,
          MainList:[]
        })
      }
      http.request(
        "/member/user/getCouponPage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": 10,
          "status": that.data.status,
          "roomId": that.data.roomId,
          "nightLong": that.data.nightLong,
          "startTime": that.data.startTime,
          "endTime": that.data.endTime,
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
              if(that.data.MainList){
                //列表已有数据  那么就追加
                let arr = that.data.MainList;
                let arrs = arr.concat(info.data.list);
                that.setData({
                  MainList: arrs,
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total
                })
              }else{
                that.setData({
                  MainList: info.data.list,
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
    } else{
      wx.showModal({
        content: '请您先登录，再重试！',
        showCancel: false,
      })
    }
  },
  // 个人中心进入，去使用，跳转到房间列表
  touse:function(e){
    // var storeId = storeIds[0]
    // wx.navigateTo({
    //   url: '../doorList/doorList?storeId='+storeId,
    // })
    wx.switchTab({
      url: '../index/index',
    })
  },
  // 其他页面进入，选择
  // 选取优惠券
  choose:function(e){
    var that = this;
    if(e.currentTarget.dataset.couponid=="0"){
      const eventChannel = that.getOpenerEventChannel();
      // 通过触发相关事件传递数据
      eventChannel.emit('pageDataList_no', 1);
      wx.navigateBack({
        delta: 1,
      })
      return
    }
    if(!e.currentTarget.dataset.info.enable){
        return
    }
    if(!that.data.from){
      return
    }
    var acouponId = e.currentTarget.dataset.couponId;//获取当前点击的下标
    var aindex = e.currentTarget.dataset.index;
    var aboj = that.data.MainList[aindex];
    //判断当前优惠券是否可用
    var acouponbool = aboj.enable;
    if(!acouponbool){
      wx.showModal({
        title: '温馨提示',
        content: '当前优惠券不满足使用情况！',
        showCancel: false
      })
      return;
    }
    console.info('点击优惠券===');
    console.info(aboj);
    if(acouponId){
      that.setData({couponId: acouponId})
    }
    setTimeout(() => {
        const eventChannel = that.getOpenerEventChannel();
        // 通过触发相关事件传递数据
        if(aboj){
          eventChannel.emit('pageDataList', aboj);
        }else{
          eventChannel.emit('pageDataList_no', 1);
        }
        wx.navigateBack({
          delta: 1,
        })
    })
  },
  // 已使用点击跳转到订单详情
  clickItem:function(e){
    var info = e.currentTarget.dataset.info
    if(info.status === 1){
      wx.navigateTo({
        url: '../orderDetail/orderDetail?toPage=true&OrderNo='+info.orderId,
      })
    }
  }
})