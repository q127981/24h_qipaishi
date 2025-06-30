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
    storeId: "",//门店id
    roomId: "", //房间id
    goPage: '',//是否页面跳转的
    groupPayNo: '',//团购券
    groupPayTitle: '',//团购券名称
    timeHourAllArr: [],//被占用时间轴
    roominfodata: '',//房间信息
    orderTimeList: [],//房间已占用的订单列表
    hour_options: [],//小时选择选项列表
    couponList: [],//用户的优惠券列表
    submit_couponId: '',//选中使用的优惠券
    submit_couponName: '',//选择的优惠券名称
    select_coupon_index: -1,//选中的优惠券索引
    timeText: '',//被占用时间
    submit_begin_time: '',//订单开始时间
    view_begin_time: '',//显示的开始时间 HH：mm
    submit_end_time: '',//订单结束时间
    view_end_time: '',//显示的结束时间 HH：mm
    showReserve: false,//显示被预定时间列表
    xiaoshiShow: false,//小时开台
    tuangouShow: false,//团购开台
    taocanShow: false,//套餐开台
    yajinShow: false,//押金开台
    typeIndex: 0,//开台类型
    couponShow: false,//优惠券选择
    select_time_index: 0,//选择的时间索引
    select_pkg_index: 0,//选择的套餐索引
    payPrice: 0,//显示的支付金额
    order_hour: 0,//订单的小时
    orderNo: '',//订单号
    timeSelectShow: false,//时间选择组件
    dayIndex: 0,//选择的日期组件
    timeSelectList: [],//时间选择列表
    pkgId: '',//选择的套餐
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("onload");
    var that = this;
    var storeId = options.storeId;
    var roomId = options.roomId;
    var goPage = options.goPage;
    var groupPayNo = '';
    if (options.groupPayNo) {
      groupPayNo = options.groupPayNo;
    }
    if (goPage) {
      //点按钮跳转的
    } else {
      //扫码的
      var query = wx.getEnterOptionsSync().query;
      console.log(query);
      if (query) {
        if (query.storeId) {
          storeId = query.storeId;
        }
        if (query.roomId) {
          roomId = query.roomId;
        }
      }
    }
    var startDate = new Date();
    that.setData({
      storeId: storeId,
      roomId: roomId,
      groupPayNo: groupPayNo,
      goPage: goPage,
      submit_begin_time: that.formatDate(startDate).text,
    });
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
      xiaoshiShow: false,//小时开台
      tuangouShow: false,//团购开台
      taocanShow: false,//套餐开台
      yajinShow: false,//押金开台
    });
    if (!that.data.goPage) {
      //扫码过来的延时1秒
      wx.showLoading({
        title: '加载中...',
      })
      setTimeout(() => {
        that.setData({
          isLogin: app.globalData.isLogin,
        });
        wx.hideLoading();
      }, 1000);
    }
    that.getroomInfodata(that.data.roomId).then((res) => {
    });
    if (that.data.groupPayNo) {
      console.log('有团购券');
      that.setData({
        tuangouShow: true,
        typeIndex: 1,
      })
      that.checkGroup();
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
            let orderTimeList = []
            if (info.data.orderTimeList) {
              orderTimeList = info.data.orderTimeList.map(item => that.timeFilter(
                item.startTime,
                item.endTime
              ))
            }
            var minHour = info.data.minHour;
            var hour_options = [];
            for (let i = 0; i < 10; i++) {
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
        function fail(info) { t(); }
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
      url: `/pages/booking/booking?storeId=${this.data.storeId}`
    })
  },
  onHideReserve() {
    this.setData({
      showReserve: false,
    })
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
          if (info.code == 0) {
            that.setData({
              balance: info.data,
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
  openSubmit(e) {
    var that = this;
    if (!app.globalData.isLogin) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }

    let index = e.currentTarget.dataset.index;
    console.log('点击了:', index);
    that.setData({
      typeIndex: index
    })
    if (index === "0") {
      //获取一下账户余额
      that.getStoreBalance();
      that.setData({
        xiaoshiShow: true,
        order_hour: that.data.roominfodata.minHour,
        submit_couponId: '',
        submit_couponName: '',
      })
      that.MathDate();
      that.MathPrice(1, null, false, false);
      that.getCouponListData();
    } else if (index === "1") {
      that.setData({
        tuangouShow: true,
        order_hour: 0,
        payPrice: 0,
        submit_couponId: '',
        submit_couponName: '',
      })
    } else if (index === "2") {
      //获取一下账户余额
      that.getStoreBalance();
      if (!that.data.pkgList) {
        that.getPkgList().then((res) => {
          if (!that.data.pkgList || that.data.pkgList.length == 0) {
            wx.showToast({
              title: '门店未设置套餐',
              icon: 'none'
            })
            return;
          } else {
            that.setData({
              taocanShow: true,
            })
          }
        });
      } else {
        that.setData({
          taocanShow: true,
        })
      }
      if (that.data.pkgList && that.data.select_pkg_index >= 0) {
        that.setData({
          pkgId: that.data.pkgList[that.data.select_pkg_index].pkgId,
          payPrice: that.data.pkgList[that.data.select_pkg_index].price,
          order_hour: that.data.pkgList[that.data.select_pkg_index].hours,
        })
        that.MathDate();
      }
    } else if (index === "3") {
      //获取一下账户余额
      that.getStoreBalance();
      if (!that.data.roominfodata.prePrice) {
        wx.showModal({
          title: '温馨提示',
          content: '管理员未设置押金开台，请选择其他开台方式',
          showCancel: false,
          complete: (res) => {
            if (res.cancel) {
            }
            if (res.confirm) {
            }
          }
        })
        return;
      }
      that.setData({
        payPrice: that.data.roominfodata.prePrice,
        yajinShow: true,
        order_hour: 0,
      })
      that.MathDate();
    }
  },
  xiaoshiCancel() {
    this.setData({
      xiaoshiShow: false
    })
  },
  //点击的时间
  selectTimeHour: function (event) {
    var that = this;
    let atimeindex = event.currentTarget.dataset.index; //选中的时间索引
    let hour = event.currentTarget.dataset.hour;
    console.log("点击的小时：", hour);
    that.setData({
      select_time_index: atimeindex,
      submit_couponId: '', //清空优惠券
      submit_couponName: '',
      order_hour: hour,
    })
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
      url: '/pages/index/index',
    })
  },
  MathDate: function () {
    console.log('MathDate');
    var that = this;
    let startDate = new Date();
    if (that.data.submit_begin_time) {
      startDate = new Date(that.data.submit_begin_time);
    }
    let order_hour = that.data.order_hour;
    let endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * order_hour);
    that.setData({
      submit_couponId: '', //清空优惠券
      submit_couponName: '',
      submit_begin_time: this.formatDate(startDate.getTime()).text,
      submit_end_time: this.formatDate(endDate.getTime()).text,
      view_begin_time: this.formatViewDate(startDate.getTime()).text,
      view_end_time: this.formatViewDate(endDate.getTime()).text,
    });
  },
  MathPrice(payType, pkgId, preSubmit, wxPay) {
    var that = this;
    wx.showLoading({
      title: '...',
    })
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
        } else {
          wx.showToast({
            title: info.msg,
            icon: 'none',
            duration: 1000,
            mask: true
          })
        }
      },
      function fail(info) { wx.hideLoading(); }
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
        function fail(info) { }
      );
    }
  },
  showCouponList() {
    var that = this;
    if (that.data.couponList && that.data.couponList.length > 0) {
      that.setData({
        couponShow: true
      })
    } else {
      wx.showToast({
        title: '暂无可用优惠券',
        icon: 'none'
      })
    }
  },
  couponCancel() {
    this.setData({
      couponShow: false
    })
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
    })
    that.MathPrice(1, null, false, false);
  },
  clearCoupon() {
    this.setData({
      submit_couponId: '',
      submit_couponName: '',
      select_coupon_index: -1,
    })
  },
  //提交订单
  SubmitOrderInfoData(e) {
    var that = this;
    let payType = e.currentTarget.dataset.paytype;
    let wxpay = false;
    if (payType == 1 || that.data.roominfodata.deposit) {
      wxpay = true;
    }
    let preSubmit = that.data.typeIndex == 3;//是否预支付
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
      },
      app.globalData.userDatatoken.accessToken,
      "提交中...",
      function success(info) {
        if (info.code == 0) {
          that.setData({
            orderNo: info.data.orderNo
          })
          //锁定订单
          that.lockWxOrder(info);
          if (that.data.roominfodata.deposit > 0 || payType == 1) {
            //唤起微信支付
            if (info.data.payPrice > 0) {
              that.payMent(info);
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
            success(res) { },
          });
        }
      },
      function fail(info) { })
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
    var that = this;
    wx.requestPayment({
      timeStamp: pay.data.timeStamp,
      nonceStr: pay.data.nonceStr,
      package: pay.data.pkg,
      signType: pay.data.signType,
      paySign: pay.data.paySign,
      success: function (res) {
        that.setData({
          goPage: true
        })
        //进入订单详情页  订单由支付回调函数创建
        setTimeout(function () {
          wx.navigateTo({
            url: "../orderDetail/orderDetail?toPage=true&orderNo=" + that.data.orderNo,
          });
        }, 1200);
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

  tuangouCancel() {
    this.setData({
      tuangouShow: false,

    })
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
        that.setData({
          groupPayNo: res.result,
        });
        wx.showToast({
          title: "扫码成功",
          icon: "error",
          duration: 1000,
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
        icon: "none"
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
            var order_hour = info.data.hours;
            that.setData({
              groupPayTitle: info.data.title,
              order_hour: order_hour,
              payPrice: 0,
            });
            that.MathDate();
          } else {
            wx.showToast({
              title: info.msg,
              icon: "none",
            });
          }
        },
        function fail(info) { }
      );
    } else {
      //console.log('未登录失败！')
    }
  },
  setTimeSelect() {
    this.setData({
      timeSelectShow: true
    })
  },
  timeSelectCancel() {
    this.setData({
      timeSelectShow: false
    })
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
        })
        that.MathDate();
        if (that.data.typeIndex == 0) {
          that.MathPrice(1, null, false, false);
        }
      } else {
        wx.showToast({
          title: '该时间不可用',
          icon: 'none'
        })
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
          orderNo: that.data.orderNo,
          preSubmit: preSubmit
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
                  "../orderDetail/orderDetail?toPage=true&orderNo=" + that.data.orderNo,
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
  taocanCancel() {
    this.setData({
      taocanShow: false,
    })
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
                })
                that.MathDate(new Date(that.data.submit_begin_time));
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
          function fail(info) { t(); }
        );
      }
    })
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
    })
    that.MathDate();
  },
  yajinCancel() {
    this.setData({
      yajinShow: false,
    })
  }
});
