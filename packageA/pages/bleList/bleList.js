// packageA/pages/bleList/bleList.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx ? true : false,
    isDiscovering: false, // 是否正在扫描
    list: [],
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
    wx.closeBluetoothAdapter({
      success(res) {
        console.log("蓝牙模块已关闭", res);
      },
      fail(err) {
        console.error("关闭蓝牙模块失败", err);
        this.handleError(err, "关闭蓝牙模块失败");
      },
    });
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
  scanStart() {
    var that = this;
    wx.showLoading({
      title: '开始扫描',
    })
    //先关闭，再打开
    wx.closeBluetoothAdapter({
      success(res) {
      },
      fail(err) {
      },
    });
    wx.hideLoading();
    wx.openBluetoothAdapter({
      success(res) {
        that.checkBluetoothState();
      },
      fail(err) {
        that.handleError(err, "初始化蓝牙模块失败");
      },
    });
  },
  scanStop() {
    wx.closeBluetoothAdapter({
      success(res) {
        wx.showToast({
          title: '停止蓝牙扫描',
        })
      }
    })
  },
  // 检查蓝牙适配器状态
  checkBluetoothState() {
    const that = this;
    wx.getBluetoothAdapterState({
      success(res) {
        if (res.available) {
          if (!res.discovering) {
            that.startScan();
          }
        } else {
          wx.showToast({
            title: "蓝牙不可用",
            icon: "none",
          });
        }
      },
      fail(err) {
        that.handleError(err, "获取蓝牙适配器状态失败");
      },
    });
  },
  // 开始扫描蓝牙设备
  startScan() {
    const that = this;
    wx.startBluetoothDevicesDiscovery({
      services: [],//在 Android 上，有些设备可能不会广播通用服务（GATT Service），需要指定具体的服务 UUID 才能被发现。
      allowDuplicatesKey: false, // 避免重复设备
      interval: 8000,          // 每隔 8秒重新扫描
      success(res) {
        console.log("蓝牙扫描已启动", res);
        that.setData({
          isDiscovering: true,
          list: []
        });
        that.onDeviceFound();
      },
      fail(err) {
        console.error("蓝牙扫描启动失败", err);
        that.handleError(err, "启动蓝牙扫描失败");
      },
    });
  },
  // 监听发现蓝牙设备
  onDeviceFound() {
    console.log('onDeviceFound');
    const that = this;
    wx.onBluetoothDeviceFound((res) => {
      const devices = res.devices || [];
      console.log('发现设备', devices);
      // 过滤设备名称以 "ck_100" 开头的设备
      const filteredDevices = devices
        .filter(device => device.localName &&
          (
            device.localName.startsWith("ck_100")
            || device.localName.startsWith("S503")
          )
        )
        .map(device => ({
          name: device.localName,
          deviceId: device.deviceId,
        }));
      if (filteredDevices.length === 0) {
        return;
      } else {
        console.log("发现设备", filteredDevices);
        that.setData({
          list: [...filteredDevices],
        });
      }

    });
  },
  // 停止扫描
  stopScan() {
    const that = this;
    wx.stopBluetoothDevicesDiscovery({
      success(res) {
        that.setData({ isDiscovering: false });
      },
      fail(err) {
        that.handleError(err, "停止蓝牙扫描失败");
      },
    });
  },
  // 错误处理函数
  handleError(err, defaultMessage) {
    let message = defaultMessage;
    switch (err.errCode) {
      case 10001:
        message = "当前设备蓝牙未开启，请开启蓝牙后重试";
        break;
      case 10002:
        message = "未找到蓝牙设备，请确认设备进入蓝牙模式并靠近手机";
        break;
      case 10003:
        message = "连接蓝牙设备失败，请重试";
        break;
      case 10004:
        message = "设备不支持蓝牙通信，请更换设备";
        break;
      case 10005:
        message = "蓝牙设备连接已断开，请重新连接";
        break;
      case 10006:
        message = "蓝牙操作超时，请重试";
        break;
      case 10007:
        message = "蓝牙操作未授权，请检查权限";
        break;
      case 10008:
        message = "当前设备不支持该操作";
        break;
      case 10009:
        message = "手机系统版本太低，不支持蓝牙功能";
        break;
      default:
        console.warn("未知错误码", err.errCode);
    }
    wx.showModal({
      title: '错误提示',
      content: message,
      showCancel: false,
      complete: (res) => {
      }
    })
  },
})