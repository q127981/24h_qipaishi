// pages/orderList/orderList.js
var http = require("../../utils/http");
var util1 = require("../../utils/util.js");
const app = getApp();
const moment = require("../../lib/moment.js");
import drawQrcode from '../../utils/weapp.qrcode.min.js'

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
    roominfodata: '',
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
    showModal: false,
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
      // that.getuserinfo();
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
    let no = e.currentTarget.dataset.no;
    wx.navigateTo({
      url: "../orderDetail/orderDetail?orderNo=" + no + "&toPage=true",
    });
  },
  //获取房间信息
  getRoomInfodata: function (roomId) {
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
          that.setData({
            roominfodata: info.data,
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
  },
  // 续费弹窗
  renewClick(e) {
    var that = this;
    that.getuserinfo();
    const info = e.currentTarget.dataset.info;
    that.getRoomInfodata(info.roomId);
    that.setData(
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
    wx.navigateTo({
      url: '/pages/login/login',
    })
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
    var newTime = moment(this.data.currentOrder.endTime)
      .add(hour, "hours")
      .format("YYYY/MM/DD HH:mm");
    that.setData({
      select_pkg_index: pkgIndex,
      pkgId: pkgId,
      payType: 1,
      newTime,
      totalPay: that.data.pkgList[pkgIndex].price,
    });
    const payTypes = this.data.payTypes
    payTypes[0].checked = true
    payTypes[1].checked = false
    this.setData({
      payTypes: payTypes
    })
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
  showOrderQr(e) {
    const orderNo = e.currentTarget.dataset.no;
    this.setData({ showModal: true }, () => {
      // 使用 nextTick 确保 DOM 渲染完成
      wx.nextTick(() => {
        drawQrcode({
          width: 200,  
          height: 200,
          canvasId: 'myQrcode',
          text: "houey_" + orderNo,
          // x: 20,
          // y: 20,
          callback: (e) => {
            console.log(e);
          }
        });
      });
    });
  },
  closeModal() {
    this.setData({ showModal: false });
  },
  preventTouch() {
    // 空函数即可阻止页面滚动
  },

});