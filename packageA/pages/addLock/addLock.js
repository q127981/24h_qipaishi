// packageA/pages/addLock/addLock.js
const app = getApp()
var http = require('../../../utils/http');
var lock = require('../../../utils/lock');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx?true:false,
    lockList: [],//锁列表
    list: [],
    // list: [
    //   {'deviceId':'12:34:56:67:89:02','deviceName':'12346567','isSettingMode':true},
    // ],
    deviceSn: '',//智能锁编码
    checkSuccess: false,
    successList:[],//已完成列表
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
  scanLock(){
    var that=this;
    if(!this.data.deviceSn||this.data.deviceSn.length<8){
      wx.showToast({
        title: '输入8位锁编号',
        icon: 'error'
      })
      return;
    }
    //先查编号是否可用
    http.request(
      "/member/store/addLock",
      "1",
      "post", {
        "lockData": 'query',
        "deviceSn": 'TT'+that.data.deviceSn
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          that.setData({
            checkSuccess: true
          });
          wx.showToast({
            title: '请唤醒智能锁',
          })
        }else{
          wx.showModal({
            content: '编码校验失败:'+info.msg,
            showCancel: false,
          })
          return;
        }
      },
      function fail(info) {
      }
    )
    var plugin=lock.getPlugin();
    var lockList = [];
    var lockDevice = '';
    plugin.startScanBleDevice((lockDevice, lockList) => {
        //成功扫描到设备
        console.log('lockList');
        var list=[];
        lockList.forEach(item=>{
          let v={
            deviceId: item.deviceId,
            deviceName: item.deviceName,
            isSettingMode: item.isSettingMode,
            electricQuantity: item.electricQuantity,
            rssi: item.rssi,
          };
          list.push(v);
        });
        that.setData({
          lockList: lockList,
          list: list
        })
      }, 
      (err) => {
        wx.showToast({
          title: '蓝牙扫描失败',
          icon:'error'
        })
        return [];
      });
  },
  initLock(){
    var that=this;
    if(!that.data.deviceSn||this.data.deviceSn.length<8){
      wx.showModal({
        content: '请先输入智能锁编码',
        showCancel: false,
      })
      return;
    }
    if(that.data.lockList){
      var plugin=lock.getPlugin();
      var deviceFromScan = that.data.lockList[0];
      if (!deviceFromScan.isSettingMode) {
        wx.showToast({
          title: '此锁不可添加',
          icon: 'error'
        })
        that.setData({
          checkSuccess: false
      })
      }else{
        that.stopScan(plugin);
        wx.showLoading({ title: `请靠近智能锁` });
        plugin.initLock({ deviceFromScan }).then(result => {
          if (result.errorCode == 0) {
              // 设备已成功初始化
              let lockData=result.lockData;
              // 开启远程控制
              setTimeout(() => {
                plugin.setRemoteUnlockSwitchState({
                  enable: true,
                  lockData: lockData
                }).then(res => {
                  if (res.errorCode === 0) {
                    http.request(
                      "/member/store/addLock",
                      "1",
                      "post", {
                        "lockData": lockData,
                        "upData": res.lockData,
                        "deviceSn": 'TT'+that.data.deviceSn
                      },
                      app.globalData.userDatatoken.accessToken,
                      "",
                      function success(info) {
                        if (info.code == 0) {
                          wx.hideLoading();
                          wx.showToast({
                            title: '初始化成功',
                          })
                          that.setData({
                              checkSuccess: false
                          })
                        }else{
                          lock.handleResetLock(lockData);
                          wx.hideLoading();
                          wx.showModal({
                            content: '初始化失败:'+info.msg,
                            showCancel: false,
                          })
                          that.setData({
                            checkSuccess: false
                        })
                        }
                      },
                      function fail(info) {
                        lock.handleResetLock(lockData);
                        wx.hideLoading();
                        wx.showToast({
                          title: '初始化失败',
                          icon: 'error'
                        })
                        that.setData({
                          checkSuccess: false
                      })
                      }
                    )
                  } else {
                    lock.handleResetLock(lockData);
                    wx.hideLoading();
                    wx.showModal({
                      content: `初始化失败：${res.errorMsg}`,
                      showCancel: false,
                    })
                    that.setData({
                      checkSuccess: false
                  })
                    return;
                  }
                })
              }, 4000);
          }else{
            lock.handleResetLock(result.lockData);
            wx.hideLoading();
            wx.showToast({
              title: '初始化失败',
              icon: 'error'
            })
            that.setData({
              checkSuccess: false
            })
          }
        })
      }
    }
  },
  stopScan(plugin){
    plugin.stopScanBleDevice().then(res => {
      //关闭蓝牙设备扫描返回
      if(res.errorCode == 0){
        // wx.showToast({
        //   title: '蓝牙扫描已关闭',
        // })
      }else{
        wx.showToast({
          title: '关闭扫描失败',
        })
      }
    });
  },

})