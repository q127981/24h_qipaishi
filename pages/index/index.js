// pages/doorList/doorList.js
const app = getApp();
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
var Moment = require("../../lib/moment.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: '',
    titleBarHeight: '',
    storeId: '',
    storeEnvImg: [],//图片数组
    bannerImg: [],//banner
    doorinfodata: {},//门店信息
    roomClass: [],//房间种类筛选
    timeselectindex: 0,//日期选择索引值
    timebg_primary: 'bg-primary',
    timebg_primary_no: '',
    timeDayArr: [],//时间展示日期：年月日
    timeWeekArr: [],//时间展示：星期
    doorlistArr: [],//房间数组
    timeHourArr: [],//小时数组
    timeHourAllArr: [],//所有门店小时数组
    isLogin: app.globalData.isLogin,
    popshow: false,
    wifiShow: false,
    simpleModel: '',//简洁模式
    maoHeight: 0,//锚链接跳转高度
    tabIndex: '',
    show: false,
    lat: '',
    lon: '',
    showReserve: false,
    showGroupsPay: false, // 是否展示团购券信息
    groupPays: [], // 优惠券信息
    clickItem: 0, // 点击的团购券位置 默认0
    selectedRoomId: null,   // 选择的id
    svgWidth: 0, // 初始化宽度
    svgHeight: 0 // 初始化高度
  },

  imageLoad(e) {
    // 获取加载完成的 SVG 的自然尺寸
    this.setData({
      svgWidth: e.detail.width,
      svgHeight: e.detail.height
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;

    that.setData({
      isLogin: app.globalData.isLogin,
      popshow: true
    })
    console.log("onLoad index");
    that.getTap();
    var storeId = '';
    var query = wx.getEnterOptionsSync().query;
    console.log('query', query);
    if (query && query.storeId) {
      storeId = query.storeId;
    }
    if (storeId) {
      console.log("获取到门店id");
      that.setData({
        storeId: storeId
      });
      wx.setStorageSync('global_store_id', storeId);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  handleClick: function (e) {
    const room = e.currentTarget.dataset.item;
    let that = this;

    if (room.status === 0) {
      wx.showToast({
        title: '该房间不可使用',
        icon: 'none',
      });
      return;
    } else if (room.status === 1 || room.status === 2) {
      const newDoorListArr = that.data.doorlistArr.map(item => {
        if (that.data.selectedRoomId && that.data.selectedRoomId !== room.roomId && item.roomId === that.data.selectedRoomId) {
          return { ...item, fill: item.status === 1 ? '#fff' : '#7FDBFF' }; // 重置之前的选择
        } else if (item.roomId === room.roomId) {
          return { ...item, fill: 'green' }; // 设置当前选择
        } else {
          return item; // 其他保持不变
        }
      });

      that.setData({
        selectedRoomId: room.roomId,
        doorlistArr: newDoorListArr
      });
    } else if (room.status === 3 || room.status === 4) {
      wx.showToast({
        title: '房间已被预定或正在使用',
        icon: 'none',
      });
      return;
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log("onShow index");
    var that = this;
    that.getLocation().then((res) => { });;
    that.setData({
      isLogin: app.globalData.isLogin,
    })
    //尝试从缓存获取
    var storeId_1 = wx.getStorageSync('global_store_id');
    if (storeId_1) {
      //都有 优先缓存
      that.setData({
        storeId: storeId_1,
      })
    } else {
      console.log("没有门店id1");
      //返回门店列表 让选择门店
      wx.navigateTo({
        url: "../doorList/doorList",
      })
    }
    console.log('门店id:' + that.data.storeId)
    that.loadingtime();
    that.getStoreInfodata();
    that.getDoorListdata();
    that.getGroupPay();
  },
  popClose: function () {
    this.setData({ popshow: false })
  },
  loadingtime: function () {
    var that = this;
    var date = new Date(); //获取当前时间
    var year = date.getFullYear(); //获取当前年份
    var month = date.getMonth() + 1; //获取当前月份
    var day = date.getDate(); //获取当前日期    
    var atimestring = year + '-' + month + '-' + day
    var atimestring1 = [year, month, day].map(util1.formatNumber).join('-')
    //console.log('atimestring1===11111');
    //console.log(atimestring1);

    var atimelist = that.getDates(5, atimestring1);
    var alist1 = [];
    var alist2 = [];
    for (var i = 0; i < atimelist.length; i++) {
      alist1.push(atimelist[i].month + '.' + atimelist[i].day)
      alist2.push(atimelist[i].week)
    }
    that.setData({
      timeDayArr: alist1,
      timeWeekArr: alist2
    })
  },
  //获取当前时间多少天后的日期和对应星期
  getDates: function (days, todate) {//todate默认参数是当前日期，可以传入对应时间
    var dateArry = [];
    for (var i = 0; i < days; i++) {
      var dateObj = this.dateLater(todate, i);
      dateArry.push(dateObj)
    }
    return dateArry;
  },
  /**
   * 传入时间后几天
   * param：传入时间：dates:"2019-04-12",later:往后多少天
   */
  dateLater: function (dates, later) {
    let dateObj = {};
    let show_day = new Array('周日', '周一', '周二', '周三', '周四', '周五', '周六');
    let date = new Date(dates);
    date.setDate(date.getDate() + later);
    let day = date.getDay();
    dateObj.year = date.getFullYear();
    dateObj.month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : date.getMonth() + 1);
    dateObj.day = (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate());

    dateObj.week = show_day[day];
    return dateObj;
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
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  getTap() {
    const SelectorQuery = wx.createSelectorQuery();
    SelectorQuery.select('#toolbar').boundingClientRect();
    SelectorQuery.exec(res => {
      this.setData({ maoHeight: res[0].bottom + 200 })
    })
  },
  showWifi() {
    this.setData({
      wifiShow: true
    })
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
  //续费
  onclickxufei: function () {
    wx.showToast({
      title: '未找到订单',
      icon: 'none'
    })
  },
  // 打开地图
  goMap(store) {
    wx.openLocation({
      latitude: store.lat,
      longitude: store.lon,
      name: store.storeName,
      address: store.address,
      scale: 28
    })
  },
  goYuyue() {
    wx.navigateTo({
      url: `/pages/booking/booking?storeId=${this.data.storeId}`
    })
  },
  goIndexPage() {
    console.log(this.data.storeId)
    wx.navigateTo({
      url: '/pages/doorList/doorList',
    })
  },
  goDoorDetail() {
    var that = this;
    wx.navigateTo({
      url: '../doorDetail/doorDetail?storeId=' + that.data.storeId,
    })
  },
  tempArr: function (key) {
    Object.keys(aobject.disabledTimeSlot).sort().forEach(function (key) {
      requestArr.push(key + '=' + aobject.disabledTimeSlot[key]);
    });
  },
  goStudy() {
    let that = this
    let roomid = that.data.selectedRoomId
    if (roomid == null) {
      wx.showToast({
        title: '请先选择座位',
      })
      return
    }
    let list = that.data.doorlistArr
    let selectedRoom = list.find(item => item.roomId === roomid);
    console.log(selectedRoom)

    var atime = '';
    if (that.data.timeselectindex >= 0)
      atime = that.data.timeDayArr[that.data.timeselectindex];
    var storeId = that.data.storeId
    if (selectedRoom.status == 2) {
      if (that.data.doorinfodata.clearOpen) {
        wx.showModal({
          title: '提示',
          content: '您选择的此场地暂未清洁，介意请勿预订！',
          confirmText: '继续预定',
          complete: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '../orderSubmit/orderSubmit?roomId=' + selectedRoom.roomId + '&daytime=' + atime + '&storeId=' + storeId + '&timeselectindex=' + that.data.timeselectindex,
              })
            } else if (res.cancel) {
              //console.log('用户点击取消')
            }
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '房间暂未清洁，禁止预订！',
          showCancel: false
        })
      }
    } else {
      wx.navigateTo({
        url: '../orderSubmit/orderSubmit?roomId=' + selectedRoom.roomId + '&daytime=' + atime + '&storeId=' + storeId + '&timeselectindex=' + that.data.timeselectindex,
      })
    }

  },
  goOrder(e) {
    var that = this;
    let status = e.currentTarget.dataset.status;
    if (status == 0) {
      return
    }
    let aroomid = e.currentTarget.dataset.info;
    var atime = '';
    if (that.data.timeselectindex >= 0)
      atime = that.data.timeDayArr[that.data.timeselectindex];
    var storeId = that.data.storeId
    if (status == 2) {
      if (that.data.doorinfodata.clearOpen) {
        wx.showModal({
          title: '提示',
          content: '您选择的此场地暂未清洁，介意请勿预订！',
          confirmText: '继续预定',
          complete: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '../orderSubmit/orderSubmit?roomId=' + aroomid + '&daytime=' + atime + '&storeId=' + storeId + '&timeselectindex=' + that.data.timeselectindex,
              })
            } else if (res.cancel) {
              //console.log('用户点击取消')
            }
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '房间暂未清洁，禁止预订！',
          showCancel: false
        })
      }
    } else {
      wx.navigateTo({
        url: '../orderSubmit/orderSubmit?roomId=' + aroomid + '&daytime=' + atime + '&storeId=' + storeId + '&timeselectindex=' + that.data.timeselectindex,
      })
    }
  },
  phone: function (e) {
    var that = this;
    //console.log('手机号码授权+++++++');
    if (e.detail.errMsg == "getPhoneNumber:fail user deny") {
      wx.showToast({ title: '已取消授权' })
    }
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      //console.log('手机号码授权+++++++');
      wx.login({
        success: function (res) {
          if (res.code != null) {
            http.request(
              "/member/auth/weixin-mini-app-login",
              "1",
              "post", {
              "phoneCode": e.detail.code,
              "loginCode": res.code
            },
              "",
              "获取中...",
              function success(info) {
                console.info('返回111===');
                console.info(info);
                if (info.code == 0) {
                  if (info.data) {
                    app.globalData.userDatatoken = info.data;
                    app.globalData.isLogin = true;
                    that.setData({
                      isLogin: true,
                    })
                    //缓存服务器返回的用户信息
                    wx.setStorageSync("userDatatoken", info.data);
                    this.goOrder(e);
                  }
                }
              },
              function fail(info) {

              }
            )
          } else {
            //console.log('登录失败！' + res.errMsg)
          }
        }
      })
    }
  },
  timeFilter(startTime, endTime) {
    if (startTime && !endTime) {
      return Moment(startTime).format("MM月DD日HH:mm");
    } else if (startTime && endTime) {
      const start = Moment(startTime);
      const end = Moment(endTime);
      return `${start.format("MM月DD日HH:mm")}-${end.format("HH:mm")}`;
    } else {
      return "";
    }
  },
  //获取房间列表数据
  getDoorListdata: function (e) {
    var that = this;
    if (that.data.storeId) {
      http.request(
        "/member/index/getRoomInfoList",
        "1",
        "post", {
        "storeId": that.data.storeId,
        "roomClass": that.data.tabIndex,
      },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('返回111===');
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

                if (el.roomClass == 2) {
                  // 禁用
                  if (el.status == 0) {
                    el.fill = '#e5e5e5' // 灰色
                  }
                  // 空闲
                  if (el.status == 1) {
                    el.fill = '#fff'   //  白色
                  }
                  // 待清洁
                  if (el.status == 2) {
                    el.fill = '#7FDBFF'  // 蓝色
                  }
                  // 使用中
                  if (el.status == 3) {
                    el.fill = '#DC143C'  //  红色
                  }
                  // 预约
                  if (el.status == 4) {
                    el.fill = '#F0E68C'  // 黄色
                  }
                }

                return el;
              }),
            });
            that.setroomlistHour(0);
          } else {
            wx.showModal({
              content: "请求服务异常，请稍后重试",
              showCancel: false,
            });
          }
        },
        function fail(info) {

        }
      )
    }
  },
  //设置列表禁用时间轴
  setroomlistHour: function (aindex) {
    //aindex代表选的第几天  从0开始
    var that = this;
    var atemplist = [];
    //根据门店循环
    for (var i = 0; i < that.data.doorlistArr.length; i++) {
      var atemp = that.data.doorlistArr[i].timeSlot.slice(aindex * 24, aindex * 24 + 24);
      atemplist.push(atemp);
      // console.log(atemp);
    }
    that.setData({
      timeHourAllArr: atemplist
    });
  },
  //获取门店信息
  getStoreInfodata: function (e) {
    var that = this;
    if (!that.data.storeId) {
      wx.navigateTo({
        url: '../doorList/doorList',
      })
    }
    console.log("getStoreInfodata");
    console.log(that.data.lat);
    console.log(that.data.lon);
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getStoreInfo" + '/' + that.data.storeId,
        "1",
        "get", {
        "lat": that.data.lat,
        "lon": that.data.lon,
      },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('门店信息===');
          // console.info(info);
          if (info.code == 0) {
            if (null != info.data) {
              that.setData({
                doorinfodata: info.data,
                simpleModel: info.data.simpleModel
              });
              if (null != info.data.storeEnvImg && info.data.storeEnvImg.length > 0) {
                var arr = info.data.storeEnvImg.split(",");
                that.setData({
                  storeEnvImg: arr
                });
              }
              if (null != info.data.bannerImg && info.data.bannerImg.length > 0) {
                var arr = info.data.bannerImg.split(",");
                that.setData({
                  bannerImg: arr
                });
              }
              //增加房间类别的筛选条件
              if (null != info.data.roomClassList && info.data.roomClassList.length > 0) {
                const classArr = [];
                info.data.roomClassList.forEach(e => {
                  if (e === 0) {
                    classArr.push({ text: '棋牌', value: 0 });
                  } else if (e === 1) {
                    classArr.push({ text: '台球', value: 1 });
                  } else if (e === 2) {
                    classArr.push({ text: '自习室', value: 2 });
                  }
                });
                that.setData({
                  roomClass: classArr
                });
              }
            } else {
              wx.navigateTo({
                url: "../doorList/doorList",
              })
            }
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            })
            wx.navigateTo({
              url: "../doorList/doorList",
            })
          }
        },
        function fail(info) {
        }
      )
    }
  },
  call: function () {
    let that = this;
    var phoneLength = that.data.doorinfodata.kefuPhone.length;
    if (phoneLength > 0) {
      if (phoneLength == 11) {
        wx.makePhoneCall({
          phoneNumber: that.data.doorinfodata.kefuPhone,
          success: function () {
            //console.log("拨打电话成功！")
          },
          fail: function () {
            //console.log("拨打电话失败！")
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '客服上班时间10：00~23：00\r\n如您遇到问题，建议先查看“使用帮助”！\r\n本店客服微信号：' + that.data.doorinfodata.kefuPhone,
          confirmText: '复制',
          complete: (res) => {
            if (res.confirm) {
              wx.setClipboardData({
                data: that.data.doorinfodata.kefuPhone,
                success: function (res) {
                  wx.showToast({ title: '微信号已复制到剪贴板！' })
                }
              })
            } else if (res.cancel) {
              //console.log('用户点击取消')
            }
          }
        })
      }
    }
  },
  //选中时间
  selectTime: function (e) {
    let that = this
    var index = e.currentTarget.dataset.index//获取当前点击的下标
    that.setData({
      timeselectindex: index
    });
    that.setroomlistHour(index);
  },
  //充值
  goRecharge() {
    var that = this;
    var storeId = that.data.storeId
    console.log(storeId)
    if (app.globalData.isLogin) {
      wx.navigateTo({
        url: '../recharge/recharge?storeId=' + storeId,
      })
    } else {
      that.gotologin();
    }
  },
  //团购
  gototuangou() {
    var that = this;
    wx.navigateTo({
      // url: '../tuangou/tuangou'
      url: '../tuangou/tuangou?storeId=' + that.data.doorinfodata.storeId
    })
  },
  toShop() {
    var that = this;
    wx.navigateTo({
      url: '../shop/shop?storeId=' + that.data.doorinfodata.storeId
    })
  },
  toRecharge() {
    wx.switchTab({
      url: `/pages/recharge/recharge?storeId=${this.data.storeId}&mode=1`,
    });
  },
  //在线组局
  gotodoor() {
    var that = this
    var data = { cityName: that.data.doorinfodata.cityName, storeId: that.data.doorinfodata.storeId }
    wx.setStorageSync('door', data)
    wx.reLaunch({
      url: '../door/door',
    })
  },
  openDoor(e) {
    var that = this;
    // let aindex = e.currentTarget.dataset.index;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/getOrderInfo",
        "1",
        "get", {
      },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('订单信息===');
          if (info.code === 0 && info.data) {
            //有订单  调用开门
            let startTime = new Date(info.data.startTime);
            if (info.data.status == 0 && startTime > Date.now()) {
              wx.showModal({
                title: '温馨提示',
                content: '当前还未到预约时间，是否提前开始消费？',
                success: function (res) {
                  if (res.confirm) {
                    that.openRoomDoor(info.data);
                  }
                }
              })
            } else {
              that.openRoomDoor(info.data);
            }
          } else {
            wx.showModal({
              title: '温馨提示',
              content: '当前无有效订单，请先下单！',
              showCancel: false,
              success(res) {
              }
            })
          }
        },
        function fail(info) {
        }
      )
    } else {
      that.gotologin();
    }
  },
  //到登录界面
  gotologin() {
    wx.navigateTo({
      url: '../login/login',
    })
  },
  //图片点击事件
  imgYu: function (event) {
    var that = this;
    let aindex = event.currentTarget.dataset.index;
    var alistimage = that.data.doorlistArr[aindex];
    var aimagearr = alistimage.imageUrls;

    //console.log("点击图片********")

    if (aimagearr.length > 0) {
      var anewimagearr = aimagearr.split(',');
      var src = anewimagearr[0] + '?Content-Type=image/jpg'; //获取data-src
      var imgList = anewimagearr; //获取data-list
      //图片预览
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: imgList // 需要预览的图片http链接列表
      })
    } else {
      wx.showToast({
        title: '该房间暂无图片介绍',
        icon: 'none'
      })
    }
  },
  gotest: function () {
    wx.navigateTo({
      url: '../roomRenew/roomRenew?storeId=12&roomId=20',
    })
  },
  copyWifi: function (e) {
    let ssid = e.currentTarget.dataset.ssid;
    let pwd = e.currentTarget.dataset.pwd;
    wx.setClipboardData({
      data: pwd,
      success: function (res) {
        wx.showToast({ title: '已复制到剪贴板！' })
      }
    })
    this.setData({
      wifiShow: false
    })
  },
  connectWifi: function (e) {
    console.log(e)
    var that = this;
    let ssid = e.currentTarget.dataset.ssid;
    let pwd = e.currentTarget.dataset.pwd;
    wx.startWifi({
      success(res) {
        // console.log(res.errMsg)
        wx.connectWifi({
          SSID: ssid,
          password: pwd,
          success(res) {
            this.setData({
              wifiShow: false
            })
            wx.showToast({ title: '自动连接WiFi成功' })
          },
          fail(res) {
            wx.showToast({ title: res })
          }
        })
      },
      fail(res) {
        wx.showToast({ title: res })
      }
    })
  },
  tabChange(e) {
    console.log(e)
    const { target } = e
    this.setData({
      tabIndex: Number(target.dataset.index),
      doorlistArr: []
    }, () => {
      this.getDoorListdata()
    })
  },
  openRoomDoor: function (data) {
    let that = this;
    //开房间门
    console.log('开房间门');
    http.request(
      "/member/order/openRoomDoor?orderKey=" + data.orderKey,
      "1",
      "post", {
      // "orderKey":that.data.orderKey,
    },
      app.globalData.userDatatoken.accessToken,
      "提交中...",
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
  onClickShow(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      show: true,
      popupIndex: +index
    });
  },
  onClickHide() {
    this.setData({ show: false });
  },
  // 续费 逻辑和开门一致 查看是否有订单 有的话拿出订单信息去续单
  roomRenew() {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/getOrderInfo",
        "1",
        "get", {
      },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('订单信息===');
          if (info.code === 0 && info.data) {
            wx.navigateTo({
              url: `/pages/roomRenew/roomRenew?storeId=${info.data.storeId}&roomId=${info.data.roomId}`,
            });
          } else {
            wx.showToast({
              title: "当前无订单",
              icon: "none",
            });
          }
        },
        function fail(info) {
        }
      )
    } else {
      that.gotologin();
    }
    // if (!this.data.currentOrder){
    //     return wx.showToast({
    //     title: "当前无订单",
    //     icon: "none",
    //   });
    // }else{
    //      wx.navigateTo({
    //   url: `/pages/roomRenew/roomRenew?storeId=${this.data.currentOrder.storeId}&roomId=${this.data.currentOrder.roomId}`,
    // });
    // }
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
  // 在需要获取位置的页面的Page函数中定义获取位置的方法
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
          // that.getMainListdata('refresh');
          // 处理位置信息，比如将位置信息显示在页面上
          // 示例中使用的是util.js中的函数，开发者可以根据需要自行编写
          //util.showLocation(latitude, longitude)
        },
        fail: function (res) {
          // that.getMainListdata('refresh');
          // 如果获取位置信息失败，可以处理错误情况
          //console.log('获取位置失败', res.errMsg)
        }
      })
    });
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
            let groupPays = info.data;
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
    let item = e.currentTarget.dataset.item;
    let that = this;
    that.setData({
      showGroupsPay: false
    })
    wx.navigateTo({
      url: '../tuangou/tuangou?storeId=' + that.data.doorinfodata.storeId + '&&ticketNo=' + item.ticketNo,
    })
  },
  cancelUser: function () {
    let that = this
    that.setData({
      showGroupsPay: false
    })
  }
})