// pages/merchant/index.js
const app = getApp();
const http = require('../../utils/http');

Page({
  data: {
    isLogin: app.globalData.isLogin,
    statusText: ['未开通', '审核中', '审核不通过', '待实名', '已开通'],
    status: '',
    showUserConsent: false,

    /* ===== 省市区（下拉搜索） ===== */
    regionTree: [],
    regionMap: {},
    regionCode: [],         // [p,c,a]
    regionText: '',         // 省-市-区
    regionList: [],         // 扁平后的“省-市-区”列表（弹窗用）
    regionFilter: [],       // 搜索后的列表
    regionKey: '',          // 搜索关键词
    showRegion: false,      // 弹窗开关

    /* ===== 银行 ===== */
    bankList: [],
    bankListTemp: [],
    bankName: '',
    bankCode: '',
    showBank: false,

    /* ===== 表单字段 ===== */
    fullAddress: '',
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
    this.loadAccount();
  },

  /* ====================== 省市区 ====================== */
  loadRegion() {
    http.request('/member/index/getRegCode', '1', 'get', {},
      app.globalData.userDatatoken.accessToken, '', res => {
        if (res.code === 0) {
          const tree = res.data || [];
          const map = this._buildRegionMap(tree);
          const list = this._flatRegion(tree);   // 拼成“省-市-区”数组
          this.setData({ regionTree: tree, regionMap: map, regionList: list, regionFilter: list });
        }
      });
  },
  /* code→name 字典 */
  _buildRegionMap(tree) {
    const map = {};
    tree.forEach(p => {
      map[p.code] = p.name;
      p.children.forEach(c => {
        map[c.code] = c.name;
        c.children.forEach(a => map[a.code] = a.name);
      });
    });
    return map;
  },
  /* 扁平化：每条 {text:"北京-北京市-东城区", codes:[p,c,a]} */
  _flatRegion(tree) {
    const arr = [];
    tree.forEach(p => {
      p.children.forEach(c => {
        c.children.forEach(a => {
          arr.push({
            text: `${p.name}-${c.name}-${a.name}`,
            codes: [p.code, c.code, a.code]
          });
        });
      });
    });
    return arr;
  },
  /* 弹窗开关 */
  toggleRegionPicker() {
    const show = !this.data.showRegion;
    this.setData({
      showRegion: show,
      regionKey: '',
      regionFilter: this.data.regionList
    });
  },
  /* 搜索过滤 */
  onRegionSearch(e) {
    const key = (e.detail.value || '').trim();
    this.setData({ regionKey: key });
    if (!key) {
      this.setData({ regionFilter: this.data.regionList });
      return;
    }
    const filtered = this.data.regionList.filter(item =>
      item.text.includes(key)
    );
    this.setData({ regionFilter: filtered });
  },
  /* 选中一行 */
  selectRegion(e) {
    const { codes, text } = e.currentTarget.dataset;
    this.setData({
      regionCode: codes,
      regionText: text,
      showRegion: false,
      regionKey: ''
    });
  },
  /* 回显 */
  echoRegion(codes) {
    const map = this.data.regionMap;
    const names = codes.map(c => map[c] || '');
    this.setData({
      regionCode: codes,
      regionText: names.join('-')
    });
  },

  /* ====================== 银行 ====================== */
  loadBankList() {
    http.request('/member/index/getBankCode', '1', 'get', {},
      app.globalData.userDatatoken.accessToken, '', res => {
        if (res.code === 0) this.setData({ bankList: res.data, bankListTemp: res.data });
      });
  },
  toggleBankPicker() { this.setData({ showBank: !this.data.showBank }); },
  onBankSearch(e) {
    const key = (e.detail.value || '').toLowerCase();
    const filtered = (this.data.bankListTemp || []).filter(b => (b.name || '').toLowerCase().includes(key));
    this.setData({ bankList: filtered });
  },
  selectBank(e) {
    const code = e.currentTarget.dataset.code;
    const bank = (this.data.bankListTemp || []).find(b => String(b.code) === String(code)) || {};
    this.setData({ bankName: bank.name || '', bankCode: bank.code || '', showBank: false });
  },

  /* ====================== 身份证 & 图片 ====================== */
  onIdCardInput(e) {
    const val = e.detail.value;
    const reg = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    this.setData({ idCard: val, idCardErr: reg.test(val) ? '' : '身份证格式错误' });
  },
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

  /* ====================== 提交 ====================== */
  submit(e) {
    if (this.data.idCardErr) return wx.showToast({ title: '身份证格式错误', icon: 'none' });
    const formData = e.detail.value;
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
      fullAddress: this.data.regionCode.join('-'),
      bankCode: this.data.bankCode,
    };
    const requiredMap = {
      legalName: '真实姓名',
      phone: '手机号',
      idCard: '身份证号',
      shopName: '店铺简称',
      address: '详细地址',
      bankCard: '银行卡号',
      fullAddress: '所在城市',
      bankCode: '开户银行',
      idCardFront: '身份证人像面照片',
      idCardBack: '身份证国徽面照片',
      storeFront: '店铺门头照片',
      scene: '店铺场景照片',
    };
    for (const k in requiredMap) {
      if (!data[k]) {
        wx.showToast({ title: `请填写 ${requiredMap[k]}`, icon: 'none' });
        return;
      }
    }
    http.request('/member/merchant-account/apply', '1', 'post', data,
      app.globalData.userDatatoken.accessToken, '提交中...', res => {
        if (res.code === 0) {
          setTimeout(() => wx.showToast({ title: '提交成功', icon: 'success' }), 500);
          this.loadAccount();
        } else {
          wx.showToast({ title: res.msg, icon: 'none' });
        }
      });
  },

  /* ====================== 账户回显 ====================== */
  loadAccount() {
    wx.showLoading({ title: '加载中...' });
    http.request('/member/merchant-account/get', '1', 'get', {},
      app.globalData.userDatatoken.accessToken, '', res => {
        wx.hideLoading();
        if (res.code === 0) {
          const acc = res.data || {};
          const codeArr = (acc.regionCode || acc.fullAddress || '')
            .split('-').map(s => s.trim()).filter(Boolean);
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
            fullAddress: acc.fullAddress || '',
            bankName: (this.data.bankList.find(b => b.code === acc.bankCode) || {}).name || acc.bankName || '',
            bankCode: acc.bankCode || '',
            remark: acc.remark || '',
            mchId: acc.mchId || '',
            shimingCode: acc.shimingCode ? ('data:image/png;base64,' + acc.shimingCode) : '',
            statusClass: acc.status === 4 ? 'success' : acc.status === 2 ? 'error' : '',
            showUserConsent: !acc.status
          });
          if (codeArr.length === 3) this.echoRegion(codeArr);
        }
      });
  },

  /* ===== 其他 ===== */
  refresh() { this.loadAccount(); },
  copyMchId() { wx.setClipboardData({ data: this.data.mchId }); },
  openAgreement(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({ url: `/pages/yeepay/agreement?type=${type}` });
  },
  onCancelConsent() { wx.navigateBack(); },
  onAgreeConsent() { this.setData({ showUserConsent: false }); },
});