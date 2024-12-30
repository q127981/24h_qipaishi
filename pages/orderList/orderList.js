// pages/orderList/orderList.js
var http = require("../../utils/http");
var util1 = require("../../utils/util.js");
const app = getApp();
const moment = require("../../lib/moment.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    appName: app.globalData.appName,
    statusBarHeight: "",
    titleBarHeight: "",
    option1: [
      { text: "全部状态", value: -1 },
      { text: "未开始", value: 0 },
      { text: "进行中", value: 1 },
      { text: "已取消", value: 3 },
      { text: "已完成", value: 2 },
    ],
    option2: [
      { text: "默认排序", value: "0" },
      { text: "下单时间", value: "1" },
      { text: "预约时间", value: "2" },
    ],
    value1: -1,
    value2: "0",
    renewShow: false, //续费弹窗
    cancelOrderShow: false, //订单取消弹窗
    cancelOrderSucShow: false, //取消成功弹窗
    status: "", //订单状态筛选
    orderColumn: "", //排序
    orderlist: [], //订单列表数组
    isLogin: app.globalData.isLogin,
    userinfo: {}, //用户信息
    orderInfo: "", //选择操作的订单
    isIos: app.globalData.isIos,
    pageNo: 1, //分页的page
    canLoadMore: true, //是否还能加载更多
    mainColor: app.globalData.mainColor,
    select_pkg_index: -1,
    newTime: "", //增加后的时间,
    balance: "",
    show: false,
    modeIndex: 0,
    scrollPosition: 0,
    addTime: 0, //续费时长
    payType: 1,
    newTime: "", //增加后的时间,
    couponId: "",
    submit_couponInfo: "",
    couponCount: 0,
    payTypes: [{ name: '微信支付', value: 1, checked: true }, { checked: false, name: '钱包余额', value: 2 }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    this.setData({
      statusBarHeight: wx.getStorageSync("statusBarHeight"),
      titleBarHeight: wx.getStorageSync("titleBarHeight"),
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;
    that.setData({
      isLogin: app.globalData.isLogin,
    });
    if (app.globalData.isLogin) {
      that.getOrderListdata("refresh");
      that.getuserinfo();
      that.getCouponListData();
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
  onPullDownRefresh() {
    let that = this;
    that.setData({
      orderlist: [],//列表数组
      canLoadMore: true,//是否还能加载更多
      pageNo: 1,
    })
    this.getOrderListdata("refresh");
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.data.pageNo++;
      that.getOrderListdata("");
    } else {
      wx.showToast({
        title: "我是有底线的...",
      });
    }
  },
  //状态下拉菜单发生变化
  OrderStatusDropdown(event) {
    let that = this;
    //console.log('选择的值')
    this.data.option1.map((it) => {
      if (it.value == event.detail) {
        //console.log(it.value)
        if (it.value == -1) {
          that.setData({
            status: "",
          });
        } else {
          that.setData({
            status: it.value,
          });
        }
        that.getOrderListdata("refresh");
      }
    });
  },
  //
  orderColumnDropdown(event) {
    let that = this;
    //console.log('选择的值')
    this.data.option2.map((it) => {
      if (it.value == event.detail) {
        //console.log(it.value)
        if (it.value == 0) {
          that.setData({
            orderColumn: "", //排序
          });
        } else if (it.value == 1) {
          that.setData({
            orderColumn: "createTime",
          });
        } else if (it.value == 2) {
          that.setData({
            orderColumn: "startTime",
          });
        }
        that.getOrderListdata("refresh");
      }
    });
  },
  openDoor(e) {
    var that = this;
    let aindex = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: "../orderDetail/orderDetail?OrderNo=" + aindex + "&toPage=true",
    });
  },
  // 续费弹窗
  renewClick(e) {
    const info = e.currentTarget.dataset.info;
    this.setData(
      {
        currentOrder: info,
        renewShow: true,
        couponId: '',
        submit_couponInfo: {},
        payTypes: [
          { name: "微信支付", value: 1, checked: true },
          { checked: false, name: "钱包余额", value: 2 },
        ],
      },
      () => {
        this.getPkgList();
      }
    );
  },
  // 再次下单跳转至 订单提交页面
  orderAgain(e) {
    var roomId = e.currentTarget.dataset.info.roomId
    var storeId = e.currentTarget.dataset.info.storeId
    wx.navigateTo({
      url: '../orderSubmit/orderSubmit?roomId=' + roomId + '&daytime=' + '' + '&storeId=' + storeId + '&timeselectindex=0',
    })
  },
  // 取消弹窗
  cancelOrder(e) {
    var orderInfo = e.currentTarget.dataset.info;
    this.setData({
      cancelOrderShow: true,
      orderInfo: orderInfo,
    });
  },
  // 确认取消
  cancelConfirm() {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/cancelOrder/" + that.data.orderInfo.orderId,
        "1",
        "post",
        {
          orderId: that.data.orderInfo.orderId,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info("返回111===");
          console.info(info);
          if (info.code == 0) {
            that.setData({
              cancelOrderSuccess: true,
            });
            that.getOrderListdata("refresh");
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
  // 取消成功关闭弹窗
  cancelSuccessConfirm() {
    this.setData({ cancelOrderSucShow: false });
  },

  getOrderListdata: function (e) {
    var that = this;
    if (app.globalData.isLogin) {
      let message = "";
      if (e == "refresh") { //刷新，page变为1
        that.setData({
          orderlist: [],//列表数组
          canLoadMore: true,//是否还能加载更多
          pageNo: 1,
        })
        message = "获取中..."
      }
      http.request(
        "/member/order/getOrderPage",
        "1",
        "post", {
        "pageNo": that.data.pageNo,
        "pageSize": 10,
        "status": that.data.status,
        "orderColumn": that.data.orderColumn
      },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info('订单列表===');
          console.info(info);
          if (info.code == 0) {
            if (info.data.list.length === 0) {
              that.setData({
                canLoadMore: false
              })
            } else {
              //有数据
              if (that.data.orderlist) {
                //列表已有数据  那么就追加
                let arr = that.data.orderlist;
                let arrs = arr.concat(info.data.list.map((el) => {
                  el.fullTime = that.combineDateTime(
                    el.startTime,
                    el.endTime
                  );
                  return el;
                }));
                that.setData({
                  orderlist: arrs,
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total,
                });
              } else {
                that.setData({
                  pageNo: that.data.pageNo + 1,
                  orderlist: info.data.list.map((el) => {
                    el.fullTime = that.combineDateTime(
                      el.startTime,
                      el.endTime
                    );
                    return el;
                  }),
                });
              }
            }
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
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
  phone: function (e) {
    //console.log("授权用户手机号");
    var that = this;
    if (e.detail.errMsg == "getPhoneNumber:fail user deny") {
      wx.showToast({ title: "已取消授权" });
    }
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      //console.log('手机号码授权+++++++');
      //console.log(e.detail);
      //console.log('手机号码授权+++++++');
      wx.login({
        success: function (res) {
          //console.log('111++++==');
          //console.log(res);
          //console.log('111++++==');
          if (res.code != null) {
            http.request(
              "/member/auth/weixin-mini-app-login",
              "1",
              "post",
              {
                phoneCode: e.detail.code,
                loginCode: res.code,
              },
              "",
              "获取中...",
              function success(info) {
                console.info("返回111===");
                console.info(info);
                if (info.code == 0) {
                  if (info.data) {
                    app.globalData.userDatatoken = info.data;
                    app.globalData.isLogin = true;
                    that.setData({
                      isLogin: true,
                    });
                    //缓存服务器返回的用户信息
                    wx.setStorageSync("userDatatoken", info.data);
                    that.getOrderListdata("refresh");
                  }
                }
              },
              function fail(info) { }
            );
          } else {
            //console.log('登录失败！' + res.errMsg)
          }
        },
      });
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
  copyOrderNo(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.order,
      success: function () {
        wx.showToast({ title: "订单号已复制" });
      },
    });
  },
  combineDateTime(startTime, endTime) {
    const startMoment = moment(startTime, "YYYY/MM/DD HH:mm");
    const endMoment = moment(endTime, "YYYY/MM/DD HH:mm");

    const formattedDate = startMoment.format("MM-DD");
    const formattedStartTime = startMoment.format("HH:mm");
    const formattedEndTime = endMoment.format("HH:mm");

    return `${formattedDate} ${formattedStartTime} - ${formattedEndTime}`;
  },
  // 取消续费重置数据
  renewCancel: function () {
    this.setData({
      renewShow: false,
      addTime: 0,
      newTime: "",
      renewOrderNo: "",
      totalPay: 0,
      payType: 1,
      select_pkg_index: -1,
    });
  },
  modeChange(e) {
    const { index } = e.target.dataset;
    this.setData({
      modeIndex: +index,
      payType: 1,
      select_pkg_index: -1,
    });
    if (index == 0) {
      //小时模式
      console.log('小时模式');
      this.setData({
        pkgId: '',
        addTime: 0
      })
      this.timeChange(0);
    }
  },
  timeChange(addTime) {
    var newTime = moment(this.data.currentOrder.endTime)
      .add(addTime, "hours")
      .format("YYYY/MM/DD HH:mm");
    this.setData({
      addTime: addTime,
      newTime: newTime,
      totalPay: (addTime * this.getPrice(newTime)).toFixed(2),
    });
  },
  onRenewAdd() {
    var addTime = this.data.addTime + 1;
    if (addTime > 8) return;
    this.timeChange(addTime);
  },
  onRenewMinus() {
    var addTime = this.data.addTime - 1;
    if (addTime < 0) return;
    this.timeChange(addTime);
  },
  getPkgList: function () {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/pkg/getPkgPage",
        "1",
        "post",
        {
          storeId: that.data.currentOrder.storeId,
          roomId: that.data.currentOrder.roomId,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            const newMeals = info.data.list.map((el) => ({
              ...el,
              desc:
                that.convertEnableWeek(el.enableWeek) +
                ", " +
                that.convertEnableTime(el.enableTime),
            }));

            that.setData({
              pkgList: newMeals,
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
  // 续费加时间
  onChange: function (event) {
    var that = this;
    var addTime = event.detail;
    // console.info('时间===');
    // console.info(addTime);
    var newTime = moment(that.data.current.endTime)
      .add(addTime, "hours")
      .format("YYYY/MM/DD HH:mm");
    //console.log(`newtime:${newTime}`)
    this.setData({
      addTime: addTime,
      // totalPay: addTime * that.data.orderInfo.price,
      newTime: newTime,
      totalPay: (addTime * this.getPrice(newTime)).toFixed(2),
    });
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
      return `周${selectedWeekdays.join("、")}`;
    }
  },
  getPrice: function (startDate) {
    var that = this;
    var day = new Date(startDate).getDay();
    switch (day) {
      case 1:
      case 2:
      case 3:
      case 4:
        return that.data.currentOrder.workPrice;
      case 0:
      case 5:
      case 6:
        return that.data.currentOrder.roomPrice;
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
  //点击的套餐
  selectPkgInfo: function (event) {
    var that = this;
    var pkgIndex = event.currentTarget.dataset.index;
    var pkgId = event.currentTarget.dataset.id;
    var hour = event.currentTarget.dataset.hour;
    if (pkgIndex == that.data.select_pkg_index) {
      pkgIndex = -1;
      pkgId = "";
    }
    var newTime = moment(this.data.currentOrder.endTime)
      .add(hour, "hours")
      .format("YYYY/MM/DD HH:mm");
    that.setData({
      select_pkg_index: pkgIndex,
      pkgId: pkgId,
      payType: 4,
      newTime,
      totalPay: that.data.pkgList[pkgIndex].price,
    });
  },
  // 支付方式选择
  radioChange(e) {
    const type = e.detail.value
    const payTypes = this.data.payTypes
    if (type == 1) {
      payTypes[0].checked = true
      payTypes[1].checked = false
      console.log(type, payTypes)

    } else {
      console.log(type, payTypes)

      payTypes[0].checked = false
      payTypes[1].checked = true
    }
    this.setData({
      payType: type,
      payTypes: payTypes
    })
  },
  //预支付
  SubmitOrderInfoData() {
    if (
      (this.data.modeIndex === 0 && !this.data.addTime) ||
      (this.data.modeIndex === 1 && !this.data.pkgId)
    ) {
      wx.showToast({
        title: this.data.modeIndex === 1 ? "请选择套餐" : "请选择增加时间",
        icon: "none",
      });
      return false;
    }
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/preOrder",
        "1",
        "post",
        {
          roomId: that.data.currentOrder.roomId,
          couponId: that.data.couponId,
          startTime: that.data.currentOrder.endTime,
          endTime: that.data.newTime,
          orderId: that.data.currentOrder.orderId,
          payType: that.data.payType,
          pkgId: that.data.pkgId,
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          console.info("支付信息===");
          console.info(info);
          if (info.code == 0) {
            that.data.renewOrderNo = info.data.orderNo;
            //判断是不是微信支付 微信支付让回调去处理
            if (that.data.payType == 1) {
              that.lockWxOrder(info);
            } else {
              that.renewConfirm();
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
          roomId: that.data.currentOrder.roomId,
          couponId: that.data.couponId,
          startTime: that.data.currentOrder.endTime,
          endTime: that.data.newTime,
          orderId: that.data.currentOrder.orderId,
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
    var that = this;
    wx.requestPayment({
      timeStamp: pay.data.timeStamp,
      nonceStr: pay.data.nonceStr,
      package: pay.data.pkg,
      signType: pay.data.signType,
      paySign: pay.data.paySign,
      success: function (res) {
        //console.log('*************支付成功');
        // that.renewConfirm();
        that.renewCancel();
        that.getOrderListdata("refresh");
      },
      fail: function (res) {
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
  //支付
  renewConfirm: function () {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/renew",
        "1",
        "post",
        {
          orderId: that.data.currentOrder.orderId,
          // "minutes": that.data.addTime * 60,
          endTime: that.data.newTime,
          payType: that.data.payType,
          orderNo: that.data.renewOrderNo,
          userId: that.data.userinfo.id,
          groupPayNo: "",
          pkgId: that.data.pkgId,
          couponId: that.data.couponId,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info("续费返回111===");
          console.info(info);
          if (info.code == 0) {
            wx.showToast({
              title: "续时成功",
            });
            that.getOrderListdata("refresh");
            that.renewCancel();
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
  // 去优惠券页面
  goCoupon() {
    var that = this;
    if (!that.data.newTime) {
      wx.showToast({
        title: '请先选择时间',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '../coupon/coupon?from=1&roomId=' + that.data.currentOrder.roomId + '&nightLong=false' + '&startTime=' + that.data.currentOrder.endTime + '&endTime=' + that.data.newTime,
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        pageDataList: function (data) {
          console.log('页面B触发事件时传递的数据1：', data)
          that.setData({
            submit_couponInfo: data,
            couponId: data.couponId
          });
          // that.setshowpayMoney(data);
        },
        pageDataList_no: function (data) {
          //console.log('页面B触发事件时传递的数据1：',data)
          that.setData({
            submit_couponInfo: data,
            couponId: ''
          });
          // that.setshowpayMoney(data);
        },
      }
    })
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
              couponCount: info.data.total
            })
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
});