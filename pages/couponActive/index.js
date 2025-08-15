var http = require("../../utils/http");
var util1 = require("../../utils/util.js");
const app = getApp();

Page({
  data: {
    // 活动ID
    id: null,
    // 优惠券ID
    couponId: null,
    // 优惠券key
    couponKey: "",
    // 优惠券名称
    couponName: "优惠券名称",
    // 活动名称 (注意是activeName不是activityName)
    activeName: "活动名称",
    // 总数量 (注意是num不是totalCount)
    num: 0,
    // 剩余数量 (注意是balanceNum不是remainCount)
    balanceNum: 0,
    // 截止时间
    endTime: "截止时间",
    // 过期时间 (注意是expriceTime不是expireTime)
    expriceTime: "过期时间",
    // 适用门槛
    minUsePrice: 0,
    // 优惠券面额
    price: 0,
    // 适用门店id
    storeId: null,
    // 适用门店名称
    storeName: "门店名称",
    // 适用房间类型 (注意是单个值不是数组)
    roomType: 1,
    // 优惠券类型
    type: 1,
    // 是否已领取 (注意是isGet不是isReceived)
    isGet: false,

    // 辅助显示字段
    couponTypeText: "",
    buttonText: "立即领取",
    remainingDays: 0,
    isActivityEnded: false,
    roomTypeText: "", // 添加房间类型文本显示
    isLoading: true, // 添加加载状态
  },

  onLoad: function (options) {
    let couponId = options.couponId;
    if(!couponId){
      var query = wx.getEnterOptionsSync().query;
      if (query) {
        if (query.couponId) {
          couponId = query.couponId;
        }
      }
    }
    this.setData({
      couponId: couponId
    });
    
  },
  onShow(){
    if (this.data.couponId) {
      this.getInfo();
    }

    this.initCouponData();
    this.checkActivityStatus();
    this.checkReceiveStatus();
    this.calculateRemainingDays();
  },

  getInfo: function () {
    var that = this;
    http.request(
      "/member/couponActive/getById?couponId=" + that.data.couponId,
      "1",
      "post",
      {},
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          console.log("Coupon Info:", info.data);
          that.setData({
            ...info.data,
            isLoading: false,
          });
          // 重新初始化数据
          that.initCouponData();
          that.checkActivityStatus();
          that.checkReceiveStatus();
          that.calculateRemainingDays();
        } else {
          console.error("Failed to fetch coupon info:", info);
          that.setData({ isLoading: false });
          wx.showToast({
            title: "加载失败，请重试",
            icon: "none",
            duration: 2000,
          });
        }
      },
      function fail(info) {
        console.error("Failed to fetch coupon info:", info);
        that.setData({ isLoading: false });
        wx.showToast({
          title: "加载失败，请重试",
          icon: "none",
          duration: 2000,
        });
      }
    );
  },

  checkActivityStatus: function () {
    const endTime = new Date(this.data.endTime);
    const now = new Date();
    const isEnded = now > endTime;

    this.setData({
      isActivityEnded: isEnded,
    });
  },

  calculateRemainingDays: function () {
    const endTime = new Date(this.data.endTime);
    const now = new Date();
    const diffTime = endTime - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    this.setData({
      remainingDays: Math.max(0, diffDays),
    });
  },

  initCouponData: function () {
    const couponType = this.data.type;
    let typeText = "";

    switch (couponType) {
      case 1:
        typeText = "抵扣券";
        break;
      case 2:
        typeText = "满减券";
        break;
      case 3:
        typeText = "加时券";
        break;
      default:
        typeText = "优惠券";
    }

    const roomType = this.data.roomType;
    let roomTypeText = "";
    switch (roomType) {
      case 1:
        roomTypeText = "大包";
        break;
      case 2:
        roomTypeText = "中包";
        break;
      case 3:
        roomTypeText = "小包";
        break;
      case 4:
        roomTypeText = "豪包";
        break;
      case 5:
        roomTypeText = "商务包";
        break;
      case 6:
        roomTypeText = "斯洛克";
        break;
      case 7:
        roomTypeText = "中式黑八";
        break;
      case 8:
          roomTypeText = "美式球桌";
          break;
      default:
        roomTypeText = "全场通用";
    }

    this.setData({
      couponTypeText: typeText,
      roomTypeText: roomTypeText,
    });
  },

  checkReceiveStatus: function () {
    const app = getApp();
    const isLogin = app.globalData.isLogin;
    const received = this.data.isGet;
    let buttonText = "";

    if (this.data.isActivityEnded) {
      buttonText = "返回门店下单";
    } else if (this.data.balanceNum <= 0) {
      buttonText = "已抢完";
    } else if (received) {
      buttonText = "已领取";
    } else if (!isLogin) {
      buttonText = "请登陆后领取";
    } else {
      buttonText = "立即领取";
    }

    this.setData({
      buttonText: buttonText,
    });
  },

  receiveCoupon: function () {
    if (!app.globalData.isLogin) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return;
    }

    if (this.data.isActivityEnded) {
      this.goBackToOrder();
      return;
    }

    if (this.data.isGet || this.data.balanceNum <= 0) {
      return;
    }
    var that = this;
    http.request(
      "/member/couponActive/putCoupon?id=" + that.data.id,
      "1",
      "post",
      {},
      app.globalData.userDatatoken.accessToken,
      "操作中...",
      function success(info) {
        if (info.code == 0) {
          wx.showToast({
            title: '领取成功',
            icon: "none",
            duration: 1000,
          })
          that.getInfo();
          that.checkReceiveStatus();
        } else {
          wx.showToast({
            title: info.msg,
            icon: "none",
            duration: 1000,
          });
        }
      },
      function fail(info) {
        wx.showToast({
          title: "操作失败，请重试",
          icon: "none",
          duration: 2000,
        });
      }
    );
  },

  goBackToOrder: function () {
    wx.setStorageSync("global_store_id", this.data.storeId);
    wx.switchTab({
      url: `/pages/index/index`,
    });
  },

  onShareAppMessage: function (res) {
    return {
      title: "邀请您领取优惠券~",
      path: `/pages/couponActive/index?couponId=${this.data.couponId}`,
      imageUrl: "/img/share_coupon.jpg",
    };
  },
  onShareTimeline(res){
    console.log('分享触发', res);
    let couponId = res.target.dataset.id;
    if (couponId) {
      return {
        title: '邀请您领取优惠券~',
        path: `/pages/couponActive/index?couponId=${couponId}`,
        imageUrl: '/img/share_coupon.jpg',
      };
    }else{
      wx.showToast({
        title: '请选择优惠券',
        icon: 'error'
      })
        return {};
    }
  },
});
