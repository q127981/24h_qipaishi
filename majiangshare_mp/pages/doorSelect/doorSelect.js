// pages/doorSelect/doorSelect.js
const app = getApp()
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: 0,
    stores: [],
    storeEnvImg:[],//图片数组
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
    doorname:'',//门店名称
    mainColor: app.globalData.mainColor
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;
    that.setData({
      isLogin:app.globalData.isLogin,
    })
    that.loadingtime();
    that.sethour();
    if(options.storeId){
      var stores = JSON.parse(options.stores)
      var storeId = Number(options.storeId)
      that.setData({
        stores: stores,
        storeId: storeId
      })
      this.getDoorListdata();
      this.getDoorInfodata();
    }
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
  sethour:function(){
    var that = this;
    var timearr = [];
    for(var i =0;i<24;i++){
      var atemp = {
        hourname:'',//小时
        useflage:false//是否可以使用
      };
      atemp.hourname = i;
      atemp.useflage = false;
      timearr.push(atemp)
    }
    that.setData({
      timeHourArr: timearr
    })
  },
    // sethour:function(){
    //   var that = this;
    //   var myDate = new Date();
    //   var ah = myDate.getHours();       //获取当前小时数(0-23)
    //   var timearr = [];
    //   var aci = false;
    //   var anewtime = 0;
    //   //console.log('当前小时===11111');
    //   //console.log(ah);

    //   for(var i =0;i<24;i++){
    //       var atime = ah+i;
    //       var atemp = {
    //         hourname:'',//小时
    //         useflage:false//是否可以使用
    //       };
    //       if(atime == 24){
    //         atemp.hourname = '次'
    //         atemp.useflage = false
    //         aci = true;
    //       }else{
    //         if(aci){
    //           atime = atime-24;
    //           atemp.hourname = atime
    //           atemp.useflage = false
    //         }else{
    //           atemp.hourname = atime
    //           atemp.useflage = false
    //         }
    //       }
    //       timearr.push(atemp)
    //   }
    //   this.setData({
    //     timeHourArr: timearr
    //   })
    // },
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
    this.getDoorListdata()
  },
  
  tempArr:function(key){
    Object.keys(aobject.disabledTimeSlot).sort().forEach(function(key){
      requestArr.push(key + '=' + aobject.disabledTimeSlot[key]);
    });

  },
  // 组局订单
  goDoorSubmit(e){
    var that = this;
    var roomInfo = e.currentTarget.dataset.info
    wx.navigateTo({
      url: '../doorSubmit/doorSubmit?roomInfo='+JSON.stringify(roomInfo)+'&doorname='+that.data.doorinfodata.storeName,
    })
  },
  // 订单
  goOrder(e){
      var that = this;
      if(that.data.isLogin){
        //console.log('已经登录+++++++');
        let type = e.currentTarget.dataset.type;
        let aroomid = e.currentTarget.dataset.info;
        let aselectindex = e.currentTarget.dataset.index;
      

        var atime = '';
        if(that.data.timeselectindex>=0)
          atime = that.data.timeDayArr[that.data.timeselectindex];

        if(type == 1){
          wx.navigateTo({
            url: '../orderSubmit/orderSubmit?roomId='+aroomid+'&daytime='+atime+'&doorname='+that.data.doorinfodata.storeName,
          })
        }else if(type == 2){
          wx.showModal({
            title: '提示',
            content: '您选择的房间暂未清洁，介意请勿预订！如果您已确定该房间卫生整洁，无需打扫可以下单！',
            confirmText: '继续预定',
            complete: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../orderSubmit/orderSubmit?roomId='+aroomid+'&daytime='+atime+'&doorname='+that.data.doorinfodata.storeName,
                })
              } else if (res.cancel) {
                //console.log('用户点击取消')
              }
            }
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
    var that = this;
    var atemplist = []; 
      //根据门店循环
      for(var i = 0;i<that.data.doorlistArr.length;i++)
      {
        var atemp = that.data.doorlistArr[i].disabledTimeSlot;
        var requestkeyArr=[];
        var requestvalueArr=[];
        Object.keys(atemp).sort().forEach(function(key){
          requestkeyArr.push(key);
          requestvalueArr.push(atemp[key]);
        });
        // //console.log(requestkeyArr);
        // //console.log(requestvalueArr);
        //处理第一天
        var listarr1 = requestvalueArr[aindex];//这个地方0的索引值就是日期选择的索引值
        if(listarr1.length>0)
        {
          //时间处理，标记时间短是否可用
          var edittimeHourArr = [];
          for(var k = 0;k<listarr1.length;k++){
            var atime1 = listarr1[k];
            var astartTime = atime1.startTime;
            var aendTime = atime1.endTime;

            var ahourend1 = aendTime.split(':');
            var ahourstart1 = astartTime.split(':');

            var num1 = Number(ahourend1[0]);
            var num2 = Number(ahourstart1[0]);

            var ahourint = num1-num2;//得到相差几个小时
            //得到时段
            for(var n=0;n<=ahourint;n++){
              var num = Number(ahourstart1[0]);
              var acounttime = num+n;
              edittimeHourArr.push(acounttime);//保存禁用小时数据
            }
          }
          //console.log('得到了禁用的小时数=====');
          //console.log(edittimeHourArr);
          //console.log('得到了禁用的小时数=====');
          var anewlist = [];

          var aoldtimeHourArr =  that.data.timeHourArr;
          //console.log('aoldtimeHourArr======0000');
          //console.log(aoldtimeHourArr);
          //console.log('aoldtimeHourArr=====1111');

          for(var y=0;y<aoldtimeHourArr.length;y++){
            var atemp1 = aoldtimeHourArr[y];
            var atempold = {
              hourname:'',//小时
              useflage:false//是否可以使用
            };
            atempold.hourname = atemp1.hourname;
            var atimeh = aoldtimeHourArr[y];
            var aserchbool = false;
            for(var m=0;m<edittimeHourArr.length;m++){
              var aedith = edittimeHourArr[m];
              if(atimeh.hourname == aedith){
                aserchbool = true;
                break;
              }
              // else if(atimeh.hourname == '次' && aedith==0){
              //   aserchbool = true;
              //   break;
              // }
            }
            if(aserchbool){
              atempold.useflage = true;
            }else{
              atempold.useflage = false;
            }
            anewlist.push(atempold);
          }
          // //console.log('整合后的=====');
          // //console.log(anewlist);
          // //console.log('整合后的=====');
          atemplist.push(anewlist);
        }
        else{
          atemplist.push(that.data.timeHourArr);
        }
      }
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
          console.info(info);
          if (info.code == 0) {
            that.setData({
              doorinfodata: info.data
            });
            if(info.data.storeEnvImg.length>0){
              var arr=info.data.storeEnvImg.split(",");
              that.setData({
                storeEnvImg: arr
              });
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
  call:function () {
    let that = this
    if(that.data.doorinfodata.kefuPhone.length>0){
      //console.log("拨打电话+++")
      wx.makePhoneCall({
        phoneNumber:that.data.doorinfodata.kefuPhone,
        success:function () {
          //console.log("拨打电话成功！")
        },
        fail:function () {
          //console.log("拨打电话失败！")
        }
      })
    }
  },
  //选中时间
  selectTime:function(e){
    let that = this
    var index = e.currentTarget.dataset.index//获取当前点击的下标
    //console.log("********")
    //console.log(index)
  
    that.setData({
      timeselectindex: index
    });
    that.setroomlistHour(index);
  },
})