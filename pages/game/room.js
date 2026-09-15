// pages/game/room.js
const app = getApp();
var http = require('../../utils/http');
var plugin = requirePlugin('WechatSI');

Page({

  data: {
    gameId: null,
    currentUserId: null,
    isOwner: 0,
    settlement: 0,
    mode: 0,
    multiple: 1,
    gratuity: 0,
    voiceEnabled: 0,
    keyNo: '',
    users: [],
    records: [],
    recordsLoading: false,
    recordsNoMore: false,

    inviteShow: false,
    wxacodeUrl: '',

    scoreShow: false,
    scoreTarget: null,
    currentUserInfo: null,

    batchScoreShow: false,
    batchUsers: [],
    batchTotal: 0,
    quickPreset: [{ value: 1 }],
    refresherTriggered: false,

    settleShow: false,
    settleCountdown: 3,
    settleTimer: null,
    settleBeforeCloseFunction: null,

    innerAudioContext: null,
    _refreshTimer: null,
  },

  onLoad(options) {
    var gameId = options.gameId;
    if (!gameId) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack();
      return;
    }
    this.setData({ gameId: Number(gameId) });
    // 用 localStorage 标记：每个 gameId 只播一次"欢迎加入房间"，避免页面重建后重复
    this._joinedKey = '_joined_' + (this.data.gameId || '');
    try {
      var joined = wx.getStorageSync(this._joinedKey);
      this._joinedSpoken = (joined === '1');
    } catch(e) { this._joinedSpoken = false; }
    // 构造结算弹窗的 before-close 回调（van-dialog 用法：before-close 接收一个 function）
    this.setData({ settleBeforeCloseFunction: this.settleBeforeClose() });
  },

  onShow() {
    var that = this;
    this.loadCurrentUserInfo(function() {
      that.loadDetail();
    });
    this._startRefreshTimer();
  },

  _startRefreshTimer() {
    var that = this;
    this._stopRefreshTimer();
    this._refreshTimer = setInterval(function() {
      that.loadDetail();
    }, 60000);
  },

  _stopRefreshTimer() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  },

  // 加载当前登录用户信息（昵称/头像/userId） - 仅本页本地变量
  loadCurrentUserInfo(cb, retryCount) {
    var that = this;
    if (!app.globalData.userDatatoken || !app.globalData.userDatatoken.accessToken) {
      if (typeof cb == 'function') cb();
      return;
    }
    retryCount = retryCount || 0;
    http.request(
      "/member/user/get",
      "1",
      "get",
      {},
      app.globalData.userDatatoken.accessToken,
      "",
      function(info) {
        if (info && info.code == 0 && info.data) {
          that.setData({ currentUserInfo: info.data });
          if (typeof cb == 'function') cb();
        } else {
          // 失败：最多重试 2 次
          if (retryCount < 2) {
            that.loadCurrentUserInfo(cb, retryCount + 1);
          } else {
            if (typeof cb == 'function') cb();
          }
        }
      },
      function() {
        if (retryCount < 2) {
          that.loadCurrentUserInfo(cb, retryCount + 1);
        } else {
          if (typeof cb == 'function') cb();
        }
      }
    );
  },

  // == 页面销毁：停止 TTS ==
  onHide() {
    this._ttsStop();
    this._stopRefreshTimer();
  },

  onUnload() {
    this._ttsStop();
    this._stopRefreshTimer();
  },

  // == TTS（队列 FIFO，ctx.onEnded 触发下一条） ==
  _ttsStop() {
    this._ttsQueue = [];
    this._ttsCtx = null;
    if (this.data.innerAudioContext) {
      this.data.innerAudioContext.stop();
    }
  },

  // 统一 TTS 入口：传入文本数组，队列播放
  _ttsSpeak(texts) {
    if (!texts || !texts.length) return;
    if (this.data.voiceEnabled !== 1) return;
    var that = this;
    if (!this._ttsQueue) this._ttsQueue = [];
    texts.forEach(function(t) { that._ttsQueue.push(t); });
    if (!this._ttsCtx) this._playNextTts();
  },

  _playNextTts() {
    var that = this;
    if (!this._ttsQueue || !this._ttsQueue.length) {
      this._ttsCtx = null;
      return;
    }
    if (this.data.voiceEnabled !== 1) {
      this._ttsQueue = [];
      this._ttsCtx = null;
      return;
    }
    var text = this._ttsQueue.shift();
    var ctx = that.data.innerAudioContext;
    if (!ctx) {
      ctx = wx.createInnerAudioContext();
      that.setData({ innerAudioContext: ctx });
    } else {
      ctx.stop();
    }
    this._ttsCtx = ctx;
    plugin.textToSpeech({
      lang: 'zh_CN',
      content: text,
      success: function(res) {
        ctx.src = res.filename;
        ctx.play();
        ctx.onEnded(function() { that._playNextTts(); });
        ctx.onError(function() { that._playNextTts(); });
      },
      fail: function() { that._playNextTts(); }
    });
  },

  // 下拉刷新：scroll-view refresher 用 refresher-triggered 双向绑定控制动画状态
  onPullDownRefresh() {
    var that = this;
    that.setData({ refresherTriggered: true });
    that.loadDetail();
    setTimeout(function () { that.setData({ refresherTriggered: false }); }, 800);
  },

  // 手动刷新记录（重新拉 detail 获取最新 20 条）
  onRefreshRecords() {
    var that = this;
    this.setData({ records: [], recordsNoMore: false });
    this.loadDetail();
  },

  // 点击"更多"：一次性加载全部记录
  onLoadMoreRecords() {
    if (this.data.recordsNoMore || this.data.recordsLoading) return;
    var that = this;
    this.setData({ recordsLoading: true });
    http.request(
      "/member/scoreGame/records/" + that.data.gameId,
      "1",
      "get",
      {},
      app.globalData.userDatatoken.accessToken,
      "",
      function(info) {
        that.setData({ recordsLoading: false });
        if (info.code == 0) {
          var rows = (info.data || []).map(function(r) {
            r.timeText = r.createTime || '';
            return r;
          });
          that.setData({ records: rows, recordsNoMore: true });
        }
      },
      function() {
        that.setData({ recordsLoading: false });
      }
    );
  },

  // == 单独加载当前用户的语音开关状态 ==
  _loadVoiceStatus() {
    var that = this;
    http.request(
      "/member/scoreGame/voice/" + that.data.gameId,
      "1",
      "get",
      {},
      app.globalData.userDatatoken.accessToken,
      "",
      function(info) {
        if (info.code == 0) {
          var enabled = info.data == true || info.data == 'true' || info.data == 1 || info.data == '1';
          that.setData({ voiceEnabled: enabled ? 1 : 0 });
        }
      },
      function() {}
    );
  },

  // == 数据加载 ==
  loadDetail() {
    var that = this;
    http.request(
      "/member/scoreGame/detail/" + that.data.gameId,
      "1",
      "get",
      {},
      app.globalData.userDatatoken.accessToken,
      "",
      function (info) {
        if (info.code == 0) {
          var d = info.data || {};
          var multiple = parseInt(d.multiple) || 1;
          // currentUserId 优先取 currentUserInfo.id（最可靠），兜底取 detail 返回的 ownerUserId 做比对
          var uid = (that.data.currentUserInfo && that.data.currentUserInfo.id) != null
            ? String(that.data.currentUserInfo.id) : null;
          var ownerUid = d.ownerUserId != null ? String(d.ownerUserId) : null;
          // 通过 currentUserId 与 ownerUserId 对比判断当前用户是否为房主
          var isOwner = (uid != null && uid === ownerUid) ? 1 : 0;
          var users = (d.users || []).map(function(u) {
            var mapped = {
              id: u.id,
              userId: u.userId != null ? String(u.userId) : u.userId,
              nickname: u.nickname || '玩家',
              avatar: u.avatar || '',
              score: parseInt(u.score) || 0,
              rank: parseInt(u.rank) || 0,
              isOwner: parseInt(u.isOwner) || 0,
            };
            return mapped;
          });
          var gratuityScore = parseInt(d.gratuityScore) || 0;
          var hasTea = parseInt(d.gratuity) == 1;
          if (hasTea) {
            users.unshift({
              id: 'tea-fee',
              userId: '-1',
              nickname: '茶水费',
              avatar: '',
              score: gratuityScore,
              rank: 0,
              isGratuity: 1,
              isOwner: 0,
            });
          }
          // 用 currentUserInfo 里最新的头像/昵称强制覆盖 users 数组中自己那一项
          // 兜底：即使后端 join 的 member_user 数据暂未生效，前端也能实时刷新
          if (uid) {
            var me = that.data.currentUserInfo || {};
            var latestNick = me.nickname;
            var latestAvatar = me.avatar;
            users = users.map(function(u) {
              if (String(u.userId) === uid) {
                var updated = Object.assign({}, u);
                if (latestNick) updated.nickname = latestNick;
                if (latestAvatar) updated.avatar = latestAvatar;
                return updated;
              }
              return u;
            });
          }
          that.setData({
            currentUserId: uid,
            isOwner: isOwner,
            settlement: parseInt(d.settlement) || 0,
            mode: parseInt(d.mode) || 0,
            multiple: multiple,
            gratuity: parseInt(d.gratuity) || 0,
            gratuityScore: parseInt(d.gratuityScore) || 0,
            keyNo: d.keyNo || '',
            users: users,
            records: (d.records || []).map(function(r) {
              r.timeText = r.createTime || '';
              return r;
            }),
          }, function() {
            // 首次进入房间播报（仅播一次，localStorage 持久化）
            if (!that._joinedSpoken) {
              that._joinedSpoken = true;
              try { wx.setStorageSync(that._joinedKey, '1'); } catch(e) {}
              that._ttsSpeak(['欢迎加入房间']);
            }
          });
          that.syncBatchPending();
          // 单独拉取当前用户的语音开关状态（不在 detail 中返回）
          that._loadVoiceStatus();
        } else if (info.code == 1004005102) {
          wx.showModal({
            title: '提示',
            content: '您不在此房间内',
            showCancel: false,
            success: function() { wx.navigateBack(); }
          });
        } else {
          wx.showModal({ title: '提示', content: info.msg, showCancel: false });
        }
      },
      function () {
        wx.showToast({ title: '加载失败，下拉刷新重试', icon: 'none' });
      }
    );
  },

  // 保持批量弹窗中已有输入值与刷新后的当前分值同步（pendingScore 不变，仅 score 字段更新）
  syncBatchPending() {
    var that = this;
    if (!that.data.batchScoreShow || !that.data.batchUsers.length) return;
    var batch = that.data.batchUsers;
    var freshUsers = that.data.users;
    var changed = false;
    var updated = batch.map(function(b) {
      var f = freshUsers.find(function(u) { return u.userId == b.userId; });
      if (f) {
        var newObj = Object.assign({}, b);
        newObj.score = f.score || 0;
        if (newObj.score !== b.score) changed = true;
        return newObj;
      }
      return b;
    });
    if (changed) that.setData({ batchUsers: updated });
  },

  // == 邀请好友 ==
  showInvite() {
    var that = this;
    if (that.data.wxacodeUrl) {
      that.setData({ inviteShow: true });
      return;
    }
    http.request(
      "/member/scoreGame/wxacode",
      "1",
      "get",
      { keyNo: that.data.keyNo },
      app.globalData.userDatatoken.accessToken,
      "",
      function(info) {
        if (info.code == 0) {
          that.setData({ inviteShow: true, wxacodeUrl: info.data || '' });
        } else {
          wx.showToast({ title: info.msg || '获取二维码失败', icon: 'none' });
        }
      },
      function() {}
    );
  },
  closeInvite() { this.setData({ inviteShow: false }); },
  copyKeyNo() {
    wx.setClipboardData({
      data: this.data.keyNo,
      success: function() { wx.showToast({ title: '已复制', icon: 'success' }); }
    });
  },
  onShareAppMessage() {
    return {
      title: '快来一起计分！房间号：' + this.data.keyNo,
      path: '/pages/game/index?keyNo=' + this.data.keyNo,
    };
  },

  // == 修改信息：直接跳转 setUserInfo 页面完成 ==
  goModifyUserInfo() {
    wx.navigateTo({ url: '/pages/setUserInfo/setUserInfo' });
  },

  onSelfBlock() {
    wx.showToast({ title: '不可以给自己加分', icon: 'none' });
  },

  // == 语音 ==
  toggleVoice() {
    var that = this;
    if (this._voiceReqing) return;
    this._voiceReqing = true;
    // 记录点击前的状态，用于失败回滚
    var prev = this.data.voiceEnabled;
    var next = prev == 1 ? 0 : 1;
    // 先切换 UI，用户立即感知
    this.setData({ voiceEnabled: next });
    wx.showToast({ title: next == 1 ? '语音已开启' : '语音已关闭', icon: 'none', duration: 1500 });
    http.request(
      "/member/scoreGame/voice/" + that.data.gameId, "1", "post", {},
      app.globalData.userDatatoken.accessToken, "",
      function(info) {
        that._voiceReqing = false;
        if (info.code == 0) {
          var enabled = info.data == true || info.data == 'true' || info.data == 1 || info.data == '1';
          that.setData({ voiceEnabled: enabled ? 1 : 0 });
        } else {
          // 失败回滚到点击前状态
          that.setData({ voiceEnabled: prev });
          wx.showToast({ title: info.msg || '操作失败', icon: 'none' });
        }
      },
      function() {
        that._voiceReqing = false;
        that.setData({ voiceEnabled: prev });
        wx.showToast({ title: '网络异常', icon: 'none' });
      }
    );
  },

  // == 退出 ==
  exitRoom() {
    var that = this;
    wx.showModal({
      title: '退出房间',
      content: '确定要退出当前房间吗？',
      success: function(res) {
        if (!res.confirm) return;
        http.request(
          "/member/scoreGame/quit/" + that.data.gameId,
          "1",
          "post",
          {},
          app.globalData.userDatatoken.accessToken,
          "",
          function(info) {
            if (info.code == 0) {
              wx.navigateBack();
            } else {
              wx.showToast({ title: info.msg || '退出失败', icon: 'none' });
            }
          },
          function() { wx.showToast({ title: '网络错误', icon: 'none' }); }
        );
      }
    });
  },

  // == 单人加分（复用批量组件，单个用户） ==
  onPlayerTap(e) {
    var ds = e.currentTarget.dataset || {};
    var uid = ds.uid;
    var isGratuity = parseInt(ds.gratuity) || 0;
    var user = this.data.users.find(function(u) { return String(u.userId) == String(uid); });
    if (!user) return;
    if (this.data.settlement == 1) {
      wx.showToast({ title: '对局已结算，无法计分', icon: 'none' }); return;
    }
    // 房主计分模式下，仅房主可操作
    if (parseInt(this.data.mode) === 1 && !this.data.isOwner) {
      wx.showToast({ title: '仅房主可计分', icon: 'none' }); return;
    }
    // 强制拦截：当前用户绝对不能给自己加分（茶水费除外）
    // userId 一律从 currentUserInfo.id 取（/member/user/get 返回的字段就是 id，不是 userId）
    var myUid = (this.data.currentUserInfo && this.data.currentUserInfo.id) || null;
    if (myUid != null) myUid = String(myUid);
    if (!isGratuity && myUid != null && String(uid) == myUid) {
      wx.showToast({ title: '不可以给自己加分', icon: 'none' });
      return;
    }
    var mult = this.data.multiple || 1;
    var single = [{
      userId: String(uid),
      nickname: user.nickname || ds.nick || '玩家',
      avatar: user.avatar || ds.avatar || '',
      isGratuity: isGratuity,
      score: user.score || 0,
      pendingScore: 0,
    }];
    this.setData({
      batchUsers: single,
      batchTotal: 0,
      scoreShow: true,
      scoreTarget: single[0],
      quickPreset: [1, 2, 3, 4, 5, 6].map(function(n) { return { value: n * mult }; }),
    });
  },

  closeScore() {
    this.setData({ scoreShow: false, scoreTarget: null, batchUsers: [], batchTotal: 0 });
  },

  // 复用的快捷选项和输入处理（复用批量 API）
  onScoreInput(e) {
    // 单人弹窗复用 batchInput
    this.onBatchInput(e);
  },

  onScoreDotTap(e) {
    // 单人弹窗复用 batchDot
    this.onBatchDotTap(e);
  },

  submitScore() {
    var that = this;
    var bi = (that.data.batchUsers || [])[0];
    if (!bi) return;
    var myUid = (that.data.currentUserInfo && that.data.currentUserInfo.id) || null;
    if (myUid) myUid = String(myUid);
    if (myUid && String(bi.userId) == myUid && !bi.isGratuity) {
      wx.showToast({ title: '不可以给自己加分', icon: 'none' }); return;
    }
    var finalScore = bi.pendingScore || 0;
    if (finalScore <= 0) { wx.showToast({ title: '请输入分值', icon: 'none' }); return; }

    // 记录提交前自己分数（用于提交后验证扣分是否真的执行）
    var myBefore = (this.data.users || []).find(function(u) {
      return myUid && String(u.userId) == String(myUid);
    });
    var myBeforeScore = myBefore ? myBefore.score : null;

    // 后端 /score 已实现：目标加分 + 操作人自动扣分（茶水费不计），前端只调一次
    wx.showLoading({ title: '提交中...', mask: true });
    http.request(
      "/member/scoreGame/score", "1", "post",
      { gameId: that.data.gameId, targetUserId: String(bi.userId), scoreChange: finalScore, isGratuity: bi.isGratuity || 0 },
      app.globalData.userDatatoken.accessToken, "",
      function(info) {
        wx.hideLoading();
        if (info.code == 0) {
          wx.showToast({ title: '加分成功', icon: 'success' });
          // TTS：直接用昵称 + 分值构造播报文本，不依赖后端 content 字段
          var nick = bi.nickname || '玩家';
          that._ttsSpeak([nick + '加' + finalScore + '分']);
          that.closeScore();
          that.loadDetail();
          // 等待 600ms 确保后端事务已提交 + Redis 缓存已失效，再拉最新详情
          setTimeout(function() {
            that.loadDetail();
            // 校验自己的分数是否真的扣了
            setTimeout(function() {
              if (myBeforeScore == null) return;
              var meNow = (that.data.users || []).find(function(u) {
                return myUid && String(u.userId) == String(myUid);
              });
              if (meNow && !bi.isGratuity) {
                var expected = myBeforeScore - finalScore;
                if (meNow.score !== expected) {
                  console.warn('[submitScore] 自己分数未正确扣减，before=' + myBeforeScore + ' now=' + meNow.score + ' expected=' + expected);
                }
              }
            }, 200);
          }, 600);
        } else {
          wx.showToast({ title: info.msg || '加分失败', icon: 'none' });
        }
      },
      function() {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    );
  },

  // == 批量加分 ==
  openBatchScore() {
    var that = this;
    var myUid = (that.data.currentUserInfo && that.data.currentUserInfo.id) || null;
    if (myUid != null) myUid = String(myUid);
    // 如果还没有自己的 userId，主动加载一次（确保能正确过滤自己）
    if (myUid == null) {
      wx.showLoading({ title: '加载中...', mask: true });
      this.loadCurrentUserInfo(function() {
        wx.hideLoading();
        that.openBatchScore();
      });
      return;
    }
    var teaRow = (that.data.users || []).find(function(u) { return u.isGratuity == 1; });
    var list = (that.data.users || [])
      .filter(function(u) {
        // 排除茶水费和当前用户自己（用字符串比较，避免数字/字符串类型不一致）
        if (u.isGratuity == 1) return false;
        return String(u.userId) !== myUid;
      })
      .map(function(u) {
        return {
          userId: String(u.userId),
          nickname: u.nickname || '玩家',
          avatar: u.avatar || '',
          isGratuity: 0,
          score: u.score || 0,
          pendingScore: 0,
        };
      });
    if (teaRow) {
      list.unshift({
        userId: String(teaRow.userId),
        nickname: teaRow.nickname || '茶水费',
        avatar: '',
        isGratuity: 1,
        score: teaRow.score || 0,
        pendingScore: 0,
      });
    }
    if (!list.length) {
      wx.showToast({ title: '暂无可加分的玩家', icon: 'none' });
      return;
    }
    var mult = that.data.multiple || 1;
    this.setData({
      batchScoreShow: true,
      batchUsers: list,
      batchTotal: 0,
      quickPreset: [1, 2, 3, 4, 5, 6].map(function(n) { return { value: n * mult }; }),
    });
  },

  closeBatchScore() {
    this.setData({ batchScoreShow: false, batchUsers: [], batchTotal: 0 });
  },

  onBatchInput(e) {
    var uid = String(e.currentTarget.dataset.uid);
    var val = Math.max(0, parseInt(e.detail.value) || 0);
    if (val > 999) val = 999;
    var updated = this.data.batchUsers.map(function(u) {
      if (String(u.userId) == uid) u.pendingScore = val;
      return u;
    });
    this.setData({ batchUsers: updated });
    this._calcBatchTotal();
  },

  onBatchDotTap(e) {
    var uid = String(e.currentTarget.dataset.uid);
    var score = parseInt(e.currentTarget.dataset.score) || 0;
    var that = this;
    var updated = that.data.batchUsers.map(function(u) {
      if (String(u.userId) == uid) {
        // 再次点击同一个选项 = 取消选择（分值回到 0）
        if (u.pendingScore == score) {
          u.pendingScore = 0;
        } else {
          u.pendingScore = score;
        }
      }
      return u;
    });
    that.setData({ batchUsers: updated });
    that._calcBatchTotal();
  },

  _calcBatchTotal() {
    var total = 0;
    this.data.batchUsers.forEach(function(u) { total += (u.pendingScore || 0); });
    this.setData({ batchTotal: total });
  },

  submitBatchScore() {
    var that = this;
    var myUid = (that.data.currentUserInfo && that.data.currentUserInfo.id) || null;
    if (myUid) myUid = String(myUid);
    var myNickname = (that.data.currentUserInfo && that.data.currentUserInfo.nickname) || '我';
    var tasks = (this.data.batchUsers || []).filter(function(u) {
      // 二次过滤：排除自己 + pendingScore > 0
      var isSelf = myUid && String(u.userId) == myUid && !u.isGratuity;
      return !isSelf && (u.pendingScore || 0) > 0;
    });
    if (!tasks.length) { wx.showToast({ title: '请设置加分步数', icon: 'none' }); return; }

    wx.showLoading({ title: '提交中...', mask: true });

    // 顺序链：每条请求完成后才发下一条，最大程度避免并发竞争
    var chain = Promise.resolve();
    var success = 0, failed = 0;
    tasks.forEach(function(u) {
      chain = chain.then(function() {
        return new Promise(function(resolve) {
          var finalScore = u.pendingScore || 0;
          http.request(
            "/member/scoreGame/score", "1", "post",
            { gameId: that.data.gameId, targetUserId: u.userId, scoreChange: finalScore, isGratuity: u.isGratuity || 0 },
            app.globalData.userDatatoken.accessToken, "",
            function(info) {
              if (info.code == 0) { success++; }
              else { failed++; }
              resolve();
            },
            function() { failed++; resolve(); }
          );
        });
      });
    });

    chain.then(function() {
      wx.hideLoading();
      if (success && !failed) wx.showToast({ title: '批量加分成功', icon: 'success' });
      else if (success > 0) wx.showToast({ title: '部分失败', icon: 'none' });
      else wx.showToast({ title: '全部失败', icon: 'none' });
      // TTS：播报操作人完成了批量加分
      if (success > 0) {
        that._ttsSpeak([myNickname + '完成了批量加分']);
      }
      if (success > 0) {
        that.closeBatchScore();
        that.loadDetail();
      }
    });
  },

  // == 结算 ==
  openSettle() {
    this.setData({ settleShow: true, settleCountdown: 3 });
    this._startCountdown();
  },

  closeSettle() {
    // 此处仅作废：实际关闭统一由 before-close 回调处理
  },

  // 构造 van-dialog 的 before-close 回调（参考 orderDetail.js 的 _stopOrderBeforeClose）
  // action: 'confirm' | 'cancel' | 'overlay'
  // 返回 false 阻止关闭，返回 true 放行
  settleBeforeClose() {
    var that = this;
    return function(action) {
      if (that.data.settleCountdown > 0) {
        wx.showToast({ title: '请等待倒计时结束', icon: 'none' });
        return false;
      }
      // 倒计时结束后：取消/遮罩放行并清状态；确认交给 onSettleConfirm 处理
      if (action === 'cancel' || action === 'overlay') {
        if (that.data.settleTimer) { clearInterval(that.data.settleTimer); }
        that.setData({ settleShow: false, settleTimer: null, settleCountdown: 3 });
        return true;
      }
      return true;
    };
  },

  _startCountdown() {
    var that = this;
    if (that.data.settleTimer) clearInterval(that.data.settleTimer);
    var t = setInterval(function() {
      var n = that.data.settleCountdown - 1;
      if (n <= 0) { clearInterval(t); that.setData({ settleCountdown: 0, settleTimer: null }); }
      else that.setData({ settleCountdown: n });
    }, 1000);
    that.setData({ settleTimer: t });
  },

  onSettleConfirm() {
    var that = this;
    if (that.data.settleCountdown > 0) {
      wx.showToast({ title: '请等待 ' + that.data.settleCountdown + ' 秒后再确认', icon: 'none' });
      return;
    }
    that.confirmSettle();
  },

  onSettleOverlayClick() {
    wx.showToast({ title: '请等待倒计时结束或点击取消', icon: 'none' });
  },

  confirmSettle() {
    var that = this;
    if (that.data.settleCountdown > 0) {
      wx.showToast({ title: '请等待倒计时结束', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '结算中...' });
    http.request(
      "/member/scoreGame/settle/" + that.data.gameId, "1", "post", {},
      app.globalData.userDatatoken.accessToken, "",
      function(info) {
        wx.hideLoading();
        if (info.code == 0) {
          that.setData({ settleShow: false, settleTimer: null, settleCountdown: 3, settlement: 1 });
          wx.showToast({ title: '结算成功', icon: 'success' });
          that.loadDetail();
        } else {
          wx.showToast({ title: info.msg || '结算失败', icon: 'none' });
        }
      },
      function() { wx.hideLoading(); }
    );
  },
});