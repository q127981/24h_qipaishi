// pages/setDiscount/setDiscount.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false, //添加规则弹窗
    cityName: '',
    storeId: 0, //列表搜索门店id
    stores: [],
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,//是否还能加载更多
    list: [],
    payMoney: '',
    giftMoney:'',
    expriceTime: '',
    optionindex: '',
    storeId2:'', //添加修改时选择的门店id
    discountId: '',
    beforeCloseFunction:null,
    isIpx: app.globalData.isIpx?true:false,
    mainColor: app.globalData.mainColor
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({beforeCloseFunction: this.beforeClose()})
    this.setData({
      storeId: Number(options.storeId),
      storeId2: Number(options.storeId)
    })
    this.getXiaLaListAdmin()
    this.getMainListdata('refresh');
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
    this.getListData('refresh');
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
            let optionindex = ''
            info.data.map((it,index) => {
              stores.push({text:it.key,value:it.value})
              if(it.value === that.data.storeId){
                optionindex = index
              }
            })
            //console.log(optionindex)
           that.setData({
             stores: stores,
            //  storeId: stores[0].value,
             optionindex: optionindex
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
        "/member/store/getDiscountRulesPage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
          "storeId": that.data.storeId,
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
  // 启用禁用
  setStatus: function(e){
    let discountId = e.currentTarget.dataset.info.discountId
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/changeDiscountRulesStatus/"+discountId,
        "1",
        "post", {
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            wx.showToast({
              title: '设置成功',
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
  // 获取优惠详情
  getData: function(discountId){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/getDiscountRuleDetail/"+discountId,
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            let optionindex = ''
            that.data.stores.map((it,index) => {
              if(it.value === info.data.storeId){
                optionindex = index
              }
            })
            that.setData({
              payMoney: info.data.payMoney,
              giftMoney: info.data.giftMoney,
              expriceTime: info.data.expriceTime,
              storeId2: info.data.storeId,
              optionindex: optionindex
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
  // 修改弹窗
  edit: function(e){
    if(e.currentTarget.dataset.info){
      let discountId = e.currentTarget.dataset.info.discountId
      this.setData({
        discountId: discountId
      })
      this.getData(discountId)
    }else{
      this.setData({
        discountId: '',
        // optionindex: '',
        payMoney: '',
        giftMoney:'',
        expriceTime: ''
      })
    }
    this.setData({
      show: true
    })
  },
  // 时分秒的事件方法
  selectDateSecondChange(e) {
    this.setData({
      expriceTime: e.detail.value
    })
  },
  // 弹窗选门店
  bindStoreChange:function(e){
		this.setData({
			storeId2: this.data.stores[e.detail.value].value,
			optionindex: e.detail.value
		});
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
  // 保存
  submit: function () {
    if(this.data.optionindex==='' || !this.data.payMoney || !this.data.giftMoney || !this.data.expriceTime){
      wx.showToast({
        title: '请填写完整',
        icon: "none"
      })
      return false;
    }else{
      this.updateData(this.data.discountId)
    }
  },
  // 取消
  cancel: function(){
    this.setData({
      // optionindex: '',
      payMoney: '',
      giftMoney:'',
      expriceTime: ''
    })
  },
  // 修改调接口
  updateData: function(discountId){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/saveDiscountRuleDetail",
        "1",
        "post", {
          "discountId": discountId?discountId:'',
          "storeId": that.data.storeId2,
          "payMoney": that.data.payMoney,
          "giftMoney": that.data.giftMoney,
          "expriceTime": that.data.expriceTime,
        },
        app.globalData.userDatatoken.accessToken,
        "保存中",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            that.getMainListdata("refresh")
            wx.showToast({
              title: '设置成功',
            })
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
})