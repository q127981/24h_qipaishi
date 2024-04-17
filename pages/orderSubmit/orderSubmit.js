// pages/orderSubmit/orderSubmit.js
const app = getApp()
const { now } = require('../../lib/moment');
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    appName: app.globalData.appName,
    storeId: '',
    roomId:'',//房间id
    daytime:'',//传递的日期
    price:0,//房间单价
    workPrice:0,//工作日房间单价
    txPrice:0.0,//通宵场价格
    txNowPrice:0.0,
    timeselectindex:0,//选择的日期索引位置
    roominfodata:{},//房间展示信息
    select_time_index:0,
    minDay:'',//可选最小时间
    maxDay:'',//可选最大时间
    minHour:'',//可选最小小时
    enableWorkPrice: '',//启用工作日价格
    leadHour: '',//提前开始时间
    leadDay: '',//提前下单时间
    txStartHour: '',//通宵起始小时
    txHour: '',//通宵时长
    clearTime: '',//订单清洁时间
    userinfo:{},//用户信息
    payselectindex:1,//支付类型索引值
    doorname:'',//门店名称
    timeHourAllArr: [],
    hour_options: [],
    order_hour: '',
    //订单提交
    submit_couponInfo:{},//选中的提交的优惠券信息
    submit_begin_time:'',//开始时间
    submit_end_time:'',//结束时间
    view_begin_time:'',//显示开始时间
    view_end_time:'',//显示结束时间
    nightLong:false,//是否通宵
    orderNo:'',//支付订单号
    // couponId:'',//优惠券Id,示例值(31071)
    scanCodeMsg:'',//团购券码 填了团购券时，其他支付方式均不生效
    pricestring:0.0,//支付金额
    showprice:0.0,//原价金额
    // coupon_hour_time:0,//优惠小时
    // coupon_price:0,//优惠金额
    // coupon_old_price:0,//优惠后的金额
    ///////////////
    couponCount:0,
    currentDate: '',
    showtimefalge:false,
    show: false,
    giftBalance: '',
    balance: '',
    isIpx: app.globalData.isIpx?true:false,
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      }
      if (type === 'month') {
        return `${value}月`;
      }
      if (type === 'day') {
        return `${value}日`;
      }
      if (type === 'hour') {
        return `${value}时`;
      }
      if (type === 'minute') {
        return `${value}分`;
      }
      return value;
    },
    minDay: new Date().getTime(),
    maxDay: new Date(new Date().getTime() + ( 5 * 24 * 60 * 60 * 1000)).getTime(),
    curTime: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;
    that.setData({
      isLogin:app.globalData.isLogin,
      storeId: options.storeId,
      roomId: options.roomId,
      // daytime: options.daytime,
      timeselectindex: options.timeselectindex
    });
    wx.setStorageSync('global_store_id',that.data.storeId);
    if (app.globalData.isLogin) {
      that.getroomInfodata(options.roomId).then(res=>{
      });
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
    var that = this;
    that.getStoreBalance();
    that.getCouponListData();
    // that.getuserinfo();
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
                        that.getroomInfodata(that.data.roomId).then(res=>{
                        });
                        that.getStoreBalance();
                        that.getCouponListData();
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
  // 去优惠券页面
  goCoupon(){
    var that = this;
    if(that.data.scanCodeMsg.length>0){
      wx.showModal({
        title: '温馨提示',
        content: '您已输入团购券码，无法再选择优惠券！',
        showCancel: false
      })
    }else{
      wx.navigateTo({
        url: '../coupon/coupon?from=1&roomId='+that.data.roominfodata.roomId+'&orderHours='+that.data.order_hour+'&nightLong='+that.data.nightLong+'&startTime='+that.data.submit_begin_time+'&endTime='+that.data.submit_end_time,
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          pageDataList: function(data) {
            console.log('页面B触发事件时传递的数据1：',data)
            that.setData({
              submit_couponInfo: data
            });
            that.setshowpayMoney(data);
          },
          pageDataList_no: function(data) {
            //console.log('页面B触发事件时传递的数据1：',data)
            that.setData({
              submit_couponInfo:{}
            });
            that.setshowpayMoney(data);
          },
        }
      })
    }
  },
  // 去订单详情页
  goOrderDetail(){
    wx.navigateTo({
      url: '../orderDetail/orderDetail',
    })
  },
  //计算订单价格
  MathPrice:function(){
    console.log("MathPrice")
    var that = this;
    var startDate=new Date(that.data.submit_begin_time);
    var timeIndex=that.data.select_time_index;
    console.log(that.data.order_hour)
    if(null==that.data.order_hour){
      that.setData({
        order_hour: 4
      })
    }
    console.log("订单时长:"+that.data.order_hour);
    //原价
    var oldPrice=0;
    if(timeIndex==3){
      //通宵 现在开始
       that.MathTxNowPrice();
       return
    }else if(timeIndex==4){
       oldPrice=that.data.txPrice;
    }else{
       oldPrice=(that.data.order_hour*that.getPrice(startDate)).toFixed(2);
    }
    console.log('价格:'+that.getPrice(startDate))
    that.setData({
      pricestring: oldPrice,
      showprice: oldPrice
    })
  },
  MathTxNowPrice(){
      var that = this;
      //现在开始的通宵价格
      var price=0;
      var startDate=new Date(that.data.submit_begin_time);
      if(that.data.order_hour>that.data.txHour){
        price=parseFloat(((that.data.order_hour-that.data.txHour)*this.getPrice(startDate)).toFixed(2))+parseFloat(that.data.txPrice);
        price=price.toFixed(2);
      }else{
        price=that.data.txPrice;
      }
      that.setData({
        txNowPrice: price,
        pricestring: price,
        showprice: price
      })
  },
  // 预支付
  SubmitOrderInfoData(){
    var that = this;
    if (app.globalData.isLogin) 
    {
      var acouponId = ""
      if(that.data.submit_couponInfo){
        acouponId = that.data.submit_couponInfo.couponId
      }
      http.request(
        "/member/order/preOrder",
        "1",
        "post", {
          roomId:that.data.roomId,
          couponId:acouponId,
          nightLong:that.data.nightLong,
          startTime:that.data.submit_begin_time,
          endTime:that.data.submit_end_time,
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          console.info('支付信息===');
          if (info.code == 0) {
            if(that.data.payselectindex==1){
              //选择的是微信支付
              if(that.data.pricestring <= 0.0){
                //订单金额为0元的时候，不走微信支付，直接订单提交
                that.data.orderNo = info.data.orderNo;
                that.submitorder();
              }else{
                that.lockWxOrder(info);
              }
            }else{
              that.data.orderNo = info.data.orderNo;
              that.submitorder();
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
      var acouponId = ""
      if(that.data.submit_couponInfo){
        acouponId = that.data.submit_couponInfo.couponId
      }
      http.request(
        "/member/order/lockWxOrder",
        "1",
        "post", {
          roomId:that.data.roomId,
          couponId:acouponId,
          nightLong:that.data.nightLong,
          startTime:that.data.submit_begin_time,
          endTime:that.data.submit_end_time,
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
    wx.requestPayment({
        'timeStamp': pay.data.timeStamp,
        'nonceStr': pay.data.nonceStr,
        'package': pay.data.pkg,
        'signType': pay.data.signType,
        'paySign': pay.data.paySign,
        'success': function(res) {
            //进入订单详情页  订单由支付回调函数创建
            setTimeout(function() {
              wx.navigateTo({
                url: '../orderDetail/orderDetail',
              })
            }, 1000);
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
  submitorder:function(){
    var that = this;
    if (app.globalData.isLogin) 
    {
      var acouponId = ""
      if(that.data.submit_couponInfo){
        acouponId = that.data.submit_couponInfo.couponId
      }
      http.request(
        "/member/order/save",
        "1",
        "post", {
          roomId:that.data.roomId,
          couponId:acouponId,
          nightLong:that.data.nightLong,
          startTime:that.data.submit_begin_time,
          endTime:that.data.submit_end_time,
          payType:that.data.payselectindex,
          groupPayNo:that.data.scanCodeMsg,
          orderNo:that.data.orderNo
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
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
                title: '预定成功！',
                icon: 'success'
              })
            }
            setTimeout(function() {
              wx.navigateTo({
                url: '../orderDetail/orderDetail?OrderNo='+info.data,
              })
            }, 1000);
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
  //获取房间信息
  getroomInfodata:function(roomId){
    return new Promise((r,t)=>{
    var that = this;
    http.request(
      "/member/index/getRoomInfo"+'/'+roomId,
      "1",
      "post", {
        roomId:roomId
      },
      app.globalData.userDatatoken.accessToken,
      "获取中...",
      function success(info) {
        if (info.code == 0) {
          var minHour=info.data.minHour;
          var hour_options=[]
          for(;minHour <= 12;minHour++){
            hour_options.push(minHour+'小时');
          }
          that.setData({
            roominfodata: info.data,
            price: info.data.price,
            minHour: info.data.minHour,
            leadHour: info.data.leadHour,
            leadDay: info.data.leadDay,
            txStartHour: info.data.txStartHour,
            txHour: info.data.txHour,
            txPrice: info.data.tongxiaoPrice,
            clearTime: info.data.clearTime,
            workPrice: info.data.workPrice,
            enableWorkPrice: info.data.enableWorkPrice,
            hour_options:hour_options,
            storeId: info.data.storeId,
            timeHourAllArr: info.data.timeSlot.slice(0,24)
          });
          that.loadingtime();
          that.MathDate(new Date(that.data.submit_begin_time));
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
  })
  },
  //初始化时间
  loadingtime:function(){
    console.log('初始化时间');
    var that = this;
    var startDate=new Date();
    if(that.data.timeselectindex>0){
      //选中的不是今天  则设置为对应日期的0时开始
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);
      startDate=new Date(startDate.getTime()+24 * 60 * 60*1000*that.data.timeselectindex);
    }
    that.setData({
      submit_begin_time: that.formatDate(startDate).text
    });
    // var startDate_fmt=that.formatDate(startDate);
   
    //console.log('几小时过后的======时间信息==='+atime);
  },
  formatDate (dateTime) {
    const date = new Date(dateTime)
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date.getMinutes()
    if (minute < 10) {
      minute = `0${minute}`
    }
    if (hour < 10) {
      hour = `0${hour}`
    }
    if (day < 10) {
      day = `0${day}`
    }
    if (month < 10) {
      month = `0${month}`
    }
    return {
      text: `${year}/${month}/${day} ${hour}:${minute}`,
      year,
      month,
      day,
      hour,
      minute
    }
  },
  formatViewDate (dateTime) {
    const date = new Date(dateTime)
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date.getMinutes()
    if (minute < 10) {
      minute = `0${minute}`
    }
    if (hour < 10) {
      hour = `0${hour}`
    }
    if (day < 10) {
      day = `0${day}`
    }
    if (month < 10) {
      month = `0${month}`
    }
    return {
      text: `${month}/${day} ${hour}:${minute}`
    }
  },
  haveSomeMinutesTime:function(newDate,n) {
    var that = this;
    if (n == null) {
      n = 0;
    }
    var date = newDate.setMinutes(newDate.getMinutes() + n);
    newDate = new Date(date);
    var year = newDate.getFullYear();
    var month = newDate.getMonth() + 1; //获取当前月份
    var day = newDate.getDate(); //获取当前日期   

    var h = newDate.getHours();
    var m = newDate.getMinutes();
    var s = newDate.getSeconds();
    if (month < 10) {
      month = '0' + month;
    };
    if (day < 10) {
      day = '0' + day;
    };
    if (h < 10) {
      h = '0' + h;
    };
    if (m < 10) {
      m = '0' + m;
    };
    if (s < 10) {
      s = '0' + s;
    };
    var time = year + month + day + h + m + s;
    //var  alist = that.data.daytime.split('.');
    that.setData({
      submit_end_time:year+'-'+month+'-'+day+' '+[h, m].map(util1.formatNumber).join(':')
    });
    return time;
  },
  
  //点击的时间
  selectTimeHour:function(event){
    var that = this;
    var startDate=new Date(that.data.submit_begin_time);//显示的开始时间
    var atimeindex = event.currentTarget.dataset.index;//选中的时间索引
    if(atimeindex==3){
      //手动再选中通宵立即开始时，把开始时间改成当前时间
      startDate=new Date();
    }
    that.setData({
      select_time_index: atimeindex
    })
    that.MathDate(startDate);
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
  //充值
  goRecharge(){
    var that = this
    var storeId = that.data.storeId
    wx.navigateTo({
      url: '../recharge/recharge?storeId='+storeId,
    })
  },
  //设置支付类型
  goSelectPayType:function(e){
    var that = this;
    let aindex = e.currentTarget.dataset.index;

    if(that.data.scanCodeMsg.length>0){
      wx.showModal({
        title: '温馨提示',
        content: '您已输入团购券码，其他支付方式不再生效！',
        showCancel: false
      })
    }else{
      that.setData({
        payselectindex: aindex
      })
    }
  },
  //团购码
  bindscanCode:function(e){
    var that = this;
    //console.log('团购码++++');
    this.setData({
      scanCodeMsg: e.detail.value
    })
    if(e.detail.value.length>0){
      that.setData({
        payselectindex: 0,
        submit_couponInfo:{}
      });
    }else{
      that.setData({
        payselectindex: 1
      });
    }
  },
  //扫码
  scanCode: function () {
    var that = this;
    wx.scanCode({ //扫描API
      success(res) { //扫描成功
        //console.log(res) //输出回调信息
        that.setData({
          scanCodeMsg: res.result,
          payselectindex: 0
        });
        wx.showToast({
          title: '扫码成功',
          icon: 'success',
          duration: 1000
        })
      },
      fail: (res) => {//接口调用失败的回调函数
        wx.showToast({
          title: '扫码失败',
          icon: 'success',
          duration: 1000
        })
      },
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
  
  //设置列表禁用时间轴
  setroomlistHour:function(aindex){
    var that = this;
    var date = new Date(); //获取当前时间
    var year = date.getFullYear();
    var anewdate = that.data.daytime.replace(".", "-");
    var atimestring1 = [year, anewdate].map(util1.formatNumber).join('-')

    var atemplist = []; 
    var atemp = that.data.roominfodata.disabledTimeSlot;
    var requestkeyArr=[];
    var requestvalueArr=[];
    Object.keys(atemp).sort().forEach(function(key){
      if(key == atimestring1){
        requestkeyArr.push(key);
        requestvalueArr.push(atemp[key]);
      }
    });
    //console.log('得到了禁用的小时数=====');
    //console.log(atimestring1);
    //console.log(requestkeyArr);
    //console.log(requestvalueArr);
    //console.log('得到了禁用的小时数=====');
    if(!requestvalueArr.length){
      return
    }
    var listarr1 = requestvalueArr[aindex];//这个地方0的索引值就是日期选择的索引值
    if(listarr1)
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
    //console.log('整合后的=====');
    //console.log(atemplist);
    //console.log('整合后的=====');
    that.setData({
      timeHourAllArr: atemplist
    });
  },
  setshowSelectHour:function(){
    let that = this
    that.setData({
      showtimefalge: true
    })
  },
  //时间选择，点击确定
  timeChange:function(event){
    const { year, month, day, hour, minute } = this.formatDate(event.detail)
    let that = this;
    var begin_time = year+'/'+month+'/'+day+' '+ `${hour}:${minute}`
    console.info('选择的开始时间信息='+begin_time);
    //根据选中的小时按钮 计算出结束时间
    var startDate = new Date(begin_time);
    that.MathDate(startDate);
    that.setData({
      showtimefalge: false,
    })
  },
  //时间选择，点击取消
  timeCancel:function(){
    let that = this
    that.setData({
      showtimefalge: false
    })
  },
  //其他时间点击确定
  onTimeConfirm(event) {
    let that = this
    var value = event.detail.value
    var hour = Number(value.replace("小时", " "))
    var startDate=new Date(that.data.submit_begin_time);//显示的开始时间
    that.setData({
      order_hour: hour,
      show: false,
      select_time_index: 2
    })
    that.MathDate(startDate);
  },
  onTimeCancel(){
    this.setData({show: false})
  },
  // 点击其他时间
  otherTime(){
    this.setData({show: true})
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
  //获取优惠券列表数据
  getCouponListData:function(e){
    var that = this;
    let message = "";
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/user/getCouponPage",
        "1",
        "post", {
          "pageNo": 1,
          "pageSize": 100,
          "status": 0,
          "storeId": that.data.storeId
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          if (info.code == 0) {
            that.getCouponNumber(info.data);
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
  //获取可用优惠券数量
  getCouponNumber:function(event){
    var that = this;
    that.setData({
      couponCount:event.total
    })
  },
  //设置支付价格显示
  setshowpayMoney:function(acoupon){
    var that = this;
    var startDate=new Date(that.data.submit_begin_time);
    var price=this.getPrice(startDate);
    console.log('优惠券信息===');
    console.log(acoupon);
    if(acoupon){
      if(acoupon.type == 1){
        //减去时间对应费用
        var amoney =  (that.data.showprice-acoupon.price*price).toFixed(2);
        if(amoney<0){
          amoney = 0.0;
        }
        that.setData({
          showprice: amoney,
          pricestring: amoney
        });
      }else if(acoupon.type == 2){
        //直接减去费用
        var amoney = that.data.showprice-acoupon.price;
        if(amoney<0){
          amoney = 0.0;
        }
        that.setData({
          showprice: amoney,
          pricestring: amoney
        });
      }  
    }else{
      that.setData({
        showprice:(that.data.order_hour*price).toFixed(2),
        pricestring: (that.data.order_hour*price).toFixed(2)
      });
    }
  },
  MathDate:function(startDate){
    var that=this;
    var endDate = new Date(startDate.getTime());
    var nightLong=false;
    //先得出订单的时长
    var order_hour=that.data.order_hour;
    if(that.data.select_time_index == 0){
      order_hour=4;
      endDate=new Date(startDate.getTime()+1000*60*60*order_hour);
    }else if(that.data.select_time_index == 1){
      order_hour=6;
      endDate=new Date(startDate.getTime()+1000*60*60*order_hour);
    }else if(that.data.select_time_index == 2){
      //不用管 已经读取了选择的值
      endDate=new Date(startDate.getTime()+1000*60*60*order_hour);
    }else if(that.data.select_time_index == 3){
      //通宵立即开始 
      nightLong=true;
      //取通宵的时长
      order_hour=that.data.txHour;
      //判断开始时间 是否在通宵场的范围内 有两种情况 结束时间在当日和次日
      if(startDate.getHours()<that.data.txStartHour){
        //如果是凌晨4点之后的  那么就要加上当前时间至通宵开始时间的时间差
        if(startDate.getHours() >= 4){
          var txStartDate = new Date(startDate.getTime());
          txStartDate.setHours(that.data.txStartHour);
          txStartDate.setMinutes(0)
          txStartDate.setSeconds(0)
          txStartDate.setMilliseconds(0);
          order_hour=order_hour+(txStartDate.getTime()-startDate.getTime())/1000/60/60;
          order_hour=order_hour.toFixed(2);
        }
      }
      endDate=new Date(startDate.getTime()+1000*60*60*order_hour);
    }else if(that.data.select_time_index == 4){
      nightLong=true;
      //取通宵的时长
      order_hour=that.data.txHour;
      //判断开始时间 是否在通宵场的范围内 有两种情况 结束时间在当日和次日
      if(startDate.getHours() < that.data.txStartHour){
        //如果是凌晨4点之后的  那么开始时间就要改为当日通宵开始小时
        if(startDate.getHours() >= 4){
          startDate.setHours(that.data.txStartHour);
          startDate.setMinutes(0)
          startDate.setSeconds(0)
          startDate.setMilliseconds(0);
        }
      }
      //取通宵的时长
      order_hour=that.data.txHour;
      endDate=new Date(startDate.getTime()+1000*60*60*order_hour);
    }
    that.setData({
      nightLong:nightLong,
      order_hour:order_hour,
      submit_couponInfo:{},//清空优惠券
      submit_begin_time: this.formatDate(startDate.getTime()).text,
      submit_end_time: this.formatDate(endDate.getTime()).text,
      view_begin_time: this.formatViewDate(startDate.getTime()).text,
      view_end_time: this.formatViewDate(endDate.getTime()).text,
    })
    that.MathPrice();
  },
  getPrice:function(startDate){
    //根据日期是否为工作日 返回对应的价格
    var that=this;
    var day= startDate.getDay();
    console.log(that.data.enableWorkPrice);
    console.log(that.data.workPrice);
    console.log(that.data.price);
    switch (day) {
      case 1:
      case 2:
      case 3:
      case 4:
        //如果门店禁用了工作日价格  就还是返回正常价格
        if(that.data.enableWorkPrice){
          return that.data.workPrice;
        }else{
          return that.data.price;
        }
      case 0:
      case 5:
      case 6:
        return that.data.price;
    }
  }
})