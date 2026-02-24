// pages/setDoorList/setDoorList.js
const app = getApp()
var http = require('../../../utils/http');
var lock = require('../../../utils/lock.js');
import { validateUrlScheme, createNfcRecords, nfcManager } from '../../../utils/nfc.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: 0,
    doorList: [],
    isIpx: app.globalData.isIpx ? true : false,
    foldIndex: -1,
    nfcData: '',
    currentRoom: '',
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
  // 停止NFC
  stopNfc() {
    try {
      // 使用全局NFC管理器清理页面资源
      nfcManager.cleanupPage('nfc-write')
      console.log('NFC写入页面已停止')
    } catch (error) {
      console.log('停止NFC写入时出错:', error)
    }
  },
  writeNFC: function (e){
   // 使用全局NFC管理器初始化
  const isSupported = nfcManager.init('nfc-write')
  if (!isSupported) {
    wx.showToast({
      title: '设备不支持NFC',
      icon: 'none'
    })
    return;
  }
  var that = this;
  that.setData({
    currentRoom: e.currentTarget.dataset.item
  })
  //先取出nfc数据
  http.request(
    "/member/store/getNFCScheme/",
    "1",
    "post", {
      "roomId": that.data.currentRoom.roomId
    },
    app.globalData.userDatatoken.accessToken,
    "",
    function success(info) {
      // console.info('返回111===');
      // console.info(info);
      if (info.code == 0) {
        that.setData({
          nfcData: info.data
        })
         // 使用全局NFC管理器开始发现
        const success = nfcManager.startDiscovery((res) => {
          console.log('发现NFC标签:', res)
          that.writeToNfc(res)
        }, 'nfc-write')
        if (success) {
          wx.showToast({
            title: '请将碰一碰标签贴近手机',
            icon: 'none',
            duration: 3000
          })
        } else {
          wx.showToast({
            title: 'NFC启动失败',
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

    }
  )

 
  },
   // 写入数据到NFC标签
   writeToNfc(nfcData) {
    try {
      // 检查NFC管理器是否初始化
      if (!nfcManager.isInitialized) {
        console.error('NFC管理器未初始化')
        wx.showToast({
          title: 'NFC未初始化',
          icon: 'none'
        })
        return
      }

      // 检查标签是否支持NDEF
      if (!nfcData.techs || !nfcData.techs.includes('NDEF')) {
        console.error('标签不支持NDEF')
        wx.showToast({
          title: '标签不支持',
          icon: 'none'
        })
        return
      }

      // 从全局NFC管理器获取ndef对象
      const ndef = nfcManager.getNdef()
      if (!ndef) {
        wx.showToast({
          title: '标签不支持',
          icon: 'none'
        })
        return
      }
      // 连接NDEF
      ndef.connect({
        success: () => {
          console.log('NDEF连接成功')
          this.performWrite(ndef)
        },
        fail: (err) => {
          console.error('NDEF连接失败:', err)
          // wx.showToast({
          //   title: '标签连接失败',
          //   icon: 'none'
          // })
        }
      })
    } catch (error) {
      console.error('创建NFC记录失败:', error)
      wx.showToast({
        title: '标签写入失败',
        icon: 'none'
      })
    }
  },
   // 执行写入操作
   performWrite(ndef) {
    try {
      const records = createNfcRecords(this.data.nfcData,this.data.storeId,this.data.currentRoom.roomId)
      console.log('准备写入NFC记录:', records)
      
      // 使用正确的API写入数据
      ndef.writeNdefMessage({
        records: records,
        success: () => {
          console.log('NFC写入成功')
          
          // 断开NDEF连接
          ndef.close()
          
          // 自动停止NFC
          this.stopNfc()
          wx.showToast({
            title: '写入成功',
          })
        },
        fail: (err) => {
          console.error('NFC写入失败:', err)
          // 断开NDEF连接
          ndef.close()
          // 自动停止NFC
          this.stopNfc()
          wx.showToast({
            title: '写入失败',
            icon: 'error'
          })
        }
      })
    } catch (error) {
      console.error('执行写入操作失败:', error)
      this.stopNfc()
      wx.showToast({
        title: '写入失败',
        icon: 'error'
      })
    }
  },
})