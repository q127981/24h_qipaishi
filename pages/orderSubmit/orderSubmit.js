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
    isLogin: app.globalData.isLogin,
    statusBarHeight: 0,
    storeId: "", //门店id
    roomId: "", //房间id
    goPage: "", //是否页面跳转的
    groupPayNo: "", //团购券
    groupPayTitle: "", //团购券名称
    timeHourAllArr: [], //被占用时间轴
    roominfodata: "", //房间信息
    orderTimeList: [], //房间已占用的订单列表
    hour_options: [], //小时选择选项列表
    couponList: [], //用户的优惠券列表
    showCouponSelect: false, //是否显示优惠券选择
    submit_couponId: "", //选中使用的优惠券
    submit_couponName: "", //选择的优惠券名称
    select_coupon_index: -1, //选中的优惠券索引
    timeText: "", //被占用时间
    submit_begin_time: "", //订单开始时间
    view_begin_time: "", //显示的开始时间 HH：mm
    submit_end_time: "", //订单结束时间
    view_end_time: "", //显示的结束时间 HH：mm
    showReserve: false, //显示被预定时间列表
    xiaoshiShow: false, //小时开台
    tuangouShow: false, //团购开台
    taocanShow: false, //套餐开台
    yajinShow: false, //押金开台
    typeIndex: 0, //开台类型
    couponShow: false, //优惠券选择
    select_time_index: 0, //选择的时间索引
    select_pkg_index: 0, //选择的套餐索引
    payPrice: 0, //显示的支付金额
    order_hour: 0, //订单的小时
    orderNo: "", //订单号
    timeSelectShow: false, //时间选择组件
    dayIndex: 0, //选择的日期组件
    timeSelectList: [], //时间选择列表
    pkgId: "", //选择的套餐
    nightLong: false, //旧版本是否通宵场的判断条件
    showYeepay: false, //是否打开了易宝支付
    isNfc: '',
    currentOrder: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("onload options");
    console.log(options);
    var that = this;
    var storeId = options.storeId;
    var roomId = options.roomId;
    var nfc = options.nfc;
    var goPage = options.goPage;
    var groupPayNo = "";
    if (options.groupPayNo) {
      groupPayNo = options.groupPayNo;
    }
    if (goPage) {
      //点按钮跳转的
    } else {
      //扫码的
      var query = wx.getEnterOptionsSync().query;
      console.log("onload query");
      console.log(query);
      if (query) {
        if (query.storeId) {
          storeId = query.storeId;
        }
        if (query.roomId) {
          roomId = query.roomId;
        }
        if (query.nfc) {
          nfc = query.nfc;
        }
      }
    }
    var startDate = new Date();
    that.setData({
      storeId: storeId,
      roomId: roomId,
      groupPayNo: groupPayNo,
      goPage: goPage,
      isNfc: nfc,
      submit_begin_time: that.formatDate(startDate).text,
    });
    wx.setStorageSync("global_store_id", storeId);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    var that = this;
    var _app = getApp();
    console.log('onShow...');
    that.setData({
      isLogin: _app.globalData.isLogin,
      xiaoshiShow: false, //小时开台
      tuangouShow: that.data.groupPayNo?true:false, //团购开台
      taocanShow: false, //套餐开台
      yajinShow: false, //押金开台
    });
    if (that.data.showYeepay && that.data.orderNo) {
      //支付完过来的 清除跳转标记
      that.setData({
        showYeepay: false,
      });
      that.getOrderInfoData();
    }else{
      console.log('不是从支付过来的');
      //不是从支付过来的
      if (!that.data.goPage) {
        //扫码过来的延时1秒
        console.log('goPage...');
        wx.showLoading({
          title: "加载中...",
        });
        setTimeout(() => {
          that.setData({
            isLogin: app.globalData.isLogin,
          });
          wx.hideLoading();
        }, 1000);
      }
      console.log('that.data.isNfc='+that.data.isNfc)
      if(that.data.isNfc){
        that.getOrderInfoByRoomId(that.data.roomId);
      }
      //没有房间信息再获取房间信息
      if(!that.data.roominfodata){
        that.getroomInfodata(that.data.roomId).then((res) => {});
      }
      if (that.data.groupPayNo) {
        console.log("有团购券");
        that.setData({
          tuangouShow: true,
          typeIndex: 1,
        });
        that.checkGroup();
      }
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
  formatDate: function (dateTime) {
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
  //获取房间信息
  getroomInfodata: function (roomId) {
    return new Promise((r, t) => {
      var that = this;
      http.request(
        "/member/index/getRoomInfo/" + roomId,
        "1",
        "post",
        {
          roomId: roomId,
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          if (info.code == 0) {
            const timeText = that.timeFilter(
              info.data.startTime,
              info.data.endTime
            );
            let orderTimeList = [];
            if (info.data.orderTimeList) {
              orderTimeList = info.data.orderTimeList.map((item) =>
                that.timeFilter(item.startTime, item.endTime)
              );
            }
            var minHour = info.data.minHour;
            var hour_options = [];
            for (let i = 0; i < 9; i++) {
              hour_options.push(minHour + i);
            }
            that.setData({
              roominfodata: info.data,
              timeHourAllArr: info.data.timeSlot.slice(0, 24),
              timeText: timeText,
              orderTimeList: orderTimeList,
              hour_options: hour_options,
              timeSelectList: info.data.timeSelectLists[0].selectList,
            });
            r();
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
            t();
          }
        },
        function fail(info) {
          t();
        }
      );
    });
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
  handleExchange() {
    wx.navigateTo({
      url: `/pages/booking/booking?storeId=${this.data.storeId}`,
    });
  },
  onHideReserve() {
    this.setData({
      showReserve: false,
    });
  },
  // 获取门店余额
  getStoreBalance: function () {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/getStoreBalance/" + that.data.storeId,
        "1",
        "get",
        {},
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            that.setData({
              balance: info.data,
            });
          }
        },
        function fail(info) {}
      );
    } else {
      //console.log('未登录失败！')
    }
  },
  openSubmit(e) {
    var that = this;
    if (!app.globalData.isLogin) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return;
    }

    let index = e.currentTarget.dataset.index;
    console.log("点击了:", index);
    that.setData({
      typeIndex: index,
    });
    if (index === "0") {
      //获取一下账户余额
      that.getStoreBalance();
      that.setData({
        xiaoshiShow: true,
        showCouponSelect: true,
        order_hour: that.data.roominfodata.minHour,
        submit_couponId: "",
        submit_couponName: "",
        select_pkg_index: 0,
        pkgId: "",
        nightLong: false,
      });
      that.MathDate();
      that.MathPrice(1, null, false, false);
      that.getCouponListData();
    } else if (index === "1") {
      that.setData({
        tuangouShow: true,
        order_hour: 0,
        payPrice: 0,
        submit_couponId: "",
        submit_couponName: "",
        select_pkg_index: 0,
        pkgId: "",
      });
    } else if (index === "2") {
      that.setData({
        nightLong: false,
      });
      //获取一下账户余额
      that.getStoreBalance();
      if (!that.data.pkgList) {
        that.getPkgList().then((res) => {
          if (!that.data.pkgList || that.data.pkgList.length == 0) {
            wx.showToast({
              title: "门店未设置套餐",
              icon: "none",
            });
            return;
          } else {
            that.setData({
              taocanShow: true,
            });
          }
        });
      } else {
        that.setData({
          taocanShow: true,
        });
      }
      if (that.data.pkgList && that.data.select_pkg_index >= 0) {
        that.setData({
          pkgId: that.data.pkgList[that.data.select_pkg_index].pkgId,
          payPrice: that.data.pkgList[that.data.select_pkg_index].price,
          order_hour: that.data.pkgList[that.data.select_pkg_index].hours,
        });
        that.MathDate();
      }
    } else if (index === "3") {
      //获取一下账户余额
      that.setData({
        nightLong: false,
      });
      that.getStoreBalance();
      if (!that.data.roominfodata.prePrice) {
        wx.showModal({
          title: "温馨提示",
          content: "管理员未设置押金开台，请选择其他开台方式",
          showCancel: false,
          complete: (res) => {
            if (res.cancel) {
            }
            if (res.confirm) {
            }
          },
        });
        return;
      }
      that.setData({
        payPrice: that.data.roominfodata.prePrice,
        yajinShow: true,
        order_hour: 0,
        select_pkg_index: 0,
        pkgId: "",
      });
      that.MathDate();
    }
  },
  xiaoshiCancel() {
    this.setData({
      xiaoshiShow: false,
    });
  },
  // 检查时间是否在某个场次的有效范围内
  isInTimeSlot(hours) {
    var that = this;
    switch (that.data.select_time_index) {
      case "9991":
        return hours >= 9 && hours < 13; // 上午场
      case "9992":
        return hours >= 13 && hours < 18; // 下午场
      case "9993":
        return hours >= 18 && hours < 23; // 夜间场
      case "9994":
        return hours >= 23 || hours < 8; // 通宵场
      default:
        console.log("不满足场次时间");
        return false;
    }
  },

  //点击的时间
  selectTimeHour: function (event) {
    var that = this;
    let atimeindex = event.currentTarget.dataset.index; //选中的时间索引
    that.setData({
      select_time_index: atimeindex,
    });
    // 首先检查是否是有效的场次ID
    if (that.data.select_time_index > 999) {
      that.MathBaochang();
      return;
    }
    //如果之前点击的包场 现在又点了小时，那么还原成当前时间开始
    if (that.data.select_time_index > 999) {
      that.setData({
        submit_begin_time: new Date(),
      });
    }
    let hour = event.currentTarget.dataset.hour;
    console.log("点击的小时：", hour);
    that.setData({
      showCouponSelect: true, //允许选择优惠券

      submit_couponId: "", //清空优惠券
      submit_couponName: "",
      order_hour: hour,
    });
    that.MathDate();
    that.MathPrice(1, null, false, false);
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
  goHome() {
    wx.switchTab({
      url: "/pages/index/index",
    });
  },
  MathDate: function () {
    console.log("MathDate");
    var that = this;
    let startDate = new Date();
    if (that.data.submit_begin_time) {
      startDate = new Date(that.data.submit_begin_time);
    }
    let order_hour = that.data.order_hour;
    let endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * order_hour);
    that.setData({
      submit_couponId: "", //清空优惠券
      submit_couponName: "",
      submit_begin_time: this.formatDate(startDate.getTime()).text,
      submit_end_time: this.formatDate(endDate.getTime()).text,
      view_begin_time: this.formatViewDate(startDate.getTime()).text,
      view_end_time: this.formatViewDate(endDate.getTime()).text,
    });
  },
  MathPrice(payType, pkgId, preSubmit, wxPay) {
    var that = this;
    wx.showLoading({
      title: "请稍等...",
    });
    http.request(
      "/member/order/preOrder",
      "1",
      "post",
      {
        roomId: that.data.roomId,
        payType: payType,
        couponId: that.data.submit_couponId,
        pkgId: pkgId,
        startTime: that.data.submit_begin_time,
        endTime: that.data.submit_end_time,
        preSubmit: preSubmit,
        wxPay: wxPay,
        nightLong: that.data.nightLong,
        timeIndex: that.data.select_time_index,
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        wx.hideLoading();
        if (info.code == 0) {
          if (that.data.typeIndex != 1) {
            let price = info.data.price / 100.0;
            that.setData({
              payPrice: price,
            });
          } else {
            //团购的设置为0
            that.setData({
              payPrice: 0,
            });
          }
        } else if (info.code == 1004004021) {
          //设置开始时间为当前时间
          that.setData({
            submit_begin_time: new Date(),
          });
          if (that.data.select_time_index < 999) {
            that.MathDate();
          }
        } else {
          wx.showToast({
            title: info.msg,
            icon: "none",
            duration: 1500,
            mask: true,
          });
        }
      },
      function fail(info) {
        wx.hideLoading();
      }
    );
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
              couponList: info.data.list,
            });
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {}
      );
    }
  },
  showCouponList() {
    var that = this;
    if (that.data.couponList && that.data.couponList.length > 0) {
      that.setData({
        couponShow: true,
      });
    } else {
      wx.showToast({
        title: "暂无可用优惠券",
        icon: "none",
      });
    }
  },
  couponCancel() {
    this.setData({
      couponShow: false,
    });
  },
  selectCouponInfo(e) {
    var that = this;
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    // console.log('选择的优惠券:',item)
    that.setData({
      select_coupon_index: index,
      submit_couponId: item.couponId,
      submit_couponName: item.couponName,
      couponShow: false,
    });
    that.MathPrice(1, null, false, false);
  },
  clearCoupon() {
    this.setData({
      submit_couponId: "",
      submit_couponName: "",
      select_coupon_index: -1,
    });
  },
  //提交订单
  SubmitOrderInfoData(e) {
    var that = this;
    let payType = e.currentTarget.dataset.paytype;
    let wxpay = false;
    if (payType == 1 || that.data.roominfodata.deposit) {
      wxpay = true;
    }
    let preSubmit = that.data.typeIndex == 3; //是否预支付
    http.request(
      "/member/order/preOrder",
      "1",
      "post",
      {
        roomId: that.data.roomId,
        payType: payType,
        couponId: that.data.submit_couponId,
        pkgId: that.data.pkgId,
        startTime: that.data.submit_begin_time,
        endTime: that.data.submit_end_time,
        preSubmit: preSubmit,
        wxPay: wxpay,
        nightLong: that.data.nightLong,
        timeIndex: that.data.select_time_index,
      },
      app.globalData.userDatatoken.accessToken,
      "提交中...",
      function success(info) {
        if (info.code == 0) {
          that.setData({
            orderNo: info.data.orderNo,
          });
          //锁定订单
          that.lockWxOrder(info);
          if (that.data.roominfodata.deposit > 0 || payType == 1) {
            //唤起微信支付
            if (info.data.payPrice > 0) {
              if (info.data.prePayTn) {
                wx.openEmbeddedMiniProgram({
                  appId: info.data.appId,
                  envVersion: "release",
                  path: info.data.prePayTn,
                  success: (res) => {
                    that.setData({
                      showYeepay: true
                    })
                  },
                  fail: (err) => {
                    wx.showToast({
                      title: err,
                      icon: "none",
                    });
                  },
                });
              } else {
                that.payMent(info);
              }
            } else {
              that.submitorder(payType, preSubmit);
            }
          } else {
            //需要支付金额为0元的时候，直接订单提交
            that.submitorder(payType, preSubmit);
          }
        } else {
          wx.showModal({
            title: "温馨提示",
            content: info.msg,
            showCancel: false,
            confirmText: "确定",
            success(res) {},
          });
        }
      },
      function fail(info) {}
    );
  },
  // 锁定订单
  lockWxOrder: function (pay) {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/lockWxOrder",
        "1",
        "post",
        {
          roomId: that.data.roomId,
          startTime: that.data.submit_begin_time,
          endTime: that.data.submit_end_time,
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          if (info.code == 0) {
            console.log("锁定订单");
          } else {
            wx.showModal({
              title: "温馨提示",
              content: info.msg,
              showCancel: false,
              confirmText: "确定",
              success(res) {},
            });
          }
        },
        function fail(info) {}
      );
    }
  },
  //支付
  payMent: function (pay) {
    var that = this;
    wx.requestPayment({
      timeStamp: pay.data.timeStamp,
      nonceStr: pay.data.nonceStr,
      package: pay.data.pkg,
      signType: pay.data.signType,
      paySign: pay.data.paySign,
      success: function (res) {
        that.setData({
          goPage: true,
        });
        that.getOrderInfoData();
      },
      fail: function (res) {
        console.log("*************支付失败");
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
  //获取订单详情
  getOrderInfoData: function (e) {
    var that = this;
    http.request(
      "/member/order/getOrderInfoByNo",
      "1",
      "get",
      {
        orderNo: that.data.orderNo,
      },
      app.globalData.userDatatoken.accessToken,
      "获取中...",
      function success(info) {
        if (info.code === 0) {
          //进入订单详情页  订单由支付回调函数创建
          // setTimeout(function () {
          wx.navigateTo({
            url:
              "../orderDetail/orderDetail?toPage=true&orderNo=" +
              that.data.orderNo,
          });
          // }, 1200);
        } else {
        }
      },
      function fail(info) {}
    );
  },
  tuangouCancel() {
    this.setData({
      tuangouShow: false,
    });
  },
  //输入团购码
  bindscanCode: function (e) {
    var that = this;
    // let deposit = that.data.roominfodata.deposit;
    if (e.detail.value.length >= 10) {
      that.setData({
        groupPayNo: e.detail.value,
        payPrice: 0,
      });
      that.checkGroup();
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
        // wx.showToast({
        //   title: "扫码成功",
        //   icon: "success",
        //   duration: 500,
        // });
        that.setData({
          groupPayNo: res.result,
          tuangouShow: true,
          typeIndex: 1,
        });
        that.checkGroup();
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
  checkGroup: function () {
    var that = this;
    if (
      that.data.groupPayNo == "" ||
      that.data.storeId == "" ||
      !that.data.groupPayNo ||
      that.data.groupPayNo.length < 10
    ) {
      wx.showToast({
        title: "请输入正确的团购券",
        icon: "none",
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
          code: that.data.groupPayNo,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            let order_hour = info.data.hours;
            let title = info.data.title;
            let nightLong = false;
            if (order_hour === 99) {
              //旧版本的通宵场
              nightLong = true;
              order_hour = that.data.roominfodata.txHour;
            }
            that.setData({
              groupPayTitle: title,
              order_hour: order_hour,
              payPrice: 0,
              nightLong: nightLong,
            });
            that.MathDate();
          } else {
            that.setData({
              groupPayTitle: info.msg,
            });
            // wx.showToast({
            //   title: info.msg,
            //   icon: "none",
            //   duration: 1500,
            //   mask: true
            // });
          }
        },
        function fail(info) {}
      );
    } else {
      //console.log('未登录失败！')
    }
  },
  setTimeSelect() {
    this.setData({
      timeSelectShow: true,
    });
  },
  timeSelectCancel() {
    this.setData({
      timeSelectShow: false,
    });
  },
  MathBaochang() {
    var that = this;
    that.setData({
      showCouponSelect: false,
    });
    let startDate = new Date(); //选择的时间
    let price = 0; //默认价格
    let order_hour = 0;
    if (that.data.submit_begin_time) {
      startDate = new Date(that.data.submit_begin_time);
    }
    let endDate = null;
    // 获取当前时间
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();

    // 获取选择日期的各部分
    const selectedDay = new Date(startDate);
    selectedDay.setHours(0, 0, 0, 0);
    const startHours = startDate.getHours();
    const isToday =
      selectedDay.getTime() === new Date(now).setHours(0, 0, 0, 0);
    console.log("isToday:", isToday);
    // 处理场次选择
    if (that.data.select_time_index == 9991) {
      // 上午场 9~13时
      price = that.data.roominfodata.morningPrice;
      order_hour = 4;
      if (isToday && that.isInTimeSlot(nowHours)) {
        // 当天且当前时间在上午场范围内
        startDate = new Date(now);
        endDate = new Date(selectedDay);
        endDate.setHours(13, 0, 0, 0);
      } else {
        // 非当天或当前时间不在上午场范围内，设置默认时间
        startDate = new Date(selectedDay);
        startDate.setHours(9, 0, 0, 0);
        endDate = new Date(selectedDay);
        endDate.setHours(13, 0, 0, 0);

        // 当天但时间已过上午场，提示
        if (isToday && nowHours >= 13) {
          wx.showToast({
            title: "当天上午场已结束",
            icon: "none",
          });
          return;
        }
      }
    } else if (that.data.select_time_index == 9992) {
      // 下午场 13~18时
      price = that.data.roominfodata.afternoonPrice;
      order_hour = 5;
      if (isToday && that.isInTimeSlot(nowHours)) {
        // 当天且当前时间在下午场范围内(14:30符合)

        startDate = new Date(now);
        endDate = new Date(selectedDay);
        endDate.setHours(18, 0, 0, 0);
      } else {
        // 非当天或当前时间不在下午场范围内，设置默认时间
        startDate = new Date(selectedDay);
        startDate.setHours(13, 0, 0, 0);
        endDate = new Date(selectedDay);
        endDate.setHours(18, 0, 0, 0);

        // 当天但时间已过下午场，提示
        if (isToday && nowHours >= 18) {
          wx.showToast({
            title: "当天下午场已结束",
            icon: "none",
          });
          return;
        }
      }
    } else if (that.data.select_time_index == 9993) {
      // 夜间场 18~23时
      order_hour = 5;
      price = that.data.roominfodata.nightPrice;
      if (isToday && that.isInTimeSlot(nowHours)) {
        // 当天且当前时间在夜间场范围内
        startDate = new Date(now);
        endDate = new Date(selectedDay);
        endDate.setHours(23, 0, 0, 0);
      } else {
        // 非当天或当前时间不在夜间场范围内，设置默认时间
        startDate = new Date(selectedDay);
        startDate.setHours(18, 0, 0, 0);
        endDate = new Date(selectedDay);
        endDate.setHours(23, 0, 0, 0);

        // 当天但时间已过夜间场，提示
        if (isToday && nowHours >= 23) {
          wx.showToast({
            title: "当天夜间场已结束",
            icon: "none",
          });
          return;
        }
      }
    } else if (that.data.select_time_index == 9994) {
      // 通宵场 23~次日8时
      price = that.data.roominfodata.txPrice;
      order_hour = 9;
      // 获取用户选择的日期（不自动加1天）
      const selectedDayStart = new Date(startDate);
      selectedDayStart.setHours(0, 0, 0, 0);

      // 结束日期（需要判断是否跨日）
      const endDay = new Date(selectedDayStart);

      // 处理开始时间
      if (startDate.getHours() < 23 && startDate.getHours() > 4) {
        // 如果选择时间<23点，强制设置为当天23:00开始
        startDate = new Date(selectedDayStart);
        startDate.setHours(23, 0, 0, 0);
        // 结束时间设置为次日8:00
        endDay.setDate(selectedDayStart.getDate() + 1);
        endDate = new Date(endDay);
        endDate.setHours(8, 0, 0, 0);
      } else {
        // 如果选择时间>=23点，保持原开始时间
        // 结束时间需要判断：
        // 如果开始时间是23:00-23:59，则结束时间是次日8:00
        // 如果开始时间是0:00-4:00，则结束时间是当日8:00
        if (startDate.getHours() >= 23) {
          endDay.setDate(selectedDayStart.getDate() + 1);
        }
        endDate = new Date(endDay);
        endDate.setHours(8, 0, 0, 0);
      }

      // 特殊处理：如果开始时间在4:00-8:00之间，不允许下单
      if (startDate.getHours() >= 4 && startDate.getHours() < 8) {
        wx.showToast({
          title: "通宵场即将结束，无法下单",
          icon: "none",
        });
        return;
      }
    }
    that.setData({
      submit_couponId: "", //清空优惠券
      submit_couponName: "", //清空优惠券名称
      order_hour: order_hour,
      submit_begin_time: that.formatDate(startDate.getTime()).text,
      submit_end_time: that.formatDate(endDate.getTime()).text,
      view_begin_time: that.formatViewDate(startDate.getTime()).text,
      view_end_time: that.formatViewDate(endDate.getTime()).text,
    });
    that.MathPrice(1, null, false, false); //检查时间占用
  },

  conTimeSelect(e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let timeSelect = that.data.timeSelectList[index];
    if (timeSelect) {
      if (timeSelect.available) {
        that.setData({
          timeSelectShow: false,
          submit_begin_time: timeSelect.date,
        });
        if (that.data.select_time_index > 999) {
          that.MathBaochang();
          return;
        } else {
          that.MathDate();
          if (that.data.typeIndex == 0) {
            that.MathPrice(1, null, false, false);
          }
        }
      } else {
        wx.showToast({
          title: "该时间不可用",
          icon: "none",
        });
      }
    }
  },
  handleDayChange(e) {
    var that = this;
    let index = e.currentTarget.dataset.index;
    that.setData({
      dayIndex: index,
      timeSelectList: that.data.roominfodata.timeSelectLists[index].selectList,
    });
  },
  //提交订单
  submitorder: function (payType, preSubmit) {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/save",
        "1",
        "post",
        {
          roomId: that.data.roomId,
          couponId: that.data.submit_couponId,
          pkgId: that.data.pkgId,
          startTime: that.data.submit_begin_time,
          endTime: that.data.submit_end_time,
          payType: payType,
          groupPayNo: that.data.groupPayNo,
          nightLong: that.data.nightLong,
          orderNo: that.data.orderNo,
          preSubmit: preSubmit,
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
                  "../orderDetail/orderDetail?toPage=true&orderNo=" +
                  that.data.orderNo,
              });
            }, 1000);
          } else {
            wx.showModal({
              title: "温馨提示",
              content: info.msg,
              showCancel: false,
              confirmText: "确定",
              success(res) {},
            });
          }
        },
        function fail(info) {}
      );
    }
  },
  onShowReserve() {
    this.setData({
      showReserve: true,
    });
  },
  onHideReserve() {
    this.setData({
      showReserve: false,
    });
  },
  taocanCancel() {
    this.setData({
      taocanShow: false,
    });
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
        result.push(`${start}~${end}时`);
        start = numbers[i];
        end = numbers[i];
      }
    }
    result.push(`${start}~${end}时`);
    return result;
  },
  getPkgList: function (e) {
    return new Promise((r, t) => {
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
              if (info.data.list.length > 0) {
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
                //默认优先套餐展示
                let select_pkg_index = 0;
                let pkgId = info.data.list[0].pkgId;
                let order_hour = info.data.list[0].hours;
                let price = info.data.list[0].price;
                that.setData({
                  select_pkg_index: select_pkg_index,
                  payPrice: price,
                  pkgId: pkgId,
                  order_hour: order_hour,
                });
                that.MathDate();
              }
              r();
            } else {
              wx.showModal({
                content: info.msg,
                showCancel: false,
              });
              t();
            }
          },
          function fail(info) {
            t();
          }
        );
      }
    });
  },
  selectPkgInfo(e) {
    var that = this;
    let pkgIndex = e.currentTarget.dataset.index;
    let pkgInfo = that.data.pkgList[pkgIndex];
    that.setData({
      select_pkg_index: pkgIndex,
      pkgId: pkgInfo.pkgId,
      order_hour: pkgInfo.hours,
      payPrice: pkgInfo.price,
    });
    that.MathDate();
  },
  yajinCancel() {
    this.setData({
      yajinShow: false,
    });
  },
  getOrderInfoByRoomId(roomId){
    var that = this;
    http.request(
      "/member/order/getOrderInfoByRoomId?roomId="+roomId,
      "1",
      "get",
      {
      },
      app.globalData.userDatatoken.accessToken,
      "获取中...",
      function success(info) {
        if (info.code == 0) {
          that.setData({
            currentOrder: info.data,
            isNfc: ''
          });
          if(info.data){
            //调用开门开电
            that.openRoomDoor();
            //再跳转订单详情
            that.goOrderDetail();
          }
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
        }
      },
      function fail(info) {
      }
    );
  },
  goOrderDetail(){
    wx.navigateTo({
      url: "../orderDetail/orderDetail?orderNo=" + this.data.currentOrder.orderNo + "&toPage=true",
    });
  },
  openRoomDoor() {
    let that = this;
    //开房间门
    console.log('开房间门');
    http.request(
      "/member/order/openRoomDoor?orderKey=" + that.data.currentOrder.orderKey,
      "1",
      "post", {
      // "orderKey":that.data.orderKey,
    },
      app.globalData.userDatatoken.accessToken,
      "开门中...",
      function success(info) {
        if (info.code == 0) {
          wx.showToast({
            title: "操作成功",
            icon: 'success'
          })
        } else {
          wx.showModal({
            title: "提示",
            content: info.msg,
            showCancel: false,
          })
        }
      },
      function fail(info) {
      }
    )
  },
});
