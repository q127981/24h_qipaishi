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
    isIpx: app.globalData.isIpx?true:false,
    foldIndex: -1,
    setLockPwdShow: false,
    lockPwd: '',
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
    if(lockData){
      //本地蓝牙开锁
     lock.blueDoorOpen(lockData);
   }else{
     wx.showToast({
       title: '未使用密码锁',
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
  previewImage(e){
    var currentUrl = e.currentTarget.dataset.src //获取当前点击图片链接
    wx.previewImage({
      urls: [currentUrl]
    })
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
  },
  delRoom: function(e){
    let roomId = e.currentTarget.dataset.id;
    let that = this
    wx.showModal({
      title: '注意提示',
      content: '请确认是否删除该房间！！！该房间不能存在未完成的订单！',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/store/deleteRoomInfo/"+roomId,
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
  queryLockPwd: function(e){
    let that = this;
    let lockData = e.currentTarget.dataset.lockdata;
    if(lockData){
     lock.queryLockPwd(lockData);
   }else{
     wx.showToast({
       title: '未使用密码锁',
     })
   }
  },
  addCard: function(e){
    let that = this;
    let lockData = e.currentTarget.dataset.lockdata;
    if(lockData){
     lock.addCard(lockData);
   }else{
     wx.showToast({
       title: '未使用密码锁',
     })
   }
  },
  setLockPwdShow: function(e){
    let that = this;
    var lockData = e.currentTarget.dataset.lockdata;
    if(lockData){
      that.setData({
        setLockPwdShow: true,
        lockData: lockData
      })
    }else{
      wx.showToast({
       title: '未使用密码锁',
       icon: 'error'
     })
    }
  },
  confirmSetLockPwd: function(e){
     var that=this;
     var lockData = that.data.lockData;
     console.log('lockData');
     console.log(lockData);
     if(lockData){
      if(!that.data.lockPwd||that.data.lockPwd<100000){
        wx.showToast({
          title: '密码不合法',
          icon: 'error'
        })
      }else{
        lock.setLockPwd(lockData,that.data.lockPwd);
        that.setData({
          setLockPwdShow:false,
          lockData:'',
        })
      }
    }else{
      wx.showToast({
        title: '未使用密码锁',
      })
    }
  },
  addLockCard: function(e){
    var that=this;
    let lockData = e.currentTarget.dataset.lockdata;
    if(lockData){
      lock.addCard(lockData);
   }else{
     wx.showToast({
       title: '未使用密码锁',
     })
   }
  },
})