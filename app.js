// app.js
App({
  globalData: {
    //接口地址
    baseUrl: "https://wq.scyanzu.com/app-api",
    // baseUrl: "http://localhost:8900/app-api",
    // baseUrl: "http://test.mzj.com:8900/app-api",
    //租户id
    tenantId: "150",
    //小程序名称
    appName: "麻老板无人自助系统",


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
    this.globalData.sysinfo = wx.getSystemInfoSync()
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
    wx.getStorage({
      key: 'userDatatoken',
      success: function (res) {
        _this.globalData.userDatatoken = res.data;
        _this.globalData.isLogin = true;
      },
      fail: function (res) {
        //为得到本地保存信息
        //console.error(res)
        _this.globalData.isLogin = false
      }
    })
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
})
