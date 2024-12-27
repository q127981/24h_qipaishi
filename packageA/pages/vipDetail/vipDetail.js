// pages/setVip/setVip.js
const app = getApp();
var http = require("../../../utils/http.js");
var util1 = require("../../../utils/util.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isSelect: 0,
    stores: [],
    index: "",
    name: "",
    couponId: "",
    showRecharge: false,
    member: "",
    money: "",
    storeId: "",
    showMore: false,
    showMoreIndex: -1,
    couponIndex: -1,
    couponList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;
    const info = JSON.parse(options.info);
    that.setData({
      vipInfo: info,
    });

    console.log(that.data.couponList);
    that.getXiaLaListAdmin();

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getCouponList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    let that = this;
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.data.pageNo++;
      this.getListData("");
    } else {
      wx.showToast({
        title: "我是有底线的...",
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() { },

  // 赠送优惠券
  select: function (e) {
    let userId = e.currentTarget.dataset.info;
    console.log("userId" + userId);
    wx.showModal({
      title: "提示",
      content: "是否确定赠送该会员",
      complete: (res) => {
        if (res.cancel) {
        }

        if (res.confirm) {
          var that = this;
          if (app.globalData.isLogin) {
            http.request(
              "/member/manager/giftCoupon",
              "1",
              "post",
              {
                couponId: that.data.couponId,
                userId: userId,
              },
              app.globalData.userDatatoken.accessToken,
              "",
              function success(info) {
                console.info("返回111===");
                console.info(info);
                if (info.code == 0) {
                  wx.showToast({
                    title: "赠送成功",
                  });
                  setTimeout(() => {
                    wx.navigateBack();
                  }, 1000);
                } else {
                  wx.showModal({
                    content: info.msg,
                    showCancel: false,
                  });
                }
              },
              function fail(info) { }
            );
          }
        }
      },
    });
  },
  // 点击复制
  copy: function (e) {
    let data = e.currentTarget.dataset.info;
    var that = this;
    wx.setClipboardData({
      data: data,
      success(res) {
        wx.showToast({ title: "复制成功" });
      },
    });
  },
  recharge: function (e) {
    let data = e.currentTarget.dataset.info;
    this.setData({
      member: data,
      money: "",
      storeId: "",
      index: "",
      showRecharge: true,
    });
  },
  confirmRecharge: function (e) {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/manager/recharge",
        "1",
        "post",
        {
          userId: that.data.member.id,
          storeId: that.data.storeId,
          money: that.data.money,
        },
        app.globalData.userDatatoken.accessToken,
        "提交中",
        function success(info) {
          console.info("返回111===");
          console.info(info);
          if (info.code == 0) {
            wx.showToast({
              title: "充值成功",
            });
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
        }
      );
    }
  },
  cancelRecharge: function (e) {
    this.setData({
      member: "",
      money: "",
      storeId: "",
      showRecharge: false,
    });
  },
  //管理员获取门店下拉列表数据
  getXiaLaListAdmin: function (e) {
    var that = this;
    //if (app.globalData.isLogin)
    {
      http.request(
        "/member/store/getStoreList",
        "1",
        "get",
        {},
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info("下拉门店数据===");
          console.info(info);
          if (info.code == 0) {
            let stores = [];
            info.data.map((it) => {
              stores.push({ text: it.key, value: it.value });
            });
            that.setData({
              stores: stores,
            });
          } else {
            wx.showModal({
              content: "请求服务异常，请稍后重试",
              showCancel: false,
            });
          }
        },
        function fail(info) { }
      );
    }
  },
  bindStoreChange: function (e) {
    this.setData({
      index: e.detail.value,
      storeId: this.data.stores[e.detail.value].value,
    });
  },
  onShowMore(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      showMore: true,
      showMoreIndex: index,
    });
  },
  //获取列表数据
  getCouponList: function () {
    return new Promise((resolve, reject) => {
      var that = this;
      wx.showLoading({
        title: '加载中',
      })
      http.request(
        "/member/manager/getUserCouponByAdmin",
        "1",
        "post",
        {
          userId: that.data.vipInfo.id,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          wx.hideLoading();
          if (info.code == 0) {
            console.log("获取优惠券列表");
            that.setData({
              couponList: info.data,
            });
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) { }
      );
    })
  },
  onRevokeCoupon(e) {
    const { item } = e.currentTarget.dataset
    var that = this;
    wx.showModal({
      title: '提示',
      content: '您确定要回收该优惠券吗？',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          http.request(
            "/member/manager/revokeCoupon/" + item.couponId,
            "1",
            "post",
            {
            },
            app.globalData.userDatatoken.accessToken,
            "",
            function success(info) {
              if (info.code == 0) {
                wx.showToast({
                  title: '操作成功',
                })
                that.getCouponList();
              } else {
                wx.showModal({
                  content: info.msg,
                  showCancel: false,
                });
              }
            },
            function fail(info) { }
          );
        }
      }
    })
  }
});
