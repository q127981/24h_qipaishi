// pages/setVip/setVip.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSelect: 0,
    MainList:[],//列表数组
    stores: [],
    index: '',
    canLoadMore: true,//是否还能加载更多
    pageNo: 1,
    pageSize: 10,
    name: '',
    cloumnName: 'orderTime',
    sortRule: 'DESC',
    createRule: 'ASC',
    orderRule: 'ASC',
    numRule: 'ASC',
    couponId: '',
    showRecharge: false,
    member: '',
    money: '',
    storeId: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //console.log(options)
    let isSelect = parseInt(options.isSelect)
    let couponId = parseInt(options.couponId)
    this.setData({
      isSelect: isSelect ? isSelect : '',
      couponId: couponId ? couponId : ''
    })
    if(isSelect === 1){
      wx.setNavigationBarTitle({
        title: '选择会员',
      })
    }
    this.getListData('refresh');
    this.getXiaLaListAdmin();
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
    let that = this;
    that.setData({
      MainList:[],//列表数组
      canLoadMore: true,//是否还能加载更多
      pageNo: 1,
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
      this.getListData('')
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
        "/member/manager/getMemberPage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
          "name": that.data.name,
          "cloumnName": that.data.cloumnName,
          "sortRule": that.data.sortRule
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
  // 搜索
  search: function(e){
    let cloumnName = e.currentTarget.dataset.info
    if(cloumnName){
      let sortRule = ''
      if(cloumnName == 'createTime'){
        sortRule = this.data.createRule == 'ASC' ? 'DESC' : 'ASC'
        this.setData({createRule: this.data.createRule == 'ASC' ? 'DESC' : 'ASC'})
      }else if(cloumnName == 'orderTime'){
        sortRule = this.data.orderRule == 'ASC' ? 'DESC' : 'ASC'
        this.setData({orderRule: this.data.orderRule == 'ASC' ? 'DESC' : 'ASC'})
      }else if(cloumnName == 'orderCount'){
        sortRule = this.data.numRule == 'ASC' ? 'DESC' : 'ASC'
        this.setData({numRule: this.data.numRule == 'ASC' ? 'DESC' : 'ASC'})
      }
      this.setData({
        cloumnName:cloumnName,
        sortRule: sortRule,
      })
    }
    this.getListData("refresh")
  },
  // 赠送优惠券
  select: function(e){
    let userId = e.currentTarget.dataset.info
    console.log("userId"+userId)
    wx.showModal({
      title: '提示',
      content: '是否确定赠送该会员',
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
                "couponId": that.data.couponId,
                "userId": userId,
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
          
        }
      }
    })
  },
  // 点击复制
  copy: function(e){
    let data = e.currentTarget.dataset.info
    var that = this;
    wx.setClipboardData({
      data: data,
      success(res){
        wx.showToast({title: '复制成功',})
      }
    })
  },
  recharge:function(e){
    let data = e.currentTarget.dataset.info
    this.setData({
        member:data,
        money: '',
        storeId: '',
        index: '',
        showRecharge: true
    })
  },
  confirmRecharge:function(e){
      var that=this;
      if(that.data.storeId){
        if (app.globalData.isLogin) 
        {
          http.request(
            "/member/manager/recharge",
            "1",
            "post", {
              "userId": that.data.member.id,
              "storeId": that.data.storeId,
              "money": that.data.money,
            },
            app.globalData.userDatatoken.accessToken,
            "提交中",
            function success(info) {
              console.info('返回111===');
              console.info(info);
              if (info.code == 0) {
                wx.showToast({
                  title: '充值成功',
                })
              }else{
                wx.showModal({
                  content: info.msg,
                  showCancel: false,
                })
              }
            },
            function fail(info) {
              wx.showModal({
                content: '请求服务异常，请稍后重试',
                showCancel: false,
              })
            }
          )
        } 
      }else{
        wx.showToast({
          title: '未选择门店',
        })
      }
  },
  cancelRecharge:function(e){
    this.setData({
      member: '',
      money: '',
      storeId: '',
      showRecharge: false
    })
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
           that.setData({
             stores: stores,
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
  bindStoreChange: function(e) {
    this.setData({
      index: e.detail.value,
      storeId: this.data.stores[e.detail.value].value
    })
  },
})