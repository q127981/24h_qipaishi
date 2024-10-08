// pages/door/door.js
const app = getApp()
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appName: app.globalData.appName,
    statusBarHeight: '',
    titleBarHeight: '',
    status: -1,
    statuslist: [
      { text: '全部状态', value: -1},
      { text: '组局中', value: 0 },
      { text: '已组局', value: 1 },
      { text: '已支付', value: 2 },
      { text: '已失效', value: 3 },
      { text: '已解散', value: 4 },
    ],
    storeId: 0,
    stores: [],
    cityName: '',
    citylist: [],
    MainList:[],//列表数组
    canLoadMore: true,//是否还能加载更多
    pageNo: 1,
    pageSize: 10,
    userinfo: {},
    isLogin:app.globalData.isLogin,
    from: '', //门店页传过来的
    mainColor: app.globalData.mainColor
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      statusBarHeight: wx.getStorageSync('statusBarHeight'),
      titleBarHeight: wx.getStorageSync('titleBarHeight'),
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    that.setData({
      isLogin:app.globalData.isLogin,
    })
    // 门店页面传过来的
    var door = wx.getStorageSync('door')
    if(door){
      //console.log("门店页面传过来的")
      this.setData({
        cityName: door.cityName,
        storeId: door.storeId,
        from: 1
      })
    }else{
      // 首页缓存的城市
      that.setData({
        cityName: '',
        storeId: '',
        from: ''
      })
      //console.log('缓存的城市+++++++');
      //console.log(wx.getStorageSync('cityName'));
      //console.log('缓存的城市+++++++');
    }
    if(app.globalData.isLogin){
      this.getuserinfo()
      this.getCityListdata()
      this.getXiaLaListdata()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //console.log("清除缓存door")
    // wx.setStorageSync('door', '')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this;
    that.setData({
        pageNo: 1,
        canLoadMore:true,
        MainList:[]
    })
    this.getListData('refresh');
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
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
    let that = this;
    return {
      title: that.appName,
      path: '/pages/index/index',
      imageUrl: 'https://images.scyanzu.com/5b4.png',  //用户分享出去的自定义图片大小为5:4,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: "分享成功",
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        // 分享失败
      },
    }
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
  //获取城市列表
  getCityListdata:function(e){
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getCityList",
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            let citylist = []
            info.data.map(it => {
              citylist.push({text:it,value:it})
            })
            that.setData({
              citylist: citylist
            });
          }
        },
        function fail(info) {
          
        }
      )
    } 
    // else {
    //   //console.log('未登录失败！')
    // }
  },
  //获取门店列表数据
  getXiaLaListdata:function(e){
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getStoreList?cityName="+that.data.cityName,
        "1",
        "get", {
          cityName:that.data.cityName
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
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
            //  storeId: that.data.storeId?that.data.storeId : stores[0].value
           })
           if(!that.data.from){
            that.setData({
              stores: stores,
              storeId: stores[0].value
            })
           }
           that.getListData('refresh');
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
  //城市下拉菜单发生变化
  cityDropdown(event){
    //console.log(event)
    this.data.citylist.map(it => {
      if(it.value == event.detail){
        this.setData({
          cityName: it.value,
        })
      }
    })
    this.setData({
      from: ''
    })
    this.getXiaLaListdata()
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
    this.getListData("refresh")
  },
  // 状态下拉菜单发生变化
  statusDropdown(event){
    //console.log(event)
    this.data.statuslist.map(it => {
      if(it.value == event.detail){
        this.setData({
          status: it.value,
        })
      }
    })
    this.getListData("refresh")
  },
  //获取列表数据
  getListData:function(e){
    var that = this;
    let message = "";
    if (app.globalData.isLogin) 
    {
      var astatus;
      if(that.data.status == -1){
        astatus = ''
      }else{
        astatus = that.data.status
      }
      if (e == "refresh") { //刷新，page变为1
        message = "正在加载"
        that.setData({
          pageNo:1,
          MainList:[]
        })
      }
      http.request(
        "/member/game/getGamePage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
          "storeId": that.data.storeId,
          "status": astatus,
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
              content: info.msg,
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
  // 到腾讯地图
  goTencentMap: function(e){
    var store = e.currentTarget.dataset.info
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
  // 踢出对局
  delUser:function(e){
    var gameId = e.currentTarget.dataset.gameid
    var userId = e.currentTarget.dataset.userid
    var that = this;
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/game/deleteUser/"+gameId+"/"+userId,
        "1",
        "post", {
          "gameId": gameId,
          "userId": userId
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('返回111===');
          if (info.code == 0) {
            wx.showToast({
              title: '操作成功',
              icon: 'success'
            })
            that.getListData("refresh")
          }
        },
        function fail(info) {
          
        }
      )
    } 
    else {
      //console.log('未登录失败！')
    }
  },
  // 发起组局
  addGame:function(){
    let stores = this.data.stores
    let storeId = this.data.storeId
    wx.navigateTo({
      url: '../doorSelect/doorSelect?stores='+JSON.stringify(stores)+'&storeId='+storeId,
    })
  },
  // 加入或退出组局
  joinExitGame:function(e){
    var info = e.currentTarget.dataset.info
    var that = this;
    // 退出
    if(info.playUserIds.includes(that.data.userinfo.id)){
      //console.log("退出组局")
      if(info.userId === that.data.userinfo.userId){
        // 房主退出
        wx.showModal({
          title: '提示',
          content: '您确定退出该组局吗？房主退出后该对局会直接解散。',
          complete: (res) => {
            if (res.cancel) {
              
            }
        
            if (res.confirm) {
              that.joinGame(info.gameId)
            }
          }
        })
      }else{
        // 用户退出
        wx.showModal({
          title: '提示',
          content: '您确定退出该组局吗？退出后对局将开放给其他玩家加入。',
          complete: (res) => {
            if (res.cancel) {
              
            }
        
            if (res.confirm) {
              that.joinGame(info.gameId)
            }
          }
        })
      }
    }else{
      //console.log("加入对局")
      that.joinGame(info.gameId)
    }
  },
  // 加入或退出接口
  joinGame:function(gameId){
    var that = this;
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/game/join/"+gameId,
        "1",
        "post", {
          "gameId": gameId,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          if (info.code == 0) {
            wx.showToast({
              title: '操作成功',
              icon: 'success'
            })
            setTimeout(() => {
              that.getListData("refresh")
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
    else {
      //console.log('未登录失败！')
    }
  },
  // 立即支付提交订单
  goOrder(e){
    var that = this;
    if(that.data.isLogin){
      //console.log('已经登录+++++++');
      let info = e.currentTarget.dataset.info;
      var astartTime = '';
      var sdays = info.startTime.split(' ')[0].split('-')
      if(sdays){
        astartTime = [sdays[1], sdays[2]].map(util1.formatNumber).join('.')
      }
      console.log('+++++++');
      console.log(info);
      console.log('+++++++');
      wx.navigateTo({
        url: '../orderSubmit/orderSubmit?roomId='+info.roomId+'&startTime='+info.startTime+'&endTime='+info.endTime+'&doorname='+info.storeName+'&storeId='+info.storeId+'&doorname='+info.storeName+'&daytime='+astartTime,
      })
    }
  },
  // 已支付去订单详情
  goOrderDetail(){
    wx.navigateTo({
      url: '../orderDetail/orderDetail?toPage=true',
    })
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
                        that.getuserinfo()
                        that.getCityListdata()
                        that.getXiaLaListdata()
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
})