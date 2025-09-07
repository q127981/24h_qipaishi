const datepicker = require("../../../utils/datepicker");
const app = getApp();
var http = require("../../../utils/http");
var util1 = require("../../../utils/util.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    storeId: "",
    storeName: "",
    stores: [],
    types: [
      { text: "全部类型", value: "" },
      { text: "抵扣券", value: 1 },
      { text: "满减券", value: 2 },
      { text: "加时券", value: 3 },
    ],
    type: "",
    isSelect: 0,
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true, //是否还能加载更多
    list: [],
    userId: "", //给用户id赠送优惠券
    isIpx: app.globalData.isIpx ? true : false,
    mainColor: app.globalData.mainColor,
    beforeCloseFunction: null,
    activeShow: false,
    couponInfo: {},
    activeName: '',
    num: 0,
    balanceNum: '',
    couponName: '',
    couponId: '',
    endTime: "请选择时间",
    multiArray: [],
    multiIndex: [],
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let isSelect = options.isSelect ? parseInt(options.isSelect) : "";
    let userId = options.userId ? parseInt(options.userId) : "";
    this.setData({
      isSelect: isSelect,
      userId: userId,
      storeId: options.storeId,
      storeName: options.storeName,
    });
    if (isSelect === 1) {
      wx.setNavigationBarTitle({
        title: "赠送优惠券",
      });
    }
    this.setData({ beforeCloseFunction: this.beforeClose() });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getMainListdata("refresh");
    var loadPickerData = datepicker.loadPickerData();
    var getCurrentDate = datepicker.getCurrentDate();
    var GetMultiIndex = datepicker.GetMultiIndex();

    let year = parseInt(getCurrentDate.substring(0, 4));
    let month = parseInt(getCurrentDate.substring(5, 7));
    let day = parseInt(getCurrentDate.substring(8, 10));
    let hour = parseInt(getCurrentDate.substring(11, 13));
    let minute = parseInt(getCurrentDate.substring(14, 16));

    this.setData({
      multiArray: loadPickerData,
      multiIndex: GetMultiIndex,
      multiEndIndex: GetMultiIndex,
      startTime: getCurrentDate,
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute
    });
  },

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
  onPullDownRefresh() {
    let that = this;
    that.setData({
      pageNo: 1,
      canLoadMore: true,
      list: [],
    });
    that.getMainListdata("refresh");
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.getMainListdata("");
    } else {
      wx.showToast({
        title: "我是有底线的...",
      });
    }
  },
  beforeClose() {
    // 这里一定要用箭头函数，否则访问不到this
    return (type) => {
      //console.log(type)
      if (type === "cancel") {
        // 点击取消
        return true;
      } else {
        // 点击确定
      }
    };
  },
  /**
   * 用户点击分享
   */
  onShareAppMessage(res) {
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

  //类型下拉菜单发生变化
  typeDropdown(event) {
    this.setData({
      type: event.detail,
    });
    this.getMainListdata("refresh");
  },
  //获取列表数据
  getMainListdata: function (e) {
    var that = this;
    let message = "";
    if (app.globalData.isLogin) {
      if (e == "refresh") {
        //刷新，page变为1
        message = "正在加载";
        that.setData({
          pageNo: 1,
          list: [],
        });
      }
      http.request(
        "/member/manager/getCouponPage",
        "1",
        "post",
        {
          pageNo: that.data.pageNo,
          pageSize: that.data.pageSize,
          storeId: that.data.storeId,
          type: that.data.type,
          roomId: "",
          orderHour: "",
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info("返回111===");
          console.info(info);
          if (info.code == 0) {
            if (info.data.list.length === 0) {
              that.setData({
                canLoadMore: false,
              });
            } else {
              //有数据
              if (that.data.list) {
                //列表已有数据  那么就追加
                let arr = that.data.list;
                let arrs = arr.concat(info.data.list);
                that.setData({
                  list: arrs,
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total,
                });
              } else {
                that.setData({
                  list: info.data.list,
                  pageNo: that.data.pageNo + 1,
                });
              }
            }
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {}
      );
    }
  },
  // 选择优惠券
  select: function (e) {
    var that = this;
    let couponId = e.currentTarget.dataset.info;
    console.log("userId" + that.data.userId);
    wx.showModal({
      title: "提示",
      content: "是否确定赠送该优惠券",
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
                couponId: couponId,
                userId: that.data.userId,
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
                  }, 200);
                } else {
                  wx.showModal({
                    content: info.msg,
                    showCancel: false,
                  });
                }
              },
              function fail(info) {}
            );
          }
        }
      },
    });
  },
  // 保存活动
  saveActive: function () {
    var that = this;
    if (that.data.activeName && that.data.num && that.data.endTime && that.data.endTime!='请选择时间') {
      http.request(
        "/member/couponActive/saveAdminByCouponId",
        "1",
        "post",
        {
          couponId: that.data.couponId,
          activeName: that.data.activeName,
          num: that.data.num,
          endTime: that.data.endTime,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info("返回111===");
          if (info.code == 0) {
            wx.showToast({
              title: "操作成功",
            });
            that.setData({
              activeShow: false
            })
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {}
      );
    } else {
      wx.showToast({
        title: "请输入完整",
        icon: "none",
      });
    }
  },
  // 取消保存活动
  cancelActice: function () {
    this.setData({
      activeName: '',
      num: 0,
      banlanceNum: 0,
      endTime:' 请选择时间'
    });
  },
  bindMultiPickerChange: function (e) {
    this.setData({
      multiEndIndex: e.detail.value,
    });

    const index = this.data.multiIndex;
    const year = this.data.multiArray[0][index[0]];
    const month = this.data.multiArray[1][index[1]];
    const day = this.data.multiArray[2][index[2]];
    const hour = this.data.multiArray[3][index[3]];
    const minute = this.data.multiArray[4][index[4]];

    this.setData({
      endTime: `${year.replace("年", "/")}${month.replace(
        "月",
        "/"
      )}${day.replace("日", "")} ${hour.replace("时", "")}:${minute.replace(
        "分",
        ""
      )}`,
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
    });
  },
  bindMultiPickerColumnChange: function (e) {
    let getCurrentDate = datepicker.getCurrentDate();
    let currentYear = parseInt(getCurrentDate.substring(0, 4));
    let currentMonth = parseInt(getCurrentDate.substring(5, 7));
    let currentDay = parseInt(getCurrentDate.substring(8, 10));
    let currentHour = parseInt(getCurrentDate.substring(11, 13));
    let currentMinute = parseInt(getCurrentDate.substring(14, 16));

    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex,
    };
    data.multiIndex[e.detail.column] = e.detail.value;

    let monthArr, dayArr, hourArr, minuteArr;

    switch (e.detail.column) {
      case 0: // 修改年份列
        let yearSelected = parseInt(
          this.data.multiArray[e.detail.column][e.detail.value]
        );
        this.setData({
          year: yearSelected,
        });
        if (yearSelected == currentYear) {
          var loadPickerData = datepicker.loadPickerData();
          this.setData({
            multiArray: loadPickerData,
            multiIndex: [0, 0, 0, 0, 0],
          });
        } else {
          monthArr = datepicker.loadMonths(1, 12);
          dayArr = datepicker.loadDays(yearSelected, 1, 1);
          hourArr = datepicker.loadHours(0, 23);
          minuteArr = datepicker.loadMinutes(0, 59);
          this.setData({
            ["multiArray[1]"]: monthArr,
            ["multiArray[2]"]: dayArr,
            ["multiArray[3]"]: hourArr,
            ["multiArray[4]"]: minuteArr,
            multiIndex: [e.detail.value, 0, 0, 0, 0],
          });
        }
        break;
      case 1: // 修改月份列
        let mon = parseInt(
          this.data.multiArray[e.detail.column][e.detail.value]
        );
        this.setData({
          month: mon,
        });
        if (this.data.year == currentYear && mon == currentMonth) {
          dayArr = datepicker.loadDays(currentYear, mon, currentDay);
        } else {
          dayArr = datepicker.loadDays(this.data.year, mon, 1);
        }
        hourArr = datepicker.loadHours(0, 23);
        minuteArr = datepicker.loadMinutes(0, 59);
        this.setData({
          ["multiArray[2]"]: dayArr,
          ["multiArray[3]"]: hourArr,
          ["multiArray[4]"]: minuteArr,
          multiIndex: [this.data.multiIndex[0], e.detail.value, 0, 0, 0],
        });
        break;
      case 2: // 修改日
        let dd = parseInt(
          this.data.multiArray[e.detail.column][e.detail.value]
        );
        this.setData({
          day: dd,
        });
        if (
          dd == currentDay &&
          this.data.year == currentYear &&
          this.data.month == currentMonth
        ) {
          hourArr = datepicker.loadHours(currentHour, 24);
          minuteArr = datepicker.loadMinutes(currentMinute, 59);
        } else {
          hourArr = datepicker.loadHours(0, 24);
          minuteArr = datepicker.loadMinutes(0, 59);
        }
        this.setData({
          ["multiArray[3]"]: hourArr,
          ["multiArray[4]"]: minuteArr,
          multiIndex: [
            this.data.multiIndex[0],
            this.data.multiIndex[1],
            e.detail.value,
            0,
            this.data.multiIndex[4],
          ],
        });
        break;
      case 3: // 修改时
        let hh = parseInt(
          this.data.multiArray[e.detail.column][e.detail.value]
        );
        let currentMinuteIndex = this.data.multiIndex[4];
        this.setData({
          hour: hh,
        });
        if (
          hh == currentHour &&
          this.data.year == currentYear &&
          this.data.month == currentMonth &&
          this.data.day == currentDay
        ) {
          minuteArr = datepicker.loadMinutes(currentMinute, 59);
        } else {
          minuteArr = datepicker.loadMinutes(0, 59);
        }
        this.setData({
          ["multiArray[4]"]: minuteArr,
          multiIndex: [
            this.data.multiIndex[0],
            this.data.multiIndex[1],
            this.data.multiIndex[2],
            e.detail.value,
            currentMinuteIndex,
          ],
        });
        break;
      case 4: // 修改分
        let mi = parseInt(
          this.data.multiArray[e.detail.column][e.detail.value]
        );
        this.setData({
          minute: mi,
          multiIndex: [
            this.data.multiIndex[0],
            this.data.multiIndex[1],
            this.data.multiIndex[2],
            this.data.multiIndex[3],
            e.detail.value,
          ],
        });
        break;
    }
    // console.log(this.data.multiArray);
  },
  openActive(e){
    var that = this;
    let couponId= e.currentTarget.dataset.id;
    let couponName= e.currentTarget.dataset.name;
    that.setData({
      couponName: couponName,
      couponId: couponId,
    })
    http.request(
      "/member/couponActive/getAdminByCouponId?couponId="+couponId,
      "1",
      "post",
      {
      },
      app.globalData.userDatatoken.accessToken,
      "加载中...",
      function success(info) {
        if (info.code == 0 && info.data) {
          that.setData({
            activeName: info.data.activeName,
            num: info.data.num,
            balanceNum: info.data.balanceNum,
            endTime: info.data.endTime,
          })
        }
        that.setData({
          activeShow: true
        })
      },
      function fail(info) {}
    );
  },
  stopActice(e){
    var that = this;
    let couponId= e.currentTarget.dataset.id;
    wx.showModal({
      title: '温馨提示',
      content: '结束后优惠券将无法被领取，已领取的仍然有效！ 您可以通过发起活动重新发起！是否确定结束？',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          http.request(
            "/member/couponActive/stopActive?couponId="+couponId,
            "1",
            "post",
            {
            },
            app.globalData.userDatatoken.accessToken,
            "加载中...",
            function success(info) {
              if (info.code == 0 ) {
                wx.showToast({
                  title: '操作成功',
                  icon: 'success'
                })
              }
            },
            function fail(info) {}
          );
        }
      }
    })
  },
  shareActice(e){
    var that = this;
    let couponId= e.currentTarget.dataset.id;
    

  },
  deleteCoupon(e){
    var that = this;
    let couponId= e.currentTarget.dataset.id;
    wx.showModal({
      title: '温馨提示',
      content: '您是否确认删除此优惠券？',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          http.request(
            "/member/manager/deleteCoupon?couponId="+couponId,
            "1",
            "post",
            {
            },
            app.globalData.userDatatoken.accessToken,
            "加载中...",
            function success(info) {
              if (info.code == 0 ) {
                wx.showToast({
                  title: '操作成功',
                  icon: 'success'
                })
                that.getMainListdata("refresh");
              }
            },
            function fail(info) {}
          );
        }
      }
    })

  }
});
