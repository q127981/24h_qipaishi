const datepicker = require("../../utils/datepicker");
const app = getApp();
var http = require("../../utils/http");
var lock = require("../../utils/lock.js");

Page({
  data: {
    startTime: "选择开始时间",
    endTime: "选择结束时间",
    multiArray: [],
    multiIndex: [],
    multiEndIndex: [],
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    roomId: "",
    roomName: "",
    name: "",
    phone: ""
  },

  onLoad: function (options) {
    console.log(options);
    if (options.id) {
      this.setData({
        roomId: options.id,
        roomName: options.roomName
      });
    }
  },

  onShow: function () {
    var loadPickerData = datepicker.loadPickerData();
    var getCurrentDate = datepicker.getCurrentDate();
    var GetMultiIndex = datepicker.GetMultiIndex();

    let year = parseInt(getCurrentDate.substring(0, 4));
    let month = parseInt(getCurrentDate.substring(5, 7));
    let day = parseInt(getCurrentDate.substring(8, 10));
    let hour = parseInt(getCurrentDate.substring(11, 13));
    let minute = parseInt(getCurrentDate.substring(14, 16));

    this.setData({
      multiArray: loadPickerData,
      multiIndex: GetMultiIndex,
      multiEndIndex: GetMultiIndex,
      startTime: getCurrentDate,
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute
    });
  },

  bindMultiPickerChange: function (e) {
    this.setData({
      multiEndIndex: e.detail.value
    });

    const index = this.data.multiIndex;
    const year = this.data.multiArray[0][index[0]];
    const month = this.data.multiArray[1][index[1]];
    const day = this.data.multiArray[2][index[2]];
    const hour = this.data.multiArray[3][index[3]];
    const minute = this.data.multiArray[4][index[4]];

    this.setData({
      startTime: `${year.replace("年", "/")}${month.replace(
        "月",
        "/"
      )}${day.replace("日", "")} ${hour.replace("时", "")}:${minute.replace(
        "分",
        ""
      )}`,
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute
    });
  },

  bindMultiPickerChanges: function (e) {
    this.setData({
      multiEndIndex: e.detail.value
    });

    const index = this.data.multiIndex;
    const year = this.data.multiArray[0][index[0]];
    const month = this.data.multiArray[1][index[1]];
    const day = this.data.multiArray[2][index[2]];
    const hour = this.data.multiArray[3][index[3]];
    const minute = this.data.multiArray[4][index[4]];

    this.setData({
      endTime: `${year.replace("年", "/")}${month.replace(
        "月",
        "/"
      )}${day.replace("日", "")} ${hour.replace("时", "")}:${minute.replace(
        "分",
        ""
      )}`,
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute
    });
  },

  bindMultiPickerColumnChange: function (e) {
    let getCurrentDate = datepicker.getCurrentDate();
    let currentYear = parseInt(getCurrentDate.substring(0, 4));
    let currentMonth = parseInt(getCurrentDate.substring(5, 7));
    let currentDay = parseInt(getCurrentDate.substring(8, 10));
    let currentHour = parseInt(getCurrentDate.substring(11, 13));
    let currentMinute = parseInt(getCurrentDate.substring(14, 16));

    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;

    let monthArr, dayArr, hourArr, minuteArr;

    switch (e.detail.column) {
      case 0: // 修改年份列
        let yearSelected = parseInt(
          this.data.multiArray[e.detail.column][e.detail.value]
        );
        this.setData({
          year: yearSelected
        });
        if (yearSelected == currentYear) {
          var loadPickerData = datepicker.loadPickerData();
          this.setData({
            multiArray: loadPickerData,
            multiIndex: [0, 0, 0, 0, 0]
          });
        } else {
          monthArr = datepicker.loadMonths(1, 12);
          dayArr = datepicker.loadDays(yearSelected, 1, 1);
          hourArr = datepicker.loadHours(0, 23);
          minuteArr = datepicker.loadMinutes(0, 59);
          this.setData({
            ["multiArray[1]"]: monthArr,
            ["multiArray[2]"]: dayArr,
            ["multiArray[3]"]: hourArr,
            ["multiArray[4]"]: minuteArr,
            multiIndex: [e.detail.value, 0, 0, 0, 0]
          });
        }
        break;
      case 1: // 修改月份列
        let mon = parseInt(
          this.data.multiArray[e.detail.column][e.detail.value]
        );
        this.setData({
          month: mon
        });
        if (this.data.year == currentYear && mon == currentMonth) {
          dayArr = datepicker.loadDays(currentYear, mon, currentDay);
        } else {
          dayArr = datepicker.loadDays(this.data.year, mon, 1);
        }
        hourArr = datepicker.loadHours(0, 23);
        minuteArr = datepicker.loadMinutes(0, 59);
        this.setData({
          ["multiArray[2]"]: dayArr,
          ["multiArray[3]"]: hourArr,
          ["multiArray[4]"]: minuteArr,
          multiIndex: [this.data.multiIndex[0], e.detail.value, 0, 0, 0]
        });
        break;
      case 2: // 修改日
        let dd = parseInt(
          this.data.multiArray[e.detail.column][e.detail.value]
        );
        this.setData({
          day: dd
        });
        if (
          dd == currentDay &&
          this.data.year == currentYear &&
          this.data.month == currentMonth
        ) {
          hourArr = datepicker.loadHours(currentHour, 24);
          minuteArr = datepicker.loadMinutes(currentMinute, 59);
        } else {
          hourArr = datepicker.loadHours(0, 24);
          minuteArr = datepicker.loadMinutes(0, 59);
        }
        this.setData({
          ["multiArray[3]"]: hourArr,
          ["multiArray[4]"]: minuteArr,
          multiIndex: [
            this.data.multiIndex[0],
            this.data.multiIndex[1],
            e.detail.value,
            0,
            this.data.multiIndex[4]
          ]
        });
        break;
      case 3: // 修改时
        let hh = parseInt(
          this.data.multiArray[e.detail.column][e.detail.value]
        );
        let currentMinuteIndex = this.data.multiIndex[4];
        this.setData({
          hour: hh
        });
        if (
          hh == currentHour &&
          this.data.year == currentYear &&
          this.data.month == currentMonth &&
          this.data.day == currentDay
        ) {
          minuteArr = datepicker.loadMinutes(currentMinute, 59);
        } else {
          minuteArr = datepicker.loadMinutes(0, 59);
        }
        this.setData({
          ["multiArray[4]"]: minuteArr,
          multiIndex: [
            this.data.multiIndex[0],
            this.data.multiIndex[1],
            this.data.multiIndex[2],
            e.detail.value,
            currentMinuteIndex
          ]
        });
        break;
      case 4: // 修改分
        let mi = parseInt(
          this.data.multiArray[e.detail.column][e.detail.value]
        );
        this.setData({
          minute: mi,
          multiIndex: [
            this.data.multiIndex[0],
            this.data.multiIndex[1],
            this.data.multiIndex[2],
            this.data.multiIndex[3],
            e.detail.value
          ]
        });
        break;
    }
    console.log(this.data.multiArray);
  },

  bindMultiPickerColumnChanges: function (e) {
    this.bindMultiPickerColumnChange(e);
  },

  inputName: function (e) {
    this.setData({
      name: e.detail.value
    });
  },

  inputPhone: function (e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 提交
  submit() {
    var that = this;

    if (that.data.endTime == "选择结束时间") {
      wx.showModal({
        content: "请选择结束时间",
        showCancel: false
      });
      return;
    }
    if (!that.data.phone) {
      wx.showModal({
        content: "请填写手机号",
        showCancel: false
      });
      return;
    }
    http.request(
      "/member/manager/submitOrder",
      "1",
      "post",
      {
        roomId: that.data.roomId,
        startTime: that.data.startTime,
        endTime: that.data.endTime,
        mobile: that.data.phone
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        console.info("返回111===");
        console.info(info);
        if (info.code == 0) {
          wx.showToast({
            title: "操作成功",
            icon: "success"
          });
          wx.navigateBack({
            delta: 1 // 返回的页面数，这里表示返回上一页
          });
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false
          });
        }
      },
      function fail(info) {}
    );
  }
});
