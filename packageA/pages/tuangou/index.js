// packageA/pages/tuangou/index.js
const app = getApp();
var http = require('../../../utils/http');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: '',
    storeName: '',
    shopruleDialogVisible: false,
    advanceBookMinutes: '',
    advanceCancelMinutes: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      storeId: options.storeId || '',
      storeName: decodeURIComponent(options.storeName || '')
    })
  },

  /* ================================================
     设置预订规则弹窗
     ================================================ */
  openShopruleDialog() {
    this.setData({ shopruleDialogVisible: true });
  },

  closeShopruleDialog() {
    this.setData({ shopruleDialogVisible: false });
  },

  onAdvanceBookChange(e) {
    this.setData({ advanceBookMinutes: parseInt(e.currentTarget.dataset.value) });
  },

  onAdvanceCancelChange(e) {
    this.setData({ advanceCancelMinutes: parseInt(e.currentTarget.dataset.value) });
  },

  saveShoprule() {
    var that = this;
    var { storeId, advanceBookMinutes, advanceCancelMinutes } = this.data;
    if (!storeId) {
      wx.showToast({ title: '门店ID不存在', icon: 'none' });
      return;
    }
    http.request(
      '/member/tuangou/putShoprule',
      '1',
      'post',
      {
        storeId,
        addOrderBefore: advanceBookMinutes || 0,
        refundBefore: advanceCancelMinutes || 0
      },
      app.globalData.userDatatoken.accessToken,
      '保存中...',
      function success(res) {
        if (res.code == 0) {
          wx.showToast({ title: '保存成功', icon: 'success' });
          that.closeShopruleDialog();
        } else {
          wx.showToast({ title: res.msg || '保存失败', icon: 'none' });
        }
      },
      function fail(err) {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    );
  },

  goMtRoomType() {
    wx.navigateTo({
      url: '/packageA/pages/tuangou/mtRoomType?storeId=' + this.data.storeId,
    });
  },

})
