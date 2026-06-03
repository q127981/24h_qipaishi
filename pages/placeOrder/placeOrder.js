const app = getApp();
var http = require("../../utils/http");

Page({
  data: {
    startTime: "选择开始时间",
    endTime: "选择结束时间",
    roomId: "",
    roomName: "",
    name: "",
    phone: "",
    money: "",
    // 时间选择器相关
    showStartTimePicker: false,
    showEndTimePicker: false,
    startDate: null,
    endDate: null,
    minDate: null,
    maxStartDate: null,
    minEndDate: null,
    maxEndDate: null,
    // 快捷时间选中的小时数
    selectedHours: 0,
  },

  onLoad: function (options) {
    console.log(options);
    if (options.id) {
      this.setData({
        roomId: options.id,
        roomName: options.roomName || '未选择场地'
      });
    }
  },

  onShow: function () {
    // 初始化日期时间
    const now = new Date();
    const currentTime = this.formatTime(now);

    // 开始时间：最小为当前时间，最大为7天后
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    this.setData({
      startTime: currentTime,
      endTime: "选择结束时间",
      startDate: now.getTime(),
      endDate: null,
      minDate: now.getTime(),
      maxStartDate: sevenDaysLater.getTime(),
      minEndDate: now.getTime(),
      maxEndDate: sevenDaysLater.getTime(),
      selectedHours: 0,
    });
  },

  // 格式化时间为 YYYY/MM/DD HH:mm
  formatTime: function(date) {
    if (typeof date === 'number') {
      date = new Date(date);
    }
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    var hour = date.getHours().toString().padStart(2, '0');
    var minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}/${month}/${day} ${hour}:${minute}`;
  },

  // 手机号输入
  onPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 金额输入
  onMoneyInput: function(e) {
    this.setData({
      money: e.detail.value
    });
  },

  // 点击开始时间单元格
  onStartTimeTap: function() {
    this.setData({
      showStartTimePicker: true
    });
  },

  // 确认开始时间
  onStartTimeConfirm: function(e) {
    console.log('开始时间确认:', e.detail);
    // 获取时间戳（兼容不同版本的 Vant）
    let selectedDate = e.detail;
    if (e.detail && typeof e.detail === 'object') {
      selectedDate = e.detail.value;
    }
    if (typeof selectedDate === 'string') {
      selectedDate = Number(selectedDate);
    }
    if (!selectedDate || isNaN(selectedDate)) {
      console.error('时间戳无效:', e.detail);
      return;
    }

    const timeStr = this.formatTime(selectedDate);
    console.log('格式化后的时间:', timeStr);

    // 更新开始时间
    this.setData({
      startTime: timeStr,
      startDate: selectedDate,
      showStartTimePicker: false,
      minEndDate: selectedDate,
      selectedHours: 0,
    });

    // 如果结束时间早于开始时间，自动调整
    if (this.data.endDate && this.data.endDate < selectedDate) {
      this.setData({
        endDate: selectedDate,
        endTime: timeStr
      });
    }
  },

  // 点击结束时间单元格
  onEndTimeTap: function() {
    this.setData({
      showEndTimePicker: true
    });
  },

  // 确认结束时间
  onEndTimeConfirm: function(e) {
    console.log('结束时间确认:', e.detail);
    // 获取时间戳（兼容不同版本的 Vant）
    let selectedDate = e.detail;
    if (e.detail && typeof e.detail === 'object') {
      selectedDate = e.detail.value;
    }
    if (typeof selectedDate === 'string') {
      selectedDate = Number(selectedDate);
    }
    if (!selectedDate || isNaN(selectedDate)) {
      console.error('时间戳无效:', e.detail);
      return;
    }

    const timeStr = this.formatTime(selectedDate);
    console.log('格式化后的时间:', timeStr);

    // 结束时间必须晚于开始时间
    if (this.data.startDate && selectedDate < this.data.startDate) {
      wx.showModal({
        content: "结束时间不能早于开始时间",
        showCancel: false
      });
      return;
    }

    this.setData({
      endTime: timeStr,
      endDate: selectedDate,
      showEndTimePicker: false,
      selectedHours: 0,
    });
  },

  // 快捷时间选择
  setQuickTime: function(e) {
    const hours = parseInt(e.currentTarget.dataset.hours);
    if (!this.data.startDate) {
      wx.showModal({
        content: "请先选择开始时间",
        showCancel: false
      });
      return;
    }

    const startTime = new Date(this.data.startDate);
    const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);

    // 检查是否超过7天限制
    const maxEndTime = new Date(this.data.startDate + 7 * 24 * 60 * 60 * 1000);
    if (endTime > maxEndTime) {
      wx.showModal({
        content: "结束时间不能超过开始时间7天后",
        showCancel: false
      });
      return;
    }

    this.setData({
      endDate: endTime.getTime(),
      endTime: this.formatTime(endTime),
      selectedHours: hours,
    });
  },

  // 提交
  submit: function() {
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
    let price = 0;
    if(that.data.money){
      price = that.data.money;
    }
    http.request(
      "/member/manager/submitOrder",
      "1",
      "post",
      {
        roomId: that.data.roomId,
        startTime: that.data.startTime,
        endTime: that.data.endTime,
        mobile: that.data.phone,
        statistics: that.data.statistics,
        price: price,
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
            delta: 1
          });
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false
          });
        }
      },
      function fail(info) { }
    );
  },

  changeStatisticsStatus: function() {
    let that = this;
    that.setData({
      statistics: !that.data.statistics
    });
  },
});
