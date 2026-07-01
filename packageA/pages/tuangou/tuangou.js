// packageA/pages/tuangou/tuangou.js
const app = getApp()
var http = require('../../../utils/http');
Page({

  data: {
    storeId: '',
    info: null,
    statusType: 0,
    statusText: '',
    expireDisplay: '',
    isExpire: false,
    isCountZero: false,
    mainColor: app.globalData.mainColor || '#5AAB6E',
    isIpx: app.globalData.isIpx ? true : false,
    openPayFromTuangou: false,

    // 配置弹窗
    configDialogVisible: false,
    configDyShopUuid: '',
    configMeituanScope: [],
    configDouyinScope: [],

    // 授权弹窗
    meituanAuthVisible: false,
    douyinAuthVisible: false,
    meituanAuthUrl: '',
    douyinAuthUrl: '',

    // 帮助弹窗
    dyHelpVisible: false,
    pricingHelpVisible: false,
    basicPlanHelpVisible: false,

    // 授权范围选项
    scopeOptions: {
      meituan: [
        { value: 'tuangou', label: '团购核销' },
        { value: 'yuding', label: '美团预定' },
      ],
      douyin: [
        { value: 'tuangou', label: '团购核销' },
      ],
    },
  },

  onLoad(options) {
    this.setData({
      storeId: Number(options.storeId),
    })
    this.getInfoByStore()
  },

  onPullDownRefresh() {
    this.getInfoByStore()
    wx.stopPullDownRefresh()
  },

  getInfoByStore() {
    var that = this
    if (!app.globalData.isLogin) return
    http.request(
      '/member/tuangou/getInfoByStore?storeId=' + that.data.storeId,
      '1',
      'post',
      {},
      app.globalData.userDatatoken.accessToken,
      '加载中',
      function success(info) {
        if (info.code == 0) {
          that.processInfo(info.data)
        } else {
          wx.showModal({ content: info.msg, showCancel: false })
        }
      },
      function fail() {}
    )
  },

  processInfo(data) {
    var that = this
    var statusType = 0
    var statusText = '未开通团购核销服务'
    var expireDisplay = ''
    var isExpire = false
    var isCountZero = false

    if (data) {
      var expireTime = data.expireTime
      var tgApiCount = data.tgApiCount

      if ((expireTime != null && expireTime !== '') || (tgApiCount != null && tgApiCount > 0)) {
        statusType = 2
        statusText = '团购核销服务已开通'
        if (expireTime) {
          var et = expireTime
          if (expireTime.indexOf('T') > -1) {
            et = expireTime.replace('T', ' ').substring(0, 19)
          }
          expireDisplay = et
          var expireTs = new Date(et).getTime()
          if (expireTs < Date.now()) {
            isExpire = true
          }
        }
        if (tgApiCount === 0) {
          isCountZero = true
        }
      } else {
        statusType = 1
        statusText = '团购核销服务已过期'
      }
    }

    that.setData({
      info: data,
      statusType: statusType,
      statusText: statusText,
      expireDisplay: expireDisplay,
      isExpire: isExpire,
      isCountZero: isCountZero,
    })
  },

  // ============================
  // 核销配置弹窗
  // ============================
  openConfigDialog() {
    var info = this.data.info
    var meituanScope = info && info.meituanScope ? info.meituanScope.split(',') : []
    var douyinScope = info && info.douyinScope ? info.douyinScope.split(',') : []

    this.setData({
      configDialogVisible: true,
      configDyShopUuid: info && info.dyShopUuid ? info.dyShopUuid : '',
      configMeituanScope: meituanScope,
      configDouyinScope: douyinScope,
    })
  },

  closeConfigDialog() {
    this.setData({ configDialogVisible: false })
  },

  onDyShopUuidChange(e) {
    this.setData({ configDyShopUuid: e.detail })
  },

  toggleMeituanScope(e) {
    var val = e.currentTarget.dataset.value
    var list = this.data.configMeituanScope.slice()
    // tuangou 为必选，不允许取消
    if (val === 'tuangou') return
    var idx = list.indexOf(val)
    if (idx >= 0) {
      list.splice(idx, 1)
    } else {
      list.push(val)
    }
    this.setData({ configMeituanScope: list })
  },

  toggleDouyinScope(e) {
    var val = e.currentTarget.dataset.value
    var list = this.data.configDouyinScope.slice()
    // tuangou 为必选，不允许取消
    if (val === 'tuangou') return
    var idx = list.indexOf(val)
    if (idx >= 0) {
      list.splice(idx, 1)
    } else {
      list.push(val)
    }
    this.setData({ configDouyinScope: list })
  },

  saveConfig() {
    var that = this
    // 校验 tuangou 必选
    if (!that.data.configMeituanScope.includes('tuangou')) {
      wx.showToast({ title: '请勾选美团授权范围「团购核销」', icon: 'none' })
      return
    }
    if (!that.data.configDouyinScope.includes('tuangou')) {
      wx.showToast({ title: '请勾选抖音授权范围「团购核销」', icon: 'none' })
      return
    }
    
    var dyShopUuid = that.data.configDyShopUuid
    var meituanScope = that.data.configMeituanScope.join(',')
    var douyinScope = that.data.configDouyinScope.join(',')

    if (!app.globalData.isLogin) return
    http.request(
      '/member/tuangou/updateByStore',
      '1',
      'post',
      {
        storeId: that.data.storeId,
        dyShopUuid: dyShopUuid,
        meituanScope: meituanScope,
        douyinScope: douyinScope,
      },
      app.globalData.userDatatoken.accessToken,
      '保存中',
      function success(info) {
        if (info.code == 0) {
          wx.showToast({ title: '保存成功', icon: 'success' })
          that.setData({ configDialogVisible: false })
          setTimeout(function () { that.getInfoByStore() }, 1500)
        } else {
          wx.showModal({ content: info.msg, showCancel: false })
        }
      },
      function fail() {}
    )
  },

  // ============================
  // 平台授权
  // ============================
  openAuthDialog(e) {
    var platform = Number(e.currentTarget.dataset.platform)
    var platformName = platform === 1 ? '美团' : '抖音'

    var that = this
    if (!app.globalData.isLogin) return

    var scope = ''
    var info = that.data.info
    if (info) {
      if (platform === 1) {
        scope = info.meituanScope || ''
      } else {
        scope = info.douyinScope || ''
      }
    }

    http.request(
      '/member/tuangou/getGroupPayAuthUrl',
      '1',
      'post',
      {
        storeId: that.data.storeId,
        groupPayType: platform,
        scope: scope,
      },
      app.globalData.userDatatoken.accessToken,
      '获取授权链接中',
      function success(res) {
        if (res.code == 0 && res.data) {
          if (platform === 1) {
            that.setData({ meituanAuthVisible: true, meituanAuthUrl: res.data })
          } else {
            that.setData({ douyinAuthVisible: true, douyinAuthUrl: res.data })
          }
        } else {
          wx.showModal({ content: res.msg || platformName + '授权链接获取失败', showCancel: false })
        }
      },
      function fail() {}
    )
  },

  closeMeituanAuth() {
    this.setData({ meituanAuthVisible: false })
  },

  closeDouyinAuth() {
    this.setData({ douyinAuthVisible: false })
  },

  copyMeituanUrl() {
    wx.setClipboardData({
      data: this.data.meituanAuthUrl,
      success: function () {
        wx.showToast({ title: '链接已复制', icon: 'success' })
      },
    })
  },

  copyDouyinUrl() {
    wx.setClipboardData({
      data: this.data.douyinAuthUrl,
      success: function () {
        wx.showToast({ title: '链接已复制', icon: 'success' })
      },
    })
  },

  // ============================
  // 抖音帮助弹窗
  // ============================
  openDyHelp() {
    this.setData({ dyHelpVisible: true })
  },

  closeDyHelp() {
    this.setData({ dyHelpVisible: false })
  },

  openBasicPlanHelp() {
    this.setData({ basicPlanHelpVisible: true })
  },

  closeBasicPlanHelp() {
    this.setData({ basicPlanHelpVisible: false })
  },

  openPricingHelp() {
    this.setData({ pricingHelpVisible: true })
  },

  closePricingHelp() {
    this.setData({ pricingHelpVisible: false })
  },

  // ============================
  // 开通/充值
  // ============================
  openService(e) {
    var type = Number(e.currentTarget.dataset.type)
    var price = 0
    var title = ''
    var content = ''

    if (type === 1) {
      title = '开通基础版（1个月）'
      content = '确定以 20 元开通基础版服务？'
    } else if (type === 2) {
      title = '开通基础版（1年）'
      content = '确定以 200 元开通基础版服务？'
    } else if (type === 3) {
      title = '充值高级版 100 次'
      content = '确定以 10 元充值 100 次高级版服务？'
    } else if (type === 4) {
      title = '充值高级版 1000 次'
      content = '确定以 100 元充值 1000 次高级版服务？'
    }

    var that = this
    wx.showModal({
      title: title,
      content: content,
      success(res) {
        if (res.confirm) {
          that.openByStore(type)
        }
      }
    })
  },

  openByStore(type) {
    var that = this
    if (!app.globalData.isLogin) return
    wx.showLoading({ title: '创建订单中' })
    http.request(
      '/member/tuangou/openByStore',
      '1',
      'post',
      {
        storeId: that.data.storeId,
        type: type,
      },
      app.globalData.userDatatoken.accessToken,
      '',
      function success(info) {
        wx.hideLoading()
        if (info.code == 0) {
          var payData = info.data
          // 优先使用半屏小程序拉起支付
          if (payData && payData.prePayTn) {
            that.setData({ openPayFromTuangou: true })
            wx.openEmbeddedMiniProgram({
              appId: payData.appId,
              envVersion: 'release',
              path: payData.prePayTn,
              success: function(res) {
                // 用户成功拉起半屏小程序
              },
              fail: function(err) {
                that.setData({ openPayFromTuangou: false })
                wx.showToast({ title: '支付取消', icon: 'none' })
              },
            })
          } else {
            wx.showToast({ title: '开通成功', icon: 'success' })
            setTimeout(function() { that.getInfoByStore() }, 1500)
          }
        } else {
          wx.showModal({ content: info.msg, showCancel: false })
        }
      },
      function fail() {
        wx.hideLoading()
      }
    )
  },

  onShow() {
    var that = this
    // 从半屏支付页面返回时，刷新团购信息
    if (that.data.openPayFromTuangou) {
      that.setData({ openPayFromTuangou: false })
      that.getInfoByStore()
    }
  },

  goRecharge() {
    wx.navigateTo({
      url: '/pages/recharge/recharge?storeId=' + this.data.storeId,
    })
  },

  goPackage() {
    wx.navigateTo({
      url: '/packageA/pages/packageManagement/packageManagement?storeId=' + this.data.storeId,
    })
  },
})
