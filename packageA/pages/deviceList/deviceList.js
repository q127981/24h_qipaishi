const app = getApp()
var http = require('../../../utils/http');
var lock = require('../../../utils/lock');
var util = require('../../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: '',
    roomId: '',
    storeName: '',
    roomList: [],
    roomIndex: '',
    deviceTypes: [{ value: '', text: '请选择类型' }, { value: 1, text: '磁力锁门禁' }, { value: 2, text: '空开' }, { value: 7, text: '插座' }, { value: 3, text: '云喇叭' }, { value: 10, text: '云喇叭(语音款)' }, { value: 4, text: '灯具' }, { value: 5, text: '智能锁' }, { value: 6, text: '网关' }, { value: 13, text: '三路控制器' }, { value: 14, text: 'AI锁球器' }, { value: 16, text: '计时器' }, { value: 8, text: '锁球器控制器（12V）' }, { value: 9, text: '人脸门禁机' }, { value: 11, text: '二维码识别器' }, { value: 12, text: '红外控制器' }],
    deviceTypeIndex: '',
    deviceType: '',
    deviceList: [],
    isIpx: app.globalData.isIpx ? true : false,
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,
    showAdd: false,
    deviceSn: '',
    shareDevice: false,
    beforeCloseFunction: null,
    lockList: [],
    showLockList: false,
    showLockOp: false,
    lockData: '',
    lockSn: '',
    setLockPwdShow: false,
    lockPwd: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      storeId: options.storeId,
      storeName: options.storeName,
    })
    this.setData({ beforeCloseFunction: this.beforeClose() })
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
    this.getDeviceList('refresh');
    this.getRoomListAdmin();
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
    let that = this;
    that.setData({
      pageNo: 1,
      canLoadMore: true,
      deviceList: []
    })
    that.getDeviceList("refresh");
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.getDeviceList('');
    } else {
      wx.showToast({
        title: '我是有底线的...',
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  beforeClose() {
    // 这里一定要用箭头函数，否则访问不到this
    return (type) => {
      //console.log(type)
      if (type === 'cancel') {
        // 点击取消
        return true
      } else {
        // 点击确定
      }
    }
  },
  //管理员获取房间下拉列表数据
  getRoomListAdmin: function () {
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/getRoomList/" + that.data.storeId,
        "1",
        "get", {
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('下拉房间数据===');
          if (info.code == 0) {
            let roomList = []
            info.data.map(it => {
              roomList.push({ text: it.key, value: it.value })
            })
            roomList.unshift({ text: "全部房间", value: "" })
            that.setData({
              roomList: roomList,
            })
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
  // 获取设备列表
  getDeviceList: function (e) {
    let that = this
    if (app.globalData.isLogin) {
      if (e == "refresh") { //刷新，page变为1
        that.setData({
          deviceList: [],
          pageNo: 1,
          canLoadMore: true
        })
      }
      http.request(
        "/member/device/getDevicePage",
        "1",
        "post", {
        "pageNo": that.data.pageNo,
        "pageSize": that.data.pageSize,
        "type": that.data.deviceType,
        "storeId": that.data.storeId,
        "roomId": that.data.roomId,
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            if (info.data.list.length === 0) {
              that.setData({
                canLoadMore: false
              })
            } else {
              //有数据
              info.data.list.forEach((item, index) => {
                item.typeName = util.getDeviceTypeName(item.type)
              })
              if (that.data.deviceList) {
                //列表已有数据  那么就追加
                let arr = that.data.deviceList;
                let arrs = arr.concat(info.data.list);
                that.setData({
                  deviceList: arrs,
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total
                })
              } else {
                that.setData({
                  deviceList: info.data.list,
                  pageNo: that.data.pageNo + 1,
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
    }
  },
  //房间下拉菜单发生变化
  roomDropdown(event) {
    this.data.roomList.map(it => {
      if (it.value === event.detail) {
        this.setData({
          roomId: it.value,
        })
      }
    })
    this.getDeviceList("refresh")
  },
  //类型下拉菜单发生变化
  typeDropdown(event) {
    let that = this
    this.data.deviceTypes.map(it => {
      if (it.value == event.detail) {
        if (it.value == -1) {
          that.setData({
            deviceType: '',
          })
        } else {
          that.setData({
            deviceType: it.value,
          })
        }
        that.getDeviceList("refresh");
      }
    })
  },
  // 添加
  add() {
    this.setData({
      showAdd: true
    })
  },
  bindDeviceTypeSelect: function (e) {
    this.setData({
      deviceTypeIndex: e.detail.value,
    })
  },
  bindStoreSelect: function (e) {
    console.log(e.detail.value)
    if (e.detail.value && e.detail.value != 0) {
      var that = this;
      that.setData({
        roomIndex: ''
      })
      that.getRoomListAdmin()
    }
  },
  bindRoomSelect: function (e) {
    this.setData({
      roomIndex: e.detail.value,
    })
  },
  changeSwitchStatus: function () {
    this.setData({
      shareDevice: !this.data.shareDevice // 根据当前状态取反
    });
    console.log(this.data.shareDevice)
  },
  submitAdd: function () {
    var that = this;
    if (!that.data.deviceSn) {
      wx.showToast({
        title: '请输入设备编号',
        icon: 'error'
      })
      return
    }
    if (!that.data.deviceTypeIndex || that.data.deviceTypeIndex == 0) {
      wx.showToast({
        title: '请选择设备类型',
        icon: 'error'
      })
      return
    }
    var deviceType = that.data.deviceTypes[that.data.deviceTypeIndex].value;
    var roomId = '';
    if (that.data.roomIndex != 0) {
      roomId = that.data.roomList[that.data.roomIndex].value;
    }
    //保存数据
    if (app.globalData.isLogin) {
      http.request(
        "/member/store/addDevice",
        "1",
        "post", {
        "deviceSn": that.data.deviceSn,
        "shareDevice": that.data.shareDevice,
        "deviceType": deviceType,
        "storeId": that.data.storeId,
        "roomId": roomId,
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          if (info.code == 0) {
            wx.showToast({
              title: '添加成功',
              icon: 'success'
            })
            that.setData({
              deviceSn: ''
            });
            that.getDeviceList('refresh');
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
  cancelAdd: function () {
    this.setData({
      deviceTypeIndex: '',
      roomIndex: '',
      shareDevice: false,
      deviceSn: '',
    })
  },
  delDevice: function (e) {
    var that = this;
    var deviceId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定删除此设备绑定吗？为了避免误操作，仅允许超管删除',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          if (app.globalData.isLogin) {
            http.request(
              "/member/store/delDevice/" + deviceId,
              "1",
              "post", {
            },
              app.globalData.userDatatoken.accessToken,
              "",
              function success(info) {
                console.info('返回111===');
                if (info.code == 0) {
                  wx.showToast({
                    title: '删除成功',
                    icon: 'success'
                  })
                  that.getDeviceList('refresh');
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
        }
      }
    })
  },
  checkBall: function (e) {
    var that = this;
    var deviceId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '请将台球全部放入锁球器/锁球柜中，不要堆叠摆放台球！',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          wx.showLoading({
            title: '检测中....',
          })
          if (app.globalData.isLogin) {
            http.request(
              "/member/store/checkBall/" + deviceId,
              "1",
              "post", {
            },
              app.globalData.userDatatoken.accessToken,
              "",
              function success(info) {
                wx.hideLoading();
                if (info.code == 0) {
                  if (info.data) {
                    wx.showModal({
                      title: '提示',
                      content: '全部球已正常归还',
                      showCancel: false,
                      complete: (res) => {
                        if (res.cancel) {
                        }
                        if (res.confirm) {
                        }
                      }
                    })
                  } else {
                    wx.showModal({
                      title: '提示',
                      content: '归还检测不通过！请检查球是否归还完毕，不要堆叠摆放台球！',
                      showCancel: false,
                      complete: (res) => {
                        if (res.cancel) {
                        }
                        if (res.confirm) {
                        }
                      }
                    })
                  }
                } else {
                  wx.showModal({
                    content: info.msg,
                    showCancel: false,
                  })
                }
              },
              function fail(info) {
                wx.hideLoading();
                wx.showToast({
                  title: '请求失败',
                  icon: 'error'
                })
              }
            )
          }
        }
      }
    })
  },
  lockAotuOpen: function () {
    var that = this;
    if (that.data.lockData) {
      wx.showModal({
        title: '提示',
        content: '请打开手机蓝牙，靠近门锁操作！锁常开=开锁后不会自动关锁，除非收到关锁指令。您确认设置锁常开吗？',
        complete: (res) => {
          if (res.confirm) {
            wx.showLoading({
              title: '请靠近门锁',
            })
            lock.setAotuLockTime(that.data.lockData, 0);
          }
        }
      })
    }
  },
  lockAotuClose: function () {
    var that = this;
    if (that.data.lockData) {
      wx.showModal({
        title: '提示',
        content: '请打开手机蓝牙，靠近门锁操作！锁自动关=每次开锁10秒后，锁会自动关闭。您确认设置锁自动关吗？',
        complete: (res) => {
          if (res.confirm) {
            wx.showLoading({
              title: '请靠近门锁',
            })
            lock.setAotuLockTime(that.data.lockData, 10);
          }
        }
      })
    }
  },
  lockConfigWifi: function () {
    var that = this;
    if (that.data.lockData) {
      wx.showModal({
        title: '提示',
        content: '仅带Wifi功能的智能锁支持，您是否确认配置？',
        complete: (res) => {
          if (res.cancel) {
          }
          if (res.confirm) {
            wx.navigateTo({
              url: '../configLockWifi/index?lockData=' + that.data.lockData,
            })
          }
        }
      })

    } else {
      wx.showToast({
        title: '锁数据异常',
      })
    }
  },

  getLockList: function (e) {
    var that = this;
    var deviceId = e.currentTarget.dataset.id;
    http.request(
      "/member/store/getLockList/" + deviceId,
      "1",
      "post", {
    },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        console.info('返回111===');
        if (info.code == 0) {
          let list = info.data;
          if (list) {
            list.forEach(v => {
              if (v.rssi >= -75) {
                v.rssi = '强(' + v.rssi + ')'
              } else if (v.rssi >= -85) {
                v.rssi = '中(' + v.rssi + ')'
              } else {
                v.rssi = '弱(' + v.rssi + ')'
              }
            })
          }
          that.setData({
            showLockList: true,
            lockList: list
          })
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
  },
  closeLockList: function (e) {
    this.setData({
      lockList: [],
      showLockList: false,
    })
  },
  lockOption: function (e) {
    var that = this;
    var lockData = e.currentTarget.dataset.lock;
    var sn = e.currentTarget.dataset.sn;
    that.setData({
      lockData: lockData,
      lockSn: sn,
      showLockOp: true
    })
  },
  closeLockOp: function (e) {
    this.setData({
      lockData: '',
      lockSn: '',
      showLockOp: false
    })
  },
  setLockPwdShow: function () {
    let that = this;
    if (that.data.lockData) {
      that.setData({
        setLockPwdShow: true,
      })
    } else {
      wx.showToast({
        title: '锁数据异常',
        icon: 'error'
      })
    }
  },
  confirmSetLockPwd: function () {
    var that = this;
    var lockData = that.data.lockData;
    if (lockData) {
      if (!that.data.lockPwd || that.data.lockPwd < 100000) {
        wx.showToast({
          title: '密码不合法',
          icon: 'error'
        })
      } else {
        lock.setLockPwd(lockData, that.data.lockPwd);
        that.setData({
          setLockPwdShow: false,
        })
      }
    } else {
      wx.showToast({
        title: '锁数据异常',
      })
    }
  },
  queryLockPwd: function () {
    let that = this;
    if (that.data.lockData) {
      lock.queryLockPwd(that.data.lockData);
    } else {
      wx.showToast({
        title: '锁数据异常',
      })
    }
  },
  addLockCard: function () {
    var that = this;
    if (that.data.lockData) {
      lock.addCard(that.data.lockData);
    } else {
      wx.showToast({
        title: '锁数据异常',
      })
    }
  },
  updateLockTime: function () {
    var that = this;
    let lockData = that.data.lockData;
    if (lockData) {
      let plugin = lock.getPlugin();
      wx.showLoading({ title: `请靠近门锁` });
      const timestamp = Date.now();
      plugin.setLockTime({
        lockData: lockData,
        serverTime: timestamp
      }).then(res => {
        console.log('updateLockTime success')
        if (res.errorCode === 0) {
          //再打开远程控制开关
          plugin.setRemoteUnlockSwitchState({
            enable: true,
            lockData: lockData
          }).then(res => {
            console.log('setRemoteUnlockSwitchState')
            wx.hideLoading();
            if (res.errorCode === 0) {
              that.postLockData(res.lockData);
              wx.showToast({
                title: '设置成功',
                icon: 'success'
              })
            } else {
              wx.showModal({
                content: `失败：${res.errorMsg}`,
                showCancel: false,
              })
            }
          })
        } else {
          wx.hideLoading();
          wx.showModal({
            content: `设置失败：${res.errorMsg}`,
            showCancel: false,
          })
        }
      })
    } else {
      wx.showToast({
        title: '锁数据异常',
      })
    }
  },
  postLockData(upData) {
    var that = this;
    http.request(
      "/member/store/updateRoomLock",
      "1",
      "post", {
      "upData": upData,
    },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          wx.hideLoading();
          wx.showToast({
            title: '操作成功',
          })
        } else {
          wx.hideLoading();
          wx.showModal({
            content: '操作失败:' + info.msg,
            showCancel: false,
          })
        }
      },
      function fail(info) {
        wx.hideLoading();
        wx.showToast({
          title: '操作失败',
          icon: 'error'
        })
      }
    )
  },
  unlock: function () {
    let that = this;
    let lockData = that.data.lockData;
    if (lockData) {
      lock.blueDoorOpen(lockData);
    } else {
      wx.showToast({
        title: '锁数据异常',
      })
    }
  },
  oplock: function () {
    let that = this;
    let lockData = that.data.lockData;
    if (lockData) {
      lock.blueCloseOpen(lockData);
    } else {
      wx.showToast({
        title: '锁数据异常',
      })
    }
  },
  resetLock: function () {
    let that = this;
    wx.showModal({
      title: '重要提示',
      content: '恢复出厂将还原锁未初始状态! 系统将不能控制,可再次通过初始化门锁重新恢复。',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          wx.showModal({
            title: '提示',
            content: '您是否确认将此智能锁恢复出厂设置?',
            complete: (res) => {
              if (res.cancel) {
              }
              if (res.confirm) {
                let lockData = that.data.lockData;
                if (lockData) {
                  wx.showLoading({ title: `请靠近门锁` });
                  lock.handleResetLock(lockData);
                } else {
                  wx.showToast({
                    title: '锁数据异常',
                  })
                }
              }
            }
          })
        }
      }
    })
  },
  initLock: function(){
    wx.showModal({
      title: '提示',
      content: '仅当门锁发出‘请添加管理员’时，门锁才可以被初始化！一般用于第一次安装锁使用，正常使用的门锁不需要初始化！',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          wx.showModal({
            title: '警告',
            content: '您是否确认初始化此智能锁？',
            complete: (res) => {
              if (res.cancel) {
              }
              if (res.confirm) {
                
              }
            }
          })
        }
      }
    })
  }
})