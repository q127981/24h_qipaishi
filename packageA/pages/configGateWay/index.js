// packageA/pages/configGateWay/index.js
const app = getApp()
var http = require('../../../utils/http');
var lock = require('../../../utils/lock');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx ? true : false,
    gatewayList: [],//网关列表
    list: [],
    wifiSn: '',
    wifiPwd: '',
    checkSuccess: false,
    successList: [],//已完成列表

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
  scanGateway() {
    var that = this;
    if (!that.data.wifiSn ||!that.data.wifiSn || that.data.wifiPwd.length < 8) {
      wx.showToast({
        title: 'Wifi信息错误',
        icon: 'error'
      })
      return;
    }
    that.setData({
      checkSuccess: true
    });
    wx.showToast({
      title: '将网关重新通电',
      icon: 'none'
    })
    var plugin = lock.getPlugin();
    plugin.startScanGateway((deviceFromScan, deviceFromScanList) => {
        // TODO 成功扫描到设备
        var list = [];
        deviceFromScanList.forEach((item,index) => {
          let v = {
            deviceId: item.deviceId,
            deviceName: item.deviceName,
            isSettingMode: item.isSettingMode,
            rssi: item.rssi,
            index: index,
          };
          list.push(v);
        });
        that.setData({
          gatewayList: deviceFromScanList,
          list: list
        })
    },
    (err) => {
      wx.showToast({
        title: '蓝牙扫描失败',
        icon: 'error'
      })
      return [];
    })
  },
  initGateway(e){
     var that = this;
     const index = e.currentTarget.dataset.index;
     const deviceFromScan = that.data.gatewayList[index];
     if (!deviceFromScan.isSettingMode) {
      wx.showModal({
        title: '提示',
        content: '网关当前不可添加，请重新通电后再试',
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
    wx.showLoading({
      title: '正在连接网关',
    })
    var plugin = lock.getPlugin();
    plugin.connectGateway({deviceFromScan}).then(res => {
      if (res.errorCode == 0) {
        // TODO 蓝牙网关连接成功
        console.log( `正在初始化网关${deviceFromScan.deviceName}, MAC地址：${deviceFromScan.MAC}, SSID:${that.data.wifiSn}, 密码：${that.data.wifiPwd}`)
        console.log(deviceFromScan)
        plugin.initGateway({
          deviceFromScan,
          configuration: {
              type: 2,
              SSID: that.data.wifiSn,
              wifiPwd: that.data.wifiPwd,
              uid: 22700401,
              password: 'cbe3d534f8880e7581e62992c0ade209',
              companyId: 0,
              branchId: 0,
              plugName: deviceFromScan.deviceName,
              server: "plug.sciener.cn",
              port: 2999,
              useLocalIPAddress: false
          }
        }).then(initRes => {
          wx.hideLoading();
          if (initRes.errorCode === 0) {
            wx.showToast({
              title: '初始化完成',
              icon: 'success',
            })
            that.setData({
              list:[],
              gatewayList:[]
            })
          }else{
            wx.showModal({
                title: '提示',
                content: `网关初始化失败：${initRes.errorMsg}`,
                showCancel: false,
                complete: (res) => {
                  if (res.cancel) {
                  }
                  if (res.confirm) {
                  }
                }
              })
            }
        })
      }else {
        wx.showModal({
          title: '提示',
          content: `网关连接失败：${res.errorMsg}`,
          showCancel: false,
          complete: (res) => {
            if (res.cancel) {
            }
            if (res.confirm) {
            }
          }
        })
      }
    });
  },
  stopScan(plugin) {
    plugin.stopScanGateway().then(res => {
      //关闭蓝牙设备扫描返回
      if (res.errorCode == 0) {
        // wx.showToast({
        //   title: '蓝牙扫描已关闭',
        // })
      } else {
        wx.showToast({
          title: '关闭扫描失败',
        })
      }
    });
  },
})