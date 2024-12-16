// pages/roomRenew/roomRenew.js
const app = getApp()
var http = require('../../utils/http');
var Moment = require('../../lib/moment.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: app.globalData.isLogin,
    storeId: '',
    roomId: '',
    OrderInfodata: '',
    newTime: '',
    addTime: 0,
    totalPay: '',
    giftBalance: '',
    balance: '',
    submit_couponInfo: {},//选中的提交的优惠券信息
    couponId: '',
    couponCount: 0,
    show: false,
    modeIndex: 0,
    scrollPosition: 0,
    select_pkg_index: -1,
    payType: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this
    var storeId = '';
    var roomId = '';
    if (options.storeId) {
      storeId = options.storeId;
    }
    if (options.roomId) {
      roomId = options.roomId;
    }
    var query = wx.getEnterOptionsSync().query;
    if (query) {
      if (query.storeId) {
        storeId = query.storeId;
      }
      if (query.roomId) {
        roomId = query.roomId;
      }
    }
    that.setData({
      storeId: storeId,
      roomId: roomId,
    });

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
    var that = this
    setTimeout(() => {
      that.setData({
        isLogin: app.globalData.isLogin
      })
    }, 200);
    that.getOrderInfo();
    that.getCouponListData();
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
  getOrderInfo: function () {
    var that = this;
    http.request(
      "/member/order/getOrderByRoomId/" + that.data.roomId,
      "1",
      "post", {
    },
      app.globalData.userDatatoken.accessToken,
      "获取中...",
      function success(info) {
        console.info('订单信息===');
        // console.info(info);
        if (info.code === 0) {
          that.setData({
            OrderInfodata: info.data
          });
          that.getStoreBalance();
        } else {
          wx.showModal({
            title: '温馨提示',
            content: info.msg,
            showCancel: false,
            success(res) {
              if (res.confirm) {
                let pages = getCurrentPages();
                if (pages.length > 1) {
                  wx.navigateBack({//返回
                    delta: 1
                  });
                }
                if (pages.length == 1) {
                  wx.reLaunch({
                    url: '/pages/index/index',
                  })
                }
              }
            }
          })
        }
      },
      function fail(info) {
      }
    )
  },
  // 续费加时间
  onChange: function (event) {
    var that = this
    var addTime = event.detail
    var newTime = Moment(that.data.OrderInfodata.endTime).add(addTime, "hours").format("YYYY/MM/DD HH:mm")
    //console.log(`newtime:${newTime}`)
    this.setData({
      newTime: newTime,
      totalPay: (addTime * that.getPrice(newTime)).toFixed(2)
    })
  },
  getPrice: function (startDate) {
    var that = this;
    var day = new Date(startDate).getDay();
    switch (day) {
      case 1:
      case 2:
      case 3:
      case 4:
        return that.data.OrderInfodata.workPrice;
      case 0:
      case 5:
      case 6:
        return that.data.OrderInfodata.roomPrice;
    }
  },
  backHome: function () {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  renewOrder: function () {
    var that = this;
    if (!that.data.newTime) {
      wx.showModal({
        title: '温馨提示',
        content: '请选择需要增加的时间！',
        showCancel: false,
        confirmText: "确定",
        success(res) {
        }
      })
      return
    }
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/preOrder",
        "1",
        "post", {
        roomId: that.data.OrderInfodata.roomId,
        couponId: that.data.couponId,
        startTime: that.data.OrderInfodata.endTime,
        endTime: that.data.newTime,
        orderId: that.data.OrderInfodata.orderId
      },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          console.info('支付信息===');
          console.info(info);
          if (info.code == 0) {
            that.data.renewOrderNo = info.data.orderNo;
            that.lockWxOrder(info);
          } else {
            wx.showModal({
              title: '温馨提示',
              content: info.msg,
              showCancel: false,
              confirmText: "确定",
              success(res) {
              }
            })
          }
        },
        function fail(info) {
        }
      )
    }

  },
  // 锁定微信订单
  lockWxOrder: function (pay) {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/lockWxOrder",
        "1",
        "post", {
        roomId: that.data.OrderInfodata.roomId,
        couponId: "",
        startTime: that.data.OrderInfodata.endTime,
        endTime: that.data.newTime,
        orderId: that.data.OrderInfodata.orderId
      },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          if (info.code == 0) {
            console.log('锁定微信支付订单');
            that.payMent(pay);//微信支付
          } else {
            wx.showModal({
              title: '温馨提示',
              content: info.msg,
              showCancel: false,
              confirmText: "确定",
              success(res) {
              }
            })
          }
        },
        function fail(info) {
        }
      )
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
        //console.log('*************支付成功');
        // setTimeout(function () {
        // }, 1000);
        // that.getOrderInfo()
      },
      'fail': function (res) {
        wx.showToast({
          title: '支付失败!',
          icon: 'error'
        })
        //console.log('*************支付失败');
      },
      'complete': function (res) {
        //console.log('*************支付完成');
      }
    })
  },
  phone: function (e) {
    var that = this;
    //console.log('手机号码授权+++++++');
    if (e.detail.errMsg == "getPhoneNumber:fail user deny") {
      wx.showToast({ title: "已取消授权" });
    }
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      //console.log('手机号码授权+++++++');
      wx.login({
        success: function (res) {
          if (res.code != null) {
            http.request(
              "/member/auth/weixin-mini-app-login",
              "1",
              "post",
              {
                phoneCode: e.detail.code,
                loginCode: res.code,
              },
              "",
              "获取中...",
              function success(info) {
                console.info("返回111===");
                console.info(info);
                if (info.code == 0) {
                  if (info.data) {
                    app.globalData.userDatatoken = info.data;
                    app.globalData.isLogin = true;
                    that.setData({
                      isLogin: true,
                    });
                    //缓存服务器返回的用户信息
                    wx.setStorageSync("userDatatoken", info.data);
                  }
                }
              },
              function fail(info) { }
            );
          } else {
            //console.log('登录失败！' + res.errMsg)
          }
        },
      });
    }
  },
  onClickShow(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      show: true,
      popupIndex: +index
    });
  },
  onClickHide() {
    this.setData({ show: false });
  },
  call: function () {
    // let that = this
    let that = this;
    var phoneLength = that.data.OrderInfodata.kefuPhone.length;
    if (phoneLength > 0) {
      if (phoneLength == 11) {
        wx.makePhoneCall({
          phoneNumber: that.data.OrderInfodata.kefuPhone,
          success: function () {
            //console.log("拨打电话成功！")
          },
          fail: function () {
            //console.log("拨打电话失败！")
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '客服上班时间10：00~23：00\r\n如您遇到问题，建议先查看“使用帮助”！\r\n本店客服微信号：' + that.data.OrderInfodata.kefuPhone,
          confirmText: '复制',
          complete: (res) => {
            if (res.confirm) {
              wx.setClipboardData({
                data: that.data.OrderInfodata.kefuPhone,
                success: function (res) {
                  wx.showToast({ title: '微信号已复制到剪贴板！' })
                }
              })
            } else if (res.cancel) {
              //console.log('用户点击取消')
            }
          }
        })
      }
    }
    // if(that.data.OrderInfodata.kefuPhone.length>0){
    //   //console.log("拨打电话+++")
    //   wx.makePhoneCall({
    //     phoneNumber:that.data.OrderInfodata.kefuPhone,
    //     success:function () {
    //       //console.log("拨打电话成功！")
    //     },
    //     fail:function () {
    //       //console.log("拨打电话失败！")
    //     }
    //   })
    // }
  },
  copyOrderNo(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.order,
      success: function () {
        wx.showToast({ title: "订单号已复制" });
      },
    });
  },
  goTencentMap(e) {
    let store = this.data.OrderInfodata
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
  // 续费弹窗
  renewClick() {
    var that = this;
    let OrderInfodata = that.data.OrderInfodata;
    if (OrderInfodata.status == 3 || OrderInfodata.status == 2) {
      wx.showToast({
        title: "订单已结束！",
        icon: "error",
      });
    } else {
      if (app.globalData.isLogin) {
        //已登录
        that.setData({
          renewShow: true,
          couponId: '',
          submit_couponInfo: {},
          payTypes: [
            { name: "微信支付", value: 1, checked: true },
            { checked: false, name: "钱包余额", value: 2 },
          ],
        });
        that.getPkgList();
      } else {
        //未登录
        that.setData({
          renewShow: true,
          payTypes: [{ name: "微信支付", value: 1, checked: true }],
        });
      }
    }
  },
  goGuide() {
    wx.navigateTo({
      url: `/packageA/pages/guide/guide?storeId=${this.data.storeId}`,
    });
  },
  modeChange(e) {
    const { index } = e.target.dataset;
    this.setData({
      modeIndex: +index,
      payType: 1,
      select_pkg_index: -1,
    });
    if (index == 0) {
      //小时模式
      console.log('小时模式');
      this.setData({
        pkgId: '',
        addTime: 0
      })
      this.timeChange(0);
    }
  },
  handleScroll(e) {
    const { scrollLeft, scrollWidth } = e.detail;
    let itemLength = 0;
    if (this.data.modeIndex === 1 && this.data.pkgList.length) {
      itemLength = scrollWidth / this.data.pkgList.length;
    } else if (this.data.modeIndex === 2) {
    }
    const position = scrollLeft / (scrollWidth - itemLength);
    this.setData({
      scrollPosition: position * 100,
    });
  },
  handleScrollStart() {
    this.setData({
      scrollPosition: 0,
    });
  },
  //点击的套餐
  selectPkgInfo: function (event) {
    var that = this;
    var pkgIndex = event.currentTarget.dataset.index;
    var pkgId = event.currentTarget.dataset.id;
    var hour = event.currentTarget.dataset.hour;
    if (pkgIndex == that.data.select_pkg_index) {
      pkgIndex = -1;
      pkgId = "";
    }
    var newTime = Moment(this.data.OrderInfodata.endTime)
      .add(hour, "hours")
      .format("YYYY/MM/DD HH:mm");
    that.setData({
      select_pkg_index: pkgIndex,
      pkgId: pkgId,
      payType: 4,
      newTime: newTime,
      totalPay: that.data.pkgList[pkgIndex].price,
    });
  },
  convertEnableTime(enableTime) {
    if (
      (enableTime.length === 24 &&
        enableTime.every((num, index) => num === index)) ||
      enableTime.length === 0
    ) {
      return "全天可用";
    } else {
      const startTime = enableTime[0].toString().padStart(2, "0");
      const endTime = enableTime[enableTime.length - 1]
        .toString()
        .padStart(2, "0");
      return `${startTime}:00 - ${endTime}:00可用`;
    }
  },
  convertEnableWeek(enableWeek) {
    const weekdays = ["一", "二", "三", "四", "五", "六", "周日"];
    const selectedWeekdays = enableWeek.map((day) => weekdays[day - 1]);

    if (enableWeek.length === 7 || enableWeek.length === 0) {
      return "周一至周日";
    } else {
      return `周${selectedWeekdays.join("、")}`;
    }
  },
  getPkgList: function (e) {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/pkg/getPkgPage",
        "1",
        "post",
        {
          storeId: that.data.OrderInfodata.storeId,
          roomId: that.data.OrderInfodata.roomId,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            const newMeals = info.data.list.map((el) => ({
              ...el,
              desc:
                that.convertEnableWeek(el.enableWeek) +
                ", " +
                that.convertEnableTime(el.enableTime),
            }));

            that.setData({
              pkgList: newMeals,
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
    }
  },
  // 获取门店余额
  getStoreBalance: function () {
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/getStoreBalance/" + that.data.OrderInfodata.storeId,
        "1",
        "get", {
        "storeId": that.data.OrderInfodata.storeId
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('赠送余额===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              giftBalance: info.data.giftBalance,
              balance: info.data.balance
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
  timeChange(addTime) {
    var newTime = Moment(this.data.OrderInfodata.endTime)
      .add(addTime, "hours")
      .format("YYYY/MM/DD HH:mm");
    this.setData({
      addTime: addTime,
      newTime: newTime,
      totalPay: (addTime * this.getPrice(newTime)).toFixed(2),
    });
  },
  onRenewAdd() {
    console.log('onRenewAdd');
    var addTime = parseInt(this.data.addTime) + 1;
    console.log('addTime:', addTime);
    if (addTime > 8) return;
    this.timeChange(addTime);
  },
  onRenewMinus() {
    var addTime = parseInt(this.data.addTime) - 1;
    if (addTime < 0) return;
    this.timeChange(addTime);
  },
  // 取消续费重置数据
  renewCancel: function () {
    this.setData({
      renewShow: false,
      addTime: 0,
      newTime: '',
      renewOrderNo: '',
      totalPay: 0,
      payType: 1
    })
  },
  // 去优惠券页面
  goCoupon() {
    var that = this;
    if (!that.data.newTime) {
      wx.showToast({
        title: '请先选择时间',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '../coupon/coupon?from=1&roomId=' + that.data.OrderInfodata.roomId + '&nightLong=false' + '&startTime=' + that.data.OrderInfodata.endTime + '&endTime=' + that.data.newTime,
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        pageDataList: function (data) {
          console.log('页面B触发事件时传递的数据1：', data)
          that.setData({
            submit_couponInfo: data,
            couponId: data.couponId
          });
          // that.setshowpayMoney(data);
        },
        pageDataList_no: function (data) {
          //console.log('页面B触发事件时传递的数据1：',data)
          that.setData({
            submit_couponInfo: data,
            couponId: ''
          });
          // that.setshowpayMoney(data);
        },
      }
    })
  },
  //获取优惠券列表数据
  getCouponListData: function (e) {
    var that = this;
    let message = "";
    if (app.globalData.isLogin) {
      http.request(
        "/member/user/getCouponPage",
        "1",
        "post",
        {
          pageNo: 1,
          pageSize: 100,
          status: 0,
          storeId: that.data.storeId,
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          if (info.code == 0) {
            that.setData({
              couponCount: info.data.total
            })
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
  },
  // 支付方式选择
  radioChange(e) {
    const type = e.detail.value;
    const payTypes = this.data.payTypes;
    if (type == 1) {
      payTypes[0].checked = true;
      payTypes[1].checked = false;
      console.log(type, payTypes);
    } else {
      console.log(type, payTypes);

      payTypes[0].checked = false;
      payTypes[1].checked = true;
    }
    this.setData({
      payType: type,
      payTypes: payTypes,
    });
  },
  //预支付
  SubmitOrderInfoData() {
    if (
      (this.data.modeIndex === 0 && !this.data.addTime) ||
      (this.data.modeIndex === 1 && !this.data.pkgId)
    ) {
      wx.showToast({
        title: this.data.modeIndex === 1 ? "请选择套餐" : "请选择增加时间",
        icon: "none",
      });
      return false;
    }
    var that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/member/order/preOrder",
        "1",
        "post",
        {
          roomId: that.data.OrderInfodata.roomId,
          couponId: "",
          startTime: that.data.OrderInfodata.endTime,
          endTime: that.data.newTime,
          orderId: that.data.OrderInfodata.orderId,
          payType: this.data.payType,
          pkgId: this.data.pkgId,
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          console.info("支付信息===");
          console.info(info);
          if (info.code == 0) {
            that.data.renewOrderNo = info.data.orderNo;
            //判断是不是微信支付 微信支付让回调去处理
            if (that.data.payType == 1 && info.data.payPrice > 0) {
              that.lockWxOrder(info);
            } else {
              that.renewConfirm();
            }
          } else {
            wx.showModal({
              title: "温馨提示",
              content: info.msg,
              showCancel: false,
              confirmText: "确定",
              success(res) { },
            });
          }
        },
        function fail(info) { }
      );
    }
  },
  //支付
  renewConfirm: function () {
    if (!this.data.newTime) {
      wx.showToast({
        title: '请选择增加时间',
        icon: "none"
      })
      return false;
    } else {
      var that = this
      if (app.globalData.isLogin) {
        http.request(
          "/member/order/renew",
          "1",
          "post", {
          "orderId": that.data.OrderInfodata.orderId,
          "couponId": that.data.couponId,
          "endTime": that.data.newTime,
          "payType": that.data.payType,
          "orderNo": that.data.renewOrderNo
        },
          app.globalData.userDatatoken.accessToken,
          "",
          function success(info) {
            console.info('续费返回111===');
            console.info(info);
            if (info.code == 0) {
              wx.showToast({
                title: '续时成功',
              })
              that.getOrderInfo()
              that.renewCancel()
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
  },
})