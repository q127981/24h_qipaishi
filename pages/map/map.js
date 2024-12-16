// index.js
// 获取应用实例
const app = getApp()
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');

Page({
  data: {
    appName: app.globalData.appName,
    statusBarHeight: '',
    titleBarHeight: '',
    isMap: false,
    bannershowlist:[],//banner数组
    MainStorelist:[],//列表数组
    cityName: '选择城市',
    name: '', //搜索关键词
    lat: '', 
    lon: '', 
    markers: [],
    store: '', //地图上方展示的门店详情
    storeId:'',
    isLogin:app.globalData.isLogin,
    pageNo:1,//分页的page
    canLoadMore: true,//是否还能加载更多
    userId: '', //管理员代下单用户id
    tabIndex: 0,
    orderDetail: '',
    showBottomDialog: false
  },
  
  goCenter() {
    wx.navigateTo({
      url: 'pages/center/center',
    });
  },

  goListSeach() {
    wx.navigateTo({
      url: '/pages/list/list',
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this
    that.getLocation().then((res) => { });;
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    let that = this;
    that.setData({
        pageNo: 1,
        canLoadMore:true,
        MainStorelist: [],
        markers: [],
        store: '',
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
      console.log("tabIndex:"+this.data.tabIndex)
      // 根据 this.data.tabIndex 判断下拉请求的是 附近的 还是 常用的
      if(this.data.tabIndex == 0){
        that.getMainListdata();
      }else{
        //   this.getOftenListdata()
        that.getMainListdata('',true);
      }
    } else {
      wx.showToast({
        title: '没有更多门店了...',
        icon: 'none'
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
  onLoad(options) {
      var that = this;
      that.goMapSeach()
  },
  goStore(e){
    var storeId = e.currentTarget.dataset.storeid
    console.log('门店选择页面的id='+storeId)
    if(storeId){
      // 设置参数
      wx.setStorageSync('global_store_id',storeId);
    }
    wx.switchTab({
      url: '/pages/index/index'
    });
  },
  goLocation(){
    var that = this;
    wx.navigateTo({
      url: '../location/location',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        pageDataList: function(data) {
          //console.log('页面B触发事件时传递的数据1：',data)
          that.setData({
            cityName: data
          });
          wx.setStorageSync('cityName', data)
          
          that.getBannerdata();
        //   that.getMainListdata('refresh');
        },
      }
    })
  },

  //点击地图
  goMapSeach(){
    this.setData({
      isMap: true
    })
    this.setData({name:''})
    this.getMainListdata('refresh')
  },
  goListSeach(){
    this.setData({
      isMap: false,
      name:"",
      tabIndex: 0,
    })
    this.setData({name:''})
    this.getMainListdata('refresh')
  },
  //充值
  goRecharge(e){
    var that = this;
    var storeId = e.currentTarget.dataset.storeid
    if(app.globalData.isLogin){
      wx.navigateTo({
        url: '../recharge/recharge?storeId='+storeId,
      })
    }else{
      that.gotologin();
    }
  },
  goTencentMap(e){
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
  goDoorDetail(){
    wx.navigateTo({
      url: '../doorDetail/doorDetail',
    })
  },
  //到登录界面
  gotologin(){
    wx.navigateTo({
      url: '../login/login',
    })
  },
  //获取列表数据
  getMainListdata:function(e,often = false){
    var that = this;
    let message = "";
    if (e == "refresh") { //刷新，page变为1
        console.log("进入方法")
      that.setData({
        MainStorelist:[],//列表数组
        canLoadMore: true,//是否还能加载更多
        pageNo: 1,
      })
      message = "获取中..."
    }
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getStoreList",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": 1000,
          "cityName": that.data.cityName,
          "lat": that.data.lat,
          "lon": that.data.lon,
          "name": that.data.name,
          "often":often
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
            console.log(info)
          if (info.code == 0) {
              let list = []
              if(info.data!=null){
                list=info.data.list
              }
            if(list.length === 0){
              that.setData({
                canLoadMore: false
              })
            }else{
              //有数据
              let list = info.data.list
              let allMarkers = [];
              for(let i=0;i<list.length;i++){
                var title = list[i].storeName
                console.log(title)
                var lat = list[i].lat
                var lon = list[i].lon
                var storeId = list[i].storeId
                let marker = {
                  id: storeId,
                  latitude: lat >90 ? 90 : lat,
                  longitude: lon,
                  label:{
                    content: title,  //文本
                    color: '#fff',  //文本颜色
                    borderRadius: 5,  //边框圆角
                    bgColor: 'rgb(90,171,110)',  //背景色
                    padding: 5,  //文本边缘留白
                    textAlign: 'center'  //文本对齐方式。有效值: left, right, center
                  },
                  iconPath:'/logo.png',
                  fontSize: 30,
                  width: 30, // 这里假设设置宽度为30像素，你可以根据实际需求修改
                  height: 30
                }
                console.log(marker)
                allMarkers.push(marker);
              }
              if(that.data.MainStorelist){
                //列表已有数据  那么就追加
                let arr = that.data.MainStorelist;
                let arrs = arr.concat(info.data.list);
                let markers = that.data.markers;
                let newMarkers = markers.concat(allMarkers);
                that.setData({
                  MainStorelist: arrs,
                  markers: newMarkers,
                  store: list[0],
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total
                })
              }else{
                that.setData({
                  MainStorelist: info.data.list,
                  markers: allMarkers,
                  store: list[0],
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
    } 
  },
  //获取首页banner
  getBannerdata:function(e){
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getBannerList",
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          if (info.code == 0) {
            that.setData({
              bannershowlist: info.data
            });
            
          }
        },
        function fail(info) {
          
        }
      )
    }
  },
  // 在需要获取位置的页面的Page函数中定义获取位置的方法

  call:function (e) {
    // let that = this;
    // var aphoneinfo = e.currentTarget.dataset.info;//获取当前点击的下标
    let that = this;
    var phoneLength=e.currentTarget.dataset.info.length;
    if(phoneLength>0){
      if(phoneLength==11){
          wx.makePhoneCall({
            phoneNumber:e.currentTarget.dataset.info,
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
          content: '客服上班时间10：00~23：00\r\n如您遇到问题，建议先查看“使用帮助”！\r\n本店客服微信号：'+e.currentTarget.dataset.info,
          confirmText: '复制',
          complete: (res) => {
            if (res.confirm) {
              wx.setClipboardData({
                data: e.currentTarget.dataset.info,
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
    // if(aphoneinfo.length>0){
    //   //console.log("拨打电话+++")
    //   wx.makePhoneCall({
    //     phoneNumber:aphoneinfo,
    //     success:function () {
    //       //console.log("拨打电话成功！")
    //     },
    //     fail:function () {
    //       //console.log("拨打电话失败！")
    //     }
    //   })
    // }
  },

  //获取列表数据
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
  // 搜索框值改变
  onInputChange: function(e){
    this.setData({name: e.detail.value});
    this.getMainListdata('refresh');
  },
  // 点击marker展示门店信息
  makertap: function(e) { 
    var that = this; 
    var storeId = e.markerId; 
    that.data.MainStorelist.map(it => {
      if(it.storeId === storeId){
        that.setData({
          store: it,
          showBottomDialog: true
        })
      }
    })
  },  
  openDoor(e){
    var that = this;
    // let aindex = e.currentTarget.dataset.index;
    if(app.globalData.isLogin){
      http.request(
        "/member/order/getOrderInfo",
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('订单信息===');
          if (info.code === 0 && info.data) {
            //有订单  调用开门
            let startTime=new Date(info.data.startTime);
            if(info.data.status == 0 && startTime>Date.now()){
              wx.showModal({
                title: '温馨提示',
                content: '当前还未到预约时间，是否提前开始消费？',
                success: function (res) {
                  if (res.confirm) {
                    that.openRoomDoor(info.data);
                  }
                }
              })
            }else{
              that.openRoomDoor(info.data);
            }
          }else{
            wx.showModal({
              title: '温馨提示',
              content: '当前无有效订单，请先下单！',
              showCancel: false,
              success (res) {
              }
            })
          }
        },
        function fail(info) {
        }
      )
    }else{
      that.gotologin();
    }
  },
  goUser: function(){
    wx.switchTab({
      url: '/pages/user/user',
    })
  },
  goNear: function(){
    this.setData({
        tabIndex: 0,
      });
      this.getMainListdata('refresh')
  },
  openDoor(e) {
    var that = this;
    // let aindex = e.currentTarget.dataset.index;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/getOrderPage",
        "1",
        "post",
        {
          pageNo: 1,
          pageSize: 10,
          status: 1,
          orderColumn: "startTime",
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            if (!info.data.list.length) {
              wx.showToast({
                title: "暂无可用订单",
                icon: "none",
              });
            } else {
              that.getOrderDetail(info.data.list[0].orderId)
            }
          } else {
            wx.showModal({
              title: "温馨提示",
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {}
      );
    } else {
      that.gotologin();
    }
  },
  goUser: function () {
    wx.switchTab({
      url: "/pages/user/user",
    });
  },
  //获取订单详情
  getOrderDetail (orderId) {
    http.request(
      "/member/order/getOrderInfo",
      "1",
      "get",
      {
        orderId
      },
      app.globalData.userDatatoken.accessToken,
      "",
      (info) => {
        if (info.code === 0) {
          this.setData({
            orderDetail: info.data
          });
        } else {
          // wx.showModal({
          //   title: "温馨提示",
          //   content: info.msg,
          //   showCancel: false,
          // });
        }
      },
      function fail(info) {}
    );
  },
  openRoomDoor:function(data) {
    let that = this;
    //开房间门
      console.log('开房间门');
      http.request(
        "/member/order/openRoomDoor?orderKey="+data.orderKey,
        "1",
        "post", {
          // "orderKey":that.data.orderKey,
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
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
    
      handleTabChange(e) {
          this.setData({
              MainStorelist: []
          })
        const { index } = e.target.dataset;
        if(index==1){
          //必须登录
          if(!app.globalData.isLogin){
             wx.showToast({
               title: '请先登录',
               icon:'none'
             })
             setTimeout(() => {
              wx.navigateTo({
                url: "../login/login",
             });
             }, 1000);
             return
          }
        }
        this.setData({
          tabIndex: +index,
        });
        console.log("handleTabChange");
        this.getMainListdata("refresh", +index === 1);
      },
      handleListTransition(e) {
        console.log("handleListTransition");
        const { current } = e.detail;
        this.setData({
          tabIndex: current,
        });
        this.getMainListdata("refresh", current === 1);
      },
      roomRenew() {
        wx.navigateTo({
          url: `/pages/roomRenew/roomRenew?storeId=${this.data.currentOrder.storeId}&roomId=${this.data.currentOrder.roomId}`,
        });
      },
      closeDialog() {
        this.setData({
            showBottomDialog: false
          })
      },
      getLocation: function () {
        return new Promise((r, t) => {
          let that = this;
          wx.getLocation({
            type: 'gcj02',
            success: function (res) {
              const latitude = res.latitude
              const longitude = res.longitude
              that.setData({
                lat: latitude,
                lon: longitude,
              });
              // that.getMainListdata('refresh');
              // 处理位置信息，比如将位置信息显示在页面上
              // 示例中使用的是util.js中的函数，开发者可以根据需要自行编写
              //util.showLocation(latitude, longitude)
            },
            fail: function (res) {
              // that.getMainListdata('refresh');
              // 如果获取位置信息失败，可以处理错误情况
              //console.log('获取位置失败', res.errMsg)
            }
          })
        });
      },
})
