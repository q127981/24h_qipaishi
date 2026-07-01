// packageA/pages/tuangou/mtRoomType.js
const app = getApp();
var http = require('../../../utils/http');

Page({

  data: {
    storeId: '',
    list: [],
    mainColor: app.globalData.mainColor || '#5AAB6E',

    // 同步弹窗
    syncDialogVisible: false,
    currentSyncItem: null,
    confirmLoading: false,
    uploadCount: 0,

    // 表单数据
    form: {
      roomClass: '',
      roomTypeImageUrlList: [],
      // 棋牌室
      space: '',
      hasWindow: '',
      hasIndependentWashRoom: '',
      tableAndChairInformation: '',
      tableAndChairInformationCustom: '',
      // 自助KTV
      minCount: '',
      maxCount: '',
      screenConfig: '',
      audioEquipment: '',
      audioEquipmentCustom: '',
      roomFacilities: [],
      roomFacilitiesCustom: '',
      // 房间设施多选布尔字段
      fHasWindow: false,
      fHasVentilation: false,
      fHasAC: false,
      fHasBathroom: false,
      fHasWIFI: false,
      fHasCustom: false
    }
  },

  onLoad(options) {
    this.setData({
      storeId: options.storeId || ''
    });
    this.getMtRoomList();
  },

  onPullDownRefresh() {
    this.getMtRoomList();
    wx.stopPullDownRefresh();
  },

  // 顶部右侧刷新按钮
  onRefresh() {
    this.getMtRoomList();
  },

  // ========== 获取列表 ==========
  getMtRoomList() {
    var that = this;
    http.request(
      '/member/tuangou/getMtRoomList',
      '1',
      'post',
      { storeId: that.data.storeId },
      app.globalData.userDatatoken.accessToken,
      '加载中',
      function success(info) {
        if (info.code == 0) {
          that.setData({ list: info.data || [] });
        } else {
          wx.showModal({ content: info.msg || '获取列表失败', showCancel: false });
        }
      },
      function fail() {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    );
  },

  // ========== 打开同步弹窗 ==========
  openSyncDialog(e) {
    var item = null;
    if (e && e.currentTarget) {
      item = e.currentTarget.dataset.item;
    }

    var storageKey = 'syncFormCache';
    var cached = null;
    try {
      var raw = wx.getStorageSync(storageKey);
      if (raw && raw.storeId === this.data.storeId) {
        cached = raw;
      }
    } catch (err) {
      // ignore
    }

    var initialForm = {
      roomClass: '',
      roomTypeImageUrlList: [],
      space: '',
      hasWindow: '',
      hasIndependentWashRoom: '',
      tableAndChairInformation: '',
      minCount: '',
      maxCount: '',
      screenConfig: '',
      audioEquipment: '',
      audioEquipmentCustom: '',
      roomFacilities: [],
      roomFacilitiesCustom: '',
      fHasWindow: false,
      fHasVentilation: false,
      fHasAC: false,
      fHasBathroom: false,
      fHasWIFI: false,
      fHasCustom: false
    };

    if (cached && cached.form) {
      var cf = cached.form;
      var imageUrls = (cf.roomTypeImageUrlList || []).map(function(url) {
        return { url: url, isImage: true };
      });
      var facilities = [];
      try { facilities = JSON.parse(cf.roomFacilities) || []; } catch (err) { facilities = []; }
      initialForm = {
        roomClass: cf.roomClass || '',
        roomTypeImageUrlList: imageUrls,
        space: cf.space || '',
        hasWindow: cf.hasWindow || '',
        hasIndependentWashRoom: cf.hasIndependentWashRoom || '',
        tableAndChairInformation: cf.tableAndChairInformation || '',
        tableAndChairInformationCustom: cf.tableAndChairInformationCustom || '',
        minCount: cf.minCount || '',
        maxCount: cf.maxCount || '',
        screenConfig: cf.screenConfig || '',
        audioEquipment: cf.audioEquipment || '',
        audioEquipmentCustom: cf.audioEquipmentCustom || '',
        roomFacilities: facilities,
        roomFacilitiesCustom: cf.roomFacilitiesCustom || '',
        fHasWindow: facilities.indexOf('有窗') > -1,
        fHasVentilation: facilities.indexOf('新风系统') > -1,
        fHasAC: facilities.indexOf('空调') > -1,
        fHasBathroom: facilities.indexOf('独立卫生间') > -1,
        fHasWIFI: facilities.indexOf('WIFI') > -1,
        fHasCustom: facilities.indexOf('自定义') > -1
      };
    }

    this.setData({
      syncDialogVisible: true,
      currentSyncItem: item,
      confirmLoading: false,
      uploadCount: 0,
      form: initialForm
    });
  },

  // 持久化表单缓存
  persistFormCache() {
    var f = this.data.form;
    // 桌椅类型：选了"自定义"则缓存实际输入值
    var cachedChair = (f.tableAndChairInformationCustom && f.tableAndChairInformationCustom.trim())
      ? f.tableAndChairInformationCustom.trim()
      : f.tableAndChairInformation;
    // 房间设施：去掉"自定义"字面量，替换为实际输入值
    var cachedFacilities = (f.roomFacilities || []).filter(function(v) { return v !== '自定义'; });
    if (f.roomFacilitiesCustom && f.roomFacilitiesCustom.trim()) {
      cachedFacilities.push(f.roomFacilitiesCustom.trim());
    }
    var cache = {
      storeId: this.data.storeId,
      form: {
        roomClass: f.roomClass,
        roomTypeImageUrlList: f.roomTypeImageUrlList.map(function(img) { return img.url; }),
        space: f.space,
        hasWindow: f.hasWindow,
        hasIndependentWashRoom: f.hasIndependentWashRoom,
        tableAndChairInformation: cachedChair,
        tableAndChairInformationCustom: f.tableAndChairInformationCustom,
        minCount: f.minCount,
        maxCount: f.maxCount,
        screenConfig: f.screenConfig,
        audioEquipment: f.audioEquipment,
        audioEquipmentCustom: f.audioEquipmentCustom,
        roomFacilities: JSON.stringify(cachedFacilities)
      }
    };
    try {
      wx.setStorageSync('syncFormCache', cache);
    } catch (err) {
      // ignore
    }
  },

  // 关闭同步弹窗
  closeSyncDialog() {
    this.setData({
      syncDialogVisible: false,
      currentSyncItem: null,
      confirmLoading: false,
      uploadCount: 0
    });
    try {
      wx.removeStorageSync('syncFormCache');
    } catch (err) {
      // ignore
    }
  },

  // ========== 表单字段 change 处理 ==========

  onRoomClassChange(e) {
    var roomClass = e.detail;
    this.setData({
      'form.roomClass': roomClass,
      'form.space': '',
      'form.hasWindow': '',
      'form.hasIndependentWashRoom': '',
      'form.tableAndChairInformation': '',
      'form.tableAndChairInformationCustom': '',
      'form.minCount': '',
      'form.maxCount': '',
      'form.screenConfig': '',
      'form.audioEquipment': '',
      'form.audioEquipmentCustom': '',
      'form.roomFacilities': [],
      'form.roomFacilitiesCustom': '',
      'form.fHasWindow': false,
      'form.fHasVentilation': false,
      'form.fHasAC': false,
      'form.fHasBathroom': false,
      'form.fHasWIFI': false,
      'form.fHasCustom': false
    }, function() {
      this.persistFormCache();
    }.bind(this));
  },

  onSpaceChange(e) { this.setData({ 'form.space': e.detail }, function() { this.persistFormCache(); }.bind(this)); },
  onHasWindowChange(e) { this.setData({ 'form.hasWindow': e.detail }, function() { this.persistFormCache(); }.bind(this)); },
  onHasWashRoomChange(e) { this.setData({ 'form.hasIndependentWashRoom': e.detail }, function() { this.persistFormCache(); }.bind(this)); },
  onTableAndChairChange(e) { this.setData({ 'form.tableAndChairInformation': e.detail }, function() { this.persistFormCache(); }.bind(this)); },
  onTableAndChairCustomChange(e) { this.setData({ 'form.tableAndChairInformationCustom': e.detail }, function() { this.persistFormCache(); }.bind(this)); },
  onMinCountChange(e) { this.setData({ 'form.minCount': e.detail }, function() { this.persistFormCache(); }.bind(this)); },
  onMaxCountChange(e) { this.setData({ 'form.maxCount': e.detail }, function() { this.persistFormCache(); }.bind(this)); },
  onScreenConfigChange(e) { this.setData({ 'form.screenConfig': e.detail }, function() { this.persistFormCache(); }.bind(this)); },
  onAudioEquipmentChange(e) { this.setData({ 'form.audioEquipment': e.detail }, function() { this.persistFormCache(); }.bind(this)); },
  onAudioEquipmentCustomChange(e) { this.setData({ 'form.audioEquipmentCustom': e.detail }, function() { this.persistFormCache(); }.bind(this)); },
  onFacilityToggle(e) {
    var boolKey = e.currentTarget.dataset.key;
    var arrValMap = {
      fHasWindow: '有窗', fHasVentilation: '新风系统', fHasAC: '空调',
      fHasBathroom: '独立卫生间', fHasWIFI: 'WIFI', fHasCustom: '自定义'
    };
    var arrVal = arrValMap[boolKey];
    if (!boolKey || arrVal === undefined) return;

    var checked = this.data.form[boolKey];
    var facilities = (this.data.form.roomFacilities || []).slice();
    if (checked) {
      var i = facilities.indexOf(arrVal);
      if (i > -1) facilities.splice(i, 1);
    } else {
      facilities.push(arrVal);
    }
    var patch = {};
    patch['form.' + boolKey] = !checked;
    patch['form.roomFacilities'] = facilities;
    // 取消勾选「自定义」时同步清空输入内容，避免下次启用时残留旧值
    if (boolKey === 'fHasCustom' && checked) {
      patch['form.roomFacilitiesCustom'] = '';
    }
    this.setData(patch, function() { this.persistFormCache(); }.bind(this));
  },
  onRoomFacilitiesCustomChange(e) { this.setData({ 'form.roomFacilitiesCustom': e.detail }, function() { this.persistFormCache(); }.bind(this)); },

  // ========== 图片上传 ==========

  afterImageRead(e) {
    var that = this;
    var files = e.detail.file;
    // multiple=true 时 file 是数组，逐个上传
    var list = that.data.form.roomTypeImageUrlList;
    var pending = Array.isArray(files) ? files.length : 1;
    var successCount = 0;

    var doUpload = function(file) {
      var uploadUrl = app.globalData.baseUrl + '/member/store/uploadImg';

      wx.uploadFile({
        url: uploadUrl,
        filePath: file.url,
        name: 'file',
        header: {
          'tenant-id': app.globalData.tenantId,
          'Authorization': 'Bearer ' + app.globalData.userDatatoken.accessToken
        },
        success(res) {
          try {
            var data = JSON.parse(res.data);
            var url = data.data || '';
            if (url) {
              list.push({ url: url, isImage: true });
              successCount++;
              if (successCount >= pending) {
                that.setData({ 'form.roomTypeImageUrlList': list }, function() {
                  that.persistFormCache();
                });
              }
              return;
            }
          } catch (err) { /* ignore */ }
          wx.showToast({ title: '图片上传失败', icon: 'none' });
        },
        fail() {
          wx.showToast({ title: '图片上传失败', icon: 'none' });
        }
      });
    };

    if (Array.isArray(files)) {
      files.forEach(function(file) { doUpload(file); });
    } else {
      doUpload(files);
    }
  },

  deleteImage(e) {
    var index = e.detail.index;
    var list = this.data.form.roomTypeImageUrlList;
    list.splice(index, 1);
    this.setData({ 'form.roomTypeImageUrlList': list }, function() {
      this.persistFormCache();
    }.bind(this));
  },

  // ========== 校验 & 提交 ==========

  onSubmitSync() {
    var that = this;
    var f = this.data.form;
    var item = this.data.currentSyncItem;

    // 必填校验
    if (!f.roomClass) {
      wx.showToast({ title: '请选择门店类型', icon: 'none' });
      return;
    }
    if (!f.roomTypeImageUrlList || f.roomTypeImageUrlList.length === 0) {
      wx.showToast({ title: '请上传包型头图', icon: 'none' });
      return;
    }

    // 棋牌室字段校验
    if (f.roomClass === '0') {
      if (!f.space || isNaN(f.space) || parseInt(f.space) < 1 || parseInt(f.space) > 99) {
        wx.showToast({ title: '请输入包间面积(1-99)', icon: 'none' });
        return;
      }
      if (f.hasWindow === '') {
        wx.showToast({ title: '请选择是否有窗', icon: 'none' });
        return;
      }
      if (f.hasIndependentWashRoom === '') {
        wx.showToast({ title: '请选择是否有独立卫生间', icon: 'none' });
        return;
      }
      if (!f.tableAndChairInformation && (!f.tableAndChairInformationCustom || !f.tableAndChairInformationCustom.trim())) {
        wx.showToast({ title: '请选择或输入桌椅类型', icon: 'none' });
        return;
      }
      if (f.tableAndChairInformation === '自定义' && (!f.tableAndChairInformationCustom || !f.tableAndChairInformationCustom.trim())) {
        wx.showToast({ title: '请输入桌椅类型', icon: 'none' });
        return;
      }
    }

    // 自助KTV字段校验
    if (f.roomClass === '2') {
      if (!f.minCount || isNaN(f.minCount) || parseInt(f.minCount) < 1 || parseInt(f.minCount) > 99) {
        wx.showToast({ title: '请输入最小容纳人数(1-99)', icon: 'none' });
        return;
      }
      if (!f.maxCount || isNaN(f.maxCount) || parseInt(f.maxCount) < 1 || parseInt(f.maxCount) > 99) {
        wx.showToast({ title: '请输入最大容纳人数(1-99)', icon: 'none' });
        return;
      }
      if (!f.screenConfig) {
        wx.showToast({ title: '请选择屏幕配置', icon: 'none' });
        return;
      }
      if (!f.audioEquipment) {
        wx.showToast({ title: '请选择音响设备', icon: 'none' });
        return;
      }
      if (f.audioEquipment === '自定义' && (!f.audioEquipmentCustom || !f.audioEquipmentCustom.trim())) {
        wx.showToast({ title: '请输入音响设备名称', icon: 'none' });
        return;
      }
      if (!f.roomFacilities || !Array.isArray(f.roomFacilities) || f.roomFacilities.length === 0) {
        wx.showToast({ title: '请选择房间设施', icon: 'none' });
        return;
      }
      if (f.roomFacilities.indexOf('自定义') > -1 && (!f.roomFacilitiesCustom || !f.roomFacilitiesCustom.trim())) {
        wx.showToast({ title: '请输入其他设施名称', icon: 'none' });
        return;
      }
    }

    this.setData({ confirmLoading: true });

    // 构造 properties
    var properties = [];
    if (f.roomClass === '0') {
      // 棋牌室：space、hasWindow、hasIndependentWashRoom、tableAndChairInformation
      // tableAndChairInformation：选"自定义"时取自定义输入值
      var chairVal = f.tableAndChairInformation;
      if (f.tableAndChairInformation === '自定义' && f.tableAndChairInformationCustom && f.tableAndChairInformationCustom.trim()) {
        chairVal = f.tableAndChairInformationCustom.trim();
      }
      properties.push({ attrName: 'space', attrValue: String(f.space) });
      properties.push({ attrName: 'hasWindow', attrValue: String(f.hasWindow) });
      properties.push({ attrName: 'hasIndependentWashRoom', attrValue: String(f.hasIndependentWashRoom) });
      properties.push({ attrName: 'tableAndChairInformation', attrValue: String(chairVal) });
    } else if (f.roomClass === '2') {
      // 自助KTV：minCount、maxCount、screenConfig、audioEquipment、roomFacilities
      // audioEquipment：单选，选"自定义"时取自定义输入值
      var audioVal = f.audioEquipment;
      if (f.audioEquipment === '自定义' && f.audioEquipmentCustom && f.audioEquipmentCustom.trim()) {
        audioVal = f.audioEquipmentCustom.trim();
      }
      // roomFacilities：多选数组，去掉"自定义"字面量，替换为实际输入值
      var facilitiesList = (f.roomFacilities || []).filter(function(v) { return v !== '自定义'; });
      if (f.roomFacilitiesCustom && f.roomFacilitiesCustom.trim()) {
        facilitiesList.push(f.roomFacilitiesCustom.trim());
      }
      properties.push({ attrName: 'minCount', attrValue: String(f.minCount) });
      properties.push({ attrName: 'maxCount', attrValue: String(f.maxCount) });
      properties.push({ attrName: 'screenConfig', attrValue: String(f.screenConfig) });
      properties.push({ attrName: 'audioEquipment', attrValue: String(audioVal) });
      properties.push({ attrName: 'roomFacilities', attrValue: JSON.stringify(facilitiesList) });
    }

    // 头图 URL 列表
    var imageUrls = f.roomTypeImageUrlList.map(function(img) { return img.url; });

    // 构造 roomList
    var roomList = [];
    if (item && item.roomInfoList && item.roomInfoList.length > 0) {
      for (var i = 0; i < item.roomInfoList.length; i++) {
        var r = item.roomInfoList[i];
        var roomObj = {
          roomCode: r.roomId,
          roomName: r.roomName
        };
        // roomClass=2 (KTV) 时：roomImageUrlList 直接复用 roomTypeImageUrlList
        if (f.roomClass === '2') {
          roomObj.roomImageUrlList = imageUrls;
        }
        roomList.push(roomObj);
      }
    }

    var reqData = {
      storeId: that.data.storeId,
      roomInfoList: [{
        roomTypeId: (item && item.roomTypeId) ? item.roomTypeId : null,
        roomClass: parseInt(f.roomClass),
        roomTypeCode: (item && item.roomTypeCode) ? item.roomTypeCode : '',
        roomTypeName: (item && item.roomTypeStr) ? item.roomTypeStr : '',
        roomTypeImageUrlList: imageUrls,
        properties: properties,
        roomList: roomList
      }]
    };

    http.request(
      '/member/tuangou/roomsync',
      '1',
      'post',
      reqData,
      app.globalData.userDatatoken.accessToken,
      '同步中...',
      function success(info) {
        that.setData({ confirmLoading: false });
        if (info.code == 0) {
          wx.showToast({ title: '同步成功,预计30秒后更新', icon: 'none' , duration: 2000 });
          that.closeSyncDialog();
          setTimeout(function() {
            that.getMtRoomList();
          }, 1500);
        } else {
          wx.showModal({ content: info.msg || '同步失败', showCancel: false });
        }
      },
      function fail() {
        that.setData({ confirmLoading: false });
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    );
  },

  // ========== 删除 ==========
  onDelete(e) {
    var that = this;
    var item = e.currentTarget.dataset.item;

    wx.showModal({
      title: '删除确认',
      content: '确定要删除该房型吗？删除后将解除与美团的关联。',
      confirmText: '删除',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          http.request(
            '/member/tuangou/deleteMtRoomType',
            '1',
            'post',
            {
              storeId: that.data.storeId,
              roomTypeId: item.roomTypeId
            },
            app.globalData.userDatatoken.accessToken,
            '删除中...',
            function success(info) {
              if (info.code == 0) {
                wx.showToast({ title: '删除成功', icon: 'success' });
                setTimeout(function() {
                  that.getMtRoomList();
                }, 1500);
              } else {
                wx.showModal({ content: info.msg || '删除失败', showCancel: false });
              }
            },
            function fail() {
              wx.showToast({ title: '网络错误', icon: 'none' });
            }
          );
        }
      }
    });
  },

});
