// pages/SetOrder/SetOrder.js
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
var Moment = require('../../../lib/moment.js');
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
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,//是否还能加载更多
    renewShow: false, //续费弹窗
    cancelOrderShow: false, //订单取消弹窗
    refundOrderShow: false, //订单退款弹窗
    changeOrderUserShow: false, //订单转移弹窗
    changeOrderShow: false, //订单修改弹窗
    cancelOrderSucShow: false, //取消成功弹窗
    refundOrderSucShow: false, //退款成功弹窗
    status:"",//订单状态筛选
    orderColumn:"",//排序
    orderlist:[],//订单列表数组
    isLogin:app.globalData.isLogin,
    orderInfo: '', //选择操作的订单
    addTimeH: 0, //续费时长
    addTimeM: 0,//续费分钟
    changeTime:0,//修改时长
    newTime:'',//增加后的时间
    totalPay: 0, //增加后支付价格
    beforeCloseFunction:null,
    changeRoomId: "",//修改的房间Id
    changeStartTime:"",//修改的开始时间
    changeEndTime:"",//修改的结束时间
    // payTypes: [{name:'微信支付',value: 1,checked:true},{name:'钱包余额',value: 2}],
    payType: 2,
    storeId:'',
    stores: [],
    userId: '',
    giftBalance: '',
    mainColor: app.globalData.mainColor
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    that.setData({
      userId: options.userId,
      beforeCloseFunction: this.beforeClose(),
      isLogin:app.globalData.isLogin,
      statusBarHeight: wx.getStorageSync('statusBarHeight'),
      titleBarHeight: wx.getStorageSync('titleBarHeight')
    })
    this.getOrderListdata('refresh');
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
    let that = this;
    that.setData({
      isLogin:app.globalData.isLogin,
    })
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
    that.getOrderListdata('refresh');
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.getOrderListdata('')
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
            stores.unshift({text:'全部门店',value:''})
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
  //门店下拉菜单发生变化
  storeDropdown(event){
    //console.log(event)
    this.data.stores.map(it => {
      if(it.value == event.detail){
        this.setData({
          storeId: it.value,
        })
      }
    })
    this.getOrderListdata("refresh")
  },
  //城市下拉菜单发生变化
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
        that.getOrderListdata('refresh');
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
        that.getOrderListdata('refresh');
      }
    })
  },
  openDoor(e){
    var that = this;
    let aindex = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?toPage=true&OrderNo='+aindex,
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
  // 退款弹窗
  refundOrder(e){
    var orderInfo = e.currentTarget.dataset.info
    this.setData({
      refundOrderShow:true,
      orderInfo: orderInfo
    })
  },
  // 修改用户弹窗
  changeOrderUser(e){
    var orderInfo = e.currentTarget.dataset.info
    this.setData({
      changeOrderUserShow:true,
      mobile:"",
      orderInfo: orderInfo
    })
  },
   // 修改订单弹窗
   changeOrder(e){
    var orderInfo = e.currentTarget.dataset.info
    this.getRoomList(orderInfo);
    this.setData({
      changeTime: "",
      changeRoomId:"",
      changeStartTime: orderInfo.startTime,
      changeEndTime: orderInfo.endTime,
      changeOrderShow:true,
      orderInfo: orderInfo
    })
  },
 // 确认转移
 cancelChangeUser(){
  var that = this
  if (app.globalData.isLogin) 
  {
    http.request(
      "/member/manager/changeOrderUser",
      "1",
      "post", {
        "orderId": that.data.orderInfo.orderId,
        "mobile": that.data.mobile,
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        console.info('返回111===');
        console.info(info);
        if (info.code == 0) {
          wx.showModal({
            content: "订单转移成功",
            showCancel: false,
          })
          that.getOrderListdata('refresh')
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
 // 确认修改
 cancelChangeOrder(){
  var that = this
  if (app.globalData.isLogin) 
  {
    http.request(
      "/member/manager/changeOrder",
      "1",
      "post", {
        "orderId": that.data.orderInfo.orderId,
        "roomId": that.data.roomId,
        "startTime": that.data.changeStartTime,
        "endTime": that.data.changeEndTime
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        console.info('返回111===');
        console.info(info);
        if (info.code == 0) {
          wx.showModal({
            content: "订单修改成功",
            showCancel: false,
          })
          that.getOrderListdata('refresh')
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
  // 确认取消
  cancelConfirm(){
    var that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/manager/cancelOrder/"+that.data.orderInfo.orderId,
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
            that.getOrderListdata('refresh')
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
  // 确认退款
  refundConfirm(){
    var that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/manager/refundOrder/"+that.data.orderInfo.orderId,
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
              refundOrderSuccess: true
            })
            that.getOrderListdata('refresh')
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
  // 退款成功关闭弹窗
  refundSuccessConfirm(){
    this.setData({refundOrderSucShow: false})
  },
  // 续费弹窗
  renewClick(e){
    var orderInfo = e.currentTarget.dataset.info
    var currentTimeStamp =  Date.now();
    var specifiedTime =  new Date(orderInfo.endTime).getTime();
    // 判断是否已经过去了5分钟（5 * 60 * 1000毫秒）
    var isPastFiveMinutes = (currentTimeStamp - specifiedTime) > (5 * 60 * 1000);
    // 判断订单结束时间是否在当前时间的5分钟前
    if (isPastFiveMinutes) {
       wx.showModal({
          title: '温馨提示',
          content: '订单已结束超过5分钟，不允许续费！请重新下单！',
          showCancel: false,
          confirmText: "确定", 
          success (res) {
          }
      })
    } else {
      this.setData({
        renewShow: true,
        orderInfo: orderInfo
      })
    // this.getgiftBalance()
    }
  },
  // 续费加时间
  onChangeH:function(event){
    var that = this
    var addTimeH = event.detail;
    var minute = addTimeH * 60 + that.data.addTimeM;
    var newTime = Moment(that.data.orderInfo.endTime).add(minute, "minutes").format("YYYY/MM/DD HH:mm")
    this.setData({
      addTimeH: addTimeH,
      newTime: newTime,
      totalPay: (minute * that.data.orderInfo.price / 60).toFixed(2)
    })
  },
  onChangeM:function(event){
    var that = this
    var addTimeM = event.detail;
    var minute = addTimeM + that.data.addTimeH * 60;
    var newTime = Moment(that.data.orderInfo.endTime).add(minute, "minutes").format("YYYY/MM/DD HH:mm")
    this.setData({
      addTimeM: addTimeM,
      newTime: newTime,
      totalPay: (minute * that.data.orderInfo.price / 60).toFixed(2)
    })
  },
  // 修改订单时间
  onChangeTime:function(event){
    var that = this
    var changeTime = event.detail
    var newTime = Moment(that.data.orderInfo.startTime).add(changeTime, "hours").format("YYYY/MM/DD HH:mm")
    var newEndTime = Moment(that.data.orderInfo.endTime).add(changeTime, "hours").format("YYYY/MM/DD HH:mm")
    //console.log(`newtime:${newTime}`)
    this.setData({
      changeTime: changeTime,
      changeStartTime: newTime,
      changeEndTime: newEndTime
    })
  },
  // 支付方式选择
  // radioChange(e){
  //   this.setData({payType: e.detail.value})
  // },
  // 处理续费
  beforeClose() {
    var that = this
    // 这里一定要用箭头函数，否则访问不到this
    return (type) => {
        //console.log(type)
        if (type === 'cancel') {
            // 点击取消
            // return true
            that.renewCancel()
        }else {
            // 点击确定
            console.log(that.data.newTime)
            if(that.data.newTime){
              that.renewConfirm()
            }else{
              wx.showToast({
                title: '请选择增加时间!',
                icon: 'none'
              })
              return
            }
            
        }
    }
  },
  // 续费
  renewConfirm: function(){
    var that = this
    http.request(
      "/member/manager/renewByAdmin",
      "1",
      "post", {
        "orderId": that.data.orderInfo.orderId,
        // "minutes": that.data.addTime * 60,
        "endTime": that.data.newTime,
        "payType": that.data.payType,
        "orderNo": that.data.orderInfo.orderNo
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        console.info('返回111===');
        console.info(info);
        if (info.code == 0) {
          wx.showToast({
            title: '续时成功',
          })
          that.getOrderListdata('refresh')
          that.renewCancel()
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
  // 取消续费重置数据
  renewCancel: function(){
    this.setData({
      renewShow: false,
      addTimeH: 0,
      addTimeM: 0,
      newTime: '',
      totalPay: 0,
      payType: 1
    })
  },

  getOrderListdata:function(e){
    var that = this;
    let message = "";
    if (app.globalData.isLogin) {
      if (e == "refresh") { //刷新，page变为1
        message = "正在加载"
        that.setData({
          orderlist:[],//列表数组
          canLoadMore: true,//是否还能加载更多
          pageNo: 1,
        })
      }
      http.request(
        "/member/manager/getOrderPage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
          "status": that.data.status,
          "storeId": that.data.storeId,
          "userId": that.data.userId,
          "orderColumn": that.data.orderColumn
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info('订单列表===');
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
              content: info.msg,
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
                        that.getOrderListdata('refresh');
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

  // 获取赠送余额
  getgiftBalance:function(){
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/getGiftBalance/"+that.data.orderInfo.storeId,
        "1",
        "get", {
          "storeId": that.data.orderInfo.storeId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('赠送余额===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              giftBalance:info.data
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
  callMobile:function (e) {
    var mobile = e.currentTarget.dataset.mobile
    wx.makePhoneCall({
        phoneNumber: mobile,
        success:function () {
          //console.log("拨打电话成功！")
        },
        fail:function () {
          //console.log("拨打电话失败！")
        }
    })
  },
  copyText: function (e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },
  bindPickerChange: function (e) {
    console.log("picker发送选择改变，携带值为", e);
    console.log(this.data.array,'this.data.stores');
    this.setData({
      index: e.detail.value,
      roomId: this.data.array[e.detail.value].roomId
    });
    console.log(this.data.roomId);
  },
  getRoomList: function (e) {
    var that = this;
    http.request(
      "/member/store/getRoomInfoList/" + e.storeId,
      "1",
      "get",
      {
        // "storeId": e.storeId
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        console.info("房间===");
        if (info.code == 0) {
          let stores = [];
          let statusName = ''
          info.data.map((it) => {
            statusName = `(${it.status==1?'空闲':it.status==2?'待清洁':it.status==3?'使用中':it.status==4?'已预约':'禁用'})`
            stores.push({ text: it.roomName + statusName , value: it.roomId });
          });
          if(e.roomId){
            const indexArr = info.data.findIndex(item => item.roomId === e.roomId);
            that.setData({
              index:indexArr,
              roomId: e.roomId

            })
          }
          that.setData({
            array: info.data,
            values: stores.map((item) => item.text)
          });
        }
      },
      function fail(info) {}
    );
  }
})