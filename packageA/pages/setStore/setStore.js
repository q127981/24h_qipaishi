// pages/store/store.js
// 获取应用实例
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
var lock = require('../../../utils/lock.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    MainList:[],//列表数组
    canLoadMore: true,//是否还能加载更多
    pageNo: 1,
    name: '',
    setLockPwdShow: false,
    lockData: '',
    isIpx: app.globalData.isIpx?true:false,
    foldIndex: -1
  },
  foldTap (e) {
    console.log(e)
    const {target: {dataset = {}} = {}} = e
    this.setData({
      foldIndex: this.data.foldIndex === dataset.index ? -1 : dataset.index
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getListData('refresh');
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
    // this.getListData('refresh');
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
    let that = this;
    that.setData({
      MainList:[],//列表数组
      canLoadMore: true,//是否还能加载更多
      pageNo: 1,
    })
    this.getListData('refresh');
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      this.getListData('')
    } else {
      wx.showToast({
        title: '我是有底线的...',
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  //获取列表数据
  getListData:function(e){
    var that = this;
    let message = "";
    if (app.globalData.isLogin) 
    {
      if (e == "refresh") { //刷新，page变为1
        message = "正在加载"
        that.setData({
          pageNo:1,
          MainList:[]
        })
      }

      http.request(
        "/member/store/getPageList",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": 10,
          "name": that.data.name
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            if(info.data.list.length === 0){
              that.setData({
                canLoadMore: false
              })
            }else{
               //有数据
              if(that.data.MainList){
                //列表已有数据  那么就追加
                let arr = that.data.MainList;
                let arrs = arr.concat(info.data.list);
                that.setData({
                  MainList: arrs,
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total
                })
              }else{
                that.setData({
                  MainList: info.data.list,
                  pageNo: that.data.pageNo + 1,
                });
              }
            }
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
    } else{
      wx.showModal({
        content: '请您先登录，再重试！',
        showCancel: false,
      })
    }
  },
  // 搜索
  search: function(){
    this.getListData("refresh")
  },
  previewImage(e){
    var currentUrl = e.currentTarget.dataset.src //获取当前点击图片链接
    wx.previewImage({
      urls: [currentUrl]
    })
  },
  // 获取门店详情
  getData:function(storeId){
    var that = this;
  },
  //美团授权跳转
  meituanScope:function(e){
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


    
  },
  //抖音授权跳转
  douyinScope:function(e){
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
  },
  // 打开大门
  openStoreDoor:function(e){
    let id = e.currentTarget.dataset.info
    var that = this;
    // console.info(id);
    http.request(
      "/member/store/openStoreDoor/"+id,
      "1",
      "post", {
        "id": id,
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        console.info(info);
        if (info.code == 0) {
          wx.showToast({
            title: "操作成功",
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
  },
  // 查看地图
  goTencentMap(e){
    var store = e.currentTarget.dataset.info
    this.goMap(store)
  },
  // 打开地图
  goMap(store) {
    let that = this
    wx.openLocation({
      latitude: store.lat,
      longitude: store.lon,
      name: store.storeName,
      address: store.address,
      scale: 28
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
       icon: 'error'
     })
   }
  },
  //设置密码锁密码
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
})