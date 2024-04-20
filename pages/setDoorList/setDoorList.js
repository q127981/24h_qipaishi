// pages/setDoorList/setDoorList.js
const app = getApp()
var http = require('../../utils/http');
var lock = require('../../utils/lock.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: 0, 
    doorList: [],
    isIpx: app.globalData.isIpx?true:false,
    foldIndex: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      storeId: Number(options.storeId)
    })
  },
  foldTap (e) {
    console.log(e)
    const {target: {dataset = {}} = {}} = e
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
  getDoorList: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/getRoomInfoList/"+that.data.storeId,
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
          }else{
            wx.showModal({
              content: '请求服务异常，请稍后重试',
              showCancel: false,
            })
          }
        },
        function fail(info) {
          
        }
      )
    } 
  },
  // 开房间门
  openDoor: function(e){
    let roomId = e.currentTarget.dataset.roomid
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定打开房间门吗',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/store/openRoomDoor/"+roomId,
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
                    title: '开门成功',
                    icon: 'success'
                  })
                }else{
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
  // 关房间门
  closeDoor: function(e){
    let roomId = e.currentTarget.dataset.roomid
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定关闭房间门吗',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/store/closeRoomDoor/"+roomId,
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
                    title: '关门成功',
                    icon: 'success'
                  })
                }else{
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
  openBlueDoor: function(e){
    let that = this;
    let lockData = e.currentTarget.dataset.lockdata;
    let gatewayId = e.currentTarget.dataset.gatewayid;
    let roomId = e.currentTarget.dataset.roomid;
    if(null!=gatewayId){
      //支持远程开锁
      if (app.globalData.isLogin) 
      {
          http.request(
            "/member/store/openRoomLock/"+roomId,
            "1",
            "post", {
            },
            app.globalData.userDatatoken.accessToken,
            "提交中...",
            function success(info) {
              if (info.code == 0) {
               wx.showToast({
                 title: '操作成功',
                 icon: 'success'
               })
              }else{
                //失败了 尝试一下本地开锁
                lock.blueDoorOpen(lockData);
              }
            },
            function fail(info) {
            }
          )
       }
    }else if(null!= lockData){
      //本地蓝牙开锁
     lock.blueDoorOpen(lockData);
   }else{
      wx.showModal({
        title: '提示',
        content: '该房间未使用密码锁',
        showCancel: false
      })
   }
  },
  disableRoom: function(e){
    let roomId = e.currentTarget.dataset.roomid;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定修改房间状态吗？',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/store/disableRoom/"+roomId,
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
                }else{
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
  testYunlaba: function(e){
    let roomId = e.currentTarget.dataset.roomid;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '房间喇叭将播放预设内容，确定操作吗？',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/store/testYunlaba/"+roomId,
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
                }else{
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
  // 清洁并结单
  clearAndFinish: function(e){
    let roomId = e.currentTarget.dataset.roomid;
    let that = this;
    wx.showModal({
      title: '注意提示',
      content: '注意！！！房间状态将变为空闲！并立即关电！如果有进行中的订单，订单将会被结束！请谨慎确认房间当前状态后再操作！！！',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/store/clearAndFinish/"+roomId,
              "1",
              "get", {
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
                }else{
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
  showQrCode: function(e){
    let qrcode = e.currentTarget.dataset.qrcode;
    wx.downloadFile({
      url: qrcode,
      success: function(res) {
        // 下载成功后将图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function() {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            });
          },
          fail: function() {
            wx.showToast({
              title: '保存失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      },
      fail: function() {
        wx.showToast({
          title: '下载失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
   // 结单
   finishOrder: function(e){
    let roomId = e.currentTarget.dataset.roomid;
    let that = this
    wx.showModal({
      title: '注意提示',
      content: '注意！！！房间状态将变为待清洁！并立即关电！如果有进行中的订单，订单将会被结束！请谨慎确认房间当前状态后再操作！！！',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/store/finishRoomOrder/"+roomId,
              "1",
              "get", {
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
                }else{
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
  }
})