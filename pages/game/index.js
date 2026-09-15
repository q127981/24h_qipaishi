// pages/game/index.js
const app = getApp();
var http = require('../../utils/http');
var Moment = require('../../lib/moment.js');

Page({

  data: {
    isLogin: app.globalData.isLogin,
    userinfo: {
      nickname: '',
      avatar: '',
    },
    myCurrentGame: null,
    hasMyUnsettledGame: 0,
    settledGames: [],
    pageNo: 1,
    pageSize: 5,
    hasMore: true,
    loading: false,
    createShow: false,
    form: {
      mode: 0,
      multiple: 1,
      gratuityEnabled: 0,
      gratuity: 0,
    },
    wxacodeUrl: '',
    newGameKeyNo: '',
    newGameId: '',
    avatarTipShow: false,
    modeDesc: '',
    multiplePresets: [1, 2, 5, 10, 20],
  },

  onLoad(options) {
    var that = this;
    this.updateModeDesc(0);
    console.log('[DEBUG onLoad] 原始options:', JSON.stringify(options));
    if (options.keyNo) {
      console.log('[DEBUG onLoad] 通过options.keyNo触发, keyNo=', options.keyNo);
      that.handleScanJoin(options.keyNo);
    }
    if (options.scene) {
      const scene = decodeURIComponent(options.scene);
      console.log('[DEBUG onLoad] 通过options.scene触发, scene=', scene);
      // 支持纯 keyNo 或 keyNo=xxx 格式
      let keyNo = scene;
      if (scene.indexOf('=') >= 0) {
        const params = scene.split('&').reduce((acc, pair) => {
          const [key, value] = pair.split('=');
          acc[key] = value;
          return acc;
        }, {});
        if (params.keyNo) keyNo = params.keyNo;
      }
        if (keyNo && /^[A-HJ-NP-Za-hj-np-z0-9]{10}$/.test(keyNo.trim())) {
          console.log('[DEBUG onLoad] scene解析后keyNo有效, keyNo=', keyNo.trim());
          that.handleScanJoin(keyNo.trim());
        } else {
          console.log('[DEBUG onLoad] scene解析后keyNo无效, keyNo=', keyNo, '正则匹配结果:', /^[A-HJ-NP-Za-hj-np-z0-9]{10}$/.test(keyNo.trim()));
        }
    }
  },

  onShow() {
    // 优先从 storage 同步读取，避免 onLaunch 晚于 onShow 导致 globalData 未初始化时的登录循环
    var storedToken = wx.getStorageSync('userDatatoken');
    var hasToken = !!(storedToken && storedToken.accessToken);
    this.setData({ isLogin: hasToken });
    if (!hasToken) {
      wx.navigateTo({ url: '../login/login' });
      return;
    }
    this.loadIndexData();
    this.loadSettledGames(true);
  },

  injectTeaUser(game) {
    if (!game || parseInt(game.gratuity) !== 1) return;
    var gs = parseInt(game.gratuityScore) || 0;
    if (game.users && !game.users.some(function(u) { return parseInt(u.isGratuity) === 1; })) {
      game.users.unshift({
        id: 'tea-fee',
        userId: -1,
        nickname: '茶水费',
        avatar: '',
        score: gs,
        isGratuity: 1,
      });
    }
  },

  loadIndexData() {
    var that = this;
    http.request(
      "/member/scoreGame/index",
      "1",
      "get",
      {},
      app.globalData.userDatatoken.accessToken,
      "",
      function (info) {
        if (info.code == 0) {
          var data = info.data || {};
          var currentGame = data.myCurrentGame || null;
          if (currentGame) that.injectTeaUser(currentGame);
          that.setData({
            userinfo: {
              nickname: data.nickname || '玩家',
              avatar: data.avatar || '',
            },
            myCurrentGame: currentGame,
            hasMyUnsettledGame: data.hasMyUnsettledGame || 0,
          });
        } else if (info.code == 1004005002) {
          that.setData({ avatarTipShow: true });
        }
      },
      function (fail) {
        wx.showToast({ title: '加载失败，下拉刷新重试', icon: 'none' });
      }
    );
  },

  loadSettledGames(refresh) {
    var that = this;
    if (that.data.loading) return;
    if (!refresh && !that.data.hasMore) return;

    that.setData({ loading: true });
    var pageNo = refresh ? 1 : that.data.pageNo;

    http.request(
      "/member/scoreGame/records",
      "1",
      "get",
      { pageNo: pageNo, pageSize: that.data.pageSize },
      app.globalData.userDatatoken.accessToken,
      "",
      function (info) {
        if (info.code == 0) {
          var list = info.data.list || [];
          list.forEach(function(g) { that.injectTeaUser(g); });
          that.setData({
            settledGames: refresh ? list : that.data.settledGames.concat(list),
            pageNo: pageNo + 1,
            hasMore: list.length >= that.data.pageSize,
            loading: false,
          });
        } else {
          that.setData({ loading: false });
        }
      },
      function (fail) {
        that.setData({ loading: false });
      }
    );
  },

  onReachBottom() {
    this.loadSettledGames(false);
  },

  onPullDownRefresh() {
    this.loadIndexData();
    this.loadSettledGames(true);
    setTimeout(() => { wx.stopPullDownRefresh(); }, 500);
  },

  goCompleteUserInfo() {
    wx.navigateTo({ url: '../setUserInfo/setUserInfo' });
  },

  closeAvatarTip() {
    this.setData({ avatarTipShow: false });
  },

  goCurrentGame() {
    var that = this;
    var game = that.data.myCurrentGame;
    if (!game) return;
    wx.navigateTo({
      url: '/pages/game/room?gameId=' + game.gameId,
    });
  },

  goSettledGame(e) {
    var gameId = e.currentTarget.dataset.gameid;
    wx.navigateTo({
      url: '/pages/game/room?gameId=' + gameId,
    });
  },

  openCreateDialog() {
    this.setData({ createShow: true });
  },

  closeCreateDialog() {
    this.setData({ createShow: false });
  },

  // ===== 计分模式 =====
  onModeChange(e) {
    var mode = Number(e.currentTarget.dataset.mode);
    this.setData({ 'form.mode': mode });
    this.updateModeDesc(mode);
  },

  updateModeDesc(mode) {
    var desc = '';
    if (mode === 0) {
      desc = '多人计分：所有玩家均可给任意玩家加减分，适合多人同时记分场景。';
    } else {
      desc = '房主计分：仅房主可以给玩家加减分，避免误操作，适合房主统筹场景。';
    }
    this.setData({ modeDesc: desc });
  },

  // ===== 茶水费开关 =====
  onGratuitySwitch(e) {
    var enabled = e.detail.value;
    this.setData({
      'form.gratuityEnabled': enabled ? 1 : 0,
    });
  },

  onGratuityChange(e) {
    var val = parseInt(e.detail.value) || 0;
    if (val < 0) val = 0;
    if (val > 999) val = 999;
    this.setData({ 'form.gratuity': val });
  },

  // ===== 倍率快捷选项 =====
  onMultiplePreset(e) {
    var val = Number(e.currentTarget.dataset.value);
    this.setData({ 'form.multiple': val });
  },

  onMultipleMinus() {
    var val = this.data.form.multiple - 1;
    if (val < 1) val = 1;
    this.setData({ 'form.multiple': val });
  },

  onMultiplePlus() {
    var val = this.data.form.multiple + 1;
    if (val > 100) val = 100;
    this.setData({ 'form.multiple': val });
  },

  submitCreate() {
    var that = this;
    var form = that.data.form;
    http.request(
      "/member/scoreGame/create",
      "1",
      "post",
      {
        mode: form.mode,
        multiple: form.multiple,
        gratuity: form.gratuityEnabled === 1 ? 1 : 0,
      },
      app.globalData.userDatatoken.accessToken,
      "创建中...",
      function (info) {
        if (info.code == 0) {
          wx.navigateTo({
            url: '/pages/game/room?gameId=' + info.data.gameId,
          });
        } else {
          wx.showModal({ title: '提示', content: info.msg, showCancel: false });
        }
      },
      function (fail) {}
    );
  },

  closeShareDialog() {
    this.setData({ shareShow: false });
    if (this.data.newGameId) {
      wx.navigateTo({
        url: '/pages/game/room?gameId=' + this.data.newGameId,
      });
    }
  },

  handleScanJoin(keyNo) {
    var that = this;
    console.log('[DEBUG handleScanJoin] 开始加入房间, keyNo=', keyNo);
    http.request(
      "/member/scoreGame/join",
      "1",
      "post",
      { keyNo: keyNo },
      app.globalData.userDatatoken.accessToken,
      "加入中...",
      function (info) {
        console.log('[DEBUG handleScanJoin] 请求返回, code=', info.code, 'msg=', info.msg, 'data=', JSON.stringify(info.data));
        if (info.code == 0) {
          wx.navigateTo({
            url: '/pages/game/room?gameId=' + info.data.gameId,
          });
        } else {
          wx.showModal({ title: '提示', content: info.msg, showCancel: false });
        }
      },
      function (fail) {}
    );
  },

  joinByScan() {
    var that = this;
    wx.scanCode({
      success: function (res) {
        console.log('[DEBUG joinByScan] scanCode res:', JSON.stringify(res));
        // 优先从 path 中取 scene（体验版扫码 path 包含完整参数，result 可能是乱码）
        var path = res.path || '';
        var sceneMatch = path.match(/[?&]scene=([^&]*)/);
        if (sceneMatch && sceneMatch[1]) {
          var scene = decodeURIComponent(sceneMatch[1]);
          console.log('[DEBUG joinByScan] 从path解析scene=', scene);
          // 复用 onLoad 中 scene 的解析逻辑
          let keyNo = scene;
          if (scene.indexOf('=') >= 0) {
            var params = scene.split('&').reduce(function(acc, pair) {
              var kv = pair.split('=');
              acc[kv[0]] = kv[1];
              return acc;
            }, {});
            if (params.keyNo) keyNo = params.keyNo;
          }
          if (keyNo && /^[A-HJ-NP-Za-hj-np-z0-9]{10}$/.test(keyNo.trim())) {
            that.handleScanJoin(keyNo.trim());
          } else {
            wx.showToast({ title: '无效的房间码', icon: 'none' });
          }
          return;
        }
        // 兜底：直接使用 result
        var result = res.result || '';
        var match = result.match(/keyNo[=/]([A-Za-z0-9]{6,16})/);
        if (match && match[1]) {
          that.handleScanJoin(match[1]);
        } else if (/^[A-HJ-NP-Za-hj-np-z0-9]{10}$/.test(result.trim())) {
          that.handleScanJoin(result.trim());
        } else {
          wx.showToast({ title: '无效的房间码', icon: 'none' });
        }
      },
      fail: function () {
        wx.showToast({ title: '扫码失败', icon: 'none' });
      }
    });
  },

  hideRecord(e) {
    var gameId = e.currentTarget.dataset.gameid;
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要隐藏此记录吗？隐藏后您将不再看到此记录。',
      success: function (res) {
        if (res.confirm) {
          http.request(
            "/member/scoreGame/hide/" + gameId,
            "1",
            "post",
            {},
            app.globalData.userDatatoken.accessToken,
            "",
            function (info) {
              if (info.code == 0) {
                wx.showToast({ title: '已隐藏', icon: 'success' });
                that.loadSettledGames(true);
              } else {
                wx.showToast({ title: info.msg || '操作失败', icon: 'none' });
              }
            },
            function (fail) {}
          );
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '快来一起计分！',
      path: '/pages/game/index',
    };
  },

  goModifyUserInfo() {
    wx.navigateTo({ url: '../setUserInfo/setUserInfo' });
  },
});