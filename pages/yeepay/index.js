// pages/merchant/index.js
const app = getApp();
const http = require('../../utils/http');

Page({
  data: {
    isLogin: app.globalData.isLogin,
    statusText: ['未开通', '审核中', '审核不通过', '待实名', '已开通'],
    status: '',
    showUserConsent: false,

    /* ===== 省市区（自定义数据） ===== */
    regionTree: [],         // 省市区树 [{code,name,children:[{code,name,children:[]}] }]
    regionMap: {},          // code -> name 映射，便于快速查名
    regionCode: [],         // 选中的省/市/区 code 数组（提交用）
    regionText: '',         // 展示的中文名称（回显/只读显示用）
    regionRange: [[], [], []], // multiSelector 每列的可选项（对象数组）
    regionIndex: [0, 0, 0],    // multiSelector 当前列索引

    /* ===== 银行 ===== */
    bankList: [],           // 银行列表（当前展示）
    bankListTemp: [],       // 银行列表（全量，用于搜索）
    bankName: '',           // 银行名称
    bankCode: '',           // 银行 code

    fullAddress: '',        // 后端历史字段（保存 code 串，作为回退显示）
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
    // 两个接口并行拉：地区树与账户数据
    // 无论哪个先返回，都会互相触发回填（见后面逻辑）
    this.loadRegion();
    this.loadBankList();
    this.loadAccount();
  },

  /* ====================== 地区相关 ====================== */

  // 拉取地区树（省市区）
  loadRegion() {
    http.request("/member/index/getRegCode", "1", "get", {}, app.globalData.userDatatoken.accessToken, "", res => {
      if (res.code === 0) {
        const tree = res.data || [];
        // 构建 code->name map，方便把 code 转成中文名
        const map = this._buildRegionMap(tree);

        this.setData({ regionTree: tree, regionMap: map }, () => {
          // 如果已经有 regionCode（来自账户回显），优先用它来初始化 picker
          if (this.data.regionCode && this.data.regionCode.length) {
            this.initRegionPickerFromCodes(this.data.regionCode);
          } else if (this.data.fullAddress) {
            // 没有 explicit regionCode，但有 fullAddress（code 串），尝试把它解析为 codes 并回填
            const codes = this._codesFromFullAddress(this.data.fullAddress);
            if (codes.length) {
              this.initRegionPickerFromCodes(codes);
            }
          }
        });
      } else {
        // 可选：处理失败逻辑
        console.warn('loadRegion failed', res);
      }
    });
  },

  // 把地区树展平为 code->name 的字典
  _buildRegionMap(tree = []) {
    const map = {};
    (tree || []).forEach(p => {
      if (p && p.code != null) map[String(p.code)] = p.name || '';
      (p.children || []).forEach(c => {
        if (c && c.code != null) map[String(c.code)] = c.name || '';
        (c.children || []).forEach(a => {
          if (a && a.code != null) map[String(a.code)] = a.name || '';
        });
      });
    });
    return map;
  },

  // 将 fullAddress 字符串 '130000-130400-130404' → ['130000','130400','130404']
  _codesFromFullAddress(fullAddress) {
    if (!fullAddress) return [];
    if (Array.isArray(fullAddress)) return fullAddress;
    return String(fullAddress).split('-').map(s => s.trim()).filter(Boolean);
  },

  /** 将 codes -> 初始化 picker 的 index、range，并生成中文回显 **/
  initRegionPickerFromCodes(codes = []) {
    const provinces = this.data.regionTree || [];
    if (!provinces.length) {
      // 地区树还没到位，不能初始化
      return;
    }

    // 注意：后端的 code 可能为 number 或 string，统一用 String 比较
    const targetP = String((codes[0] || '')).trim();
    const targetC = String((codes[1] || '')).trim();
    const targetA = String((codes[2] || '')).trim();

    const pIndex = this._safeIndex(provinces.findIndex(p => String(p.code) === targetP), provinces.length);
    const cities = (provinces[pIndex] && provinces[pIndex].children) ? provinces[pIndex].children : [];
    const cIndex = this._safeIndex(cities.findIndex(c => String(c.code) === targetC), cities.length);
    const areas = (cities[cIndex] && cities[cIndex].children) ? cities[cIndex].children : [];
    const aIndex = this._safeIndex(areas.findIndex(a => String(a.code) === targetA), areas.length);

    const finalCodes = [
      (provinces[pIndex] && provinces[pIndex].code) ? String(provinces[pIndex].code) : '',
      (cities[cIndex] && cities[cIndex].code) ? String(cities[cIndex].code) : '',
      (areas[aIndex] && areas[aIndex].code) ? String(areas[aIndex].code) : ''
    ];

    // names：优先用 map 查名字（更稳），否则使用对象的 name 字段
    const map = this.data.regionMap || {};
    const names = [
      map[finalCodes[0]] || (provinces[pIndex] && provinces[pIndex].name) || '',
      map[finalCodes[1]] || (cities[cIndex] && cities[cIndex].name) || '',
      map[finalCodes[2]] || (areas[aIndex] && areas[aIndex].name) || ''
    ].filter(Boolean);

    this.setData({
      regionRange: [provinces, cities, areas],
      regionIndex: [pIndex, cIndex, aIndex],
      regionCode: finalCodes,
      regionText: names.join(' ')
    });
  },

  /** multiSelector 每列滚动时，联动后续列数据 **/
  onRegionColumnChange(e) {
    const column = e.detail.column;
    const value = e.detail.value;

    const provinces = this.data.regionTree || [];
    let [pIndex, cIndex, aIndex] = this.data.regionIndex.slice();

    if (column === 0) {
      pIndex = value;
      const cities = (provinces[pIndex] && provinces[pIndex].children) ? provinces[pIndex].children : [];
      const areas = (cities[0] && cities[0].children) ? cities[0].children : [];
      cIndex = 0;
      aIndex = 0;
      this.setData({ regionRange: [provinces, cities, areas], regionIndex: [pIndex, cIndex, aIndex] });
    } else if (column === 1) {
      cIndex = value;
      const cities = (provinces[pIndex] && provinces[pIndex].children) ? provinces[pIndex].children : [];
      const areas = (cities[cIndex] && cities[cIndex].children) ? cities[cIndex].children : [];
      aIndex = 0;
      this.setData({ regionRange: [provinces, cities, areas], regionIndex: [pIndex, cIndex, aIndex] });
    } else if (column === 2) {
      aIndex = value;
      this.setData({ regionIndex: [pIndex, cIndex, aIndex] });
    }
  },

  /** 点击“完成”时，更新 code 与中文名（用于显示） **/
  onRegionConfirm(e) {
    const [pIndex, cIndex, aIndex] = e.detail.value || [0, 0, 0];
    const provinces = this.data.regionRange[0] || [];
    const cities = this.data.regionRange[1] || [];
    const areas = this.data.regionRange[2] || [];

    const p = provinces[pIndex] || {};
    const c = cities[cIndex] || {};
    const a = areas[aIndex] || {};

    const codes = [
      p.code != null ? String(p.code) : '',
      c.code != null ? String(c.code) : '',
      a.code != null ? String(a.code) : ''
    ];

    const names = [
      (this.data.regionMap && this.data.regionMap[codes[0]]) || p.name || '',
      (this.data.regionMap && this.data.regionMap[codes[1]]) || c.name || '',
      (this.data.regionMap && this.data.regionMap[codes[2]]) || a.name || ''
    ].filter(Boolean);

    this.setData({
      regionIndex: [pIndex, cIndex, aIndex],
      regionCode: codes,              // 提交仍用 code
      regionText: names.join(' ')     // 展示中文
    });
  },

  _safeIndex(idx, len) {
    return (len > 0 && idx >= 0 && idx < len) ? idx : 0;
  },

  /* ====================== 银行相关 ====================== */
  loadBankList() {
    http.request("/member/index/getBankCode", "1", "get", {}, app.globalData.userDatatoken.accessToken, "", res => {
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
    // dataset 里只传了 bank.code（字符串），在这里找回完整对象
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

      // 仍然提交 code（保持与你现有后端一致）
      fullAddress: (this.data.regionCode && this.data.regionCode.length && this.data.regionCode.join('-')) || this.data.fullAddress,
      bankCode: this.data.bankCode,
    };

    // 3. 必填字段列表（新增/删除字段只改这里）
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

  /* ====================== 账户回显 ====================== */
  loadAccount() {
    wx.showLoading({ title: '加载中...' });
    http.request("/member/merchant-account/get", "1", "get", {}, app.globalData.userDatatoken.accessToken, "", res => {
      wx.hideLoading();
      if (res.code === 0) {
        const acc = res.data || {};
        // 兼容后端历史字段：可能叫 regionCode，也可能把 code 串放在 fullAddress
        const codeArr = acc.regionCode ? String(acc.regionCode).split('-').map(s => s.trim()).filter(Boolean) : (acc.fullAddress ? String(acc.fullAddress).split('-').map(s => s.trim()).filter(Boolean) : []);

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

          // 保存 code 供之后提交使用；如果没有 codeArr 则为空数组
          regionCode: codeArr,

          // 保存后端原始 fullAddress（兜底显示）
          fullAddress: acc.fullAddress || '',

          // 银行回显（若 bankList 尚未到位，名称可能为空，之后不影响）
          bankName: (this.data.bankList.find(b => b.code === acc.bankCode) || {}).name || acc.bankName || '',
          bankCode: acc.bankCode || '',

          remark: acc.remark || '',
          mchId: acc.mchId || '',
          shimingCode: acc.shimingCode ? ('data:image/png;base64,' + acc.shimingCode) : '',
          statusClass: acc.status === 4 ? 'success' : acc.status === 2 ? 'error' : ''
        });

        // 如果地区树已加载（regionMap 已存在），立刻把 code -> 中文回显
        if (this.data.regionTree && this.data.regionTree.length) {
          this.initRegionPickerFromCodes(codeArr);
        } else {
          // 地区树尚未准备：先把页面上显示的文字回退为 code 串（fullAddress），
          // 当 loadRegion 完成后会再自动 initRegionPickerFromCodes。
          // 这里确保 regionText 不误显示为空（使用 fullAddress 兜底）
          if (!this.data.regionText && this.data.fullAddress) {
            this.setData({ regionText: '' }); // 保持空，wxml 会显示 fullAddress 作为兜底
          }
        }

        if (!this.data.status) {
          this.setData({ showUserConsent: true });
        }
      } else {
        console.warn('loadAccount failed', res);
      }
    });
  },

  /* ===== 其他方法 ===== */
  refresh() { this.loadAccount(); },
  copyMchId() { wx.setClipboardData({ data: this.data.mchId }); },
  openAgreement(e) {
    const type = e.currentTarget.dataset.type; // 'service' 或 'privacy'
    wx.navigateTo({ url: `/pages/yeepay/agreement?type=${type}` });
  },
  onCancelConsent() { wx.navigateBack(); },
  onAgreeConsent() { this.setData({ showUserConsent: false }); },
});
