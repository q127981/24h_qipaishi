// pages/doorList/doorList.js
const app = getApp()
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: '',
    titleBarHeight: '',
    storeId:'',
    storeEnvImg:[],//图片数组
    bannerImg:[],//banner
    doorinfodata:{},//门店信息
    timeselectindex:0,//日期选择索引值
    timebg_primary:'bg-primary',
    timebg_primary_no:'',
    timeDayArr:[],//时间展示日期：年月日
    timeWeekArr:[],//时间展示：星期
    doorlistArr:[],//房间数组
    timeHourArr:[],//小时数组
    timeHourAllArr:[],//所有门店小时数组
    isLogin:app.globalData.isLogin,
    popshow: false,
    maoHeight:0,//锚链接跳转高度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("onLoad index")
    var that = this;
    that.getTap();
    if(options.storeId){
      //扫码进来的 肯定有门店id 
      that.setData({
        storeId: options.storeId
      });
      wx.setStorageSync('global_store_id',storeId);
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
    console.log("onShow index")
    var that = this;
    that.setData({
      isLogin:app.globalData.isLogin,
    })
    var popshow=false;//默认不显示广告
    //尝试从缓存获取
    var storeId_1 = wx.getStorageSync('global_store_id');
    var storeId_2 = that.data.storeId;//页面的
    console.log('storeId_1='+storeId_1)
    console.log('storeId_2='+storeId_2)
    //如果两个都是空的，让用户去选择门店
    if(!storeId_1&&!storeId_2){
      console.log("未获取到门店id")
      wx.navigateTo({
        url: "../doorList/doorList",
      })
    }else{
      //至少有一个不为空
      //只处理不相等的情况，控制显示公告弹窗，相等的情况说明停留在当前门店
      if(storeId_1!=storeId_2){
        popshow=true
        if(!storeId_1){
          //如果缓存为空，可能是用户第一次扫码那就以扫码的为准
          that.setData({
            storeId: storeId_2
          })
        }else{
          //缓存有  页面也有 优先缓存
          that.setData({
            storeId: storeId_1
          })
        }
      }
    }
    console.log('最终的门店id:'+that.data.storeId)
    if(that.data.storeId){
      that.loadingtime();
      that.getDoorInfodata();
      that.setData({
        popshow: popshow
      })
    }
    // this.getDoorListdata();
  },
  popClose:function(){
    this.setData({popshow: false})
  },
  loadingtime:function(){
    var that = this;
    var date = new Date(); //获取当前时间
    var year = date.getFullYear(); //获取当前年份
    var month = date.getMonth() + 1; //获取当前月份
    var day = date.getDate(); //获取当前日期    
    var atimestring = year+'-'+month+'-'+day
    var atimestring1 = [year, month, day].map(util1.formatNumber).join('-')
    //console.log('atimestring1===11111');
    //console.log(atimestring1);

    var atimelist = that.getDates(5,atimestring1);
    var alist1=[];
    var alist2=[];
    for(var i=0;i<atimelist.length;i++){
      alist1.push(atimelist[i].month+'.'+atimelist[i].day)
      alist2.push(atimelist[i].week)
    }
    that.setData({
      timeDayArr: alist1,
      timeWeekArr: alist2
    })
  },
    //获取当前时间多少天后的日期和对应星期
    getDates:function(days,todate) {//todate默认参数是当前日期，可以传入对应时间
      var dateArry = [];
      for (var i = 0; i < days; i++) {
        var dateObj = this.dateLater(todate, i);
        dateArry.push(dateObj)
      }
      return dateArry;
    },
    /**
     * 传入时间后几天
     * param：传入时间：dates:"2019-04-12",later:往后多少天
     */
    dateLater:function(dates, later) {
      let dateObj = {};
      let show_day = new Array('周日', '周一', '周二', '周三', '周四', '周五', '周六');
      let date = new Date(dates);
      date.setDate(date.getDate() + later);
      let day = date.getDay();
      dateObj.year = date.getFullYear();
      dateObj.month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : date.getMonth()+1);
      dateObj.day = (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate());
      
      dateObj.week = show_day[day];
      return dateObj;
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
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    
  },
  getTap(){
    const SelectorQuery = wx.createSelectorQuery();
    SelectorQuery.select('#toolbar').boundingClientRect();
    SelectorQuery.exec(res=>{
     this.setData({maoHeight:res[0].bottom+200})
    })
 },
  showWifi(){
    wx.showModal({
      title: 'WIFI信息',
      content: this.data.doorinfodata.wifiInfo,
      showCancel: false
    })
  },
 
  goTencentMap(e){
    var store = e.currentTarget.dataset.info
    this.goMap(store)
  },
  //续费
  onclickxufei:function(){
    wx.showToast({
      title: '未找到订单',
      icon: 'none'
    })
  },
  // 打开地图
  goMap(store) {
    wx.openLocation({
      latitude: store.lat,
      longitude: store.lon,
      name: store.storeName,
      address: store.address,
      scale: 28
    })
  },
  goYuyue(){
    wx.navigateTo({
      url: `/pages/booking/booking?storeId=${this.data.storeId}`
    })
  },
  goIndexPage(){
    console.log(this.data.storeId)
    wx.navigateTo({
        url: '/pages/doorList/doorList?storeId='+this.data.storeId,
    })
  },
  goDoorDetail(){
    var that = this;
    wx.navigateTo({
      url: '../doorDetail/doorDetail?storeId='+that.data.storeId,
    })
  },
  tempArr:function(key){
    Object.keys(aobject.disabledTimeSlot).sort().forEach(function(key){
      requestArr.push(key + '=' + aobject.disabledTimeSlot[key]);
    });
  },
  goOrder(e){
      var that = this;
      if(that.data.isLogin){
        //console.log('已经登录+++++++');
        let status = e.currentTarget.dataset.status;
        let aroomid = e.currentTarget.dataset.info;
        var atime = '';
        if(that.data.timeselectindex >= 0)
          atime = that.data.timeDayArr[that.data.timeselectindex];
        var storeId = that.data.storeId
        if(status == 2){
          if(that.data.doorinfodata.clearOpen){
            wx.showModal({
              title: '提示',
              content: '您选择的房间暂未清洁，介意请勿预订！',
              confirmText: '继续预定',
              complete: (res) => {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../orderSubmit/orderSubmit?roomId='+aroomid+'&daytime='+atime+'&storeId='+storeId+'&timeselectindex='+that.data.timeselectindex,
                  })
                } else if (res.cancel) {
                  //console.log('用户点击取消')
                }
              }
            })
          }else{
            wx.showModal({
              title: '提示',
              content: '房间暂未清洁，禁止预订！',
              showCancel: false
            })
          }
        }else{
          wx.navigateTo({
            url: '../orderSubmit/orderSubmit?roomId='+aroomid+'&daytime='+atime+'&storeId='+storeId+'&timeselectindex='+that.data.timeselectindex,
          })
        }
      }
  },
  phone:function(e){
    var that = this;
    //console.log('手机号码授权+++++++');
    if(e.detail.errMsg=="getPhoneNumber:fail user deny"){
      wx.showToast({title: '已取消授权'})
    }
    if(e.detail.errMsg=="getPhoneNumber:ok"){
      //console.log('手机号码授权+++++++');
      wx.login({
        success: function(res) {
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
  //获取房间列表数据
  getDoorListdata:function(e){
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getRoomInfoList"+'/'+that.data.storeId,
        "1",
        "post", {
          "storeId": that.data.storeId,
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              doorlistArr: info.data
            });
            that.setroomlistHour(0);
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
  //设置列表禁用时间轴
  setroomlistHour:function(aindex){
    //aindex代表选的第几天  从0开始
    var that = this;
    console.log(aindex);
    var atemplist = []; 
      //根据门店循环
    for(var i = 0;i<that.data.doorlistArr.length;i++)
    {
        var atemp = that.data.doorlistArr[i].timeSlot.slice(aindex*24,aindex*24+24);
        atemplist.push(atemp);
        // console.log(atemp);
    }
    console.log(atemplist);
    that.setData({
      timeHourAllArr: atemplist
     });
  },
  //获取门店相信信息
  getDoorInfodata:function(e){
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getStoreInfo"+'/'+that.data.storeId,
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('门店信息===');
          // console.info(info);
          if (info.code == 0) {
            if(null!=info.data){
              that.setData({
                doorinfodata: info.data
              });
              if(null!=info.data.storeEnvImg &&info.data.storeEnvImg.length>0){
                var arr=info.data.storeEnvImg.split(",");
                that.setData({
                  storeEnvImg: arr
                });
              }
              if(null!=info.data.bannerImg &&info.data.bannerImg.length>0){
                var arr=info.data.bannerImg.split(",");
                that.setData({
                  bannerImg: arr
                });
              }
            }else{
              wx.navigateTo({
                url: "../doorList/doorList",
              })
            }
          }else{
            wx.showModal({
              content: '请求服务异常，请稍后重试',
              showCancel: false,
            })
            wx.navigateTo({
              url: "../doorList/doorList",
            })
          }
        },
        function fail(info) {
        }
      )
    } 
  },
  call:function () {
    let that = this;
    var phoneLength=that.data.doorinfodata.kefuPhone.length;
    if(phoneLength>0){
      if(phoneLength==11){
          wx.makePhoneCall({
            phoneNumber:that.data.doorinfodata.kefuPhone,
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
          content: '客服上班时间10：00~23：00\r\n如您遇到问题，建议先查看“使用帮助”！\r\n本店客服微信号：'+that.data.doorinfodata.kefuPhone,
          confirmText: '复制',
          complete: (res) => {
            if (res.confirm) {
              wx.setClipboardData({
                data: that.data.doorinfodata.kefuPhone,
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
  },
  //选中时间
  selectTime:function(e){
    let that = this
    var index = e.currentTarget.dataset.index//获取当前点击的下标
    that.setData({
      timeselectindex: index
    });
    that.setroomlistHour(index);
  },
    
  //充值
  goRecharge(){
    var that = this;
    var storeId = that.data.storeId
    if(that.data.isLogin){
      wx.navigateTo({
        url: '../recharge/recharge?storeId='+storeId,
      })
    }else{
      that.gotologin();
    }
  },
  //团购
   gototuangou(){
    var that = this;
    wx.navigateTo({
      url: '../tuangou/tuangou',
    })
  },
  //在线组局
  gotodoor(){
    var that = this
    var data = {cityName:that.data.doorinfodata.cityName,storeId: that.data.doorinfodata.storeId}
    wx.setStorageSync('door', data)
    wx.reLaunch({
      url: '../door/door',
    })
  },
  openDoor(e){
    var that = this;
    // let aindex = e.currentTarget.dataset.index;
    if(that.data.isLogin){
      wx.navigateTo({
        url: '../orderDetail/orderDetail',
      })
    }else{
      that.gotologin();
    }
  },
  //到登录界面
  gotologin(){
    wx.navigateTo({
      url: '../login/login',
    })
  },
  //图片点击事件
  imgYu: function(event) {
    var that = this;
    let aindex = event.currentTarget.dataset.index;
    var alistimage = that.data.doorlistArr[aindex];
    var aimagearr = alistimage.imageUrls;

    //console.log("点击图片********")

    if(aimagearr.length>0){
      var anewimagearr = aimagearr.split(',');
      var src = anewimagearr[0]+'?Content-Type=image/jpg'; //获取data-src
      var imgList = anewimagearr; //获取data-list
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

})