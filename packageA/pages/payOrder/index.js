var http = require('../../../utils/http');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: '',
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,//是否还能加载更多
    list: [],
    orderNo: '',
    showRefundModal: false, //退款弹窗
    maxRefundAmount: 0,
    refundAmount: '',
    selectedOption: 'full',
    currentOrder: null
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    that.setData({
      storeId: options.storeId,
    })
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
    this.getList('refresh');
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
  getList(e){
    var that = this;
    let message = "";
    if (app.globalData.isLogin) 
    {
      if (e == "refresh") { //刷新，page变为1
        message = "正在加载"
        that.setData({
          list:[],
          canLoadMore: true,//是否还能加载更多
          pageNo:1
        })
      }
      http.request(
        "/member/manager/getPayOrderPage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
          "storeId": that.data.storeId,
          "orderNo": that.data.orderNo
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info('返回111===');
          if (info.code == 0) {
            if(info.data.list.length === 0){
              that.setData({
                canLoadMore: false
              })
            }else{
               //有数据
              if(that.data.list){
                //列表已有数据  那么就追加
                let arr = that.data.list;
                let arrs = arr.concat(info.data.list);
                that.setData({
                  list: arrs,
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total
                })
              }else{
                that.setData({
                  list: info.data.list,
                  pageNo: that.data.pageNo + 1,
                });
              }
            }
          }else{
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
  },
  refund(e){
    const item = e.currentTarget.dataset.item;
    const maxRefund = (item.price - item.refundPrice) / 100.0;
    
    this.setData({
      showRefundModal: true,
      maxRefundAmount: maxRefund.toFixed(2),
      refundAmount: maxRefund.toFixed(2),
      selectedOption: 'full',
      currentOrder: item
    });
  },
  onSearchInput(e) {
    this.setData({
      orderNo: e.detail.value
    });
  },
  onSearch(){
      this.getList('refresh');
  },
  // 隐藏退款弹框
  hideRefundModal: function() {
    this.setData({
      showRefundModal: false,
      currentOrder: null
    });
  },
  // 金额输入
  onAmountInput: function(e) {
    const value = e.detail.value;
    const maxAmount = parseFloat(this.data.maxRefundAmount);
    let inputAmount = parseFloat(value) || 0;
    
    // 限制输入金额不超过最大可退款金额
    if (inputAmount > maxAmount) {
      inputAmount = maxAmount;
    }
    
    this.setData({
      refundAmount: inputAmount === 0 ? '' : inputAmount.toString(),
      selectedOption: '' // 手动输入时清除选项
    });
  },

  // 选择快速选项
  selectOption: function(e) {
    const option = e.currentTarget.dataset.option;
    const maxAmount = parseFloat(this.data.maxRefundAmount);
    let amount = 0;
    
    switch(option) {
      case 'full':
        amount = maxAmount;
        break;
      case 'half':
        amount = maxAmount * 0.5;
        break;
      case 'quarter':
        amount = maxAmount * 0.25;
        break;
    }
    
    this.setData({
      selectedOption: option,
      refundAmount: amount.toFixed(2)
    });
  },
  // 确认退款
  confirmRefund: function() {
    var that = this;
    const { refundAmount, currentOrder, maxRefundAmount } = this.data;
    const amount = parseFloat(refundAmount);
    const maxAmount = parseFloat(maxRefundAmount);
    
    if (!amount || amount <= 0) {
      wx.showToast({
        title: '请输入有效退款金额',
        icon: 'none'
      });
      return;
    }
    
    if (amount > maxAmount) {
      wx.showToast({
        title: '退款金额不能超过最大可退款金额',
        icon: 'none'
      });
      return;
    }
    // 调用退款接口
    http.request(
      "/member/manager/refundPayOrder",
      "1",
      "post", {
        "id": currentOrder.id,
        "price": amount * 100 // 转为分
      },
      app.globalData.userDatatoken.accessToken,
      '...',
      function success(info) {
        if (info.code == 0) {
          wx.showToast({
            title: '操作成功',
            icon: 'success'
          });
          that.setData({
            showRefundModal: false
          });
          that.getList('refresh');
        }else{
          wx.showModal({
            title: '温馨提示',
            content: info.msg,
            showCancel: false,
            complete: (res) => {
              if (res.cancel) {
              }
              if (res.confirm) {
              }
            }
          })
        }
      })
  },
})