// pages/orderSubmit/orderSubmit.js
const app = getApp();
var http = require("../../utils/http");
var util1 = require("../../utils/util.js");
var moment = require("../../lib/moment.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    appName: app.globalData.appName,
    storeId: "",
    roomId: "", //房间id
    price: 0, //房间单价
    workPrice: 0, //工作日房间单价
    txPrice: 0.0, //通宵场价格
    txNowPrice: 0.0,
    timeselectindex: 0, //选择的日期索引位置
    roominfodata: {}, //房间展示信息
    pkgList: [],
    select_time_index: 0,
    select_pkg_index: -1,
    minDay: "", //可选最小时间
    maxDay: "", //可选最大时间
    minHour: "", //可选最小小时
    enableWorkPrice: "", //启用工作日价格
    leadHour: "", //提前开始时间
    // leadDay: "", //提前下单天数
    txStartHour: "", //通宵起始小时
    txHour: "", //通宵时长
    clearTime: "", //订单清洁时间
    userinfo: {}, //用户信息
    payselectindex: 1, //支付类型索引值
    doorname: "", //门店名称
    timeHourAllArr: [],
    hour_options: [],
    other_hour_options: [],
    order_hour: "",
    //订单提交
    submit_couponInfo: {}, //选中的提交的优惠券信息
    submit_begin_time: "", //开始时间
    submit_end_time: "", //结束时间
    view_begin_time: "", //显示开始时间
    view_end_time: "", //显示结束时间
    nightLong: false, //是否通宵
    orderNo: "", //支付订单号
    pkgId: "",
    preSubmit: false,//是否预付费下单
    // couponId:'',//优惠券Id,示例值(31071)
    scanCodeMsg: "", //团购券码 填了团购券时，其他支付方式均不生效
    pricestring: 0.0, //支付金额
    showprice: 0.0, //原价金额
    // coupon_hour_time:0,//优惠小时
    // coupon_price:0,//优惠金额
    // coupon_old_price:0,//优惠后的金额
    ///////////////
    couponCount: 0,
    couponInfo: "",
    currentDate: "",
    showtimefalge: false,
    show: false,
    giftBalance: 0,
    balance: 0,
    isIpx: app.globalData.isIpx ? true : false,
    isLogin: app.globalData.isLogin,
    formatter(type, value) {
      if (type === "year") {
        return `${value}年`;
      }
      if (type === "month") {
        return `${value}月`;
      }
      if (type === "day") {
        return `${value}日`;
      }
      if (type === "hour") {
        return `${value}时`;
      }
      if (type === "minute") {
        return `${value}分`;
      }
      return value;
    },
    minDay: new Date().getTime(),
    maxDay: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).getTime(),
    curTime: "",
    background: ["demo-text-1", "demo-text-2", "demo-text-3"],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    daySlot: [],
    dayIndex: 0,
    modeIndex: 0,
    cardList: [],
    packCardIndex: -1,
    orderTimeList: [],
    showReserve: false,
    showGroupsPay: false, // 是否展示团购券信息
    voucherInfo: {},
    groupPays: [], // 优惠券信息
    clickItem: 0, // 点击的团购券位置 默认0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("onload");
    var that = this;
    var storeId = options.storeId;
    var roomId = options.roomId;
    var timeselectindex = options.timeselectindex;
    var goPage = options.goPage;
    const storeName = options.storeName;
    if (goPage) {
      //点按钮跳转的
    } else {
      var query = wx.getEnterOptionsSync().query;
      console.log(query);
      if (query) {
        if (query.storeId) {
          storeId = query.storeId;
        }
        if (query.roomId) {
          roomId = query.roomId;
        }
        if (query.timeselectindex) {
          timeselectindex = query.timeselectindex;
        }
      }
    }
    var startDate = new Date();
    that.setData({
      storeId: storeId,
      roomId: roomId,
      storeName: storeName,
      // startDate: new Date(),
      submit_begin_time: that.formatDate(startDate).text,
      timeselectindex: timeselectindex,
    });
    
    that.daySlotInit();
    wx.setStorageSync("global_store_id", storeId);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    var that = this;
    var _app = getApp();
    that.setData({
      isLogin: _app.globalData.isLogin,
    });
    if (!that.data.goPage) {
      //扫码过来的 延时0.5秒
      setTimeout(() => {
        wx.showLoading({
          title: '请稍等',
        })
        that.setData({
          isLogin: app.globalData.isLogin,
        });
      }, 500);
      wx.hideLoading()
    }
    that.getroomInfodata(that.data.roomId).then((res) => { 
      that.getCouponListData();
      that.getStoreBalance();
    });
    if (app.globalData.isLogin) {
      that.getGroupPay();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() { },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() { },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() { },

  // 去优惠券页面
  goCoupon() {
    var that = this;
    if (that.data.scanCodeMsg.length > 0) {
      wx.showModal({
        title: "温馨提示",
        content: "您已输入团购券码，无法再选择优惠券！",
        showCancel: false,
      });
    } else if (that.data.select_pkg_index != -1) {
      wx.showModal({
        title: "温馨提示",
        content: "您已选择套餐支付，无法再选择优惠券！",
        showCancel: false,
      });
    } else {
      wx.navigateTo({
        url:
          "../coupon/coupon?from=1&roomId=" +
          that.data.roominfodata.roomId +
          "&orderHours=" +
          that.data.order_hour +
          "&nightLong=" +
          that.data.nightLong +
          "&startTime=" +
          that.data.submit_begin_time +
          "&endTime=" +
          that.data.submit_end_time,
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          pageDataList: function (data) {
            console.log("页面B触发事件时传递的数据1：", data);
            that.setData({
              submit_couponInfo: data,
              goPage: true
            });
          },
          pageDataList_no: function (data) {
            console.log('页面B触发事件时传递的数据2：',data)
            that.setData({
              submit_couponInfo: {},
              goPage: true
            });
          },
        },
      });
    }
  },
  // 去订单详情页
  goOrderDetail() {
    wx.navigateTo({
      url: "../orderDetail/orderDetail?toPage=true",
    });
  },
  //计算订单价格
  MathPrice: function () {
    console.log("MathPrice");
    var that = this;
    if (!that.data.nightLong) {
      var hour = that.data.order_hour;
      if (!hour) {
        hour = that.data.minHour;
        that.setData({
          order_hour: hour,
        });
      }
    }
    console.log('优惠券:',that.data.submit_couponInfo);
    //计算价格
    http.request(
      "/member/order/preOrder",
      "1",
      "post",
      {
        roomId: that.data.roomId,
        payType: that.data.payselectindex,
        couponId: that.getCouponId(),
        pkgId: that.data.pkgId,
        nightLong: that.data.nightLong,
        startTime: that.data.submit_begin_time,
        endTime: that.data.submit_end_time,
        preSubmit: false,
        wxPay: false,
        userCardId: that.data.packCardIndex >= 0 ? that.data.cardList[that.data.packCardIndex].cardId : ''
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          that.data.orderNo = info.data.orderNo;
          let price = info.data.payPrice / 100.0;
          that.setData({
            pricestring: price,
            showprice: price,
          });
        } else {
          wx.showToast({
            title: info.msg,
            icon: 'none',
            duration: 2000,
            mask: true
          })
        }
      },
      function fail(info) { }
    );
  },
  getCouponId(){
    var that = this;
    if (that.data.submit_couponInfo) {
      return that.data.submit_couponInfo.couponId;
    }
    return '';
  },

  // 预支付
  SubmitOrderInfoData() {
    console.log('SubmitOrderInfoData');
    var that = this;
    if (app.globalData.isLogin) {
      let preSubmit = that.data.modeIndex == 4;
      http.request(
        "/member/order/preOrder",
        "1",
        "post",
        {
          roomId: that.data.roomId,
          payType: that.data.payselectindex,
          couponId: that.getCouponId(),
          pkgId: that.data.pkgId,
          nightLong: that.data.nightLong,
          startTime: that.data.submit_begin_time,
          endTime: that.data.submit_end_time,
          preSubmit: preSubmit,
          userCardId: that.data.packCardIndex >= 0 ? that.data.cardList[that.data.packCardIndex].cardId : ''
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          console.info("支付信息===");
          console.log("that.data.payselectindex:" + that.data.payselectindex);
          if (info.code == 0) {
            that.data.orderNo = info.data.orderNo;
            if (that.data.payselectindex == 1) {
              //选择的是微信支付
              if (that.data.pricestring <= 0.0) {
                //订单金额为0元的时候，不走微信支付，直接订单提交
                that.submitorder();
              } else {
                that.lockWxOrder(info);
              }
            } else if (
              that.data.payselectindex == 2 ||
              that.data.payselectindex == 3 ||
              that.data.payselectindex == 5
            ) {
              //余额或团购支付
              //如果需要押金
              if (that.data.roominfodata.deposit) {
                that.lockWxOrder(info);
              } else {
                //直接提交
                that.submitorder();
              }
            } else if (that.data.payselectindex == 4) {
              //套餐支付
              //直接走微信
              that.lockWxOrder(info);
            }
          } else {
            wx.showModal({
              title: "温馨提示",
              content: info.msg,
              showCancel: false,
              confirmText: "确定",
              success(res) { },
            });
          }
        },
        function fail(info) { }
      );
    }
  },
  // 锁定微信订单
  lockWxOrder: function (pay) {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/lockWxOrder",
        "1",
        "post",
        {
          roomId: that.data.roomId,
          couponId: that.getCouponId(),
          nightLong: that.data.nightLong,
          startTime: that.data.submit_begin_time,
          endTime: that.data.submit_end_time,
          payType: 1,
          preSubmit: that.data.modeIndex == 4,
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          if (info.code == 0) {
            console.log("锁定微信支付订单");
            that.payMent(pay); //微信支付
          } else {
            wx.showModal({
              title: "温馨提示",
              content: info.msg,
              showCancel: false,
              confirmText: "确定",
              success(res) { },
            });
          }
        },
        function fail(info) { }
      );
    }
  },
  //支付
  payMent: function (pay) {
    wx.requestPayment({
      timeStamp: pay.data.timeStamp,
      nonceStr: pay.data.nonceStr,
      package: pay.data.pkg,
      signType: pay.data.signType,
      paySign: pay.data.paySign,
      success: function (res) {
        //进入订单详情页  订单由支付回调函数创建
        setTimeout(function () {
          wx.navigateTo({
            url: "../orderDetail/orderDetail?toPage=true",
          });
        }, 1000);
      },
      fail: function (res) {
        console.log("*************支付失败");
        console.log(res);
        wx.showToast({
          title: "支付失败!",
          icon: "error",
        });
        //console.log('*************支付失败');
      },
      complete: function (res) {
        //console.log('*************支付完成');
      },
    });
  },
  //提交订单
  submitorder: function () {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/save",
        "1",
        "post",
        {
          roomId: that.data.roomId,
          couponId: that.getCouponId(),
          pkgId: that.data.pkgId,
          nightLong: that.data.nightLong,
          startTime: that.data.submit_begin_time,
          endTime: that.data.submit_end_time,
          payType: that.data.payselectindex,
          groupPayNo: that.data.scanCodeMsg,
          orderNo: that.data.orderNo,
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          console.info("提交订单信息===");
          console.info(info);
          if (info.code == 0) {
            if (info.msg) {
              wx.showToast({
                title: info.msg,
                icon: "none",
              });
            } else {
              wx.showToast({
                title: "预定成功！",
                icon: "success",
              });
            }
            setTimeout(function () {
              wx.navigateTo({
                url:
                  "../orderDetail/orderDetail?toPage=true&OrderNo=" + info.data,
              });
            }, 1000);
          } else {
            wx.showModal({
              title: "温馨提示",
              content: info.msg,
              showCancel: false,
              confirmText: "确定",
              success(res) { },
            });
          }
        },
        function fail(info) { }
      );
    }
  },
  //获取房间信息
  getroomInfodata: function (roomId) {
    return new Promise((r, t) => {
      var that = this;
      http.request(
        "/member/index/getRoomInfo" + "/" + roomId,
        "1",
        "post",
        {
          roomId: roomId,
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          if (info.code == 0) {
            var minHour = info.data.minHour;
            var hour_options = [];
            for (let i = 0; i < 3; i++) {
              // minHour=minHour+1;
              hour_options.push(minHour + i);
            }
            var other_hour_options = [];
            for (let i = 0; i < 20; i++) {
              // minHour=minHour+1;
              other_hour_options.push(minHour + i + "小时");
            }
            const timeText = that.timeFilter(
              info.data.startTime,
              info.data.endTime
            );
            let orderTimeList = []
            if (info.data.orderTimeList) {
              orderTimeList = info.data.orderTimeList.map(item => that.timeFilter(
                item.startTime,
                item.endTime
              ))
            }
            that.setData({
              roominfodata: info.data,
              price: info.data.price,
              minHour: info.data.minHour,
              leadHour: info.data.leadHour,
              // leadDay: info.data.leadDay,
              txStartHour: info.data.txStartHour,
              txHour: info.data.txHour,
              txPrice: info.data.tongxiaoPrice,
              clearTime: info.data.clearTime,
              workPrice: info.data.workPrice,
              enableWorkPrice: info.data.enableWorkPrice,
              hour_options: hour_options,
              other_hour_options: other_hour_options,
              storeId: info.data.storeId,
              timeHourAllArr: info.data.timeSlot.slice(0, 24),
              orderTimeList,
              timeText
            });
            
            that.MathDate(new Date(that.data.submit_begin_time));
            r();
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
            t();
          }
        },
        function fail(info) {t(); }
      );
    });
  },
  formatDate(dateTime) {
    const date = new Date(dateTime);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    if (minute < 10) {
      minute = `0${minute}`;
    }
    if (hour < 10) {
      hour = `0${hour}`;
    }
    if (day < 10) {
      day = `0${day}`;
    }
    if (month < 10) {
      month = `0${month}`;
    }
    return {
      text: `${year}/${month}/${day} ${hour}:${minute}`,
      year,
      month,
      day,
      hour,
      minute,
    };
  },
  formatViewDate(dateTime) {
    const date = new Date(dateTime);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    if (minute < 10) {
      minute = `0${minute}`;
    }
    if (hour < 10) {
      hour = `0${hour}`;
    }
    if (day < 10) {
      day = `0${day}`;
    }
    if (month < 10) {
      month = `0${month}`;
    }
    return {
      text: `${hour}:${minute}`,
    };
  },
  haveSomeMinutesTime: function (newDate, n) {
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
      month = "0" + month;
    }
    if (day < 10) {
      day = "0" + day;
    }
    if (h < 10) {
      h = "0" + h;
    }
    if (m < 10) {
      m = "0" + m;
    }
    if (s < 10) {
      s = "0" + s;
    }
    var time = year + month + day + h + m + s;
    that.setData({
      submit_end_time:
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        [h, m].map(util1.formatNumber).join(":"),
    });
    return time;
  },

  //点击的时间
  selectTimeHour: function (event) {
    var that = this;
    var atimeindex = event.currentTarget.dataset.index; //选中的时间索引
    var hour = event.currentTarget.dataset.hour;
    var nightLong = false;
    console.log("点击的小时：", hour);
    var startDate = null;
    var payselectindex = 1;
    if (atimeindex == that.data.select_time_index) {
      that.setData({
        select_time_index: -1,
        pkgId: '',
      })
    } else {
      if (atimeindex == 99) {
        startDate = new Date();
        hour = 99;//计算时间时会自动设置成正确的时长
        nightLong = true;
      } else {
        //如果之前是通宵，又点的小时，那么开始时间设置为现在开始
        if (that.data.select_time_index == 99) {
          startDate = new Date();
        } else {
          startDate = new Date(that.data.submit_begin_time);//显示的开始时间
        }
      }
      if (that.data.scanCodeMsg) {
        payselectindex = 3;
      }
      that.setData({
        payselectindex: payselectindex,
        select_time_index: atimeindex,
        select_pkg_index: -1,
        submit_couponInfo: {},
        pkgId: '',
        order_hour: hour,
        nightLong: nightLong,
      })
      that.MathDate(startDate);
    }
  },

  getuserinfo: function () {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/get",
        "1",
        "get",
        {},
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info("我的信息===");
          console.info(info);
          if (info.code == 0) {
            that.setData({
              userinfo: info.data,
            });
          }
        },
        function fail(info) { }
      );
    } else {
      //console.log('未登录失败！')
    }
  },
  //充值
  goRecharge() {
    var that = this;
    var storeId = that.data.storeId;
    wx.switchTab({
      url: "../recharge/recharge?storeId=" + storeId,
    });
  },
  //设置支付类型
  goSelectPayType: function (e) {
    var that = this;
    let aindex = e.currentTarget.dataset.index;
    if (that.data.scanCodeMsg.length > 0) {
      wx.showModal({
        title: "温馨提示",
        content: "您已输入团购券码，其他支付方式不再生效！",
        showCancel: false,
      });
      // }else  if(that.data.select_pkg_index>-1){
      //   wx.showModal({
      //     title: '温馨提示',
      //     content: '您已选择套餐支付，其他支付方式不再生效！',
      //     showCancel: false
      //   })
    } else {
      that.setData({
        payselectindex: aindex,
      });
    }
  },
  //团购码
  bindscanCode: function (e) {
    var that = this;
    //console.log('团购码++++');
    that.setData({
      scanCodeMsg: e.detail.value,
      pricestring: 0,
      preSubmit: false,
    });
    console.log(e.detail.value.length)
    console.log('e.detail.value.length')
    if (e.detail.value.length > 0) {
      that.setData({
        payselectindex: 3,
        submit_couponInfo: {},
        pkgId: "",
        select_pkg_index: -1,
      });

      if (e.detail.value.length >= 10) {
        that.checkGroup();
      }
    } else {
      that.setData({
        payselectindex: 1,
      });
      that.MathPrice();
    }
  },
  //扫码
  scanCode: function () {
    var that = this;
    wx.scanCode({
      //扫描API
      success(res) {
        //扫描成功
        //console.log(res) //输出回调信息
        that.setData({
          scanCodeMsg: res.result,
          payselectindex: 3,
        });
        wx.showToast({
          title: "扫码成功",
          icon: "success",
          duration: 1000,
        });
      },
      fail: (res) => {
        //接口调用失败的回调函数
        wx.showToast({
          title: "扫码失败",
          icon: "success",
          duration: 1000,
        });
      },
    });
  },
  sethour: function () {
    var that = this;
    var timearr = [];
    for (var i = 0; i < 24; i++) {
      var atemp = {
        hourname: "", //小时
        useflage: false, //是否可以使用
      };
      atemp.hourname = i;
      atemp.useflage = false;
      timearr.push(atemp);
    }
    that.setData({
      timeHourArr: timearr,
    });
  },

  setshowSelectHour: function () {
    let that = this;
    console.log('setshowSelectHour:', that.data.submit_begin_time);
    that.setData({
      currentDate: new Date(that.data.submit_begin_time),
      showtimefalge: true,
    });
  },
  //时间选择，点击确定
  timeChange: function (event) {
    console.log('.timeChange:', this.data.nightLong);
    const { year, month, day, hour, minute } = this.formatDate(event.detail);
    let that = this;
    var begin_time = year + "/" + month + "/" + day + " " + `${hour}:${minute}`;
    console.info("选择的开始时间信息=" + begin_time);
    //根据选中的小时按钮 计算出结束时间
    var startDate = new Date(begin_time);
    that.MathDate(startDate);
    that.setData({
      showtimefalge: false,
    });
  },
  //时间选择，点击取消
  timeCancel: function () {
    let that = this;
    that.setData({
      showtimefalge: false,
    });
  },

  //获取优惠券列表数据
  getCouponListData: function (e) {
    var that = this;
    let message = "";
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/getCouponPage",
        "1",
        "post",
        {
          pageNo: 1,
          pageSize: 100,
          status: 0,
          storeId: that.data.storeId,
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          if (info.code == 0) {
            that.setData({
              couponCount: info.data.total,
            });
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) { }
      );
    }
  },
  MathDate: function (startDate) {
    var that = this;
    //先得出订单的时长
    var order_hour = that.data.order_hour;
    //没有选时间 默认为最低下单时间
    if (!order_hour) {
      order_hour = that.data.minHour;
      that.setData({
        order_hour: order_hour,
      });
    }
    var nightLong = that.data.nightLong;
    if (nightLong || order_hour == 99) {
      //取通宵的时长
      order_hour = that.data.txHour;
      //判断开始时间 是否在通宵场的范围内 有两种情况 结束时间在当日和次日
      if (startDate.getHours() < that.data.txStartHour) {
        //如果是凌晨4点之后的  那么开始时间就要改为当日通宵开始小时
        if (startDate.getHours() >= 4) {
          startDate.setHours(that.data.txStartHour);
          startDate.setMinutes(0);
          startDate.setSeconds(0);
          startDate.setMilliseconds(0);
        }
      }
      var endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * order_hour);
      that.setData({
        nightLong: true,
        order_hour: order_hour,
        // submit_couponInfo: {}, //清空优惠券
        submit_begin_time: this.formatDate(startDate.getTime()).text,
        submit_end_time: this.formatDate(endDate.getTime()).text,
        view_begin_time: this.formatViewDate(startDate.getTime()).text,
        view_end_time: this.formatViewDate(endDate.getTime()).text,
      });
    } else {
      var endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * order_hour);
      that.setData({
        nightLong: false,
        order_hour: order_hour,
        // submit_couponInfo: {}, //清空优惠券
        submit_begin_time: this.formatDate(startDate.getTime()).text,
        submit_end_time: this.formatDate(endDate.getTime()).text,
        view_begin_time: this.formatViewDate(startDate.getTime()).text,
        view_end_time: this.formatViewDate(endDate.getTime()).text,
      });
    }
    that.MathPrice();
  },
  getPrice: function (startDate) {
    //根据日期是否为工作日 返回对应的价格
    var that = this;
    var day = startDate.getDay();
    console.log(that.data.enableWorkPrice);
    console.log(that.data.workPrice);
    console.log(that.data.price);
    switch (day) {
      case 1:
      case 2:
      case 3:
      case 4:
        //如果门店禁用了工作日价格  就还是返回正常价格
        if (that.data.enableWorkPrice) {
          return that.data.workPrice;
        } else {
          return that.data.price;
        }
      case 0:
      case 5:
      case 6:
        return that.data.price;
    }
  },
  getPkgList: function (e) {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/pkg/getPkgPage",
        "1",
        "post",
        {
          storeId: that.data.storeId,
          roomId: that.data.roomId,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            const newMeals = info.data.list.map((el) => ({
              ...el,
              desc: that.convertEnableWeek(el.enableWeek),
              // 需要修改的方法
              timeQuantum: that.convertTime(el.enableTime),
              // that.convertEnableTime(el.enableTime),
            }));
            that.setData({
              pkgList: newMeals,
            });
            if (info.data.list.length > 0) {
              that.setData({
                select_pkg_index: 0,
                pkgId: info.data.list[0].pkgId,
                order_hour: info.data.list[0].hours,
              })
              that.MathDate(new Date(that.data.submit_begin_time));
            }
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) { }
      );
    }
  },
  convertTime(numbers) {
    if (numbers.length === 0) {
      return [];
    }
    let result = [];
    let start = numbers[0];
    let end = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] === end + 1) {
        end = numbers[i];
      } else {
        result.push(`${start}~${end}`);
        start = numbers[i];
        end = numbers[i];
      }
    }
    result.push(`${start}~${end}`);
    return result;
  },
  //点击的套餐
  selectPkgInfo: function (event) {
    var that = this;
    if (that.data.scanCodeMsg.length > 0) {
      wx.showModal({
        title: "温馨提示",
        content: "您已输入团购券码，其他支付方式不再生效！",
        showCancel: false,
      });
    } else {
      var pkgIndex = event.currentTarget.dataset.index; //选中的时间索引
      var pkgId = event.currentTarget.dataset.id; //选中的时间索引
      var hour = event.currentTarget.dataset.hour; //选中的时间索引
      if (pkgIndex == -1) {
        pkgId = "";
      }
      var startDate = new Date(that.data.submit_begin_time); //显示的开始时间
      var endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * hour);
      that.setData({
        select_pkg_index: pkgIndex,
        pkgId: pkgId,
        order_hour: hour,
        nightLong: false,
        submit_couponInfo: {}, //清空优惠券
        payselectindex: 4,
        select_time_index: -1,
        submit_begin_time: this.formatDate(startDate.getTime()).text,
        submit_end_time: this.formatDate(endDate.getTime()).text,
        view_begin_time: this.formatViewDate(startDate.getTime()).text,
        view_end_time: this.formatViewDate(endDate.getTime()).text,
      });
      that.MathPrice();
    }
  },
  // 点击其他时间
  otherTime() {
    this.setData({ show: true });
  },
  onTimeCancel() {
    this.setData({ show: false });
  },
  //其他时间点击确定
  onTimeConfirm(event) {
    let that = this;
    var value = event.detail.value;
    var hour = Number(value.replace("小时", " "));
    var startDate = new Date(that.data.submit_begin_time); //显示的开始时间
    that.setData({
      order_hour: hour,
      show: false,
      select_time_index: 999,
      select_pkg_index: -1,
      pkgId: "",
      nightLong: false,
    });
    that.MathDate(startDate);
  },
  handleExchange() {
    wx.navigateBack();
  },
  timeFilter(startTime, endTime) {
    if (startTime && !endTime) {
      return moment(startTime).format("MM月DD日HH:mm");
    } else if (startTime && endTime) {
      const start = moment(startTime);
      const end = moment(endTime);
      return `${start.format("MM月DD日HH:mm")}-${end.format("HH:mm")}`;
    } else {
      return "";
    }
  },
  handleScroll(e) {
    const { scrollLeft, scrollWidth } = e.detail;
    let itemLength = 0;
    if (this.data.modeIndex === 1 && this.data.pkgList.length) {
      itemLength = scrollWidth / this.data.pkgList.length;
    } else if (this.data.modeIndex === 2) {
    }
    const position = scrollLeft / (scrollWidth - itemLength);
    this.setData({
      scrollPosition: position * 100,
    });
  },
  handleScrollStart() {
    this.setData({
      scrollPosition: 0,
    });
  },
  daySlotInit() {
    const today = moment();
    const dates = [];
    const weekdays = [
      "星期日",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
    ];

    for (let i = 0; i < 5; i++) {
      const date = today.clone().add(i, "days");
      const day = date.format("MM-DD");
      const dayOrigin = date.format("YYYY/MM/DD");
      let desc = "";

      if (i === 0) {
        desc = "今天";
      } else if (i === 1) {
        desc = "明天";
      } else {
        const weekday = date.day();
        desc = weekdays[weekday];
      }

      dates.push({ dayOrigin, day, desc });
    }

    this.setData({
      daySlot: dates,
    });
  },
  handleDayChange(e) {
    const dayOrigin = e.currentTarget.dataset.day;

    const originalMoment = moment(
      this.data.submit_begin_time,
      "YYYY/MM/DD HH:mm"
    );
    const newDate = moment(dayOrigin, "YYYY/MM/DD");

    const updatedMoment = originalMoment.set({
      year: newDate.year(),
      month: newDate.month(),
      date: newDate.date(),
    });
    this.setData({
      dayIndex: e.currentTarget.dataset.index,
      submit_begin_time: updatedMoment.format("YYYY/MM/DD HH:mm"),
    });
    this.MathDate(new Date(this.data.submit_begin_time));
  },
  modeChange(e) {
    var that = this;
    const { index } = e.target.dataset;
    that.setData({
      modeIndex: +index,
      scrollPosition: 0,
      packCardIndex: - 1
    });
    if (index == 0) {
      //小时模式
      that.setData({
        select_time_index: 0,
        select_pkg_index: -1,
        pkgId: '',
        order_hour: that.data.hour_options[0],
        preSubmit: false,
      })
      that.MathDate(new Date(that.data.submit_begin_time));
    } else if (index == 1) {
      that.getPkgList();
      //套餐模式
      that.setData({
        select_time_index: -1,
        scanCodeMsg: '',
        pricestring: 0,
        preSubmit: false,
      })
    } else if (index == 4) {
      //预付费模式
      that.setData({
        select_time_index: -1,
        scanCodeMsg: '',
        pkgId: '',
        select_pkg_index: -1,
        pricestring: that.data.roominfodata.prePrice,
        nightLong: false,
        submit_end_time: that.data.submit_begin_time,
        preSubmit: true,
      })
    }
  },
  convertEnableTime(enableTime) {
    if (
      (enableTime.length === 24 &&
        enableTime.every((num, index) => num === index)) ||
      enableTime.length === 0
    ) {
      return "全天可用";
    } else {
      const startTime = enableTime[0].toString().padStart(2, "0");
      const endTime = enableTime[enableTime.length - 1]
        .toString()
        .padStart(2, "0");
      return `${startTime}:00 - ${endTime}:00可用`;
    }
  },
  convertEnableWeek(enableWeek) {
    const weekdays = ["一", "二", "三", "四", "五", "六", "周日"];
    const selectedWeekdays = enableWeek.map((day) => weekdays[day - 1]);

    if (enableWeek.length === 7 || enableWeek.length === 0) {
      return "周一至周日";
    } else {
      return `周${selectedWeekdays.join("、")}可用`;
    }
  },
  // 获取包时卡列表
  getCardPage(storeId) {
    const that = this
    http.request(
      `/member/card/getMyCardPage`,
      "1",
      "post",
      {
        "pageNo": 1,
        "pageSize": 100,
        "storeId": storeId || this.data.storeId,
        userId: app.globalData.userDatatoken.userId
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          that.setData({
            cardList: info.data.list.map(el => {
              return {
                ...el,
                enableWeekText: that.convertEnableWeek(el.enableWeek),
                enableTimeText: that.convertEnableTime(el.enableTime)
              }
            })
          })
        } else {
          wx.showModal({
            content: info.msg || "请求服务异常，请稍后重试",
            showCancel: false,
          });
        }
      },
      function fail(info) { }
    );
  },
  onSelectCard(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      packCardIndex: index,
      payselectindex: 5
    })
  },
  onShowReserve() {
    this.setData({
      showReserve: true
    })
  },
  onHideReserve() {
    this.setData({
      showReserve: false,
    })
  },
  //   获取团购券
  getGroupPay: function () {
    let that = this
    if (app.globalData.isLogin) {
      http.request(
        "/member/index/groupPay/getListByPhone",
        "1",
        "post", {
        "storeId": that.data.storeId
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            let groupPays = info.data
            that.setData({
              groupPays: groupPays,
              showGroupsPay: groupPays && groupPays.length > 0 ? true : false
            })
          }
        },
        function fail(info) {
        }
      )
    }
  },
  getIndex: function (e) {
    let that = this
    let index = e.currentTarget.dataset.index
    that.setData({
      clickItem: index
    })
    console.log(that.data.clickItem)
  },
  gotoUse: function (e) {
    let that = this;
    let item = e.currentTarget.dataset.item;
    that.setData({
      showGroupsPay: false
    })
    console.log(item)
    that.setData({
      scanCodeMsg: item.ticketNo,
      pricestring: 0,
      payselectindex: 3,
      submit_couponInfo: {},
      pkgId: "",
      select_pkg_index: -1,
      preSubmit: false,
    })
    that.checkGroup();
  },
  cancelUser: function () {
    let that = this
    that.setData({
      showGroupsPay: false
    })
  },
  // 获取团购券时长
  checkGroup: function () {
    var that = this;
    if (
      !that.data.scanCodeMsg
    ) {
      wx.showToast({
        title: "请填写完整",
      });
      return;
    }
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/preGroupNo",
        "1",
        "post",
        {
          storeId: that.data.storeId,
          code: that.data.scanCodeMsg,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info(info);
          if (info.code == 0) {
            that.setData({
              voucherInfo: info.data,
              order_hour: info.data.hours,
            });
            that.MathDate(new Date())
          } else {
          }
        },
        function fail(info) { }
      );
    } else {
      //console.log('未登录失败！')
    }
  },
  // 获取门店余额
  getStoreBalance: function () {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/getStoreBalance/" + that.data.storeId,
        "1",
        "get", {
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('赠送余额===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              giftBalance: info.data.giftBalance,
              balance: info.data.balance
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

});
