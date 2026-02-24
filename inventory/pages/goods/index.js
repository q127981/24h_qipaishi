// pages/goodsType/goodsType.js
const app = getApp();
var http = require('../../../utils/http');

Page({
  data: {
    storeId: '',
    
    // 列表数据
    goodsTypeList: [],
    loading: false,
    
    // 搜索
    searchKeyword: '',
    
    // 弹窗控制
    showModal: false,
    isEdit: false,
    
    // 表单数据
    formData: {
      id: null,
      storeId: null,
      goodsName: '',
      units: '',
      enable: true
    },
    
    // 表单验证
    isFormValid: false
  },

  onLoad(options) {
    // 从options中获取门店ID
    const storeId = options.storeId;
    
    this.setData({
      storeId: storeId,
      'formData.storeId': storeId
    });
  },

  onShow() {
    // 每次显示页面刷新列表
    this.loadGoodsTypeList();
  },

  // 加载商品类型列表
  loadGoodsTypeList() {
    var that = this;
    http.request(
      "/member/inventory/getGoodsList?storeId="+this.data.storeId,
      "1",
      "post", {
      },
      app.globalData.userDatatoken.accessToken,
      '加载中...',
      function success(info) {
        if (info.code == 0) {
          that.setData({
            goodsTypeList: info.data
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

  // 显示新增弹窗
  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      formData: {
        id: null,
        storeId: this.data.storeId,
        goodsName: '',
        units: '',
        enable: true
      },
      isFormValid: false
    });
  },

  // 编辑
  editItem(e) {
    const item = e.currentTarget.dataset.item;
    
    this.setData({
      showModal: true,
      isEdit: true,
      formData: {
        id: item.id,
        storeId: item.storeId,
        goodsName: item.goodsName,
        units: item.units,
        enable: item.enable
      },
      isFormValid: true
    });
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showModal: false
    });
  },

  // 阻止冒泡
  preventBubble() {
    // 什么都不做，只是阻止事件冒泡
  },

  // 输入框变化
  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value
    });
    
    this.checkFormValid();
  },

  // 开关变化
  onSwitchChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  // 检查表单有效性
  checkFormValid() {
    const { goodsName, units } = this.data.formData;
    const isValid = goodsName.trim() && units.trim();
    
    this.setData({
      isFormValid: isValid
    });
  },

  // 保存（新增或修改）
  saveItem() {
    var that = this;
    if (!this.data.isFormValid) return;
    const { formData } = this.data;
    http.request(
      "/member/inventory/saveGoods",
      "1",
      "post", {
        "id": formData.id,
        "storeId": that.data.storeId,
        "goodsName": formData.goodsName,
        "units": formData.units,
        "enable": formData.enable,
      },
      app.globalData.userDatatoken.accessToken,
      '操作中...',
      function success(info) {
        console.info('返回111===');
        if (info.code == 0) {
          that.setData({
            showModal: false
          })
          wx.showToast({
            title: '操作成功',
          })
          that.loadGoodsTypeList();
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

  // 切换启用状态
  toggleEnable(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const enable = e.detail.value;
    
    // 本地更新
    const item = this.data.goodsTypeList[index];
    
    wx.showLoading({
      title: '更新中...'
    });
    
    // 模拟接口调用
    setTimeout(() => {
      wx.hideLoading();
      
      this.setData({
        [`goodsTypeList[${index}].enable`]: enable
      });
      
      wx.showToast({
        title: enable ? '已启用' : '已禁用',
        icon: 'success'
      });
    }, 500);
    
    // 实际接口调用：
    /*
    wx.request({
      url: app.globalData.baseUrl + '/api/goodsType/update',
      method: 'PUT',
      data: {
        id: id,
        storeId: item.storeId,
        goodsName: item.goodsName,
        unit: item.unit,
        enable: enable
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 200) {
          wx.showToast({
            title: enable ? '已启用' : '已禁用',
            icon: 'success'
          });
        } else {
          // 恢复原状态
          this.setData({
            [`goodsTypeList[${index}].enable`]: !enable
          });
          wx.showToast({
            title: res.data.msg || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        this.setData({
          [`goodsTypeList[${index}].enable`]: !enable
        });
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
    */
  },

  // 删除
  deleteItem(e) {
    const id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，是否继续？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          http.request(
            "/member/inventory/deleteGoods?id=" + id,
            "1",
            "post", {
             
            },
            app.globalData.userDatatoken.accessToken,
            '...',
            function success(info) {
              console.info('返回111===');
              wx.showToast({
                title: '操作成功',
              })
              that.loadGoodsTypeList();
            },
            function fail(info) {
              
            }
          )
        }
      }
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});