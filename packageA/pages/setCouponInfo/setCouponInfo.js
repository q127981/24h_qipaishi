// pages/setCouponInfo/setCouponInfo.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ruleIndex: '',
    rules:['1小时','2小时','3小时','4小时','5小时','6小时','7小时','8小时','9小时','10小时','11小时','12小时','13小时','14小时','15小时','16小时','17小时','18小时','19小时','20小时','21小时','22小时','23小时','24小时',],
    limitIndex:'',
    limits:['0.5小时','1小时','1.5小时','2小时','2.5小时','3小时','3.5小时','4小时','4.5小时','5小时','5.5小时','6小时','6.7小时','7小时','7.5小时','8小时','8.5小时','9小时','9.5小时','10小时','10.5小时','11小时','11.5小时','12小时',],
    couponId: '',
    couponName: '',
    type: '',
    types: [{id:1,name:'抵扣券'},{id:2,name:'满减券'},{id:3,name:'加时券'}],
    storeId: "", //门店
    tags: [],
    stores: [],
    roomType: '',
    rooms: [{id:null,name:'不限制'},{id:1,name:'小包'},{id:2,name:'中包'},{id:3,name:'大包'},{id:4,name:'豪包'},{id:5,name:'商务包'}],
    minUsePrice: '',
    price: '',
    expriceTime: '',
    isIpx: app.globalData.isIpx?true:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getXiaLaListAdmin()
    if(options.couponId){
      this.setData({
        couponId: Number(options.couponId)
      })
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
              stores.push({name:it.key,id:it.value})
            })
           that.setData({
             stores: stores
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
  // 获取详情
  getData: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/manager/getCouponDetail/"+that.data.couponId,
        "1",
        "get", {
          "couponId": that.data.couponId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            let storeIndex = ''
            that.data.stores.map((it,index) => {
              if(it.id === info.data.storeId){
                storeIndex = index
              }
            })
            let doorIndex = ''
            that.data.rooms.map((it,index) => {
              if(it.id === info.data.roomType){
                doorIndex = index
              }
            })
            let ruleIndex = ''
            that.data.rules.map((it,index) => {
              if(it.match(/\d+(.\d+)?/g)[0] == info.data.minUsePrice){
                ruleIndex = index
              }
            })
            let limitIndex = ''
            that.data.limits.map((it,index) => {
              if(it.match(/\d+(.\d+)?/g)[0] == info.data.price){
                limitIndex = index
              }
            })
            that.setData({
              couponId: info.data.couponId,
              couponName: info.data.couponName,
              type: info.data.type,
              storeId: info.data.storeId,
              storeIndex: storeIndex,
              roomType: info.data.roomType,
              doorIndex: doorIndex,
              minUsePrice: info.data.minUsePrice,
              ruleIndex: ruleIndex,
              price: info.data.price,
              limitIndex: limitIndex,
              expriceTime: info.data.expriceTime,
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
  // 选择优惠券类型
  bindTypeChange: function(e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      type: this.data.types[e.detail.value].id
    })
  },
  // 单选选门店
  bindStoreChange: function(e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      storeId: this.data.stores[e.detail.value].id,
      storeIndex: e.detail.value
    })
  },
  // 选择包间限制
  bindDoorChange: function(e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    let roomType = this.data.rooms[e.detail.value].id
    this.setData({
      doorIndex: e.detail.value,
      roomType: roomType
    })
  },
  // 选择门槛时间段
  bindRuleChange: function(e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      ruleIndex: e.detail.value,
      minUsePrice: this.data.rules[e.detail.value].match(/\d+(.\d+)?/g)[0]
    })
  },
  // 抵扣额度
  bindLimitChange: function(e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      limitIndex: e.detail.value,
      price: this.data.limits[e.detail.value].match(/\d+(.\d+)?/g)[0]
    })
  },
  // 时分秒的事件方法
  selectDateSecondChange(e) {
    this.setData({
      expriceTime: e.detail.value
    })
  },
  // 使用门槛步进器
  minUseChange:function(event){
    this.setData({minUsePrice: event.detail})
  },
  // 抵扣额度步进器
  priceChange:function(event){
    this.setData({price: event.detail})
  },
  // 取消
  cancel: function(){
    wx.navigateBack()
  },
  // 保存
  submit: function(){
    if(this.data.couponName && this.data.type && this.data.storeId && this.data.expriceTime){
      let that = this
      if (app.globalData.isLogin) 
      {
        http.request(
          "/member/manager/saveCouponDetail",
          "1",
          "post", {
            "couponId": that.data.couponId,
            "couponName": that.data.couponName,
            "expriceTime": that.data.expriceTime,
            "minUsePrice": that.data.minUsePrice,
            "price": that.data.price,
            "storeId": that.data.storeId,
            "roomType": that.data.roomType,
            "type": that.data.type,
          },
          app.globalData.userDatatoken.accessToken,
          "",
          function success(info) {
            console.info('返回111===');
            console.info(info);
            if (info.code == 0) {
              wx.showToast({
                title: '设置成功',
                icon: 'success'
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
    }else{
      wx.showToast({
        title: '请填写完整',
        icon: 'none'
      })
    }
  }
})