// pages/setCoupon/setCoupon.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: '', //列表搜索门店id
    stores: [],
    types: [
      { text: '全部类型', value: '' },
      { text: '抵扣券', value: 1 },
      { text: '满减券', value: 2 },
      { text: '加时券', value: 3 },
    ],
    type: '',
    isSelect: 0,
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,//是否还能加载更多
    list: [],
    userId: '', //给用户id赠送优惠券
    isIpx: app.globalData.isIpx?true:false,
    mainColor: app.globalData.mainColor
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let isSelect = options.isSelect ? parseInt(options.isSelect) :''
    let userId = options.userId ? parseInt(options.userId) :''
    this.setData({
      isSelect: isSelect,
      userId: userId
    })
    if(isSelect === 1){
      wx.setNavigationBarTitle({
        title: '赠送优惠券',
      })
    }
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
    that.getMainListdata('refresh');
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.getMainListdata('');
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
    this.getMainListdata("refresh")
  },
  //类型下拉菜单发生变化
  typeDropdown(event){
    this.setData({
      type: event.detail
    })
    this.getMainListdata("refresh")
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
          list: []
        })
      }
      http.request(
        "/member/manager/getCouponPage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
          "storeId": that.data.storeId,
          "type": that.data.type,
          "roomId": '',
          "orderHour": '',
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
  // 选择优惠券
  select: function(e){
    var that = this;
    let couponId = e.currentTarget.dataset.info
    console.log("userId"+that.data.userId)
    wx.showModal({
      title: '提示',
      content: '是否确定赠送该优惠券',
      complete: (res) => {
        if (res.cancel) {
        }
    
        if (res.confirm) {
          var that = this;
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/manager/giftCoupon",
              "1",
              "post", {
                "couponId": couponId,
                "userId": that.data.userId,
              },
              app.globalData.userDatatoken.accessToken,
              '',
              function success(info) {
                console.info('返回111===');
                console.info(info);
                if (info.code == 0) {
                    wx.showToast({
                      title: '赠送成功',
                    })
                    setTimeout(() => {
                      wx.navigateBack()
                    }, 200);
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
          
        }
      }
    })
  },

})