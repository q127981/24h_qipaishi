// app.js
import { parseNfcData, nfcManager } from './utils/nfc.js'
App({
  globalData: {
    //接口地址 只修改域名为api.xxxx.com  后面的/app-api不要删
    baseUrl: "https://malaoban.scyanzu.com/app-api",
    // baseUrl: "http://localhost:8900/app-api",
    // baseUrl: "http://test.mzj.com:8900/app-api",
    //租户id
    tenantId: "150",
    //小程序名称
    appName: "闪订-智慧门店",


    //下面的不要改
    sysinfo: {},
    systemInfo: '',
    Version: "1.0.0",
    userData: {
    },
    userDatatoken: {
    },
    isLogin: false, //是否登录
    isIpx: false,
    isIos: false,
  },
  onLaunch() {
    var _this = this
    _this.globalData.sysinfo = wx.getSystemInfoSync()
    const token = wx.getStorageSync('userDatatoken');
    if (token) {
      this.globalData.userDatatoken = token;
      this.globalData.isLogin = true;
    }
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log('res.hasUpdate')
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '检测到新版本，需要重启小程序完成更新',
        showCancel: false,
        success: function (res) {
          updateManager.applyUpdate();
          // if (res.confirm) {
          //   // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          //   updateManager.applyUpdate()
          // }
        }
      })
    })
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败，请删除小程序并重新进入',
        showCancel: false
      })
    })
    this.checkIsIPhoneX();
    wx.getSystemInfo({
      success: function (res) {
        //console.log(res)
        _this.globalData.systemInfo = res
        let totalTopHeight = 64;
        //console.log(res.model)
        //   if (res.model.indexOf('iPhone X') != -1) {
        //     _this.globalData.isIpx = true
        //  }
        if (res.system.indexOf('iOS') > -1) {
          _this.globalData.isIos = true
        } else {
          _this.globalData.isIos = false
        }
        if (res.screenTop > 0) {
          totalTopHeight = res.screenTop;
        } else {
          totalTopHeight = res.statusBarHeight + 44;
          // if (res.model.indexOf('iPhone X') !== -1) {
          //   totalTopHeight = 88
          // } else if (res.model.indexOf('iPhone') !== -1) {
          //   totalTopHeight = 64
          // } else{
          //   totalTopHeight = res.statusBarHeight+44;
          // }
        }
        wx.setStorageSync('screenHeight', res.screenHeight - totalTopHeight)
        wx.setStorageSync('statusBarHeight', res.statusBarHeight)
        wx.setStorageSync('titleBarHeight', totalTopHeight - res.statusBarHeight)
      },
      failure() {
        wx.setStorageSync('statusBarHeight', 0)
        wx.setStorageSync('titleBarHeight', 0)
      }
    })
    //console.log('启动程序==');
  },
  onShow() {
    console.log('app.js onShow');
    var _this = this;
    // 页面显示时初始化NFC
    _this.initNfc()
    _this.startNfc()
  },
  onHide() {
    // 页面隐藏时停止NFC
    // this.stopNfc()
  },

  // 判断设备是否为 iPhone X
  checkIsIPhoneX: function () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        var safeBottom = res.screenHeight - res.safeArea.bottom
        that.kBottomSafeHeight = safeBottom
        //根据安全高度判断
        if (safeBottom === 34) {
          that.globalData.isIpx = true
        }
        // // 根据 model 进行判断
        // if (res.model.search('iPhone X') != -1) {
        //   that.globalData.isIPhoneX = true
        //   that.isIPhoneX = true
        // }
        // // 或者根据 screenHeight 进行判断
        // if (res.screenHeight == 812 || res.screenHeight == 896) {
        //   that.isIPhoneX = true
        // }
      }
    })
  },
  // 初始化NFC
  initNfc() {
    // 使用全局NFC管理器初始化
    const isSupported = nfcManager.init('nfc-read')
    console.log('NFC读取初始化完成')
  },
  // 开始NFC监听
  startNfc() {
    // 使用全局NFC管理器开始发现
    const success = nfcManager.startDiscovery((res) => {
      this.handleNfcData(res)
    }, 'nfc-read')
  },
  // 停止NFC监听
  stopNfc() {
    try {
      // 使用全局NFC管理器清理页面资源
      nfcManager.cleanupPage('nfc-read')
      console.log('NFC读取页面已停止')
    } catch (error) {
      console.log('停止NFC读取时出错:', error)
    }
  },
  // 处理NFC数据
  handleNfcData(nfcData) {
    try {
      const tagInfo = parseNfcData(nfcData)
      console.log('tagInfo.text:'+ tagInfo.text)
      if(tagInfo.text){
        //有结果
        console.log('跳转下单页面')
        wx.navigateTo({
          url: '/pages/orderSubmit/orderSubmit?goPage=true&'+tagInfo.text,
        })
      }

    } catch (error) {
      console.error('解析NFC数据失败:', error)
    }
  },
})
