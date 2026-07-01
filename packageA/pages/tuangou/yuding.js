// packageA/pages/tuangou/yuding.js
const app = getApp()
var http = require('../../../utils/http')

Page({

  data: {
    // 状态 Tab 选项
    statusOptions: [
      { text: '全部', value: '' },
      { text: '待审核', value: 1 },
      { text: '下单', value: 0 },
      { text: '已退款', value: 2 },
      { text: '已拒绝', value: 3 },
    ],
    // 当前筛选
    status: '',
    // 门店ID（固定取页面传入）
    storeId: '',
    // 分页
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,
    // 列表数据
    list: [],
    mainColor: app.globalData.mainColor
  },

  onLoad(options) {
    if (options.storeId) {
      this.setData({ storeId: options.storeId })
    }
    this.refreshList()
  },

  onPullDownRefresh() {
    this.refreshList()
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    if (this.data.canLoadMore) {
      this.loadMore()
    }
  },

  // 刷新列表
  refreshList() {
    this.setData({ pageNo: 1, canLoadMore: true, list: [] })
    this.getListData('refresh')
  },

  // 加载更多
  loadMore() {
    this.getListData('loadmore')
  },

  // 获取列表数据
  getListData(type) {
    var that = this
    var message = type == 'refresh' ? '正在加载' : ''

    http.request(
      '/member/manager/getYudingOrderPage',
      '1',
      'post',
      {
        pageNo: that.data.pageNo,
        pageSize: that.data.pageSize,
        storeId: that.data.storeId,
        status: that.data.status,
      },
      app.globalData.userDatatoken.accessToken,
      message,
      function success(info) {
        if (info.code == 0) {
          var newItems = info.data.list || []
          if (newItems.length === 0) {
            that.setData({ canLoadMore: false })
          } else {
            var processedItems = newItems.map(function(item) {
              item.statusText = that.getStatusText(item.status)
              return item
            })
            var newList = type == 'refresh' ? processedItems : that.data.list.concat(processedItems)
            that.setData({
              list: newList,
              pageNo: that.data.pageNo + 1,
              canLoadMore: newList.length < info.data.total
            })
          }
        }
      }
    )
  },

  // 状态值转文字
  getStatusText(status) {
    var map = {
      0: '已下单',
      1: '待审核退款',
      2: '已退款',
      3: '已拒绝',
      4: '已取消',
    }
    return map[status] || '未知'
  },

  // Tab 切换
  onStatusChange(e) {
    var value = e.currentTarget.dataset.value
    this.setData({ status: value })
    this.refreshList()
  },

  // 拨打电话
  onCallPhone(e) {
    var mobile = e.currentTarget.dataset.mobile
    wx.makePhoneCall({
      phoneNumber: mobile
    })
  },

  // 审核操作
  onAudit(e) {
    var that = this
    var orderId = e.currentTarget.dataset.orderid
    var auditResult = e.currentTarget.dataset.result
    var confirmText = auditResult == 2 ? '确认通过该退款申请？' : '确认拒绝该退款申请？'
    var successText = auditResult == 2 ? '已通过退款' : '已拒绝退款'

    wx.showModal({
      title: '审核确认',
      content: confirmText,
      confirmText: '确认',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          http.request(
            '/member/manager/refundauditresult',
            '1',
            'post',
            {
              storeId: that.data.storeId,
              orderId: orderId,
              auditResult: auditResult
            },
            app.globalData.userDatatoken.accessToken,
            '正在处理',
            function success(info) {
              if (info.code == 0) {
                wx.showToast({ title: successText, icon: 'success' })
                setTimeout(function() {
                  that.refreshList()
                }, 1500)
              } else {
                wx.showModal({
                  content: info.msg || '操作失败',
                  showCancel: false
                })
              }
            }
          )
        }
      }
    })
  },

  // 主动退款订单
  onRefundYuding(e) {
    var that = this
    var orderId = e.currentTarget.dataset.orderid

    wx.showModal({
      title: '退款确认',
      content: '确认主动退款该订单？',
      confirmText: '确认',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          http.request(
            '/member/manager/refundYuding',
            '1',
            'post',
            {
              storeId: that.data.storeId,
              orderId: orderId,
            },
            app.globalData.userDatatoken.accessToken,
            '正在处理',
            function success(info) {
              if (info.code == 0) {
                wx.showToast({ title: '退款成功', icon: 'success' })
                setTimeout(function() {
                  that.refreshList()
                }, 1500)
              } else {
                wx.showModal({
                  content: info.msg || '退款失败',
                  showCancel: false
                })
              }
            }
          )
        }
      }
    })
  },

})
