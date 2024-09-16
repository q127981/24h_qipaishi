// pages/editPages/editPages.js
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    times: new Array(24).fill().map((_, i) => ({
      index: i,
      checked: false
    })),
    index: 0,
    hours: 1,
    stores: [], // 用于存储门店列表
    selectedStoreId: null, // 选中的门店ID
    storeName: '', // 选中的门店名称
    storeIndex: -1, // 确保有一个有效的初始索引
    storeId: '',
    switchChecked: false,
    checked: [], // 默认选中复选框 a
    weekDays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    checkedStates: Array(7).fill(false), // 初始未选中状态
    storesRoomList: [{key: "0",value: "不限"},{key: "1",value: "小包"},{key: "2",value: "中包"},{key: "3",value: "大包"},{key: "4",value: "豪包"},{key: "5",value: "商务包"}], //用于储存限制房间数据
    storesRoomIndex: 0, //默认第一个
    storesRoomName: '', //选中的限制房间类型
    item: {}, //回显数据
    price: '', //价格
    balanceBuy: false,//支持余额支付
    roomStoreId:'',//门店id
  },
  // 获取适用门店列列表
  //获取门店下拉列表数据
  getStoreList: function () {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        // "/member/index/getStoreList",
        "/member/store/getStoreList",
        "1",
        "get", {
          cityName: ''
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('下拉门店数据===');
          console.log(info,'门店数据');
          if (info.code == 0 && info.data.length > 0) {
            // 更新门店列表和默认选中的门店
            let storeIndex = 0
            info.data.map((it,index) => {
              console.log(it);
              if(it.value === that.data.storeId){
                storeIndex = index
              }
            })
            that.setData({
              stores: info.data,
              storeName: that.formatString(info.data[storeIndex].key, 10), // 默认选中第一个门店的名称
              storeIndex: storeIndex, // 默认选中门店的索引
              roomStoreId:info.data[storeIndex].value
            });
          } else {
            wx.showModal({
              content: '请求服务异常，请稍后重试',
              showCancel: false,
            });
          }
        },
        function fail(info) {
          wx.showToast({
            title: '网络错误，请检查您的网络连接',
            icon: 'none'
          });
        }
      );
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
    }
  },
  // 选择门店
  handlePickerChanges: function (e) {
    const newIndex = e.detail.value;
    const newStore = this.data.stores[newIndex];
    console.log(newStore,'newStore');
    this.setData({
      storeIndex: e.detail.value,
      roomStoreId:newStore.value,
      storeName:newStore.key
      // storeIndex:newStore.value
    });
    console.log(this.data.storeIndex,'storeIndex');
  },
  //
  // 处理用户选择变更：限制房间的类型
  handlePickerChange: function (e) {
    const newIndex = e.detail.value;
    const newStore = this.data.storesRoomList[newIndex];
    this.setData({
      storesRoomIndex: newIndex,
      storesRoomName: newStore.value
    });
  },
  chackWeek(e) {
    const index = e.currentTarget.dataset.index;
    const checkedStates = this.data.checkedStates.slice(); // 创建week数组的副本
    checkedStates[index] = !checkedStates[index];
    this.setData({
      checkedStates: checkedStates
    });
  },
  selectAll: function () {
    this.setData({
      checkedStates: Array(7).fill(true)
    });
  },
  // 星期反选
  selectInverse: function () {
    let newStates = this.data.checkedStates.map(state => !state);
    this.setData({
      checkedStates: newStates
    });
  },
  bindMultiPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value
    });
  },
  bindWeekPickerChange: function (e) {
    this.setData({
      weekIndex: e.detail.value,
      selectedWeekDays: e.detail.value.map(index => this.data.weekDays[0][index])
    });
  },
  // 增加时长
  increaseDuration: function () {
    let newCount = this.data.hours + 1;
    const maxCount = 100; // 假设最大时长为100小时
    if (newCount > maxCount) {
      newCount = maxCount;
      wx.showToast({
        title: '已达最大时长',
        icon: 'none'
      });
    }
    this.setData({
      hours: newCount
    });
  },
  // 减少时长
  decreaseDuration: function () {
    let newCount = this.data.hours - 1;
    const minCount = 1;
    if (newCount < minCount) {
      newCount = minCount;
      wx.showToast({
        title: '时长不能小于1小时',
        icon: 'none'
      });
    }
    this.setData({
      hours: newCount
    });
  },
  /* 可用时间处理逻辑：  */
  // 全选所有小时
  selectAllHours: function () {
    const times = this.data.times.map(item => ({
      ...item,
      checked: true
    }));
    this.setData({
      times
    });
  },
  // 反选所有小时
  invertSelection: function () {
    const times = this.data.times.map(item => ({
      ...item,
      checked: !item.checked
    }));
    this.setData({
      times
    });
  },
  toggleCheck: function (e) {
    const index = e.currentTarget.dataset.index;
    const times = this.data.times.slice(); // 创建times数组的副本
    times[index].checked = !times[index].checked;
    this.setData({
      times: times
    });
  },
  increment: function () {
    this.setData({
      count: this.data.count + 1
    });
  },
  decrement: function () {
    this.setData({
      count: this.data.count - 1
    });
  },
  switchChange: function (e) {
    this.setData({
      switchChecked: e.detail.value
    });
  },
  switch2Change: function (e) {
    this.setData({
      balanceBuy: e.detail.value
    });
  },
  submit: function () {
    wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 2000
    });
  },
  cancelSave: function () {
    this.setData({});
    wx.navigateBack();
  },

  //超过10个字符，将显示省略号
  formatString(str, maxLength) {
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + '...';
    } else {
      return str;
    }
  },
  handleInput: function (e) {
    let value = e.detail.value;
    // 只允许输入数字和一个小数点
    value = value.replace(/[^\d.]/g, '');
    // 只保留第一个小数点，去除多余的小数点
    value = value.replace(/^\./g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
    // 将处理后的值设置回输入框
    this.setData({
      'item.price': value
    });
  },
  // 表单验证
  onSubmit: function (e) {
  
    const formData = e.detail.value;
    const selectedTimes = this.data.times
      .filter(item => item.checked)
      .map(item => item.index);
    // 验证必填项
    if (!formData.pkg_name) {
      wx.showToast({
        title: '请输入套餐名称',
        icon: 'none'
      });
      return;
    }
    if (!this.data.storeName) {
      wx.showToast({
        title: '请选择适用门店',
        icon: 'none'
      });
      return;
    }
    if (this.data.count <= 0) {
      wx.showToast({
        title: '套餐时长必须大于0',
        icon: 'none'
      });
      return;
    }
    if (!formData.price) {
      wx.showToast({
        title: '请输入销售价格',
        icon: 'none'
      });
      return;
    }
    if (!formData.expireDay) {
      wx.showToast({
        title: '请输入过期天数',
        icon: 'none'
      });
      return;
    }
    if (!formData.maxNum) {
      wx.showToast({
        title: '请输入购买数量',
        icon: 'none'
      });
      return;
    }
    console.log('formData.store'+formData.store);
    console.log('this.data.roomStoreId'+this.data.roomStoreId);
    //所有验证成功之后提交数据保存
    // if(app.globalData.isLogin)
    {
      http.request(
        "/member/pkg/admin/saveAdminPkg",
        "1",
        "post", {
          "pkgId": this.data.item.pkgId,
          "pkgName": formData.pkg_name, //套餐名称
          "hours": formData.duration, //时长
          "storeId": this.data.roomStoreId, //门店id
          "roomType": formData.storeRoom, //限制房间类型
          "enableTime": formData.enableTime, //可用时间 0-23数字
          "enableWeek": formData.enableWeek, //可用星期 1-7 数字
          "enableHoliday": formData.enableHoliday, //节假日可用
          "balanceBuy": formData.balanceBuy, //节假日可用
          "price": formData.price, //销售价格	
          "expireDay": formData.expireDay, //购买后过期时间(天) 0=不过期	
          "maxNum": formData.maxNum, //单用户最大购买数量 0=不限	
          "sortId": formData.sortId //排序
          // enable                           //是否启用	
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.log(info)
          if (info.code == 0) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000,
              complete: function () {
                wx.navigateBack();
              }
            })
          } else {
            wx.showToast({
              title: info.msg,
              icon: 'none'
            });
          }
        },
      )
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that=this;
    if (options.item) {
      const item = JSON.parse(options.item);
      console.log(item, 'options');
      that.setData({
        item: item,
        storeName: that.formatString(item.storeName, 10), //门店
        hours: item.hours, //时长
        switchChecked: item.enableHoliday, //节假日是否可用
        balanceBuy: item.balanceBuy,
        price: item.price,
        storeId: item.storeId,
        roomType: item.roomType,
      });
      //选中指定房间
      that.data.storesRoomList.forEach(function(v, i){
        if(v.key==item.roomType){
          console.log(v);
          that.setData({
            storesRoomIndex: i,
            storesRoomName: v.value
          })
          return;
        }
      })
      // 解析 enableWeek 字符串
      if (item.enableWeek) {
        const weekDaysSet = new Set(item.enableWeek.split(', ').map(day => day.trim()));
        const checkedStates = this.data.weekDays.map(day => weekDaysSet.has(day));
        this.setData({
          checkedStates: checkedStates
        });
      }
      // 解析 enableTime 字符串
      if (item.enableTime) {
        console.log(item.enableTime);
        const timeIndices = new Set(item.enableTime.map(time => parseInt(time)));
        console.log(timeIndices, 'timeIndices');
        const times = this.data.times.map((time, index) => ({
          index: index,
          checked: timeIndices.has(index)
        }));
        console.log(times, 'times');
        this.setData({
          times: times
        });
      }
    }
    that.setData({
      storesRoomIndex: 0,
      storesRoomName: that.data.storesRoomList[0].value
    })
    that.getStoreList();
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

  }
})