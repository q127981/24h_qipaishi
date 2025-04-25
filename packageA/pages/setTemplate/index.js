// packageA/pages/setTemplate/index.js
var http = require('../../../utils/http');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: '',
    simpleModel: '',
    templateKey: '',
    theTemplate: '',
    templateList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options) {
      this.setData({
        storeId: options.storeId,
        simpleModel: options.simpleModel,
        templateKey: options.templateKey,
      })
      console.log(this.data)
    }
    this.getTemplateList();
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
  getTemplateList: function () {
    wx.showLoading({
      title: '加载中...',
    })    
    let that = this
    if (app.globalData.isLogin) {
      http.request(
        "/member/store/getTemplateList",
        "1",
        "post", {
      },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info(info);
          if (info.code == 0) {
            that.setData({
              templateList: info.data
            })
            wx.hideLoading();
          } else {
            wx.hideLoading();
            wx.showModal({
              content: info.msg,
              showCancel: false,
            })
          }
        },
        function fail(info) {
          wx.hideLoading();
        }
      )
    }
  },
  setTemplate(e) {
    var that = this;
    let templateKey = e.currentTarget.dataset.key;
    if (templateKey) {
      //不为空
      if (templateKey == 'custom') {
        wx.showModal({
          title: '温馨提示',
          content: '您确定将当前门店的首页切换为自定义图片模板吗? 切换后需要在【门店管理】->【修改信息】，往下拉上传自定义的图片',
          complete: (res) => {
            if (res.cancel) {
            }
            if (res.confirm) {
              that.setData({
                templateKey: templateKey
              })
              that.confirmSet(templateKey);
            }
          }
        })
      } else {
        that.setData({
          templateKey: templateKey
        })
        that.confirmSet(templateKey);
      }
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '您确定将当前门店的首页切换为简洁模板吗?',
        complete: (res) => {
          if (res.cancel) {
          }
          if (res.confirm) {
            that.setData({
              templateKey: templateKey
            })
            that.confirmSet();
          }
        }
      })
    }
  },
  confirmSet() {
    var that = this;
    http.request(
      "/member/store/setTemplate",
      "1",
      "post", {
      "storeId": that.data.storeId,
      "templateKey": that.data.templateKey,
     },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          wx.showToast({
            title: '操作成功',
          })
          setTimeout(() => {
            wx.navigateBack();
          }, 300);
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
  },

})