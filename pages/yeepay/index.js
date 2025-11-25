var http = require('../../utils/http');
const app = getApp();

Page({
  data: {
    isLogin: app.globalData.isLogin,
    phone: '',
    queryCode: '',
    showInfo: false,
    applyUrl: '',
    merchantNo: '',
    remark: '',
    shimingCode: '',
    statusType: 'default'
  },

  onLoad(optios){
    if(!app.globalData.isLogin){
      wx.navigateTo({
        url: '../login/login',
      })
    }
  },

  // 手机号输入
  onPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 查询密码输入
  onCodeInput: function(e) {
    this.setData({
      queryCode: e.detail.value
    });
  },

  // 验证输入
  validateInput: function() {
    const { phone, queryCode } = this.data;
    
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return false;
    }
    
    if (!queryCode || queryCode.length !== 4) {
      wx.showToast({
        title: '请输入4位查询密码',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  // 新增申请
  onAddApply: function() {
    if (!this.validateInput()) return;
    
    this.callApi('add');
  },

  // 查询申请单
  onQueryApply: function() {
    if (!this.validateInput()) return;
    
    this.callApi('query');
  },

  // 调用接口
  callApi: function(type) {
    var that = this;
    const { phone, queryCode } = that.data;
    let add = type === 'add';
    http.request(
      "/member/merchant-account/getApplyUrl",
      "1",
      "post", {
        "mobile": phone,
        "code": queryCode,
        "add": add,
      },
      app.globalData.userDatatoken.accessToken,
      '查询中...',
      function success(info) {
        if (info.code == 0) {
         that.setData({
          applyUrl: info.data.applyUrl,
          merchantNo: info.data.merchantNo,
          remark: info.data.remark,
          showInfo: true,
          shimingCode: 'data:image/png;base64,' +info.data.shimingCode,
         })
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
  },

  // 复制文本
  copyText: function(e) {
    const text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  }
});