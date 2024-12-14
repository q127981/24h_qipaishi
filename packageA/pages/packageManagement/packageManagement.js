// pages/packageManagement/packageManagement.js
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userinfo: {}, //用户信息
    pkgList: [],
    storeId: '',
    storeName: '',
    index: 0,
    stores: [], //门店列表
    option1: [
      { text: '全部状态', value: -1 },
      { text: '禁用', value: 0 },
      { text: '启用', value: 1 },
    ],
    value1: -1,
    isLogin: app.globalData.isLogin,
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,//是否还能加载更多
    mainColor: app.globalData.mainColor,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log('onLoad', options)
    // this.getuserinfo()
    if (options.storeId) {
      this.setData({
        storeId: options.storeId
      })
    }
    this.setData({
      isLogin: app.globalData.isLogin,
    })

    this.getXiaLaListAdmin();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow(options) {
    this.getPkgList('refresh');
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    let that = this;
    that.setData({
      pkgList: [],//列表数组
      canLoadMore: true,//是否还能加载更多
      pageNo: 1,
    })
    this.getPkgList("refresh");
    that.data.canLoadMore = true;
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.getPkgList('');
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
  getPkgList: function (e) {
    var that = this;
    let message = "";
    if (app.globalData.isLogin) {
      if (e == "refresh") { //刷新，page变为1
        message = "正在加载"
        that.setData({
          pkgList: [],//列表数组
          canLoadMore: true,//是否还能加载更多
          pageNo: 1,
        })
      }
      http.request(
        "/member/pkg/admin/getAdminPkgPage",
        "1",
        "post", {
        "pageNo": that.data.pageNo,
        "pageSize": that.data.pageSize,
        "enable": that.data.status,
        "storeId": that.data.storeId,
      },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info('套餐列表===');
          if (info.code == 0) {
            if (info.data.list.length === 0) {
              that.setData({
                canLoadMore: false
              })
            } else {
              const newList = info.data.list.map(meal => ({
                ...meal,
                weekQuantum: that.convertWeekday(meal.enableWeek),
                timeQuantum: that.convertTime(meal.enableTime),
                roomQuantum: that.convertRoomType(meal.roomType),
                enableRoomQuantum: that.convertEnableRoomType(meal.roomListRespVOList, meal.enableRoom)
              }));
              //有数据
              if (that.data.pkgList) {
                //列表已有数据  那么就追加
                let arr = that.data.pkgList;
                let arrs = arr.concat(newList);
                that.setData({
                  pkgList: arrs,
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total
                })
              } else {
                that.setData({
                  pkgList: newList,
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
      //console.log('未登录失败！')
    }


  },
  //管理员获取门店下拉列表数据
  getXiaLaListAdmin: function (e) {
    var that = this;
    {
      http.request(
        "/member/store/getStoreList",
        "1",
        "get", {
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('下拉门店数据===');
          if (info.code == 0) {
            let stores = []
            info.data.map(it => {
              stores.push({ text: it.key, value: it.value })
            })
            stores.unshift({ text: '全部门店', value: '' })
            that.setData({
              stores: stores,
              storeId: stores[0].value
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
  //门店下拉菜单发生变化
  storeDropdown(event) {
    //console.log(event)
    this.data.stores.map(it => {
      if (it.value == event.detail) {
        this.setData({
          storeId: it.value,
        })
      }
    })
    this.getPkgList("refresh")
  },
  //状态下拉菜单发生变化
  statusDropdown(event) {
    let that = this
    //console.log('选择的值')
    this.data.option1.map(it => {
      if (it.value == event.detail) {
        //console.log(it.value)
        if (it.value == -1) {
          that.setData({
            status: '',
          })
        } else {
          that.setData({
            status: it.value,
          })
        }
        that.getPkgList('refresh');
      }
    })
  },
  goToAddPage() {
    wx.navigateTo({
      url: '../editPages/editPages',
    })
  },
  //定义一个函数来将数字转换为星期名称：
  convertWeekday(numbers) {
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return numbers.map(num => weekDays[num % 7]).join(" | ");
  },
  convertRoomType(numbers) {
    if (numbers === null) {
      return [];
    }
    if (numbers.length === 0) {
      return [];
    }
    const weekDays = ["不限", "小包", "中包", "大包", "豪包", "商务包", "斯洛克", "中式黑八", "‌美式球桌"];
    return numbers.map(num => weekDays[num]).join("、");
  },
  convertEnableRoomType(doorRoomList, enableRoom) {
    if (doorRoomList === null || enableRoom === null) {
      return [];
    }
    if (doorRoomList.length === 0) {
      return [];
    }
    const enabledRoomIds = enableRoom.filter(roomId => doorRoomList.some(room => room.roomId === roomId));

    return enabledRoomIds.map(roomId => {
      const room = doorRoomList.find(room => room.roomId === roomId);
      return room ? room.roomName : "";
    }).join("、");
  },
  convertTime(numbers) {
    if (numbers.length === 0) {
      return [];
    }
    let result = [];
    let start = numbers[0];
    let end = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] === end + 1) {
        end = numbers[i];
      } else {
        result.push(`${start}~${end}`);
        start = numbers[i];
        end = numbers[i];
      }
    }
    result.push(`${start}~${end}`);
    return result;
  },
  changeStatus: function (e) {
    var that = this;
    let item = e.currentTarget.dataset.item;
    http.request(
      "/member/pkg/admin/enable/" + item.pkgId,
      "1",
      "post", {
      pkgId: item.pkgId,
    },
      app.globalData.userDatatoken.accessToken,
      "获取中...",
      function success(info) {
        if (info.code == 0) {
          wx.showToast({
            title: '操作成功',
            icon: 'none'
          })
          that.getPkgList('refresh');

        } else {
          wx.showToast({
            title: info.msg,
            icon: 'none'
          })
        }
      },
      function fail(info) { }
    )
  },
  edit: function (e) {
    var that = this;
    let item = e.currentTarget.dataset.item;
    const params = JSON.stringify(item);
    // console.log(params)
    wx.navigateTo({
      url: '../editPages/editPages?item=' + params,
    })
  },


})