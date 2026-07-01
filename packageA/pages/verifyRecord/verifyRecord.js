// packageA/pages/verifyRecord/verifyRecord.js
const app = getApp()
var http = require('../../../utils/http.js');

Page({

  data: {
    storeId: '',
    pageNo: 1,
    pageSize: 20,
    canLoadMore: true,
    list: [],

    // 平台筛选
    filterGroupPayType: null,
    platformOptions: [
      { text: '全部平台', value: null },
      { text: '美团', value: 1 },
      { text: '抖音', value: 2 },
      { text: '快手', value: 3 },
    ],

    // 日期筛选
    dateShow: false,
    minDate: new Date(2023, 0, 1).getTime(),
    currentRange: 'today',
    startDate: '',
    endDate: '',

    mainColor: app.globalData.mainColor,
  },

  onLoad(options) {
    this.setData({ storeId: options.storeId })
    this._initDates();
    this.getList('refresh');
  },

  onPullDownRefresh() {
    this.setData({ list: [], pageNo: 1, canLoadMore: true })
    this.getList('refresh');
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.canLoadMore) this.getList();
  },

  _initDates() {
    const today = this._formatDate(new Date());
    const yesterday = this._formatDate(new Date(Date.now() - 86400000));
    this.setData({
      startDate: today,
      endDate: today,
      today,
      yesterday,
    })
  },

  _formatDate(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  getList(action) {
    let that = this
    if (!app.globalData.isLogin) return;
    if (action === 'refresh') {
      that.setData({ list: [], pageNo: 1, canLoadMore: true })
    }
    http.request(
      '/member/store/getVerifyRecordPage',
      '1',
      'post',
      {
        storeId: that.data.storeId,
        startDate: that.data.startDate,
        endDate: that.data.endDate,
        groupPayType: that.data.filterGroupPayType,
        pageNo: that.data.pageNo,
        pageSize: that.data.pageSize,
      },
      app.globalData.userDatatoken.accessToken,
      '',
      function success(info) {
        if (info.code == 0) {
          if (info.data.list.length === 0) {
            that.setData({ canLoadMore: false })
          } else {
            const newList = that.data.list.concat(info.data.list);
            newList.forEach(item => {
              if (item.createTime) {
                const d = new Date(item.createTime);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const h = String(d.getHours()).padStart(2, '0');
                const mi = String(d.getMinutes()).padStart(2, '0');
                item.createTime = `${y}-${m}-${day} ${h}:${mi}`;
              }
            });
            that.setData({
              list: newList,
              pageNo: that.data.pageNo + 1,
              canLoadMore: newList.length < info.data.total,
            })
          }
        } else {
          wx.showModal({ content: info.msg, showCancel: false })
        }
      }
    )
  },

  // 平台下拉切换
  onPlatformChange(e) {
    this.setData({ filterGroupPayType: e.detail })
    this._clearDateRange();
    this.getList('refresh');
  },

  // 快捷日期筛选
  selectDateRange(e) {
    const range = e.currentTarget.dataset.range;
    const { today, yesterday } = this.data;
    if (range === 'today') {
      this.setData({ currentRange: 'today', startDate: today, endDate: today })
    } else if (range === 'yesterday') {
      this.setData({ currentRange: 'yesterday', startDate: yesterday, endDate: yesterday })
    } else if (range === '7days') {
      const start = this._formatDate(new Date(Date.now() - 6 * 86400000));
      this.setData({ currentRange: '7days', startDate: start, endDate: today })
    }
    this.getList('refresh');
  },

  openDatePicker() {
    this.setData({ dateShow: true, currentRange: 'custom' })
  },

  onDateClose() {
    this.setData({ dateShow: false })
  },

  onDateConfirm(e) {
    const [start, end] = e.detail;
    this.setData({
      dateShow: false,
      startDate: this._formatDate(start),
      endDate: this._formatDate(end),
    })
    this.getList('refresh');
  },

  _clearDateRange() {
    this.setData({ currentRange: 'today' })
  },

  // ---------- 辅助方法 ----------
  getPlatformName(type) {
    const map = { 1: '美团', 2: '抖音', 3: '快手' };
    return map[type] || '';
  },

  getPlatformClass(type) {
    const map = { 1: 'meituan', 2: 'douyin', 3: 'kuaishou' };
    return map[type] || '';
  },

  getStatusName(status) {
    const map = { 0: '待使用', 1: '已使用', 2: '已撤销', 3: '已退款' };
    return map[status] || '未知';
  },

  getStatusClass(status) {
    const map = { 0: 'pending', 1: 'used', 2: 'cancelled', 3: 'refunded' };
    return map[status] || '';
  },

  formatTime(timeStr) {
    if (!timeStr) return '';
    let t = timeStr.replace('T', ' ').replace(/\.\d+/, '');
    return t.substring(0, 16);
  },
})
