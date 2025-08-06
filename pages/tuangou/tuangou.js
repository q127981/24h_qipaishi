const app = getApp();
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
var moment = require("../../lib/moment.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    storeId: "",
    groupPayNo: "",
    ticketName: "",
    storeIndex: "",
    stores: [],
    success: false,
    dayIndex: 0,
    view_begin_time: "", //显示开始时间
    view_end_time: "", //显示结束时间
    currentDate: "",
    showReserve: false,
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
    minHour: "", //可选最小小时
    show: false,
    popupIndex: 0,
    voucherInfo: null,
    storeList: [],
    storeOptions: [],
    roomIndex: -1,
    lat: '',
    lon: '',
    showGroupsPay: false, // 是否展示团购券信息
    groupPays: [], // 优惠券信息
    clickItem: 0, // 点击的团购券位置 默认0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    console.log(options)
    let storeId = options.storeId;
    let ticketNo = options.ticketNo;
    let ticketName = options.ticketName
    that.setData({
      storeId: storeId,
      groupPayNo: ticketNo,
      ticketName: ticketName
    });
    
    if (!app.globalData.isLogin) {
      wx.navigateTo({
        url: '../login/login',
      })
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
    let that = this;
    let storeId = that.data.storeId;
    that.getLocation().then((res) => {
      that.getDoorInfoData(storeId);
    }).catch(res => {
      that.getDoorInfoData(storeId);
    });
    // this.MathDate(new Date());
    that.getListData();
    that.getDoorListdata(storeId)
  },

  bindKeyInput(e) {
    this.setData({
      groupPayNo: e.detail.value,
    });
  },
  //获取门店相信信息
  getDoorInfoData: function (storeId) {
    var that = this;
    {
      http.request(
        "/member/index/getStoreInfo/" + storeId,
        "1",
        "get",
        {
          "lat": that.data.lat,
          "lon": that.data.lon,
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          if (info.code == 0) {

            that.setData({
              doorinfodata: info.data,
              // timeText,
            });
          } else {
            wx.showModal({
              content: "请求服务异常，请稍后重试",
              showCancel: false,
            });
          }
        },
        function fail(info) { }
      );
    }
  },

  voucherCheck() { },

 
  setshowSelectHour() {
    this.setData({
      showtimefalge: true,
    });
  },
  timeChange(event) {
    const { year, month, day, hour, minute } = this.formatDate(event.detail);
    let that = this;
    var begin_time = year + "-" + month + "-" + day + " " + `${hour}:${minute}`;
    //根据选中的小时按钮 计算出结束时间
    var startDate = new Date(begin_time);
    that.MathDate(startDate);
    that.setData({
      showtimefalge: false,
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
  MathDate: function (startDate) {
    var that = this;
    var nightLong = false;
    var order_hour = that.data.voucherInfo.hours;
    if (order_hour == 99) {
      nightLong = true;
      //取通宵的时长
      order_hour = that.data.doorinfodata.txHour;
      //判断开始时间 是否在通宵场的范围内 有两种情况 结束时间在当日和次日
      if (startDate.getHours() < that.data.doorinfodata.txStartHour) {
        //如果是凌晨4点之后的  那么开始时间就要改为当日通宵开始小时
        if (startDate.getHours() >= 4) {
          startDate.setHours(that.data.doorinfodata.txStartHour);
          startDate.setMinutes(0);
          startDate.setSeconds(0);
          startDate.setMilliseconds(0);
        }
      }
      var endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * order_hour);
      that.setData({
        nightLong: true,
        order_hour: order_hour,
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
        submit_begin_time: this.formatDate(startDate.getTime()).text,
        submit_end_time: this.formatDate(endDate.getTime()).text,
        view_begin_time: this.formatViewDate(startDate.getTime()).text,
        view_end_time: this.formatViewDate(endDate.getTime()).text,
      });
    }
  },
  selectRoom(e) {
    console.log(e);
    const { index } = e.currentTarget.dataset;
    if(this.data.doorlistArr[index].status==0){
      wx.showToast({
        title: "场地禁用",
        icon: 'none'
      })
      return;
    }
    this.setData({
      roomIndex: index,
    });
  },
  onClickHide() {
    this.setData({ show: false });
  },
  onClickShow(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ show: true, popupIndex: +index });
  },
  goTencentMap(e) {
    const store = this.data.doorinfodata;
    wx.openLocation({
      latitude: store.lat,
      longitude: store.lon,
      name: store.storeName,
      address: store.address,
      scale: 28,
    });
  },
  goGuide() {
    wx.navigateTo({
      url: `/packageA/pages/guide/guide?storeId=${this.data.storeId}`,
    });
  },
  call: function (e) {
    let that = this;
    var phone = this.data.doorinfodata.kefuPhone;
    phone.length === 11 &&
      wx.makePhoneCall({
        phoneNumber: phone,
        success: function () {
          //console.log("拨打电话成功！")
        },
        fail: function () {
          //console.log("拨打电话失败！")
        },
      });
  },
  copy() {
    wx.setClipboardData({
      data: this.data.doorinfodata.kefuPhone,
      success: function (res) {
        wx.showToast({ title: "已复制到剪贴板" });
      },
    });
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
          payselectindex: 0,
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
  
  // 预支付
  SubmitOrderInfoData() {
    var that = this;
    if (that.data.roomIndex < 0) {
      return wx.showToast({
        title: '未选择房间',
        icon: "none",
      });
    }
    // if (!that.data.groupPayNo) {
    //   return wx.showToast({
    //     title: '请填写团购券',
    //     icon: "none",
    //   });
    // }
    wx.navigateTo({
      url: '../orderSubmit/orderSubmit?roomId=' + that.data.doorlistArr[that.data.roomIndex].roomId + '&goPage=1' + '&storeId=' + that.data.storeId + '&groupPayNo=' + that.data.groupPayNo,
    })
  },

  showSelect() {
    this.setData({ showStoreSelect: true });
  },
  onClose() {
    this.setData({ showStoreSelect: false });
  },
  onSelect(event) {
    this.setData({
      doorinfodata: event.detail,
      storeId: event.detail.id,
    });
    this.getDoorListdata(event.detail.id)
  },
  //获取列表数据
  getListData: function (e) {
    var that = this;
    let message = "";
    http.request(
      "/member/index/getStoreList",
      "1",
      "post",
      {
        pageNo: 1,
        pageSize: 100,
        name: "",
        lat: that.data.lat,
        lon: that.data.lon,
      },
      app.globalData.userDatatoken.accessToken,
      message,
      function success(info) {
        if (info.code == 0) {
          const storeList = info.data.list.map((el) => {
            return {
              name: el.storeName,
              id: el.storeId,
              ...el,
            };
          });
          that.setData({
            storeList: storeList,
            storeOptions: storeList
              .map((el) => {
                return {
                  text: el.name,
                  value: el.id,
                  ...el,
                };
              })
              .concat([
                {
                  text: "全部门店",
                  value: "",
                },
              ]),
          });
          if (!that.data.doorinfodata) {
            that.setData({
              doorinfodata: storeList[0],
            });
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
  //获取房间列表数据
  getDoorListdata: function (storeId) {
    var that = this;
    //if (app.globalData.isLogin)
    {
      http.request(
        `/member/index/getRoomInfoList`,
        "1",
        "post",
        {
          storeId: storeId,
          roomClass: -1,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            that.setData({
              doorlistArr: info.data.map((el) => {
                el.timeText = that.timeFilter(el.startTime, el.endTime);
                if (el.orderTimeList) {
                  el.orderTimeList = el.orderTimeList.map((item) =>
                    that.timeFilter(item.startTime, item.endTime)
                  );
                }
                // 新增逻辑：计算当前时间到endTime的等待时间
                if (el.endTime) {
                  const currentTime = new Date();
                  const endDateTime = new Date(el.endTime);
                  const diffInMilliseconds = endDateTime - currentTime;
                  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
                  const hours = Math.floor(diffInMinutes / 60);
                  const minutes = diffInMinutes % 60;
                  const timeNumber1 = hours < 10 ? `0${hours}` : `${hours}`;
                  const timeNumber2 = minutes < 10 ? `0${minutes}` : `${minutes}`;
                  el.waitTime = {
                    hours: timeNumber1,
                    minutes: timeNumber2
                  };
                }
                return el;
              }),
            });
            // that.setroomlistHour(0);
          } else {
            wx.showModal({
              content: "请求服务异常，请稍后重试",
              showCancel: false,
            });
          }
        },
        function fail(info) { }
      );
    }
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
          r();
          // that.getMainListdata('refresh');
          // 处理位置信息，比如将位置信息显示在页面上
          // 示例中使用的是util.js中的函数，开发者可以根据需要自行编写
          //util.showLocation(latitude, longitude)
        },
        fail: function (res) {
          t();
          // that.getMainListdata('refresh');
          // 如果获取位置信息失败，可以处理错误情况
          //console.log('获取位置失败', res.errMsg)
        }
      })
    });
  },

  getIndex: function (e) {
    let that = this
    let index = e.currentTarget.dataset.index
    that.setData({
      clickItem: index
    })
    console.log(that.data.clickItem)
  },
  gotoUse: function () {
    let that = this
    that.setData({
      showGroupsPay: false
    })
    let index = that.data.clickItem
    let item = that.data.groupPays[index]
    console.log(item)
    that.setData({
      groupPayNo: item.ticketNo
    })
  },
  cancelUser: function () {
    let that = this
    that.setData({
      showGroupsPay: false
    })
  },
  onShowReserve(e) {
    const list = e.currentTarget.dataset.list;
    console.log(list);
    this.setData({
      orderTimeList: list,
      showReserve: true,
    });
  },
  onHideReserve() {
    this.setData({
      showReserve: false,
      // orderTimeList: [],
    });
  },
});
