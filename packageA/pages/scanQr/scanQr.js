// pages/join/join.js
var http = require("../../../utils/http");
var util1 = require("../../../utils/util.js");
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    storeId: "",
    groupPayNo: "",
    storeIndex: "",
    stores: [],
    success: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getXiaLaListAdmin();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
  selectCity() {},
  onChange(event) {},
  //扫码
  scanCode: function () {
    var that = this;
    wx.scanCode({
      //扫描API
      success(res) {
        //扫描成功
        //console.log(res) //输出回调信息
        that.setData({
          groupPayNo: res.result,
          payselectindex: 0,
        });
        wx.showToast({
          title: "扫码成功",
          icon: "success",
          duration: 1000,
        });
      },
      fail: (res) => {
        //接口调用失败的回调函数
        wx.showToast({
          title: "扫码失败",
          icon: "success",
          duration: 1000,
        });
      },
    });
  },
  bindRegionChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value,
    });
  },
  submit: function () {
    var that = this;
    if (
      that.data.groupPayNo == "" ||
      that.data.storeId == "" ||
      that.data.groupPayNo.length == 0
    ) {
      wx.showToast({
        title: "请填写完整",
      });
      return;
    }
    if (app.globalData.isLogin) {
      http.request(
        "/member/manager/useGroupNo",
        "1",
        "post",
        {
          storeId: that.data.storeId,
          groupPayNo: that.data.groupPayNo,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info(info);
          if (info.code == 0) {
            wx.showToast({
              title: "操作成功",
              icon: "success",
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1000);
          } else {
            wx.showToast({
              title: "验券失败",
              icon: "error",
            });
          }
        },
        function fail(info) {}
      );
    } else {
      //console.log('未登录失败！')
    }
  },
  // 单选选门店
  bindStoreChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      storeId: this.data.stores[e.detail.value].id,
      storeIndex: e.detail.value,
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
              stores.push({ name: it.key, id: it.value });
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
        function fail(info) {}
      );
    }
  },
});
