var http = require('../../../utils/http');
const app = getApp()
Page({
  data: {
    storeId: null,
    lotteryList: [],
    showModal: false,
    showResultModal: false,
    isEdit: false,
    formData: {
      id: null,
      storeId: null,
      title: '',
      prize1: '',
      prize2: '',
      prize3: '',
      prize4: '',
      bmd: '',
      expireTime: '',
      orderNum: '',
      minOrderNum: '',
      remark: ''
    },
    resultList: [],
    currentId: null
  },

  onLoad(options) {
    const storeId = options.storeId;
    if (!storeId) {
      wx.showToast({
        title: '缺少门店ID参数',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    this.setData({
      storeId: parseInt(storeId)
    });
    
    this.loadLotteryList();
  },

  loadLotteryList() {
    var that = this;
    http.request(
      "/member/lottery/getList",
      "1",
      "post", {
        storeId: that.data.storeId,
      },
      app.globalData.userDatatoken.accessToken,
      "获取中...",
      function success(info) {
        if (info.code == 0) {
          that.setData({
            lotteryList: info.data
          });
        } else {
          wx.showToast({
            title: info.msg,
            icon: 'none'
          })
        }
      },
      function fail(info) { }
    )
    
  },

  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      formData: {
        id: null,
        storeId: this.data.storeId,
        title: '',
        prize1: '',
        prize2: '',
        prize3: '',
        prize4: '',
        bmd: '',
        expireTime: '',
        orderNum: '',
        minOrderNum: '',
        remark: ''
      }
    });
  },

  showEditModal(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      showModal: true,
      isEdit: true,
      currentId: item.id,
      formData: {
        id: item.id,
        storeId: this.data.storeId,
        bmd: item.bmd,
        title: item.title,
        remark: item.remark || '',
        prize1: '',
        prize2: '',
        prize3: '',
        prize4: '',
        expireTime: '',
        orderNum: '',
        minOrderNum: ''
      }
    });
  },

  hideModal() {
    this.setData({
      showModal: false
    });
  },

  inputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  dateChange(e) {
    this.setData({
      'formData.expireTime': e.detail.value
    });
  },

  saveLottery() {
    const { formData, isEdit, storeId } = this.data;
    let url = "/member/lottery/";
    if(isEdit){
      url = url + "save"
    }else{
      url = url + "add"
    }
    // 表单验证
    if (!formData.title || formData.title.length < 1 || formData.title.length > 12) {
      wx.showToast({ title: '活动名称1-12个字', icon: 'none' });
      return;
    }
    
    if (!isEdit) {
      if (!formData.prize1) {
        wx.showToast({ title: '请输入一等奖', icon: 'none' });
        return;
      }
      if (!formData.prize2) {
        wx.showToast({ title: '请输入二等奖', icon: 'none' });
        return;
      }
      if (!formData.prize3) {
        wx.showToast({ title: '请输入三等奖', icon: 'none' });
        return;
      }
      if (!formData.expireTime) {
        wx.showToast({ title: '请选择开奖日期', icon: 'none' });
        return;
      }
    }
    var that = this;
    // 构造提交数据，storeId自动带上
    const submitData = {
      ...formData,
      storeId: storeId
    };
    http.request(
      url ,
      "1",
      "post", submitData,
      app.globalData.userDatatoken.accessToken,
      "操作中...",
      function success(info) {
        if (info.code == 0) {
          wx.showToast({
            title: '操作成功',
            icon: 'none'
          })
          that.setData({
            showModal: false
          });
          that.loadLotteryList();
        } else {
          wx.showToast({
            title: info.msg,
            icon: 'none'
          })
        }
      },
      function fail(info) { }
    )
  },

  showResultModal(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      showResultModal: true,
      currentId: id
    });
    this.loadResultList(id);
  },

  loadResultList(lotteryId) {
    var that = this;
    http.request(
      "/member/lottery/getResult/"+lotteryId,
      "1",
      "post", {},
      app.globalData.userDatatoken.accessToken,
      "操作中...",
      function success(info) {
        if (info.code == 0) {
          that.setData({
            resultList: info.data
          });
        } else {
          wx.showToast({
            title: info.msg,
            icon: 'none'
          })
        }
      },
      function fail(info) { }
    )
    
   
  },

  hideResultModal() {
    this.setData({
      showResultModal: false,
      resultList: []
    });
  },

  copyPhone(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.setClipboardData({
      data: phone,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success',
          duration: 1200
        });
      }
    });
  },

  preventBubble() {},
  goDetail(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/coupon/lottery?id='+id,
    })
  },
  toggleVerify(e) {
    const { id, user } = e.currentTarget.dataset;
    var that = this;
    wx.showModal({
      title: '确认核销',
      content: '确定要核销该中奖记录吗？',
      confirmColor: '#3b82f6',
      success: async (res) => {
        if (res.confirm) {
          http.request(
            "/member/lottery/verifyPrize",
            "1",
            "post", {
                "id": id,
                "userId": user,
            },
            app.globalData.userDatatoken.accessToken,
            "操作中...",
            function success(info) {
              if (info.code == 0) {
                that.loadResultList(id);
              } else {
                wx.showToast({
                  title: info.msg,
                  icon: 'none'
                })
              }
            },
            function fail(info) { }
          )
        }
      }
    });
  },

});