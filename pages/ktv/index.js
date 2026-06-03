const app = getApp();
var http = require("../../utils/http");

Page({
  data: {
    statusBarHeight: 44,
    navBarHeight: 88,
    ktvkey: "",
    keyword: "",
    roomId: "",
    storeId: "",
    selectTab: 1,
    songList: [],
    singerList: [],
    songClassList: [],
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true, //是否还能加载更多
    showDanmu: false,
    danmuText: "",
    showQrDialog: false,
    showYidianSheet: false,
    orderedList: [],
    currentSong: null,
    sungCount: 0,
    showBokongSheet: false,
    accompanyVol: 1,
    centerPressed: false,
    shufflePressed: false,
    accompanyPressed: false,
    playPressed: false,
    repeatPressed: false,
    scorePressed: false,
    volMinusPressed: false,
    volPlusPressed: false,
    canTap: true,
    scoreEnabled: false, // 新增：评分开关状态，默认关闭
    lightIndex: 0, // 灯光控制 - 当前选中的索引
    kongtiaoShow: false, //空调控制
    temperature: 26,
    mode: "",
    verticalSwing: false,
    horizontalSwing: false,
    fanSpeed: "",
    fanDelta: "",
    power: false,
    // 新增：视图模式
    viewMode: "normal", // 'normal' | 'singer' | 'class'
    selectedSinger: null,
    selectedClass: null,
    detailSongList: [], // 详情页的歌曲列表
    scrollIntoView: "",
    showBackTop: false,
    headerHeight: 0,
  },

  onLoad(query) {
     // 兼容获取系统信息
     let systemInfo;
     try {
         systemInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
     } catch (e) {
         systemInfo = { statusBarHeight: 20 };
     }
     
     const statusBarHeight = systemInfo.statusBarHeight || 20;
     const navBarHeight = statusBarHeight + 44;

    this.setData({
      statusBarHeight,
      navBarHeight,
    });
    console.log("onload");
    // 获取到二维码原始链接内容
    const params = this.extractParams(query.q);
    const { storeId, roomId, ktvkey } = params;
    if (ktvkey) {
      this.setData({
        roomId: roomId || '',
        storeId: storeId || '',
        ktvkey: ktvkey || '',
      });
      //放到缓存
      this.setStorage();
    }
    // else{
    //   //页面参数没有 那么判断缓存有没有
    //   this.getStorage();
    // }
  },

  onShow() {
    this.getStorage();
    if (this.data.ktvkey) {
      this.getSongList("refresh");
    } else {
      this.loadDefaultSongs();
    }
  },
  onReady() {
    this.calcHeaderHeight();
  },
  calcHeaderHeight() {
    const query = wx.createSelectorQuery();
    query.select(".fixed-header").boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        this.setData({ headerHeight: res[0].height });
      }
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    let that = this;
    return {
      title: that.appName,
      path: "/pages/ktv/index",
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: "分享成功",
          icon: "success",
          duration: 2000,
        });
      },
      fail: function (res) {
        // 分享失败
      },
    };
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},
 
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log("onReachBottom");
    let that = this;
    if (!this.checkKtvkey()) return;

    if (that.data.canLoadMore) {
      if (that.data.selectTab == 1) {
        that.getSongList("");
      } else if (that.data.selectTab == 2) {
        if (that.data.viewMode == "singer") {
          that.getSongListBySinger("");
        } else {
          that.getSingerList("");
        }
      } else if (that.data.selectTab == 3) {
        // if (that.data.viewMode == "class") {
        //   that.getSongListByClass("");
        // }
      }
    } else {
      wx.showToast({
        title: "我是有底线的...",
      });
    }
  },
  loadDefaultSongs() {
    const mockData = this.generateMockSongs();
    this.setData({
      songList: mockData,
    });
  },

  generateMockSongs() {
    return [
      {
        songId: 1,
        songName: "海阔天空[MTV]",
        singerName: "Beyond",
        isScore: true,
      },
      {
        songId: 2,
        songName: "消愁[明日之子]",
        singerName: "毛不易,明日之子",
        isScore: true,
      },
      {
        songId: 3,
        songName: "刚好遇见你[HD]",
        singerName: "李玉刚",
        isScore: true,
      },
      { songId: 4, songName: "演员", singerName: "薛之谦", isScore: false },
      { songId: 5, songName: "告白气球", singerName: "周杰伦", isScore: true },
      { songId: 6, songName: "成都", singerName: "赵雷", isScore: false },
      { songId: 7, songName: "体面", singerName: "于文文", isScore: true },
      {
        songId: 8,
        songName: "起风了",
        singerName: "买辣椒也用券",
        isScore: false,
      },
      { songId: 9, songName: "晴天", singerName: "周杰伦", isScore: true },
      { songId: 10, songName: "趁早", singerName: "张宇", isScore: true },
      { songId: 11, songName: "偷心", singerName: "张学友", isScore: true },
      { songId: 12, songName: "十年", singerName: "陈奕迅", isScore: true },
      { songId: 13, songName: "过火", singerName: "张信哲", isScore: false },
      {
        songId: 14,
        songName: "爱笑的眼睛",
        singerName: "林俊杰",
        isScore: true,
      },
      { songId: 15, songName: "李白", singerName: "李荣浩", isScore: true },
    ];
  },

  checkKtvkey() {
    if (!this.data.ktvkey) {
      this.setData({ showQrDialog: true });
      return false;
    }
    return true;
  },

  onMenuTap(e) {
    if (!this.checkKtvkey()) return;

    const action = e.currentTarget.dataset.action;
    if (action === "shop") {
      this.goShop();
    } else if (action === "danmu") {
      this.showDanmuDialog();
    }
  },

  onTabTap(e) {
    if (!this.checkKtvkey()) return;

    const type = parseInt(e.currentTarget.dataset.type);
    this.checkTab({ currentTarget: { dataset: { type } } });
    setTimeout(() => this.calcHeaderHeight(), 50);
  },

  onBottomTap(e) {
    if (!this.checkKtvkey()) return;

    const action = e.currentTarget.dataset.action;

    if (action === "center") {
      this.setData({ centerPressed: true });
      setTimeout(() => {
        this.setData({ centerPressed: false });
      }, 150);
      this.qiege();
    } else if (action === "bokong") {
      this.showMenu();
    } else if (action === "yidian") {
      this.showYidian();
    }
  },

  onInputChange(e) {
    if (!this.data.ktvkey) {
      this.setData({ showQrDialog: true });
      return;
    }

    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value,
    });
  },

  clearKeyword() {
    this.setData({ keyword: "" });
  },

  scanCode() {
    if (!this.data.canTap) return;
    var that = this;
    that.setData({ canTap: false });
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        const params = that.extractParams(res.result);
        const { storeId, roomId, ktvkey } = params;
        if (params) {
          that.setData({
            roomId: roomId,
            storeId: storeId,
            ktvkey: ktvkey,
          });
          //放到缓存
          that.setStorage();
        }
        that.setData({
          showQrDialog: false,
        });
        wx.showToast({ title: "扫码成功", icon: "success" });
      },
      fail: () => {},
      complete: () => {
        setTimeout(() => this.setData({ canTap: true }), 300);
      },
    });
  },

  getSearch() {
    if (!this.checkKtvkey()) return;
    if (this.data.selectTab == 1) {
      this.getSongList("refresh");
    } else if (this.data.selectTab == 2) {
      this.getSingerList("refresh");
    } else {
      this.setData({
        selectTab: 1,
      });
      this.getSongList("refresh");
    }
  },
  getSongListBySinger(e) {
    var that = this;
    if (e == "refresh") {
      //刷新，page变为1
      that.setData({
        detailSongList: [], //列表数组
        canLoadMore: true, //是否还能加载更多
        pageNo: 1,
      });
    }
    http.request(
      "/member/ktv/getSongList",
      "1",
      "post",
      {
        pageNo: that.data.pageNo,
        pageSize: that.data.pageSize,
        roomId: that.data.roomId,
        key: that.data.ktvkey,
        singerName: that.data.selectedSinger.singerName,
      },
      app.globalData.userDatatoken.accessToken,
      "加载中...",
      function success(info) {
        if (info.code == 0) {
          if (info.data.length === 0) {
            that.setData({
              canLoadMore: false,
            });
          } else {
            //有数据
            if (that.data.detailSongList) {
              //列表已有数据  那么就追加
              let arr = that.data.detailSongList;
              let arrs = arr.concat(info.data);
              that.setData({
                detailSongList: arrs,
                pageNo: that.data.pageNo + 1,
                canLoadMore: true,
              });
            } else {
              that.setData({
                detailSongList: info.data,
                pageNo: that.data.pageNo + 1,
              });
            }
          }
        } else if (info.code == 1004004265) {
          that.clearStorage();
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
        }
      },
      function fail(info) {}
    );
  },
  getSongListByClass(e) {
    var that = this;
    if (e == "refresh") {
      //刷新，page变为1
      that.setData({
        detailSongList: [], //列表数组
        canLoadMore: true, //是否还能加载更多
        pageNo: 1,
      });
    }
    http.request(
      "/member/ktv/getSongListByClass",
      "1",
      "post",
      {
        pageNo: that.data.pageNo,
        pageSize: that.data.pageSize,
        roomId: that.data.roomId,
        key: that.data.ktvkey,
        songClassId: that.data.selectedClass.songClassId,
        songClassName: that.data.selectedClass.songClassName,
      },
      app.globalData.userDatatoken.accessToken,
      "加载中...",
      function success(info) {
        if (info.code == 0) {
          if (info.data.length === 0) {
            that.setData({
              canLoadMore: false,
            });
          } else {
            //有数据
            if (that.data.detailSongList) {
              //列表已有数据  那么就追加
              let arr = that.data.detailSongList;
              let arrs = arr.concat(info.data);
              that.setData({
                detailSongList: arrs,
                pageNo: that.data.pageNo + 1,
                canLoadMore: true,
              });
            } else {
              that.setData({
                detailSongList: info.data,
                pageNo: that.data.pageNo + 1,
              });
            }
          }
        } else if (info.code == 1004004265) {
          that.clearStorage();
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
        }
      },
      function fail(info) {}
    );
  },
  getSongList(e) {
    var that = this;
    if (e == "refresh") {
      //刷新，page变为1
      that.setData({
        songList: [], //列表数组
        canLoadMore: true, //是否还能加载更多
        pageNo: 1,
      });
    }
    http.request(
      "/member/ktv/getSongList",
      "1",
      "post",
      {
        pageNo: that.data.pageNo,
        pageSize: that.data.pageSize,
        roomId: that.data.roomId,
        key: that.data.ktvkey,
        name: that.data.keyword,
      },
      app.globalData.userDatatoken.accessToken,
      "加载中...",
      function success(info) {
        if (info.code == 0) {
          if (info.data.length === 0) {
            that.setData({
              canLoadMore: false,
            });
          } else {
            //有数据
            if (that.data.songList) {
              //列表已有数据  那么就追加
              let arr = that.data.songList;
              let arrs = arr.concat(info.data);
              that.setData({
                songList: arrs,
                pageNo: that.data.pageNo + 1,
                canLoadMore: true,
              });
            } else {
              that.setData({
                songList: info.data,
                pageNo: that.data.pageNo + 1,
              });
            }
          }
        } else if (info.code == 1004004265) {
          that.clearStorage();
          that.loadDefaultSongs();
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
          that.clearStorage();
          that.loadDefaultSongs();
        }
      },
      function fail(info) {}
    );
  },
  getSongClassList() {
    var that = this;
    http.request(
      "/member/ktv/getSongClassList",
      "1",
      "post",
      {
        pageNo: that.data.pageNo,
        pageSize: that.data.pageSize,
        roomId: that.data.roomId,
        key: that.data.ktvkey,
      },
      app.globalData.userDatatoken.accessToken,
      "加载中...",
      function success(info) {
        if (info.code == 0) {
          if (info.data.length === 0) {
          } else {
            // 根据名称长度计算样式类
            const classesWithStyle = info.data.map((item) => {
              const len = item.songClassName.length;
              let coverClass, iconClass;
              // 根据长度分配背景色
              switch (len) {
                case 2:
                  coverClass = "cover-len-2";
                  iconClass = "icon-heart";
                  break;
                case 3:
                  coverClass = "cover-len-3";
                  iconClass = "icon-mic";
                  break;
                case 4:
                  coverClass = "cover-len-4";
                  iconClass = "icon-radio";
                  break;
                case 5:
                  coverClass = "cover-len-5";
                  iconClass = "icon-list-file";
                  break;
                case 6:
                  coverClass = "cover-len-6";
                  iconClass = "icon-heart";
                  break;
                default:
                  coverClass = "cover-len-default";
                  iconClass = "icon-mic";
              }

              return {
                ...item,
                coverClass,
                iconClass,
              };
            });

            that.setData({ songClassList: classesWithStyle });
          }
        } else if (info.code == 1004004265) {
          that.clearStorage();
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
        }
      },
      function fail(info) {}
    );
  },

  checkTab(e) {
    const type = parseInt(e.currentTarget.dataset.type);
    this.setData({
      selectTab: type,
      page: 1,
      noMore: false,
    });
    // 如果切换了 Tab，先回到顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0, // 瞬间回到顶部，不要动画
    });
    if (type === 1) {
      this.getSongList("refresh");
      this.setData({
        viewMode: "normal",
      });
    } else if (type === 2) {
      this.getSingerList("refresh");
      this.setData({
        viewMode: "normal",
      });
    } else {
      this.getSongClassList();
      this.setData({
        viewMode: "normal",
      });
    }
  },

  getSingerList(e) {
    var that = this;
    if (e == "refresh") {
      //刷新，page变为1
      that.setData({
        singerList: [], //列表数组
        canLoadMore: true, //是否还能加载更多
        pageNo: 1,
      });
    }
    http.request(
      "/member/ktv/getSingerList",
      "1",
      "post",
      {
        pageNo: that.data.pageNo,
        pageSize: that.data.pageSize,
        roomId: that.data.roomId,
        key: that.data.ktvkey,
        name: that.data.keyword,
      },
      app.globalData.userDatatoken.accessToken,
      "加载中...",
      function success(info) {
        if (info.code == 0) {
          if (info.data.length === 0) {
            that.setData({
              canLoadMore: false,
            });
          } else {
            //有数据
            if (that.data.singerList) {
              //列表已有数据  那么就追加
              let arr = that.data.singerList;
              let arrs = arr.concat(info.data);
              that.setData({
                singerList: arrs,
                pageNo: that.data.pageNo + 1,
                canLoadMore: true,
              });
            } else {
              that.setData({
                singerList: info.data,
                pageNo: that.data.pageNo + 1,
              });
            }
          }
        } else if (info.code == 1004004265) {
          that.clearStorage();
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
        }
      },
      function fail(info) {}
    );
  },

  getCurrentSongList() {
    var that = this;
    http.request(
      "/member/ktv/getCurrentSongList",
      "1",
      "post",
      {
        pageNo: that.data.pageNo,
        pageSize: that.data.pageSize,
        roomId: that.data.roomId,
        key: that.data.ktvkey,
      },
      app.globalData.userDatatoken.accessToken,
      "加载中...",
      function success(info) {
        if (info.code == 0) {
          if (info.data.length === 0) {
          } else {
            that.setData({
              orderedList: info.data,
              currentSong: info.data[0],
            });
          }
        } else if (info.code == 1004004265) {
          that.clearStorage();
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
        }
      },
      function fail(info) {}
    );
  },

  loadMore() {
    if (!this.data.ktvkey) return;
    if (this.data.noMore || this.data.isLoading) return;

    this.setData({ isLoading: true });

    setTimeout(() => {
      const moreSongs = this.generateMockSongs().map((s) => ({
        ...s,
        songId: s.songId + this.data.songList.length + 100,
      }));

      this.setData({
        songList: [...this.data.songList, ...moreSongs],
        isLoading: false,
        noMore: this.data.songList.length > 40,
      });
    }, 500);
  },

  // 点歌：直接加入已点列表并置顶到第二首
  diange(e) {
    var that = this;
    if (!this.checkKtvkey()) return;

    const { index } = e.currentTarget.dataset;
    if (that.data.selectTab == 1) {
      this.setData({ [`songList[${index}]._pressed`]: true });
      setTimeout(() => {
        this.setData({ [`songList[${index}]._pressed`]: false });
      }, 150);
    } else {
      this.setData({ [`detailSongList[${index}]._pressed`]: true });
      setTimeout(() => {
        this.setData({ [`detailSongList[${index}]._pressed`]: false });
      }, 150);
    }

    const { item } = e.currentTarget.dataset;
    const orderedList = [...this.data.orderedList];

    // 检查是否已点
    const exists = orderedList.find((s) => s.songId === item.songId);
    if (exists) {
      wx.showToast({ title: "该歌曲已点", icon: "none" });
      return;
    }
    http.request(
      "/member/ktv/songCommand",
      "1",
      "post",
      {
        roomId: that.data.roomId,
        key: that.data.ktvkey,
        type: 1, //1点歌 2删除已点 3顶置歌曲
        songId: item.songId,
        songFilename: item.songFilename,
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          // 插入到第二首（索引1），如果列表为空则插入到第一首
          const insertIndex = orderedList.length === 0 ? 0 : 1;
          orderedList.splice(insertIndex, 0, { ...item });

          that.setData({
            orderedList,
            currentSong: orderedList[0] || null,
          });
          wx.showToast({ title: "操作成功", icon: "none" });
        } else if (info.code == 1004004265) {
          that.clearStorage();
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
        }
      },
      function fail(info) {}
    );
  },

  goSongList(e) {
    if (!this.checkKtvkey()) return;
    const { item } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/singer-songs/singer-songs?singerId=${item.singerId}`,
    });
  },

  goClassSongList(e) {
    if (!this.checkKtvkey()) return;
    const { item } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/class-songs/class-songs?classId=${item.classId}`,
    });
  },

  goShop() {
    // 跳转到商品点单页面
    wx.navigateTo({
      url:
        "/pages/shop/shop?storeId=" +
        this.data.storeId +
        "&roomId=" +
        this.data.roomId,
    });
  },

  showDanmuDialog() {
    this.setData({ showDanmu: true, danmuText: "" });
  },

  closeDanmuDialog() {
    this.setData({ showDanmu: false });
  },

  onDanmuInput(e) {
    this.setData({ danmuText: e.detail.value });
  },

  sendDanmu() {
    var that = this;
    if (!that.data.danmuText.trim()) {
      wx.showToast({ title: "请输入弹幕内容", icon: "none" });
      return;
    }
    http.request(
      "/member/ktv/sendBarrage",
      "1",
      "post",
      {
        roomId: that.data.roomId,
        key: that.data.ktvkey,
        content: that.data.danmuText,
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          wx.showToast({ title: "操作成功", icon: "none" });
          that.setData({
            showDanmu: false,
          });
        } else if (info.code == 1004004265) {
          that.clearStorage();
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
        }
      },
      function fail(info) {}
    );
  },

  closeQrDialog() {
    this.setData({ showQrDialog: false });
  },

  showYidian() {
    this.setData({ showYidianSheet: true });
    this.getCurrentSongList();
  },

  closeYidian() {
    this.setData({ showYidianSheet: false });
  },

  shuffleOrdered() {
    this.setData({ shufflePressed: true });
    setTimeout(() => {
      this.setData({ shufflePressed: false });
    }, 150);
    this.sendCommand(14);
    this.getCurrentSongList();
  },

  topOrdered(e) {
    const { index, item } = e.currentTarget.dataset;
    var that = this;
    this.setData({ [`orderedList[${index}]._pressed`]: true });
    setTimeout(() => {
      this.setData({ [`orderedList[${index}]._pressed`]: false });
    }, 150);

    if (index <= 1) return;
    http.request(
      "/member/ktv/songCommand",
      "1",
      "post",
      {
        roomId: that.data.roomId,
        key: that.data.ktvkey,
        type: 3, //1点歌 2删除已点 3顶置歌曲
        songId: item.songId,
        songFilename: item.songFilename,
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          const orderedList = [...that.data.orderedList];
          const item = orderedList.splice(index, 1)[0];
          orderedList.splice(1, 0, item);

          that.setData({ orderedList });
          wx.showToast({ title: "操作成功", icon: "none" });
        } else if (info.code == 1004004265) {
          that.clearStorage();
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
        }
      },
      function fail(info) {}
    );
  },

  removeOrdered(e) {
    const { index, item } = e.currentTarget.dataset;
    var that = this;

    this.setData({ [`orderedList[${index}]._delPressed`]: true });
    setTimeout(() => {
      this.setData({ [`orderedList[${index}]._delPressed`]: false });
    }, 150);

    http.request(
      "/member/ktv/songCommand",
      "1",
      "post",
      {
        roomId: that.data.roomId,
        key: that.data.ktvkey,
        type: 2, //1点歌 2删除已点 3顶置歌曲
        songId: item.songId,
        songFilename: item.songFilename,
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          const orderedList = [...that.data.orderedList];
          // orderedList.splice(index, 1);

          that.setData({
            orderedList,
            currentSong: orderedList[0] || null,
            sungCount: that.data.sungCount + 1,
          });
          wx.showToast({ title: "操作成功", icon: "none" });
        } else if (info.code == 1004004265) {
          that.clearStorage();
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
        }
      },
      function fail(info) {}
    );

    const orderedList = [...this.data.orderedList];
    orderedList.splice(index, 1);

    this.setData({
      orderedList,
      currentSong: orderedList[0] || null,
      sungCount: this.data.sungCount + 1,
    });
  },

  showMenu() {
    this.setData({ showBokongSheet: true });
  },

  closeBokong() {
    this.setData({ showBokongSheet: false });
  },

  qiege() {
    this.sendCommand(3);
  },
  /**
   *   1重唱 2原伴唱 3切歌 4暂停/播放 5音量加 6音量减 7麦克风加 8麦克风减 9静音 42 静音关
   * 10演唱模式-专业 11演唱模式-标准  12演唱模式-K歌 13演唱模式-剧院 14打乱已点 15原调 16升调 17降调 18评分开 41评分关
   * 19转播开  20转播关  21混响加 22混响减
   * 灯光 31柔和 32明亮 33动感 34抒情 35浪漫 36全开
   */
  sendCommand(type) {
    var that = this;
    http.request(
      "/member/ktv/sendCommand",
      "1",
      "post",
      {
        roomId: that.data.roomId,
        key: that.data.ktvkey,
        type: type,
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        if (info.code == 0) {
          wx.showToast({ title: "操作成功", icon: "none" });
        } else if (info.code == 1004004265) {
          that.clearStorage();
        } else {
          wx.showModal({
            content: info.msg,
            showCancel: false,
          });
        }
      },
      function fail(info) {}
    );
  },

  //暂停/播放
  togglePlay() {
    this.setData({ playPressed: true });
    setTimeout(() => {
      this.setData({ playPressed: false });
    }, 150);
    this.sendCommand(4);
  },

  //切换原唱/伴唱
  toggleAccompany() {
    this.setData({ accompanyPressed: true });
    setTimeout(() => {
      this.setData({ accompanyPressed: false });
    }, 150);
    this.sendCommand(2);
  },

  //重唱当前歌曲
  toggleRepeat() {
    this.setData({ repeatPressed: true });
    setTimeout(() => {
      this.setData({ repeatPressed: false });
    }, 150);
    this.sendCommand(1);
  },

  //切换评分
  toggleScore() {
    this.setData({ scorePressed: true });
    setTimeout(() => {
      this.setData({ scorePressed: false });
    }, 150);
    // 切换评分状态并发送对应命令
    const newState = !this.data.scoreEnabled;
    this.setData({ scoreEnabled: newState });

    if (newState) {
      // 开启评分
      this.sendCommand(18);
    } else {
      // 关闭评分
      this.sendCommand(41);
    }
  },

  changeVol(e) {
    const { delta } = e.currentTarget.dataset;
    const deltaValue = parseInt(delta);

    // 判断是 + 还是 -
    const isPlus = deltaValue > 0;
    const key = isPlus ? "volPlusPressed" : "volMinusPressed";

    this.setData({ [key]: true });
    setTimeout(() => {
      this.setData({ [key]: false });
    }, 150);
    // 根据 +/- 发送不同命令
    if (isPlus) {
      this.sendCommand(5); // 音量+
    } else {
      this.sendCommand(6); // 音量-
    }
  },

  stopPropagation() {},

  // 根据歌单名称获取封面样式
  getCoverClass(name) {
    const classes = [
      "cover-yellow",
      "cover-red",
      "cover-purple",
      "cover-pink",
      "cover-cyan",
      "cover-green",
      "cover-orange",
      "cover-blue",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return classes[Math.abs(hash) % classes.length];
  },

  // 根据歌单名称获取图标样式
  getIconClass(name) {
    const icons = ["icon-heart", "icon-mic", "icon-radio", "icon-list-file"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return icons[Math.abs(hash) % icons.length];
  },
  setStorage() {
    wx.setStorageSync("ktv_roomId", this.data.roomId);
    wx.setStorageSync("ktv_storeId", this.data.storeId);
    wx.setStorageSync("ktv_ktvkey", this.data.ktvkey);
  },
  clearStorage() {
    wx.removeStorageSync("ktv_roomId");
    wx.removeStorageSync("ktv_storeId");
    wx.removeStorageSync("ktv_ktvkey");
    this.setData({
      roomId: "",
      storeId: "",
      ktvkey: "",
      songList: [],
      pageNo: 1,
      keyword: "",
      selectTab: 1,
    });
    this.loadDefaultSongs();
  },
  getStorage() {
    const roomId = wx.getStorageSync("ktv_roomId") || '';
    const storeId = wx.getStorageSync("ktv_storeId") || '';
    const ktvkey = wx.getStorageSync("ktv_ktvkey") || '';
    console.log(
      "roomId:" + roomId + ",storeId:" + storeId + ",ktvkey:" + ktvkey
    );
    this.setData({
      roomId: roomId,
      storeId: storeId,
      ktvkey: ktvkey,
    });

    // this.setData({
    //   roomId: 24,
    //   storeId: 16,
    //   ktvkey: "test123",
    // });
  },
  changeLight(e) {
    const { index } = e.currentTarget.dataset;
    const idx = parseInt(index);

    this.setData({ lightIndex: idx });

    // 固定命令映射
    const commands = [31, 32, 33, 34, 35];
    this.sendCommand(commands[idx]);

    // const names = ['柔和', '明亮', '动感', '抒情', '浪漫'];
    // wx.showToast({ title: `已切换${names[idx]}`, icon: 'none' });
  },
  showModal() {
    this.setData({ kongtiaoShow: true });
    this.closeBokong();
  },
  hideModal() {
    this.setData({ kongtiaoShow: false });
  },

  adjustTemperature(e) {
    //调节温度 升高温度67 降低温度68
    const delta = parseInt(e.currentTarget.dataset.delta);
    if (delta == 1) {
      this.controlKT(67);
    } else {
      this.controlKT(68);
    }
  },

  setMode(e) {
    const newMode = e.currentTarget.dataset.mode;
    //设置模式 制冷20 制热21 自动24
    this.setData({ mode: newMode });
    setTimeout(() => {
      this.setData({ mode: "" });
    }, 300);
    if (newMode == "cool") {
      this.controlKT(20);
    } else if (newMode == "heat") {
      this.controlKT(21);
    } else if (newMode == "auto") {
      this.controlKT(24);
    }
  },

  toggleVerticalSwing() {
    //上下扫风 开始63 停止65
    this.setData({ verticalSwing: !this.data.verticalSwing });
    if (this.data.verticalSwing) {
      this.controlKT(63);
    } else {
      this.controlKT(65);
    }
  },

  toggleHorizontalSwing() {
    //左右扫风 开始64 停止66
    this.setData({ horizontalSwing: !this.data.horizontalSwing });
    if (this.data.horizontalSwing) {
      this.controlKT(64);
    } else {
      this.controlKT(66);
    }
  },

  adjustFanSpeed(e) {
    //增大风速69 减小风速70
    const delta = parseInt(e.currentTarget.dataset.delta);
    let newSpeed = this.data.fanSpeed + delta;
    newSpeed = Math.max(1, Math.min(5, newSpeed));
    console.log("delta:" + delta);
    console.log("newSpeed:" + newSpeed);
    this.setData({
      fanSpeed: newSpeed,
      fanDelta: delta,
    });
    if (delta == 1) {
      this.controlKT(69);
    } else {
      this.controlKT(70);
    }
  },
  togglePowerOn() {
    // 开机 0
    this.controlKT(0);
  },
  togglePowerOff() {
    // 关机 1
    this.controlKT(1);
  },
  controlKT(cmd) {
    let that = this;
    http.request(
      "/member/ktv/controlKT",
      "1",
      "post",
      {
        roomId: that.data.roomId,
        key: that.data.ktvkey,
        type: cmd,
      },
      app.globalData.userDatatoken.accessToken,
      "提交中...",
      function success(info) {
        if (info.code == 0) {
          wx.showToast({
            title: "操作成功",
            icon: "none",
          });
        } else {
          wx.showModal({
            title: "提示",
            content: info.msg,
            showCancel: false,
          });
        }
      },
      function fail(info) {}
    );
  },
  // 显示歌手详情
  showSingerDetail(e) {
    const item = e.currentTarget.dataset.item;
    // 先回到顶部，再切换视图
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
    this.setData({
      viewMode: "singer",
      selectedSinger: item,
    });
    // TODO: 调用接口获取歌手歌曲列表，赋值给 detailSongList
    this.getSongListBySinger("refresh");
    // 等 DOM 更新后重新计算高度
    setTimeout(() => this.calcHeaderHeight(), 50);
  },

  // 显示歌单详情
  showClassDetail(e) {
    const item = e.currentTarget.dataset.item;
    // 先回到顶部，再切换视图
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
    this.setData({
      viewMode: "class",
      selectedClass: item,
      detailSongList: [], // 先清空，实际应调用接口获取该歌单歌曲
    });
    // TODO: 调用接口获取歌单歌曲列表，赋值给 detailSongList
    this.getSongListByClass("refresh");
    // 等 DOM 更新后重新计算高度
    setTimeout(() => this.calcHeaderHeight(), 50);
  },

  // 返回列表
  backToList() {
    // 先回到顶部，再切换视图
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
    this.setData({
      viewMode: "normal",
      selectedSinger: null,
      selectedClass: null,
      detailSongList: [],
    });
    setTimeout(() => this.calcHeaderHeight(), 50);
  },
  extractParams(raw) {
    if (!raw) return {};
    
    try {
        const decoded = raw.includes('%') ? decodeURIComponent(raw) : raw;
        const search = decoded.includes('?') ? decoded.split('?')[1] : decoded;
        if (!search) return {};
        
        return Object.fromEntries(
            search.split('&').map(p => {
                const [k, ...v] = p.split('=');
                return [k, v.join('=')]; // key 不解码，value 不解码（你的值没有二次编码）
            })
        );
    } catch (e) {
        console.error('extractParams error:', e);
        return {};
    }
},
});
