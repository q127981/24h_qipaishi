// pages/recharge/recharge.js
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo:{},//用户信息
    discount: [], //金额信息
    storeId: '',
    storeName:'',
    index: 0,
    stores: [], //门店列表
    payMoney: '',//选择的充值金额
    userId: '', //管理员为用户充值时的用户id
    giftBalance: '', //赠送余额
    balance: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('onLoad')
    // this.getuserinfo()
    if(options.storeId){
      this.setData({
        storeId: Number(options.storeId)
      })
    }
    this.getXiaLaListdata()
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
  // 获取赠送余额
  getStoreBalance:function(){
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/getStoreBalance/"+that.data.storeId,
        "1",
        "get", {
          "storeId": that.data.storeId
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
              userId:info.data.id
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
  //获取门店下拉列表数据
  getXiaLaListdata:function(e){
    var that = this;
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getStoreList",
        "1",
        "get", {
          cityName:''
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('下拉门店数据===');
          console.info(info);
          if (info.code == 0) {
            if(info.data.length){
              that.setData({
                stores: info.data
              })
              if(!that.data.storeId){
                that.setData({
                  storeId: info.data[0].value
                })
              }
            }
            var aindex = 0
            var storeName=''
            that.data.stores.map((it,index) => {
              if(it.value === that.data.storeId){
                aindex = index
                storeName = it.key
              }
            })
            that.setData({
              index: aindex,
              storeName: storeName
            })
            that.getDiscount()
            that.getStoreBalance()
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
  // 选择门店
  bindStoreChange: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    // console.log(this.data.stores[e.detail.value])
    this.setData({
      index: e.detail.value,
      storeId: this.data.stores[e.detail.value].value,
      storeName: this.data.stores[e.detail.value].key
    })
    this.getDiscount()
    this.getStoreBalance()
  },
  // 获取充值金额
  getDiscount:function(){
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/getDiscountRules/"+that.data.storeId,
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            that.setData({
              discount:info.data,
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
  // 选择充值金额
  choose: function(e){
    var ainfo = e.currentTarget.dataset.info;//获取当前点击的下标
    this.setData({payMoney: ainfo})
  },
  //立即支付
  submitpay:function(res){
    var that = this;
    if (app.globalData.isLogin) {
      wx.showModal({
        title: '提示',
        content: '您当前选择的门店为：\r\n【 '+that.data.storeName+'】\r\n充值的余额或卡券仅该门店可用！确认充值吗？',
        confirmText: '确认',
        complete: (res) => {
          if (res.confirm) {
            http.request(
              "/member/user/preRechargeBalance",
              "1",
              "post", {
                "userId": that.data.userId,
                "storeId": that.data.storeId,
                "price": that.data.payMoney*100,
              },
              app.globalData.userDatatoken.accessToken,
              "获取中...",
              function success(info) {
                console.info('返回111===');
                console.info(info);
                if (info.code == 0) {
                  that.payMent(info);
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
          } else if (res.cancel) {
            //console.log('用户点击取消')
          }
        }
      })
    } else {
      //console.log('未登录失败！')
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
             wx.showToast({
                title: '支付成功!',
                icon: 'success'
            })
            that.getStoreBalance();
        },
        'fail': function(res) {
            wx.showToast({
                title: '支付失败!',
                icon: 'error'
            })
            //console.log('*************支付失败');
        },
        'complete': function(res) {
            //console.log('*************支付完成');
        }
    })
  },  
    //提交订单
    submitorder:function(aorderno){
      var that = this;
      if (app.globalData.isLogin) 
      {
        http.request(
          "/member/user/rechargeBalance",
          "1",
          "post", {
            storeId:that.data.storeId,
            userId:that.data.userId,
            price:that.data.payMoney*100,
            orderNo:aorderno
          },
          app.globalData.userDatatoken.accessToken,
          "获取中...",
          function success(info) {
            console.info('提交订单信息===');
            console.info(info);
              if (info.code == 0) {
                if (info.msg) {
                  wx.showToast({
                    title: info.msg,
                    icon: 'none'
                  })
                }else{
                  wx.showToast({
                    title: '支付成功',
                    icon: 'none'
                  })
                }
                that.getStoreBalance();
              }
          },
          function fail(info) {
          }
        )
      } 
    },
})