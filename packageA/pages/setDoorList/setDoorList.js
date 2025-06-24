// pages/setDoorList/setDoorList.js
const app = getApp()
var http = require('../../../utils/http');
var lock = require('../../../utils/lock.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: 0,
    doorList: [],
    isIpx: app.globalData.isIpx ? true : false,
    foldIndex: -1,
    
    lockData: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      storeId: Number(options.storeId)
    })
  },
  foldTap(e) {
    console.log(e)
    const { target: { dataset = {} } = {} } = e
    this.setData({
      foldIndex: this.data.foldIndex === dataset.index ? -1 : dataset.index
    })
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
    this.getDoorList()
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
  getDoorList: function () {
    let that = this
    if (app.globalData.isLogin) {
      http.request(
        "/member/store/getRoomInfoList/" + that.data.storeId,
        "1",
        "get", {
        "storeId": that.data.storeId
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              doorList: info.data
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
  disableRoom: function (e) {
    let roomId = e.currentTarget.dataset.roomid;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定修改房间状态吗？',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          if (app.globalData.isLogin) {
            http.request(
              "/member/store/disableRoom/" + roomId,
              "1",
              "post", {
              "roomId": roomId
            },
              app.globalData.userDatatoken.accessToken,
              "",
              function success(info) {
                console.info('返回111===');
                console.info(info);
                if (info.code == 0) {
                  wx.showToast({
                    title: '操作成功',
                    icon: 'success'
                  })
                  that.getDoorList();
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
  previewImage(e) {
    var currentUrl = e.currentTarget.dataset.src //获取当前点击图片链接
    if (currentUrl) {
      wx.previewImage({
        urls: [currentUrl]
      })
    } else {
      wx.showModal({
        content: '请先完善房间信息',
        showCancel: false,
      })
    }
  },
  delRoom: function (e) {
    let roomId = e.currentTarget.dataset.id;
    let that = this
    wx.showModal({
      title: '注意提示',
      content: '请确认是否删除该房间！！！该房间不能存在未完成的订单！',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          if (app.globalData.isLogin) {
            http.request(
              "/member/store/deleteRoomInfo/" + roomId,
              "1",
              "post", {
            },
              app.globalData.userDatatoken.accessToken,
              "",
              function success(info) {
                // console.info('返回111===');
                // console.info(info);
                if (info.code == 0) {
                  wx.showToast({
                    title: '操作成功',
                    icon: 'success'
                  })
                  that.getDoorList();
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

})