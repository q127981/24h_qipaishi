// pages/user/user.js
var http = require('../../../utils/http');
var lock = require('../../../utils/lock');
var util1 = require('../../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    titleBarHeight: 0,
    isLogin: app.globalData.isLogin,
    storeName: '',
    simpleModel: '',
    templateKey: '',
    qrCode: '',
    expireTime: '',
    storeId: '',
    setLockPwdShow: false,
    setDYShow: false,
    dyId: '',
    lockData: '',
    erweima: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let storeInfo = JSON.parse(decodeURIComponent(options.storeInfo));
    that.setData({
      storeId: storeInfo.storeId,
      expireTime: storeInfo.expireTime,
      lockData: storeInfo.lockData
    });
    // that.getData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    that.getData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //到登录界面
  gotologin() {
    wx.navigateTo({
      url: '../login/login',
    })
  },
  // 获取详情
  getData: function () {
    let that = this
    if (app.globalData.isLogin) {
      http.request(
        "/member/store/getDetail/" + that.data.storeId,
        "1",
        "get", {
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info(info);
          if (info.code == 0) {
            that.setData({
              storeName: info.data.storeName,
              qrCode: info.data.qrCode,
              dyId: info.data.dyId,
              simpleModel: info.data.simpleModel,
              templateKey: info.data.templateKey,
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
  // 门店二维码
  previewImage(e) {
    var currentUrl = e.currentTarget.dataset.src
    if (currentUrl) {
      wx.previewImage({
        urls: [currentUrl]
      })
    } else {
      wx.showModal({
        content: '请先完善门店信息',
        showCancel: false,
      })
    }
  },
  //美团授权跳转
  meituanScope: function (e) {
    let storeId = e.currentTarget.dataset.id
    http.request(
      "/member/store/getGroupPayAuthUrl",
      "1",
      "post", {
      "storeId": storeId,
      "groupPayType": 1
    },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          wx.showModal({
            title: '提示',
            content: '请点击复制按钮,然后打开系统浏览器,并粘贴链接打开! 完成授权流程',
            confirmText: '复制',
            complete: (res) => {
              if (res.confirm) {
                wx.setClipboardData({
                  data: info.data,
                  success: function (res) {
                    wx.showToast({ title: '已复制到剪贴板！' })
                  }
                })
              } else if (res.cancel) {
                //console.log('用户点击取消')
              }
            }
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
  //抖音授权跳转
  douyinScope: function (e) {
    let storeId = e.currentTarget.dataset.id
    http.request(
      "/member/store/getGroupPayAuthUrl",
      "1",
      "post", {
      "storeId": storeId,
      "groupPayType": 2
    },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          wx.showModal({
            title: '提示',
            content: '请点击复制按钮,然后打开系统浏览器,并粘贴链接打开! 完成授权流程,授权完成后一定要设置抖音门店ID！',
            confirmText: '复制',
            complete: (res) => {
              if (res.confirm) {
                wx.setClipboardData({
                  data: info.data,
                  success: function (res) {
                    wx.showToast({ title: '已复制到剪贴板！' })
                  }
                })
              } else if (res.cancel) {
                //console.log('用户点击取消')
              }
            }
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
  //   获取锁密码
  queryLockPwd: function (e) {
    let that = this;
    let lockData = e.currentTarget.dataset.lockdata;
    if (lockData) {
      lock.queryLockPwd(lockData);
    } else {
      wx.showToast({
        title: '未使用密码锁',
        icon: 'error'
      })
    }
  },
  //设置密码锁密码
  setLockPwdShow: function (e) {
    let that = this;
    var lockData = e.currentTarget.dataset.lockdata;
    if (lockData) {
      that.setData({
        setLockPwdShow: true,
        lockData: lockData
      })
    } else {
      wx.showToast({
        title: '未使用密码锁',
        icon: 'error'
      })
    }
  },
  confirmSetLockPwd: function (e) {
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
          lockData: '',
        })
      }
    } else {
      wx.showToast({
        title: '未使用密码锁',
      })
    }
  },
  //  添加锁卡片
  addLockCard: function (e) {
    var that = this;
    let lockData = e.currentTarget.dataset.lockdata;
    if (lockData) {
      lock.addCard(lockData);
    } else {
      wx.showToast({
        title: '未使用密码锁',
      })
    }
  },
  resetQrCode(e){
    var that = this;
    let storeId = e.currentTarget.dataset.id
    wx.showModal({
      title: '温馨提示',
      content: '将重新生成此门店的二维码以及所有房间的二维码、续费码，时间较长，请耐心等待！您是否确认重置？',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          http.request(
            "/member/store/resetQrcode?storeId=" + storeId,
            "1",
            "post", {
            },
            app.globalData.userDatatoken.accessToken,
            "操作中...",
            function success(info) {
              if (info.code == 0) {
                wx.showToast({
                  title: '操作成功',
                })
                that.getData();
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
    })
  },
  setDouyinId(){
    var that = this;
    that.setData({
      setDYShow: true
    })
  },
  confirmSetDYID(){
    var that = this;
    if(that.data.dyId && that.data.dyId.length>0){
      http.request(
        "/member/store/setDouyinId?storeId=" + that.data.storeId +"&dyId="+that.data.dyId,
        "1",
        "post", {
        },
        app.globalData.userDatatoken.accessToken,
        "操作中...",
        function success(info) {
          if (info.code == 0) {
            wx.showToast({
              title: '操作成功',
            })
            that.getData();
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

    }else{
      wx.showToast({
        title: '未填写门店ID',
        icon: 'error'
      })
    }
  },
})