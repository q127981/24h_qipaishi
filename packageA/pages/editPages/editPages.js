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
    storeId: '',
    storeName: '',
    switchChecked: false,
    checked: [], // 默认选中复选框 a
    weekDays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    weekNum: ["1", "2", "3", "4", "5", "6", "7"],
    roomTypeNum: ["1", "2", "3", "4", "5", "6", "7", "8"],
    checkedStates: Array(7).fill(false), // 初始未选中状态
    roomTypeCheckd: Array(5).fill(false),
    enableRoomCheck: [],
    storesRoomList: [{ key: "1", value: "小包" }, { key: "2", value: "中包" }, { key: "3", value: "大包" }, { key: "4", value: "豪包" }, { key: "5", value: "商务包" }, { key: "6", value: "斯洛克" }, { key: "7", value: "中式黑八" }, { key: "8", value: "‌美式球桌" }], //用于储存限制房间数据
    item: {}, //回显数据
    price: '', //价格
    balanceBuy: false,//支持余额支付
    roomClass: [],//房间种类筛选
    doorinfodata: {},//门店信息
    roomLimit: [{ text: '按大小设置', value: 0 }, { text: '按包厢设置', value: 1 }],
    tabIndex: 0,
    checkedRoomList: [],
    doorList: [], // 房间列表存放
  },
  tabChange(e) {
    const { target } = e
    this.setData({
      tabIndex: Number(target.dataset.index),
      checkedRoomList: []
    })
  },
  checkboxChange(event) {
    // roomType 为包厢类型 roomId 为 小包、中包的index
    // const roomType = event.currentTarget.dataset.roomType;
    // if (roomType!= undefined) {
    //     const selectedRooms = event.detail.value;
    //     let newCheckedList = [];
    //     // 逐个添加原始数组中可修改的元素副本
    //     this.data.checkedRoomList.forEach(item => {
    //         newCheckedList.push({...item});
    //     });
    //     newCheckedList = newCheckedList.filter(item => item.roomType!== roomType);
    //     newCheckedList.push(...selectedRooms.map(roomId => ({ roomId, roomType })));
    //     this.setData({
    //         checkedRoomList: newCheckedList
    //     });
    // } else {
    this.setData({
      checkedRoomList: event.detail.value
    })
    // }

    console.log(this.data.checkedRoomList);
  },
 
 
  chackRoomType(e) {
    const index = e.currentTarget.dataset.index;
    const checkedStates = this.data.roomTypeCheckd.slice();
    checkedStates[index] = !checkedStates[index];
    this.setData({
      roomTypeCheckd: checkedStates
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
        "storeId": this.data.storeId, //门店id
        "roomType": formData.roomType, //限制房间类型
        "enableTime": formData.enableTime, //可用时间 0-23数字
        "enableWeek": formData.enableWeek, //可用星期 1-7 数字
        "enableHoliday": formData.enableHoliday, //节假日可用
        "balanceBuy": formData.balanceBuy, //节假日可用
        "price": formData.price, //销售价格	
        "expireDay": formData.expireDay, //购买后过期时间(天) 0=不过期	
        "maxNum": formData.maxNum, //单用户最大购买数量 0=不限	
        "sortId": formData.sortId, //排序
        "mtId": formData.mtId,
        "dyId": formData.dyId,
        "ksId": formData.ksId,
        "enableRoom": formData.enableRoom,
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
    console.log(options)
    var that = this;
    console.log("1111")
    that.setData({
      storeId: options.storeId,
      storeName: options.storeName,
    })

    setTimeout(() => {
      
    }, 500);
    if (options.item) {
      const item = JSON.parse(options.item);
      console.log(item, 'options');
      that.setData({
        item: item,
        hours: item.hours, //时长
        switchChecked: item.enableHoliday, //节假日是否可用
        balanceBuy: item.balanceBuy,
        price: item.price,
        roomType: item.roomType,
      });
      // 查看该门店有哪些房间
      that.getDoorList((val) => {
        that.setData({
          doorList: val.data
        })
        if (item.enableRoom) {
          const enableRoomString = String(item.enableRoom);
          const enableRoomSet = new Set(enableRoomString.split(',').map(item => item.trim()));
          const checkedStates = val.data.map(item =>
            enableRoomSet.has(String(item.roomId))
          );
          this.setData({
            tabIndex: 1,
            enableRoomCheck: checkedStates,
          });
        }
      })
      // 解析 enableWeek 字符串
      if (item.enableWeek) {
        const weekDaysString = String(item.enableWeek);
        const weekDaysSet = new Set(weekDaysString.split(',').map(day => day.trim()));
        const checkedStates = this.data.weekNum.map(day => weekDaysSet.has(day));
        this.setData({
          checkedStates: checkedStates
        });
      }
      if (item.roomType) {
        const roomTypeString = String(item.roomType);
        const roomTypeSet = new Set(roomTypeString.split(',').map(item => item.trim()));
        const checkedStates = this.data.roomTypeNum.map(item => roomTypeSet.has(item));
        this.setData({
          roomTypeCheckd: checkedStates
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
    } else {
      setTimeout(() => {
         // 查看该门店有哪些房间  点击的新增 不需要判断哪些被选中
      that.getDoorList((val) => {
        that.setData({
          doorList: val.data
        })
      })
      }, 500);
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

  // 获取房间列表
  getDoorList: function (callback) {
    console.log(12321321)
    let that = this
    if (app.globalData.isLogin) {
      http.request(
        "/member/store/getRoomInfoList?storeId=" + that.data.storeId,
        "1",
        "post", {
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            callback(info);
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
    }
  },


})