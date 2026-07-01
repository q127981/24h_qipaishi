// packageA/pages/tuangou/mtPackage.js
const app = getApp();
var http = require('../../../utils/http');

var ROOM_TYPE_OPTIONS = [
  { value: 1, label: '小包' },
  { value: 2, label: '中包' },
  { value: 3, label: '大包' },
  { value: 4, label: '豪包' },
  { value: 5, label: '商务包' },
  { value: 6, label: '斯洛克' },
  { value: 7, label: '黑八' },
  { value: 8, label: '美式球桌' }
];
var ROOM_TYPE_MAP = {};
ROOM_TYPE_OPTIONS.forEach(function(o) { ROOM_TYPE_MAP[o.value] = o.label; });

var WEEK_OPTIONS = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' }
];
var WEEK_MAP = {};
WEEK_OPTIONS.forEach(function(o) { WEEK_MAP[o.value] = o.label; });
var WEEK_SHORT = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '日' };

var HOLIDAY_OPTIONS = [
  { value: 101, label: '元旦' },
  { value: 102, label: '春节' },
  { value: 103, label: '劳动节' },
  { value: 104, label: '端午节' },
  { value: 105, label: '国庆节' },
  { value: 106, label: '清明节' },
  { value: 107, label: '中秋节' },
  { value: 108, label: '儿童节' },
  { value: 109, label: '元宵节' },
  { value: 110, label: '七夕' },
  { value: 111, label: '冬至' },
  { value: 201, label: '情人节' },
  { value: 202, label: '圣诞节' },
  { value: 203, label: '平安夜' }
];
var HOLIDAY_MAP = {};
HOLIDAY_OPTIONS.forEach(function(o) { HOLIDAY_MAP[o.value] = o.label; });

function buildHourOptions() {
  var arr = [];
  for (var i = 0; i <= 23; i++) arr.push(i + ' 时');
  return arr;
}

function buildEmptyForm() {
  return {
    id: null,
    dealGroupIdStr: '',
    roomTypeIdsMap: {},
    startHour: 0,
    endHour: 0,
    enableWeekMap: {},
    holidaysMap: {},
    timeSelectType: 2
  };
}

function toInt(v, def) {
  var n = parseInt(v, 10);
  return isNaN(n) ? def : n;
}

