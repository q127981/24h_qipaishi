// packageA/pages/addLock/addLock.js
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx ? true : false,
    currentPage: 1, // 当前页码
    productOrderList: [],  // 商品订单列表
    hasMore: false, // 是否可以加载更多
    isShowAll: false, // 长度超过3 可以点击展示更多
    manager: false, // 判断是在哪里点击进入 manager true 商家通过 经营管理进入
    showCancel: false, // 是否显示取消弹窗
    showFinish: false, // 是否显示确认弹窗
    orderNo: '', // 订单编号
    orderId: '', // 订单id
    store: -1,
    storeOption: [
      { text: '全部门店', value: -1 }
    ],
    storeList: [],
    status: -1,
    statusOption: [
      { text: '全部状态', value: -1 },
      { text: '待支付', value: 0 },
      { text: '已支付', value: 1 },
      { text: '已完成', value: 2 },
      { text: '已取消', value: 3 },
    ],
    tabs: [
      { id: -1, name: '全部' },
      { id: 0, name: '待支付' },
      { id: 1, name: '已支付' },
      { id: 2, name: '已完成' },
      { id: 3, name: '已取消' }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    console.log(111)
    console.log(options)
    console.log(111)
    let manager = options.manager
    if (manager != undefined) {
      that.setData({
        manager: true
      })
    } else {
      that.setData({
        manager: false
      })
    }
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
    let that = this
    if (that.data.manager) {
      that.getManageOrderPage(true)
    } else {
      that.getOrderPage(true)
    }
    //   that.getStoreListoption()
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
    let that = this
    if (that.data.hasMore) {
      if (that.data.manager) {
        that.getManageOrderPage(false)
      } else {
        that.getOrderPage(false)
      }
    } else {
      wx.showToast({
        title: '没有更多啦~',
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  // 获取订单数据
  getOrderPage: function (refuse = false) {
    let that = this;
    if (app.globalData.isLogin) {
      let currentPage = refuse ? 1 : that.data.currentPage + 1;
      that.setData({ currentPage });
      http.request(
        "/product/order/page",
        "1",
        "post",
        {
          "storeId": that.data.store == -1 ? null : that.data.store,
          "status": that.data.status == -1 ? null : that.data.status,
          "pageSize": 10,
          "pageNo": currentPage
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            const productOrderList = info.data.list
            productOrderList.forEach(item => {
              let totalNumber = 0;
              item.productInfoVoList.forEach(product => {
                totalNumber += product.number;
              });
              item.productInfoVoListThree = item.productInfoVoList.slice(0, 3);
              item.productNum = totalNumber;
            });
            if (!refuse) {
              that.setData({
                productOrderList: that.data.productList.concat(productOrderList),
                hasMore: that.data.currentPage * 10 < info.data.total,
              });
            } else {
              that.setData({
                productOrderList: productOrderList,
                hasMore: that.data.currentPage * 10 < info.data.total,
              });
            }
            console.log(that.data.productOrderList)
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {
          wx.stopPullDownRefresh();
        }
      );
    }
  },
  // 获取筛选门店
  getStoreListoption: function () {
    let that = this
    if (app.globalData.isLogin) {
      http.request(
        "/product/order/getstore",
        "1",
        "get",
        {},
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            that.setData({
              storeList: info.data
            })
            const storeOption = that.data.storeOption
            that.data.storeList.forEach(item => {
              storeOption.push({ text: item.storeName, value: item.storeId })
            })
            that.setData({
              storeOption: storeOption
            })
            if (that.data.manager) {
              that.getManageOrderPage(true)
            } else {
              that.getOrderPage(true)
            }
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {
          wx.stopPullDownRefresh();
        }
      );
    }
  },
  // 点击顶部门店下拉选项
  storeFilter(e) {
    let that = this
    console.log(e)
    that.setData({
      store: e.detail
    })
    if (that.data.manager) {
      that.getManageOrderPage(true)
    } else {
      that.getOrderPage(true)
    }
  },
  // 点击顶部状态下拉选项
  statusFilter(e) {
    let that = this
    that.setData({
      status: e.detail
    })
    if (that.data.manager) {
      that.getManageOrderPage(true)
    } else {
      that.getOrderPage(true)
    }
  },
  // tab切换
  tabChange: function (e) {
    let that = this
    let status = e.currentTarget.dataset.status;//获取当前点击的下标
    that.setData({
      status: status
    })
    if (that.data.manager) {
      that.getManageOrderPage(true)
    } else {
      that.getOrderPage(true)
    }
  },
  // 默认展示两个，点击取反
  showMore: function () {
    let that = this
    let show = that.data.isShowAll
    that.setData({
      isShowAll: !show
    })
  },
  // 取消支付 修改订单状态
  cancelPay: function () {
    let that = this
    let orderId = that.data.orderId
    let url = "/product/order/cancel";
    if (that.data.manager) {
      url = "/product/order/cancelByAdmin";
    }
    if (app.globalData.isLogin) {
      http.request(
        url,
        "1",
        "post",
        {
          "orderId": orderId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          wx.showToast({
            title: '取消成功',
          })
          that.setData({
            showCancel: false
          })
          if (that.data.manager) {
            that.getManageOrderPage(true)
          } else {
            that.getOrderPage(true)
          }
        }
      );
    }
  },
  // 支付
  tpPay: function (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderid
    if (app.globalData.isLogin) {
      wx.showLoading({
        title: '加载中',
      })
      http.request(
        "/product/order/pay/" + orderId,
        "1",
        "post",
        {},
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            wx.hideLoading()
            that.payMent(info);
          }
        }
      );
    }
  },
  //支付
  payMent: function (pay) {
    var that = this;
    wx.requestPayment({
      'timeStamp': pay.data.timeStamp,
      'nonceStr': pay.data.nonceStr,
      'package': pay.data.pkg,
      'signType': pay.data.signType,
      'paySign': pay.data.paySign,
      'success': function (res) {
        wx.showToast({
          title: '支付成功!',
          icon: 'success'
        })
        that.getOrderPage(true)
      },
      'fail': function (res) {
        wx.showToast({
          title: '支付失败!',
          icon: 'error'
        })
      },
      'complete': function (res) {

      }
    })
  },
  //   管理员获取门店下的订单
  getManageOrderPage: function (refuse = false) {
    let that = this;
    if (app.globalData.isLogin && that.data.manager) {
      let currentPage = refuse ? 1 : that.data.currentPage + 1;
      that.setData({ currentPage });
      http.request(
        "/product/order/manage/page",
        "1",
        "post",
        {
          "status": that.data.status == -1 ? null : that.data.status,
          "pageSize": 10,
          "pageNo": currentPage
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            const productOrderList = info.data.list
            productOrderList.forEach(item => {
              let totalNumber = 0;
              item.productInfoVoList.forEach(product => {
                totalNumber += product.number;
              });
              item.productInfoVoListThree = item.productInfoVoList.slice(0, 3);
              item.productNum = totalNumber;
            });
            if (!refuse) {
              that.setData({
                productOrderList: that.data.productList.concat(productOrderList),
                hasMore: that.data.currentPage * 10 < info.data.total,
              });
            } else {
              that.setData({
                productOrderList: productOrderList,
                hasMore: that.data.currentPage * 10 < info.data.total,
              });
            }
            console.log(that.data.productOrderList)
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {
          wx.stopPullDownRefresh();
        }
      );
    }
  },
  //   完成订单
  finishOrder: function (e) {
    let that = this
    let orderId = that.data.orderId
    if (app.globalData.isLogin) {
      http.request(
        "/product/order/finish/" + orderId,
        "1",
        "post",
        {},
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          wx.showToast({
            title: '订单已完结',
          })
          that.setData({
            showFinish: false
          })
          if (that.data.manager) {
            that.getManageOrderPage(true)
          } else {
            that.getOrderPage(true)
          }
        }
      );
    }
  },
  // showCancel 显示取消弹窗
  showCancel: function (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderid
    wx.showModal({
      title: '温馨提示',
      content: '您确定要取消此订单吗？',
      complete: (res) => {
        if (res.cancel) {

        }
        if (res.confirm) {
          that.setData({
            orderId: orderId,
          })
          that.cancelPay();
        }
      }
    })
  },
  // showFinish 显示完成弹窗
  showFinish: function (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderid
    wx.showModal({
      title: '温馨提示',
      content: '您确定要取消此订单吗？',
      complete: (res) => {
        if (res.cancel) {

        }
        if (res.confirm) {
          that.setData({
            orderId: orderId,
          })
          that.finishOrder();
        }
      }
    })
  },
  // 关闭取消弹窗
  closeShow: function () {
    let that = this
    that.setData({
      orderNo: '',
      showCancel: false
    })
  },
  // 关闭完成弹窗
  closeFinishShow: function () {
    let that = this
    that.setData({
      orderId: '',
      showFinish: false
    })
  },
  // 跳转商品订单详情
  orderInfo: function (e) {
    let orderId = e.currentTarget.dataset.orderid
    let storeId = e.currentTarget.dataset.storeid
    wx.navigateTo({
      url: '../productOrderInfo/productOrderInfo?storeId=' + storeId + '&&orderId=' + orderId
    })
  },
  //打电话
  call: function (e) {
    let that = this;
    const orderId = e.currentTarget.dataset.orderid
    if (app.globalData.isLogin) {
      http.request(
        "/product/order/phone/" + orderId,
        "1",
        "get",
        {},
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          wx.makePhoneCall({
            phoneNumber: info.data,
            success: function () {
              //console.log("拨打电话成功！")
            },
            fail: function () {
              //console.log("拨打电话失败！")
            }
          })
        }
      );
    }
  },

})