// pages/storageHome/storageHome.js
const app = getApp();

Page({
  data: {
    // 固定门店ID
    storeId: null,
    storeName: '',
    
    // 查询
    queryPhone: '',
    storageList: [],
    loading: false,
    
    // 新增寄存弹窗
    showAddModal: false,
    addForm: {
      phone: '',
      expireDateTime: '',
      goodsList: [
        { goodsId: null, goodsName: '', unit: '', num: 1 }
      ]
    },
    isAddFormValid: false,
    
    // 时间选择器
    dateTimeArray: [],
    dateTimeIndex: [],
    
    // 商品类型列表
    goodsTypeList: [],
    
    // 商品选择弹窗
    showGoodsSelector: false,
    currentSelectIndex: -1,
    tempSelectedGoodsId: null,
    tempSelectedGoods: null
  },

  onLoad(options) {
    const storeId = options.storeId ? parseInt(options.storeId) : null;
    const storeName = options.storeName || '未知门店';
    
    if (!storeId) {
      wx.showToast({
        title: '门店ID不能为空',
        icon: 'none',
        duration: 2000,
        complete: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
      return;
    }
    
    this.setData({
      storeId: storeId,
      storeName: storeName
    });
    
    this.initDateTimePicker();
    this.setDefaultExpireDate();
    this.loadGoodsTypeList();
  },

  // 初始化时间选择器
  initDateTimePicker() {
    const date = new Date();
    const years = [];
    const months = [];
    const days = [];
    const hours = [];
    const minutes = [];
    
    const currentYear = date.getFullYear();
    for (let i = 0; i < 6; i++) {
      years.push((currentYear + i) + '年');
    }
    
    for (let i = 1; i <= 12; i++) {
      months.push(String(i).padStart(2, '0') + '月');
    }
    
    for (let i = 1; i <= 31; i++) {
      days.push(String(i).padStart(2, '0') + '日');
    }
    
    for (let i = 0; i < 24; i++) {
      hours.push(String(i).padStart(2, '0') + '时');
    }
    
    for (let i = 0; i < 60; i++) {
      minutes.push(String(i).padStart(2, '0') + '分');
    }
    
    this.setData({
      dateTimeArray: [years, months, days, hours, minutes]
    });
  },

  // 设置默认到期时间
  setDefaultExpireDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    const expireDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
    
    const yearIndex = year - new Date().getFullYear();
    const monthIndex = date.getMonth();
    const dayIndex = date.getDate() - 1;
    const hourIndex = date.getHours();
    const minuteIndex = date.getMinutes();
    
    this.setData({
      'addForm.expireDateTime': expireDateTime,
      dateTimeIndex: [yearIndex, monthIndex, dayIndex, hourIndex, minuteIndex]
    });
  },

  // 时间选择器变化
  onExpireDateTimeChange(e) {
    const val = e.detail.value;
    const arr = this.data.dateTimeArray;
    
    const year = arr[0][val[0]].replace('年', '');
    const month = arr[1][val[1]].replace('月', '');
    const day = arr[2][val[2]].replace('日', '');
    const hour = arr[3][val[3]].replace('时', '');
    const minute = arr[4][val[4]].replace('分', '');
    
    const expireDateTime = `${year}-${month}-${day} ${hour}:${minute}`;
    
    this.setData({
      'addForm.expireDateTime': expireDateTime,
      dateTimeIndex: val
    });
  },

  // 时间列变化
  onDateTimeColumnChange(e) {
    const column = e.detail.column;
    const value = e.detail.value;
    const dateTimeArray = this.data.dateTimeArray;
    const dateTimeIndex = this.data.dateTimeIndex;
    
    dateTimeIndex[column] = value;
    
    if (column === 0 || column === 1) {
      const year = parseInt(dateTimeArray[0][dateTimeIndex[0]]);
      const month = dateTimeIndex[1] + 1;
      const daysInMonth = new Date(year, month, 0).getDate();
      
      const days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(String(i).padStart(2, '0') + '日');
      }
      
      dateTimeArray[2] = days;
      
      if (dateTimeIndex[2] >= daysInMonth) {
        dateTimeIndex[2] = daysInMonth - 1;
      }
      
      this.setData({
        dateTimeArray: dateTimeArray,
        dateTimeIndex: dateTimeIndex
      });
    } else {
      this.setData({
        dateTimeIndex: dateTimeIndex
      });
    }
  },

  // 加载商品类型列表
  loadGoodsTypeList() {
    var that = this;
    wx.request({
      url: app.globalData.baseUrl + '/member/inventory/getGoodsList?storeId=' + this.data.storeId,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + app.globalData.userDatatoken.accessToken
      },
      success: (res) => {
        if (res.data.code === 0) {
          // const goodsList = res.data.data || [];
          // const listWithPlaceholder = [
          //   { id: null, goodsName: '请选择', units: '' },
          //   ...goodsList
          // ];
          
          that.setData({
            goodsTypeList: res.data.data
          });
        } else {
          wx.showModal({
            content: res.data.msg,
            showCancel: false
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到商品管理
  goToGoodsManage() {
    wx.navigateTo({
      url: '/inventory/pages/goods/index?storeId=' + this.data.storeId
    });
  },

  // 显示新增寄存弹窗
  showAddModal() {
    this.setDefaultExpireDate();
    this.setData({
      showAddModal: true,
      addForm: {
        phone: '',
        expireDateTime: this.data.addForm.expireDateTime,
        goodsList: [
          { goodsId: null, goodsName: '', unit: '', num: 1 }
        ]
      },
      isAddFormValid: false
    });
  },

  // 隐藏新增寄存弹窗
  hideAddModal() {
    this.setData({
      showAddModal: false
    });
  },

  // 阻止冒泡
  preventBubble() {},

  // 新增表单输入
  onAddFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`addForm.${field}`]: e.detail.value
    });
    this.checkAddFormValid();
  },

  // 添加商品项
  addGoodsItem() {
    const list = this.data.addForm.goodsList;
    list.push({ goodsId: null, goodsName: '', unit: '', num: 1 });
    this.setData({
      'addForm.goodsList': list
    });
  },

  // 删除商品项
  deleteGoodsItem(e) {
    const index = e.currentTarget.dataset.index;
    if (this.data.addForm.goodsList.length <= 1) {
      wx.showToast({ title: '至少保留一个商品', icon: 'none' });
      return;
    }
    const list = this.data.addForm.goodsList;
    list.splice(index, 1);
    this.setData({
      'addForm.goodsList': list
    });
    this.checkAddFormValid();
  },

  // 打开商品选择弹窗
  openGoodsSelector(e) {
    const index = e.currentTarget.dataset.index;
    const currentGoods = this.data.addForm.goodsList[index];
    
    this.setData({
      showGoodsSelector: true,
      currentSelectIndex: index,
      tempSelectedGoodsId: currentGoods.goodsId,
      tempSelectedGoods: currentGoods.goodsId ? {
        id: currentGoods.goodsId,
        goodsName: currentGoods.goodsName,
        units: currentGoods.unit
      } : null
    });
  },

  // 关闭商品选择弹窗
  closeGoodsSelector() {
    this.setData({
      showGoodsSelector: false,
      tempSelectedGoodsId: null,
      tempSelectedGoods: null
    });
  },

  // 点击商品选项
  onGoodsOptionTap(e) {
    const goods = e.currentTarget.dataset.goods;
    
    // 忽略"请选择"选项
    if (!goods.id) {
      return;
    }
    
    this.setData({
      tempSelectedGoodsId: goods.id,
      tempSelectedGoods: goods
    });
  },

  // 确认选择商品
  confirmGoodsSelect() {
    if (!this.data.tempSelectedGoodsId) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    
    const index = this.data.currentSelectIndex;
    const goods = this.data.tempSelectedGoods;
    
    this.setData({
      [`addForm.goodsList[${index}].goodsId`]: goods.id,
      [`addForm.goodsList[${index}].goodsName`]: goods.goodsName,
      [`addForm.goodsList[${index}].unit`]: goods.units,
      showGoodsSelector: false,
      tempSelectedGoodsId: null,
      tempSelectedGoods: null
    });
    
    this.checkAddFormValid();
  },

  // 改变商品数量
  changeGoodsNum(e) {
    const index = e.currentTarget.dataset.index;
    const delta = parseInt(e.currentTarget.dataset.delta);
    const key = `addForm.goodsList[${index}].num`;
    let num = this.data.addForm.goodsList[index].num + delta;
    
    if (num < 1) num = 1;
    this.setData({ [key]: num });
  },

  // 商品数量输入
  onGoodsNumInput(e) {
    const index = e.currentTarget.dataset.index;
    let num = parseInt(e.detail.value) || 1;
    if (num < 1) num = 1;
    this.setData({
      [`addForm.goodsList[${index}].num`]: num
    });
  },

  // 检查新增表单有效性
  checkAddFormValid() {
    const { phone, goodsList } = this.data.addForm;
    const phoneValid = /^1[3-9]\d{9}$/.test(phone);
    const goodsValid = goodsList.every(item => item.goodsId && item.num > 0);
    
    this.setData({
      isAddFormValid: phoneValid && goodsValid
    });
  },

  // 提交新增寄存
  submitAddStorage() {
    if (!this.data.isAddFormValid) return;
    
    const { addForm, storeId } = this.data;
    
    wx.showLoading({ title: '保存中...' });
    
    const params = {
      storeId: storeId,
      phone: addForm.phone,
      expireTime: addForm.expireDateTime + ':00',
      goodsList: addForm.goodsList.map(item => ({
        goodsId: item.goodsId,
        num: item.num
      }))
    };
    
    wx.request({
      url: app.globalData.baseUrl + '/member/inventory/addInventory',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + app.globalData.userDatatoken.accessToken,
        'Content-Type': 'application/json'
      },
      data: params,
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          this.setData({ showAddModal: false,queryPhone: addForm.phone});
          wx.showToast({ title: '寄存成功', icon: 'success' });
          this.queryStorage();
        } else {
          wx.showToast({ title: res.data.msg || '寄存失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // 查询手机号输入
  onQueryPhoneInput(e) {
    this.setData({
      queryPhone: e.detail.value
    });
  },

  // 查询寄存记录
  queryStorage() {
    const phone = this.data.queryPhone.trim();
    if (!phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' });
      return;
    }
    
    this.setData({ loading: true });
    let params= {
      mobile: phone,
      storeId: this.data.storeId
    }
    wx.request({
      url: app.globalData.baseUrl + '/member/inventory/getUserInventoryPage',
      method: 'POST',
      data: params,
      header: {
        'Authorization': 'Bearer ' + app.globalData.userDatatoken.accessToken
      },
      success: (res) => {
        if (res.data.code === 0) {
          const list = (res.data.data || []).map(item => ({
            ...item,
            expireTime: item.expireTime ? item.expireTime.substring(0, 16) : '',
            takeNum: 0
          }));
          
          this.setData({
            storageList: list,
            loading: false
          });
          this.calculateSelected();
        } else {
          wx.showToast({ title: res.data.msg || '查询失败', icon: 'none' });
          this.setData({ loading: false });
        }
      },
      fail: () => {
        wx.showToast({ title: '查询失败', icon: 'none' });
        this.setData({ loading: false });
      }
    });
  },

  // 重置查询
  resetQuery() {
    this.setData({
      queryPhone: '',
      storageList: []
    });
  },

  // 改变取出数量
  changeTakeNum(e) {
    const index = e.currentTarget.dataset.index;
    const delta = parseInt(e.currentTarget.dataset.delta);
    const item = this.data.storageList[index];
    let num = item.takeNum + delta;
    
    if (num < 0) num = 0;
    if (num > item.stockNum) num = item.stockNum;
    
    this.setData({
      [`storageList[${index}].takeNum`]: num
    });
    this.calculateSelected();
  },

  // 取出数量输入
  onTakeNumInput(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.storageList[index];
    let num = parseInt(e.detail.value) || 0;
    
    if (num < 0) num = 0;
    if (num > item.stockNum) num = item.stockNum;
    
    this.setData({
      [`storageList[${index}].takeNum`]: num
    });
    this.calculateSelected();
  },

  // 快速取出
  quickTake(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.storageList[index];
    
    let takeNum = item.takeNum || 1;
    if (takeNum > item.stockNum) takeNum = item.stockNum;
    
    this.setData({
      [`storageList[${index}].takeNum`]: takeNum
    });
    
    wx.showModal({
      title: '确认取出',
      content: `确认取出 ${item.goodsName} ${takeNum}${item.units}？`,
      success: (res) => {
        if (res.confirm) {
          this.submitSingleTake(index);
        }
      }
    });
  },

  // 单个商品取出提交
  submitSingleTake(index) {
    const item = this.data.storageList[index];
    
    wx.showLoading({ title: '处理中...' });
    
    wx.request({
      url: app.globalData.baseUrl + '/member/inventory/takeOut',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + app.globalData.userDatatoken.accessToken,
        'Content-Type': 'application/json'
      },
      data: {
        id: item.id,
        num: item.takeNum
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          wx.showToast({ title: '取出成功', icon: 'success' });
          this.queryStorage();
        } else {
          wx.showToast({ title: res.data.msg || '取出失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // 计算已选
  calculateSelected() {
    const list = this.data.storageList;
    let count = 0;
    let total = 0;
    
    list.forEach(item => {
      if (item.takeNum > 0) {
        count++;
        total += item.takeNum;
      }
    });
    
    this.setData({
      hasSelected: count > 0,
      selectedCount: count,
      selectedTotal: total
    });
  },

  // 确认取出
  confirmTakeOut() {
    let that = this;
    const takeList = this.data.storageList
      .filter(item => item.takeNum > 0)
      .map(item => ({
        goodsId: item.id,
        num: item.takeNum
      }));
    
    if (takeList.length === 0) return;
    
    wx.showModal({
      title: '确认取出',
      content: `共取出 ${this.data.selectedTotal} 件商品？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          wx.request({
            url: app.globalData.baseUrl + '/member/inventory/takeInventory',
            method: 'POST',
            header: {
              'Authorization': 'Bearer ' + app.globalData.userDatatoken.accessToken,
              'Content-Type': 'application/json'
            },
            data: {
              storeId: that.data.storeId, 
              phone: that.data.queryPhone,
              goodsList: takeList
            },
            success: (res) => {
              wx.hideLoading();
              if (res.data.code === 0) {
                wx.showToast({ title: '取出成功', icon: 'success' });
                this.queryStorage();
              } else {
                wx.showToast({ title: res.data.msg || '取出失败', icon: 'none' });
              }
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '网络错误', icon: 'none' });
            }
          });
        }
      }
    });
  }
});