Page({

  data: {
    storeId: '',
    list: [],
    loaded: false,
    dialogVisible: false,
    editMode: false,
    confirmLoading: false,
    form: buildEmptyForm(),
    roomTypeOptions: ROOM_TYPE_OPTIONS,
    weekOptions: WEEK_OPTIONS,
    holidayOptions: HOLIDAY_OPTIONS,
    hourOptions: buildHourOptions(),
    forceMode2: false
  },

  onLoad(options) {
    if (options.storeId) {
      this.setData({ storeId: options.storeId });
    }
    this.refreshList();
  },

  onPullDownRefresh() {
    this.refreshList();
    wx.stopPullDownRefresh();
  },

  refreshList() {
    var that = this;
    var storeId = that.data.storeId;
    if (!storeId) {
      wx.showToast({ title: '门店ID缺失', icon: 'none' });
      return;
    }
    http.request(
      '/member/tuangou/getYudingPkgList',
      '1',
      'post',
      { storeId: storeId },
      app.globalData.userDatatoken.accessToken,
      '正在加载',
      function success(info) {
        if (info.code != 0) {
          wx.showModal({ content: info.msg || '获取套餐失败', showCancel: false });
          that.setData({ loaded: true });
          return;
        }
        var arr = info.data || [];
        var processed = arr.map(function(p) { return that.normalizeItem(p); });
        that.setData({ list: processed, loaded: true });
      },
      function fail() {
        wx.showToast({ title: '网络错误', icon: 'none' });
        that.setData({ loaded: true });
      }
    );
  },

  normalizeItem: function(p) {
    function split(str) {
      if (!str) return [];
      return String(str).split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s !== ''; });
    }
    var roomIds = split(p.roomTypeIds).map(function(s) { return toInt(s, null); }).filter(function(n) { return n !== null; });
    var weeks = split(p.enableWeek).map(function(s) { return toInt(s, null); }).filter(function(n) { return n !== null; });
    var holidays = split(p.holidays).map(function(s) { return toInt(s, null); }).filter(function(n) { return n !== null; });
    function namesOf(ids, map) { return ids.map(function(id) { return map[id] || ('' + id); }); }
    var startHour = p.startHour == null ? 0 : p.startHour;
    var endHour = p.endHour == null ? 0 : p.endHour;
    var timeRangeText;
    if (startHour === endHour) {
      timeRangeText = '全天 24h';
    } else if (startHour < endHour) {
      timeRangeText = startHour + ':00 - ' + endHour + ':00';
    } else {
      timeRangeText = startHour + ':00 - 次日 ' + endHour + ':00';
    }
    return {
      id: p.id,
      dealGroupId: p.dealGroupId,
      timeSelectType: p.timeSelectType,
      timeRangeText: timeRangeText,
      roomTypeNames: namesOf(roomIds, ROOM_TYPE_MAP),
      enableWeekShorts: namesOf(weeks, WEEK_SHORT),
      holidayShorts: namesOf(holidays, HOLIDAY_MAP).join('')
    };
  },

  // ============================================
  // 弹窗 — 新增 / 编辑
  // ============================================
  openCreateDialog() {
    var form = buildEmptyForm();
    form.timeSelectType = 2;
    this.setData({ dialogVisible: true, editMode: false, form: form, forceMode2: false, confirmLoading: false });
  },

  openEditDialog(e) {
    var that = this;
    var idx = e.currentTarget.dataset.index;
    var pkg = that.data.list[idx];
    if (!pkg) return;
    // 从接口拿最新一条避免列表展示字段被解析损耗
    http.request(
      '/member/tuangou/getYudingPkgList',
      '1',
      'post',
      { storeId: that.data.storeId },
      app.globalData.userDatatoken.accessToken,
      '',
      function success(info) {
        if (info.code == 0 && info.data) {
          var original = (info.data || []).find(function(x) { return x.id == pkg.id; });
          if (original) that.fillEditForm(original);
          else that.fillEditForm(pkg);
        } else {
          that.fillEditForm(pkg);
        }
      },
      function fail() { that.fillEditForm(pkg); }
    );
  },

  fillEditForm(p) {
    function split(str) {
      var obj = {};
      if (!str) return obj;
      String(str).split(',').forEach(function(s) {
        s = s.trim();
        if (s !== '') obj[s] = true;
      });
      return obj;
    }
    var form = {
      id: p.id,
      dealGroupIdStr: p.dealGroupId != null ? String(p.dealGroupId) : '',
      roomTypeIdsMap: split(p.roomTypeIds),
      startHour: p.startHour == null ? 0 : p.startHour,
      endHour: p.endHour == null ? 0 : p.endHour,
      enableWeekMap: split(p.enableWeek),
      holidaysMap: split(p.holidays),
      timeSelectType: p.timeSelectType || 1
    };
    var forceMode2 = form.startHour === form.endHour;
    if (forceMode2) form.timeSelectType = 2;
    this.setData({ dialogVisible: true, editMode: true, form: form, forceMode2: forceMode2, confirmLoading: false });
  },

  closeDialog() {
    this.setData({ dialogVisible: false });
  },

  // ============================================
  // 表单字段
  // ============================================
  onDealGroupIdChange(e) {
    this.setData({ 'form.dealGroupIdStr': e.detail });
  },

  onStartHourChange(e) {
    this.updateHour('startHour', parseInt(e.detail.value, 10));
  },

  onEndHourChange(e) {
    this.updateHour('endHour', parseInt(e.detail.value, 10));
  },

  updateHour(key, value) {
    var form = this.data.form;
    form[key] = value;
    var forceMode2 = form.startHour === form.endHour;
    if (forceMode2) form.timeSelectType = 2;
    this.setData({ form: form, forceMode2: forceMode2 });
  },

  onRoomTypeToggle(e) {
    var value = String(e.currentTarget.dataset.value);
    var map = Object.assign({}, this.data.form.roomTypeIdsMap);
    if (map[value]) delete map[value]; else map[value] = true;
    this.setData({ 'form.roomTypeIdsMap': map });
  },

  onWeekToggle(e) {
    var value = String(e.currentTarget.dataset.value);
    var map = Object.assign({}, this.data.form.enableWeekMap);
    if (map[value]) delete map[value]; else map[value] = true;
    this.setData({ 'form.enableWeekMap': map });
  },

  onHolidayToggle(e) {
    var value = String(e.currentTarget.dataset.value);
    var map = Object.assign({}, this.data.form.holidaysMap);
    if (map[value]) delete map[value]; else map[value] = true;
    this.setData({ 'form.holidaysMap': map });
  },

  onModeToggle(e) {
    var mode = parseInt(e.currentTarget.dataset.mode, 10);
    if (this.data.forceMode2 && mode === 1) {
      wx.showToast({ title: '24小时可用只能选进场模式', icon: 'none' });
      return;
    }
    this.setData({ 'form.timeSelectType': mode });
  },

  // ============================================
  // 保存
  // ============================================
  onSave() {
    var that = this;
    if (that.data.confirmLoading) return;
    var form = that.data.form;

    var dealGroupId = parseInt(form.dealGroupIdStr, 10);
    if (!dealGroupId || isNaN(dealGroupId)) {
      wx.showToast({ title: '请输入美团套餐ID', icon: 'none' });
      return;
    }
    var roomTypeIds = Object.keys(form.roomTypeIdsMap || {});
    if (!roomTypeIds.length) {
      wx.showToast({ title: '请选择包间类型', icon: 'none' });
      return;
    }
    var enableWeek = Object.keys(form.enableWeekMap || {});
    if (!enableWeek.length) {
      wx.showToast({ title: '请选择可用星期', icon: 'none' });
      return;
    }
    var startHour = form.startHour;
    var endHour = form.endHour;
    var forceMode2 = startHour === endHour;
    var timeSelectType = form.timeSelectType;
    if (forceMode2 && timeSelectType !== 2) {
      wx.showToast({ title: '24小时可用只能选进场模式', icon: 'none' });
      return;
    }
    var holidays = Object.keys(form.holidaysMap || {});

    var payload = {
      storeId: that.data.storeId,
      dealGroupId: dealGroupId,
      roomTypeIds: roomTypeIds.join(','),
      startHour: startHour,
      endHour: endHour,
      enableWeek: enableWeek.join(','),
      holidays: holidays.length ? holidays.join(',') : null,
      timeSelectType: timeSelectType
    };

    that.setData({ confirmLoading: true });
    http.request(
      '/member/tuangou/createRelate',
      '1',
      'post',
      payload,
      app.globalData.userDatatoken.accessToken,
      '保存中...',
      function success(info) {
        if (info.code == 0) {
          wx.showToast({ title: '保存成功', icon: 'success' });
          that.setData({ dialogVisible: false, confirmLoading: false });
          setTimeout(function() { that.refreshList(); }, 600);
        } else {
          wx.showModal({ content: info.msg || '保存失败', showCancel: false });
          that.setData({ confirmLoading: false });
        }
      },
      function fail() {
        wx.showToast({ title: '网络错误', icon: 'none' });
        that.setData({ confirmLoading: false });
      }
    );
  }

})
