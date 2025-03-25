// pages/setVip/setVip.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSelect: 0,
    MainList: [],//列表数组
    index: '',
    canLoadMore: true,//是否还能加载更多
    pageNo: 1,
    pageSize: 10,
    name: '',
    showEdit: false,
    showAdd: false,
    storeId: '',
    member: '',
    mobile: '',
    vipList: [],
    isIpx: app.globalData.isIpx ? true : false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let storeId = options.storeId
    this.setData({
      storeId: storeId,
    })
    this.getListData('refresh');
    this.getVipList();
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    let that = this;
    that.setData({
      MainList: [],//列表数组
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
  getListData: function (e) {
    var that = this;
    let message = "";
    if (app.globalData.isLogin) {
      if (e == "refresh") { //刷新，page变为1
        message = "正在加载"
        that.setData({
          pageNo: 1,
          MainList: []
        })
      }

      http.request(
        "/member/manager/getVipPage",
        "1",
        "post", {
        "storeId": that.data.storeId,
        "pageNo": that.data.pageNo,
        "pageSize": that.data.pageSize,
        "name": that.data.name,
      },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info('返回111===');
          if (info.code == 0) {
            if (info.data.list.length === 0) {
              that.setData({
                canLoadMore: false
              })
            } else {
              //有数据
              if (that.data.MainList) {
                //列表已有数据  那么就追加
                let arr = that.data.MainList;
                let arrs = arr.concat(info.data.list);
                that.setData({
                  MainList: arrs,
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total
                })
              } else {
                that.setData({
                  MainList: info.data.list,
                  pageNo: that.data.pageNo + 1,
                });
              }
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
    } else {
      wx.showModal({
        content: '请您先登录，再重试！',
        showCancel: false,
      })
    }
  },
  // 搜索
  search: function (e) {
    this.getListData("refresh")
  },
  getVipList: function () {
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/getVipConfig/" + that.data.storeId,
        "1",
        "post", {
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            let vipList = []
            info.data.map(it => {
              vipList.push({ text: it.vipName, value: it.vipLevel })
            })
            that.setData({
              vipList: vipList,
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


  edit: function (e) {
    let data = e.currentTarget.dataset.info
    this.setData({
      member: data,
      index: '',
      showEdit: true
    })
  },
  addVip: function (e) {
    this.setData({
      mobile: '',
      index: '',
      showAdd: true
    })
  },
  confirmEdit: function (e) {
    var that = this;
    if (that.data.index) {
      if (app.globalData.isLogin) {
        http.request(
          "/member/store/editMemberVip",
          "1",
          "post", {
          "userId": that.data.member.id,
          "storeId": that.data.storeId,
          "vipLevel": that.data.vipList[that.data.index].value,
        },
          app.globalData.userDatatoken.accessToken,
          "提交中",
          function success(info) {
            if (info.code == 0) {
              wx.showToast({
                title: '操作成功',
              })
              that.getListData('refresh')
            } else {
              wx.showModal({
                content: info.msg,
                showCancel: false,
              })
            }
          },
          function fail(info) {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            })
          }
        )
      }
    } else {
      wx.showToast({
        title: '未选择等级',
      })
    }
  },
  confirmAdd: function (e) {
    var that = this;
    if (that.data.index) {
      if (app.globalData.isLogin) {
        http.request(
          "/member/store/addMemberVip",
          "1",
          "post", {
          "mobile": that.data.mobile,
          "storeId": that.data.storeId,
          "vipLevel": that.data.vipList[that.data.index].value,
        },
          app.globalData.userDatatoken.accessToken,
          "提交中",
          function success(info) {
            if (info.code == 0) {
              wx.showToast({
                title: '操作成功',
              })
              that.getListData('refresh')
            } else {
              wx.showModal({
                content: info.msg,
                showCancel: false,
              })
            }
          },
          function fail(info) {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            })
          }
        )
      }
    } else {
      wx.showToast({
        title: '未选择等级',
      })
    }
  },
  cancelEdit: function (e) {
    this.setData({
      member: '',
      showEdit: false
    })
  },
  cancelAdd: function (e) {
    this.setData({
      mobile: '',
      showAdd: false
    })
  },
  bindVipChange: function (e) {
    this.setData({
      index: e.detail.value,
      // storeId: this.data.stores[e.detail.value].value
    })
  },
  addVip: function () {
    this.setData({
      member: '',
      showAdd: true
    })
  },
})