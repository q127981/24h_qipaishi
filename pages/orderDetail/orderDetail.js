// pages/orderDetail/orderDetail.js
const app = getApp()
var http = require('../../utils/http');
var lock = require('../../utils/lock.js');
var Moment = require('../../lib/moment.js');

// const { TABLE } = require('XrFrame/core/Component');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    renewShow: false, //续费弹窗
    cancelOrderShow: false, //订单取消弹窗
    cancelOrderSucShow: false, //取消成功弹窗
    kongtiaoShow: false,//空调控制显示
    temperature: 26,
    mode: '',
    verticalSwing: false,
    horizontalSwing: false,
    fanSpeed: '',
    fanDelta: '',
    power: false,
    OrderNo: '',//订单id
    orderKey: '',//订单key  用于分享好友 直接打开使用
    isLogin:app.globalData.isLogin,
    OrderInfodata:{},
    RoomImageList:[],//房间图片数组
    damenSwitchBool:false,
    roomSwitchBool:false,
    userinfo:{},//用户信息
    addTime: 0, //续费时长
    newTime:'',//增加后的时间
    totalPay: 0, //增加后支付价格
    beforeCloseFunction:null,
    payTypes: [{name:'微信支付',value: 1,checked:true},{name:'钱包余额',value: 2}],
    payType: 1,
    weixinOrderNo:'',//支付订单号
    renewOrderNo:'',//续费订单号
    giftBalance: '',
    balance: '',
    submit_couponInfo:{},//选中的提交的优惠券信息
    couponId:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;
    that.setData({
      isLogin:app.globalData.isLogin,
    })
    var OrderNo='';
    var orderKey='';
    if(options.OrderNo){
      OrderNo= options.OrderNo;
    }
    if(options.orderKey){
        orderKey= options.orderKey;
    }
    if(!options.toPage){
      var query=wx.getEnterOptionsSync().query;
      if(query){
        if(query.OrderNo){
          OrderNo=query.OrderNo;
        }
        if(query.orderKey){
          orderKey=query.orderKey;
        }
      }
    }
  console.log(OrderNo);
  console.log(orderKey);
    that.setData({
      beforeCloseFunction: this.beforeClose(),
      OrderNo: OrderNo,
      orderKey: orderKey,
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
    this.getOrderInfoData();
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
    let that = this;
    return {
      title: '打开订单，一键开门!',
      path: '/pages/orderDetail/orderDetail?toPage=true&orderKey='+that.data.orderKey,
      success: function (res) {
        if(res.confirm){
          // 转发成功
          wx.showToast({
            title: "分享成功",
            icon: 'success',
            duration: 2000
          })
        }
      },
      fail: function (res) {
        // 分享失败
      },
    }
  },
  share:function(){

  },
  // 结束订单
  endOrder:function(){
    var that = this
    wx.showModal({
      title: '提示',
      content: '由于订单已开始计费，提前结束将无法退款。因设备故障等原因导致无法正常消费的，请联系客服人工处理。请问您是否需要联系客服？',
      cancelText: '取消',
      confirmText: '联系客服',
      complete: (res) => {
        if (res.cancel) {
          
        }
    
        if (res.confirm) {
          that.call()
        }
      }
    })
  },
  // 开始订单
  beginOrder: function(){
    var that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/order/startOrder/"+that.data.OrderInfodata.orderId,
        "1",
        "post", {
          "orderId": that.data.OrderInfodata.orderId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          if (info.code == 0) {
            wx.showToast({
              title: '确认到店成功',
            })
            that.getOrderInfoData()
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
  // 去更换房间
  goChangeDoor(){
    var orderInfo={
        "orderId":this.data.OrderInfodata.orderId,
        "storeId":this.data.OrderInfodata.storeId,
        "storeName":this.data.OrderInfodata.storeName,
        "roomName":this.data.OrderInfodata.roomName,
        "startTime":this.data.OrderInfodata.startTime,
        "endTime":this.data.OrderInfodata.endTime,
        "roomType":this.data.OrderInfodata.roomType,
        "roomId":this.data.OrderInfodata.roomId,
        "kefuPhone":this.data.OrderInfodata.kefuPhone,
    };
    console.log(orderInfo);
    wx.navigateTo({
      url: '../changeDoor/changeDoor?orderInfo='+JSON.stringify(orderInfo),
    })
  },
  // 续费弹窗
  renewClick(){
    var that = this;
    let OrderInfodata = that.data.OrderInfodata
    if(OrderInfodata.status==3 ||OrderInfodata.status==2){
      wx.showToast({
        title: '订单已结束！',
        icon: 'error'
      })
    }else{
        this.setData({
          renewShow: true,
          couponId: '',
          submit_couponInfo:{},
          payTypes: [{name:'微信支付',value: 1,checked:true},{name:'钱包余额',value: 2}],
        })

      // var currentTimeStamp =  Date.now();
      // var specifiedTime =  new Date(OrderInfodata.endTime).getTime();
      // // 判断是否已经过去了5分钟（5 * 60 * 1000毫秒）
      // var isPastFiveMinutes = (currentTimeStamp - specifiedTime) > (5 * 60 * 1000);
      // // 判断订单结束时间是否在当前时间的5分钟前
      // if (isPastFiveMinutes) {
      //    wx.showModal({
      //       title: '温馨提示',
      //       content: '订单已结束超过5分钟，不允许续费！请重新下单！',
      //       showCancel: false,
      //       confirmText: "确定", 
      //       success (res) {
      //       }
      //   })
      // } else {
      //   this.setData({
      //     renewShow: true,
      //     payTypes: [{name:'微信支付',value: 1,checked:true},{name:'钱包余额',value: 2}],
      //   })
      // }
    }
  },
  // 续费加时间
  onChange:function(event){
    var that = this
    var addTime = event.detail
    // console.info('时间===');
    // console.info(addTime);
    var newTime = Moment(that.data.OrderInfodata.endTime).add(addTime, "hours").format("YYYY/MM/DD HH:mm")
    //console.log(`newtime:${newTime}`)
    that.setData({
      addTime: addTime,
      // totalPay: addTime * that.data.orderInfo.price,
      newTime: newTime,
      totalPay: (addTime * that.data.OrderInfodata.roomPrice).toFixed(2)
    })
  },
  // 支付方式选择
  radioChange(e){
    this.setData({payType: e.detail.value})
  },
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
            if(that.data.addTime<0.5){
              wx.showToast({
                title: '请选择增加时间!',
                icon: 'error'
              })
              return
            }
            that.SubmitOrderInfoData();   
        }
    }
  },
  //预支付
  SubmitOrderInfoData(){
    var that = this;
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/order/preOrder",
        "1",
        "post", {
          roomId:that.data.OrderInfodata.roomId,
          couponId: that.data.couponId,
          startTime:that.data.OrderInfodata.endTime,
          endTime:that.data.newTime,
          orderId: that.data.OrderInfodata.orderId
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          console.info('支付信息===');
          console.info(info);
          if (info.code == 0) {
            that.data.renewOrderNo = info.data.orderNo;
             //判断是不是微信支付 微信支付让回调去处理
             if(that.data.payType == 1 && info.data.payPrice>0){
                that.lockWxOrder(info);
              }else{
                that.renewConfirm();
              }
          }else{
            wx.showModal({
              title: '温馨提示',
              content: info.msg,
              showCancel: false,
              confirmText: "确定", 
              success (res) {
              }
            })
          }
        },
        function fail(info) {
        }
      )
    } 
  },
   // 锁定微信订单
   lockWxOrder:function(pay){
    var that = this;
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/order/lockWxOrder",
        "1",
        "post", {
          roomId:that.data.OrderInfodata.roomId,
          couponId:that.data.couponId,
          startTime:that.data.OrderInfodata.endTime,
          endTime:that.data.newTime,
          orderId: that.data.OrderInfodata.orderId
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          if (info.code == 0) {
            console.log('锁定微信支付订单');
            that.payMent(pay);//微信支付
          }else{
            wx.showModal({
              title: '温馨提示',
              content: info.msg,
              showCancel: false,
              confirmText: "确定", 
              success (res) {
              }
            })
          }
        },
        function fail(info) {
        }
      )
    } 
  },
  //支付
  payMent: function(pay) {
    var that = this;
    wx.requestPayment({
        'timeStamp': pay.data.timeStamp,
        'nonceStr': pay.data.nonceStr,
        'package': pay.data.pkg,
        'signType': pay.data.signType,
        'paySign': pay.data.paySign,
        'success': function(res) {
            //console.log('*************支付成功');
            // that.renewConfirm();
            that.getOrderInfoData()
            that.renewCancel()
        },
        'fail': function(res) {
            wx.showToast({
                title: '支付失败!',
                icon:'error'
            })
            //console.log('*************支付失败');
        },
        'complete': function(res) {
            //console.log('*************支付完成');
        }
    })
  },
  //支付
  renewConfirm: function(){
    if(!this.data.addTime){
      wx.showToast({
        title: '请选择增加时间',
        icon: "none"
      })
      return false;
    }else{
      var that = this
      if (app.globalData.isLogin) 
      {
        http.request(
          "/member/order/renew",
          "1",
          "post", {
            "orderId": that.data.OrderInfodata.orderId,
            "couponId": that.data.couponId,
            "endTime": that.data.newTime,
            "payType": that.data.payType,
            "orderNo": that.data.renewOrderNo
          },
          app.globalData.userDatatoken.accessToken,
          "",
          function success(info) {
            console.info('续费返回111===');
            console.info(info);
            if (info.code == 0) {
              wx.showToast({
                title: '续时成功',
              })
              that.getOrderInfoData()
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
      } 
    }
  },
  // 取消续费重置数据
  renewCancel: function(){
    this.setData({
      renewShow: false,
      addTime: '',
      newTime: '',
      renewOrderNo:'',
      totalPay: 0,
      payType: 1
    })
  },
  //取消成功
  SucessConfirm(){
    //订单取消成功
     //刷新页面
     var that=this;
     that.getOrderInfoData();
     that.renewCancel()
  },
  // 取消弹窗
  cancelOrder(e){
    var that = this;
    var astatus = e.currentTarget.dataset.info;
    if(astatus==2 || astatus==3){
      wx.showToast({
        title: '订单已完成，暂无法取消！',
        icon: 'none'
      })
    }else{
      this.setData({
        cancelOrderShow:true
      })
    }
  },
    // 提前离店
  stopOrder(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '温馨提示',
      content: '提前离店不退费，会立即结束订单，已支付的押金会自动退还，请问是否确认提前离店？',
      showCancel: true,
      success (res) {
        if (res.confirm) {
            http.request(
              "/member/order/closeOrder/"+orderId,
              "1",
              "post", {
              },
              app.globalData.userDatatoken.accessToken,
              "",
              function success(info) {
                console.info('结束订单===');
                if (info.code == 0) {
                    //刷新页面
                    that.getOrderInfoData();
                }else{
                    wx.showModal({
                      title: '温馨提示',
                      content: info.msg,
                      showCancel: false
                    })
                }
              })
        }
      }
    })
  },
  //订单取消成功弹窗
  cancelConfirm(){
    var that = this;
    console.log('确定取消订单')
    console.log(that.data.OrderNo)
    if (app.globalData.isLogin) {
      if(that.data.OrderNo){
        http.request(
          "/member/order/cancelOrder"+'/'+that.data.OrderNo,
          "1",
          "post", {
            "orderId":that.data.OrderInfodata.roomId
          },
          app.globalData.userDatatoken.accessToken,
          "",
          function success(info) {
            console.info('取消订单===');
            console.info(info);
            if (info.code == 0) {
                //刷新页面
                that.getOrderInfoData();
                that.renewCancel()
                that.setData({
                  cancelOrderSuccess: true
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
    } 
  },
  //获取订单详情
  getOrderInfoData:function(e){
    var that = this;
      // console.log(that.data.OrderNo)
      http.request(
        "/member/order/getOrderInfo",
        "1",
        "get", {
          "orderId": that.data.OrderNo,
          "orderKey":that.data.orderKey
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('订单信息===');
          // console.info(info);
          if (info.code === 0) {
            that.setData({
              OrderInfodata: info.data,
              OrderNo: info.data.orderId,
              orderKey: info.data.orderKey
            });
            console.log(that.data.OrderNo)
            that.getrorderImageList();
            that.getStoreBalance()
          }else{
            wx.showModal({
              title: '温馨提示',
              content: info.msg,
              showCancel: false,
              success (res) {
                if (res.confirm) {
                  let pages = getCurrentPages();
                  if (pages.length > 1) {
                    wx.navigateBack({//返回
                      delta: 1
                    });
                  }
                  if (pages.length == 1) {
                    wx.reLaunch({
                      url: '/pages/index/index',
                    })
                  }
                } 
              }
            })
          }
        },
        function fail(info) {
        }
      )
  },
  call:function () {
    // let that = this
    let that = this;
    var phoneLength=that.data.OrderInfodata.kefuPhone.length;
    if(phoneLength>0){
      if(phoneLength==11){
          wx.makePhoneCall({
            phoneNumber:that.data.OrderInfodata.kefuPhone,
            success:function () {
              //console.log("拨打电话成功！")
            },
            fail:function () {
              //console.log("拨打电话失败！")
            }
          })
      }else{
        wx.showModal({
          title: '提示',
          content: '客服上班时间10：00~23：00\r\n如您遇到问题，建议先查看“使用帮助”！\r\n本店客服微信号：'+that.data.OrderInfodata.kefuPhone,
          confirmText: '复制',
          complete: (res) => {
            if (res.confirm) {
              wx.setClipboardData({
                data: that.data.OrderInfodata.kefuPhone,
                success: function (res) {
                    wx.showToast({ title: '微信号已复制到剪贴板！' })
                }
              })
            } else if (res.cancel) {
              //console.log('用户点击取消')
            }
          }
        })
      }
    }
    // if(that.data.OrderInfodata.kefuPhone.length>0){
    //   //console.log("拨打电话+++")
    //   wx.makePhoneCall({
    //     phoneNumber:that.data.OrderInfodata.kefuPhone,
    //     success:function () {
    //       //console.log("拨打电话成功！")
    //     },
    //     fail:function () {
    //       //console.log("拨打电话失败！")
    //     }
    //   })
    // }
  },
  goTencentMap(e){
    let store = this.data.OrderInfodata
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
  //获取图片
  getrorderImageList:function(e){
    var that = this;
    if (app.globalData.isLogin) 
    {
      if(that.data.OrderInfodata.roomId){
        http.request(
          "/member/order/getRoomImgs"+'/'+that.data.OrderInfodata.roomId,
          "1",
          "get", {
            "roomId":that.data.OrderInfodata.roomId
          },
          app.globalData.userDatatoken.accessToken,
          "",
          function success(info) {
            console.info('图片信息===');
            console.info(info);
            if (info.code == 0) {
              if(info.data){
              var alist = info.data.split(',');
              // console.info('图片信息===1111');
              // console.info(alist);
              that.setData({
                RoomImageList:alist
              });
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
    } 
  },
  //图片点击事件
  imgYu: function(event) {
    var that = this;

    if(that.data.RoomImageList.length>0){
      var src = that.data.RoomImageList[0]+'?Content-Type=image/jpg'; //获取data-src
      var imgList = that.data.RoomImageList; //获取data-list
      //图片预览
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: imgList // 需要预览的图片http链接列表
      })
    }else{
      wx.showToast({
        title: '该房间暂无图片介绍',
        icon: 'none'
      })
    }
  },
  //大门
  damenbindchange:function(event) {
    let that = this;
    http.request(
      "/member/order/openStoreDoor?orderKey="+that.data.orderKey,
      "1",
      "post", {
        "orderKey":that.data.orderKey
      },
      app.globalData.userDatatoken.accessToken,
      "提交中...",
      function success(info) {
        console.info('打开大门===');
        if (info.code == 0) {
          wx.showToast({
            title: "操作成功",
            icon: 'success'
          })
        }else{
          wx.showModal({
            title:"提示",
            content: info.msg,
            showCancel: false,
          })
        }
      },
      function fail(info) {
      }
    )
  },
  openRoomDoor:function(e) {
    let that = this;
    //开房间门
    console.log('开房间门');
    http.request(
      "/member/order/openRoomDoor?orderKey="+that.data.orderKey,
      "1",
      "post", {
        // "orderKey":that.data.orderKey,
      },
      app.globalData.userDatatoken.accessToken,
      "提交中...",
      function success(info) {
        console.info('房间门===');
        console.info(info);
        if (info.code == 0) {
          //如果不存在网关 但是又用了密码锁，有锁数据的情况下再进行蓝牙开门操作
          if(that.data.OrderInfodata.lockData&&!that.data.OrderInfodata.gatewayId){
            console.log("蓝牙开锁");
            lock.blueDoorOpen(that.data.OrderInfodata.lockData);
          }
          wx.showToast({
            title: "操作成功",
            icon: 'success'
          })
          that.getOrderInfoData();
        }else{
          wx.showModal({
            title:"提示",
            content: info.msg,
            showCancel: false,
          })
        }
      },
      function fail(info) {
      }
    )
    },
  roombindchange:function(event) {
    let that = this;
    let startTime=new Date(that.data.OrderInfodata.startTime);
    if(that.data.OrderInfodata.status == 0 && startTime>Date.now()){
      wx.showModal({
        title: '温馨提示',
        content: '当前还未到预约时间，是否提前开始消费？',
        success: function (res) {
          if (res.confirm) {
            that.openRoomDoor()
          }
        }
      })
    }else{
      that.openRoomDoor()
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
  // 获取门店余额
  getStoreBalance:function(){
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/getStoreBalance/"+that.data.OrderInfodata.storeId,
        "1",
        "get", {
          "storeId": that.data.OrderInfodata.storeId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('赠送余额===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              giftBalance:info.data.giftBalance,
              balance:info.data.balance
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
  showModal() {
    let that=this;
    if(that.data.OrderInfodata.kongtiaoCount){
      this.setData({ kongtiaoShow: true });
    }else{
      wx.showModal({
        title: '温馨提示',
        content: '商家未开通空调控制功能',
        showCancel: false,
        complete: (res) => {
        }
      })
    }
  },
  
  hideModal() {
    this.setData({ kongtiaoShow: false });
  },
  
  stopPropagation(e) {
    // e.stopPropagation();
  },
  
  adjustTemperature(e) {
    //调节温度 升高温度67 降低温度68
    const delta = parseInt(e.currentTarget.dataset.delta);
    if(delta==1){
      this.sendKongtiaoControl(67);
    }else{
      this.sendKongtiaoControl(68);
    }
  },
  
  setMode(e) {
    const newMode = e.currentTarget.dataset.mode;
    //设置模式 制冷20 制热21 自动24
    this.setData({mode: newMode})
    setTimeout(() => {
      this.setData({mode: ''})
    }, 300);
    if(newMode == 'cool'){
      this.sendKongtiaoControl(20);
    }else if(newMode == 'heat'){
      this.sendKongtiaoControl(21);
    }else if(newMode == 'auto'){
      this.sendKongtiaoControl(24);
    }
  },
  
  toggleVerticalSwing() {
   //上下扫风 开始63 停止65
   this.setData({ verticalSwing: !this.data.verticalSwing });
   if(this.data.verticalSwing){
     this.sendKongtiaoControl(63);
   }else{
     this.sendKongtiaoControl(65);
   }
  },
  
  toggleHorizontalSwing() {
    //左右扫风 开始64 停止66
    this.setData({ horizontalSwing: !this.data.horizontalSwing });
    if(this.data.horizontalSwing){
      this.sendKongtiaoControl(64);
    }else{
      this.sendKongtiaoControl(66);
    }
  },
  
  adjustFanSpeed(e) {
    //增大风速69 减小风速70
    const delta = parseInt(e.currentTarget.dataset.delta);
    let newSpeed = this.data.fanSpeed + delta;
    newSpeed = Math.max(1, Math.min(5, newSpeed));
    console.log('delta:'+delta);
    console.log('newSpeed:'+newSpeed);
    this.setData({ 
      fanSpeed: newSpeed,
      fanDelta: delta
    });
    if(delta==1){
      this.sendKongtiaoControl(69);
    }else{
      this.sendKongtiaoControl(70);
    }
  },
  togglePowerOn() {
    // 开机 0
    this.sendKongtiaoControl(0); 
  },
  togglePowerOff() {
    // 关机 1
    this.sendKongtiaoControl(1);
  },
  sendKongtiaoControl(cmd){
    let that = this;
    let startTime=new Date(that.data.OrderInfodata.startTime);
    if(that.data.OrderInfodata.status == 0 && startTime>Date.now()){
      wx.showModal({
        title: '提示',
        content: '订单将从当前时间开始计费。您确定要提前开始吗？',
        cancelText: '继续等待',
        confirmText: '现在开始',
        complete: (res) => {
          if (res.cancel) {
          }
          if (res.confirm) {
            that.openRoomDoor();
            that.controlKT(cmd);
          }
        }
      })
    }else{
      that.controlKT(cmd);
    }
  },
  controlKT(cmd){
    let that = this;
    http.request(
      "/member/order/controlKT",
      "1",
      "post", {
        "orderKey":that.data.orderKey,
        "cmd":cmd
      },
      app.globalData.userDatatoken.accessToken,
      "提交中...",
      function success(info) {
        if (info.code == 0) {
          wx.showToast({
            title: "操作成功",
            icon: 'none'
          })
        }else{
          wx.showModal({
            title:"提示",
            content: info.msg,
            showCancel: false,
          })
        }
      },
      function fail(info) {
      }
    )
  },
  
  // 去优惠券页面
  goCoupon(){
    var that = this;
    if(!that.data.newTime){
      wx.showToast({
        title: '请先选择时间',
        icon:'none'
      })
      return
    }
    wx.navigateTo({
      url: '../coupon/coupon?from=1&roomId='+that.data.OrderInfodata.roomId+'&nightLong=false'+'&startTime='+that.data.OrderInfodata.endTime+'&endTime='+that.data.newTime,
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        pageDataList: function(data) {
          console.log('页面B触发事件时传递的数据1：',data)
          that.setData({
            submit_couponInfo: data,
            couponId: data.couponId
          });
          // that.setshowpayMoney(data);
        },
        pageDataList_no: function(data) {
          //console.log('页面B触发事件时传递的数据1：',data)
          that.setData({
            submit_couponInfo: data,
            couponId:''
          });
          // that.setshowpayMoney(data);
        },
      }
    })
  },
  
})