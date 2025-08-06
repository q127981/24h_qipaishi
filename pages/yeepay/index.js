// pages/merchant/index.js
const app = getApp();
const http = require('../../utils/http');

Page({
  data: {
    isLogin: app.globalData.isLogin,
    statusText: ['未开通', '审核中', '审核不通过', '待实名', '已开通'],
    status: '',
    showUserConsent: false,
    regionTree: [],         // 省市区树
    regionCode: [],         // picker value（省市区 code）
    regionText: '',         // 展示文字
    bankList: [],           // 银行列表
    bankListTemp: [],           // 银行列表
    bankName: '',           // 银行名称
    bankCode: '',           // 银行 code
    fullAddress: '',
    showBank: false,
    idCardErr: '',
    id: '',
    mchId: '',
    requestNo: '',
    legalName: '',
    phone: '',
    idCard: '',
    shopName: '',
    address: '',
    bankCard: '',
    idCardFront: '',
    idCardBack: '',
    storeFront: '',
    scene: '',
    remark: '',
    shimingCode: '',
    statusClass: ''
  },

  onLoad() {
    this.setData({ isLogin: app.globalData.isLogin });
    this.loadRegion();
    this.loadBankList();
    if(!this.data.status){
      this.setData({
        showUserConsent: true
      })
    }else{
      this.loadAccount();
    }
  },

  /* ===== 省市区 ===== */
  loadRegion() {
    http.request("/member/index/getRegCode", "1", "get", {}, app.globalData.userDatatoken.accessToken, "", res => {
      if (res.code === 0) this.setData({ regionTree: res.data });
    });
  },
  regionChange(e) {
    const { value, code } = e.detail;
    this.setData({
      regionCode: code,   // 数组
      regionValue: code,  // picker value
      regionText: value.join(' ')
    });
  },

  /* ===== 银行 ===== */
  loadBankList() {
    http.request("/member/index/getBankCode", "1", "get", {}, app.globalData.userDatatoken.accessToken, "", res => {
      if (res.code === 0) this.setData({ bankList: res.data ,bankListTemp: res.data });
    });
  },
  toggleBankPicker() { this.setData({ showBank: !this.data.showBank }); },
  onBankSearch(e) {
    const key = e.detail.value.toLowerCase();
    const filtered = this.data.bankListTemp.filter(b => b.name.toLowerCase().includes(key));
    this.setData({ bankList: filtered });
  },
  selectBank(e) {
    const { item } = e.currentTarget.dataset;
    this.setData({ bankName: item.name, bankCode: item.code, showBank: false });
  },

  /* ===== 身份证 ===== */
  onIdCardInput(e) {
    const val = e.detail.value;
    const reg = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    this.setData({ idCard: val, idCardErr: reg.test(val) ? '' : '身份证格式错误' });
  },

  /* ===== 图片 base64 ===== */
  choose(e) {
    const key = e.currentTarget.dataset.key;
    wx.chooseMedia({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        wx.getFileSystemManager().readFile({
          filePath: res.tempFiles[0].tempFilePath,
          encoding: 'base64',
          success: r => this.setData({ [key]: 'data:image/png;base64,' + r.data })
        });
      }
    });
  },

  /* ===== 提交 ===== */
  submit(e) {
    if (this.data.idCardErr) return wx.showToast({ title: '身份证格式错误', icon: 'none' });

    // 获取表单数据
    const formData = e.detail.value;

    // 构建提交数据
    const data = {
      id: this.data.id,
      requestNo: this.data.requestNo,
      legalName: formData.legalName || this.data.legalName,
      phone: formData.phone || this.data.phone,
      idCard: formData.idCard || this.data.idCard,
      shopName: formData.shopName || this.data.shopName,
      address: formData.address || this.data.address,
      bankCard: formData.bankCard || this.data.bankCard,
      idCardFront: this.data.idCardFront,
      idCardBack: this.data.idCardBack,
      storeFront: this.data.storeFront,
      scene: this.data.scene,
      fullAddress: this.data.regionCode.join('-') || this.data.fullAddress,
      bankCode: this.data.bankCode,
    };

    http.request("/member/merchant-account/apply", "1", "post", data,
      app.globalData.userDatatoken.accessToken, "提交中...", res => {
        if (res.code === 0) {
          setTimeout(() => {
            wx.showToast({ title: '提交成功', icon: 'success' });
          }, 500);
          this.loadAccount();
        } else {
          wx.showToast({ title: res.msg, icon: 'none' });
        }
      });
  },

  /* ===== 账户回显 ===== */
  loadAccount() {
    wx.showLoading({ title: '加载中...' });
    http.request("/member/merchant-account/get", "1", "get", {}, app.globalData.userDatatoken.accessToken, "", res => {
      wx.hideLoading();
      if (res.code === 0) {
        const acc = res.data || {};
        const codeArr = acc.regionCode ? acc.regionCode.split('-') : [];
        this.setData({
          id: acc.id || '',
          requestNo: acc.requestNo || '',
          legalName: acc.legalName || '',
          phone: acc.phone || '',
          idCard: acc.idCard || '',
          shopName: acc.shopName || '',
          address: acc.address || '',
          bankCard: acc.bankCard || '',
          idCardFront: acc.idCardFront || '',
          idCardBack: acc.idCardBack || '',
          storeFront: acc.storeFront || '',
          scene: acc.scene || '',
          status: acc.status || 0,
          regionCode: codeArr,
          regionValue: codeArr,
          regionText: acc.fullAddress || '',
          fullAddress: acc.fullAddress || '',
          bankName: this.data.bankList.find(b => b.code === acc.bankCode)?.name || acc.bankName || '',
          bankCode: acc.bankCode || '',
          remark: acc.remark || '',
          mchId: acc.mchId || '',
          shimingCode: 'data:image/png;base64,'+acc.shimingCode || '',
          statusClass: acc.status === 4 ? 'success' : acc.status === 2 ? 'error' : ''
        });
      }
    });
  },

  /* ===== 其他方法 ===== */
  refresh() { this.loadAccount(); },
  copyMchId() { wx.setClipboardData({ data: this.data.mchId }); },
  /* 点击协议文字跳转 */
  openAgreement(e) {
    const type = e.currentTarget.dataset.type; // 'service' 或 'privacy'
    wx.navigateTo({
      url: `/pages/yeepay/agreement?type=${type}`
    });
  },

  /* 暂不使用 */
  onCancelConsent() {
    wx.navigateBack(); // 返回上一页
  },

  /* 同意 */
  onAgreeConsent() {
    this.setData({ showUserConsent: false });
  },
});