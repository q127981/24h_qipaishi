const app = getApp()
var http = require('../../../utils/http');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: '',
    stores: [],
    storeIndex: '',
    roomList:[],
    roomIndex: '',
    deviceTypes: [{value:'',text:'请选择类型'},{value:1,text:'门禁'},{value:2,text:'空开'},{value:3,text:'云喇叭'},{value:4,text:'灯具'},{value:5,text:'密码锁'},{value:6,text:'网关'},{value:7,text:'插座'},{value:8,text:'锁球器控制器（12V）'},{value:9,text:'人脸门禁机'},{value:10,text:'智能语音喇叭'},{value:11,text:'二维码识别器'},{value:12,text:'红外控制器'},{value:13,text:'三路控制器'}],
    deviceTypeIndex: '',
    deviceType: '',
    deviceList:[],
    isIpx: app.globalData.isIpx?true:false,
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,
    showAdd: false,
    deviceSn: '',
    shareDevice: false,
    beforeCloseFunction:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getXiaLaListAdmin();
    this.setData({beforeCloseFunction: this.beforeClose()})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
      this.getDeviceList('refresh');
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    let that = this;
    that.setData({
      pageNo: 1,
      canLoadMore:true,
      deviceList:[]
  })
  that.getDeviceList("refresh");
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.getDeviceList('');
    } else {
      wx.showToast({
        title: '我是有底线的...',
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  beforeClose() {
    // 这里一定要用箭头函数，否则访问不到this
    return (type) => {
        //console.log(type)
        if (type === 'cancel') {
            // 点击取消
            return true
        }else {
            // 点击确定
        }
    }
  },
   //管理员获取门店下拉列表数据
   getXiaLaListAdmin:function(e){
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/getStoreList",
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('下拉门店数据===');
          console.info(info);
          if (info.code == 0) {
            let stores = []
            info.data.map(it => {
              stores.push({text:it.key,value:it.value})
            })
            stores.unshift({text:"请选择门店",value:""})
           that.setData({
             stores: stores,
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
    } 
  },
   //管理员获取房间下拉列表数据
   getRoomListAdmin:function(storeId){
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/getRoomList/"+storeId,
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('下拉房间数据===');
          if (info.code == 0) {
            let roomList = []
            info.data.map(it => {
              roomList.push({text:it.key,value:it.value})
            })
            roomList.unshift({text:"请选择房间",value:""})
           that.setData({
             roomList: roomList,
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
    } 
  },
   // 获取设备列表
   getDeviceList: function(e){
    let that = this
    if (app.globalData.isLogin) 
    {
      if (e == "refresh") { //刷新，page变为1
        that.setData({
          deviceList:[],
          pageNo:1,
          canLoadMore: true
        })
      }
      http.request(
        "/member/device/getDevicePage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
          "type": that.data.deviceType,
          "storeId": that.data.storeId,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            if(info.data.list.length === 0){
              that.setData({
                canLoadMore: false
              })
            }else{
               //有数据
              if(that.data.deviceList){
                //列表已有数据  那么就追加
                let arr = that.data.deviceList;
                let arrs = arr.concat(info.data.list);
                that.setData({
                  deviceList: arrs,
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total
                })
              }else{
                that.setData({
                  deviceList: info.data.list,
                  pageNo: that.data.pageNo + 1,
                });
              }
            }
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
    } 
  },
  //门店下拉菜单发生变化
  storeDropdown(event){
    this.data.stores.map(it => {
      if(it.value === event.detail){
        this.setData({
          storeId: it.value,
        })
      }
    })
    this.getDeviceList("refresh")
  },
  //类型下拉菜单发生变化
  typeDropdown(event){
    let that = this
    this.data.deviceTypes.map(it => {
      if(it.value == event.detail){
        if(it.value == -1){
          that.setData({
            deviceType: '',
          })
        }else{
          that.setData({
            deviceType: it.value,
          })
        }
        that.getDeviceList("refresh");
      }
    })
  },
    // 添加
  add(){
    this.setData({
      showAdd: true
    })
  },
  bindDeviceTypeSelect: function(e) {
    this.setData({
      deviceTypeIndex: e.detail.value,
    })
  },
  bindStoreSelect: function(e) {
    console.log(e.detail.value)
    if(e.detail.value&&e.detail.value!=0){
      var that=this;
      that.setData({
        storeIndex: e.detail.value,
        roomIndex: ''
      })
      that.getRoomListAdmin(that.data.stores[that.data.storeIndex].value)
    }
  },
  bindRoomSelect: function(e) {
    this.setData({
      roomIndex: e.detail.value,
    })
  },
  changeSwitchStatus: function() {
    this.setData({
      shareDevice: !this.data.shareDevice // 根据当前状态取反
    });
    console.log(this.data.shareDevice)
  },
  submitAdd: function(){
    var that=this;
    if(!that.data.deviceSn){
      wx.showToast({
        title: '请输入设备编号',
        icon: 'error'
      })
      return
    }
    if(!that.data.deviceTypeIndex||that.data.deviceTypeIndex==0){
      wx.showToast({
        title: '请选择设备类型',
        icon: 'error'
      })
      return
    }
    if(!that.data.storeIndex||that.data.storeIndex==0){
      wx.showToast({
        title: '请选择门店',
        icon: 'error'
      })
      return
    }
    var deviceType=that.data.deviceTypes[that.data.deviceTypeIndex].value;
    var storeId=that.data.stores[that.data.storeIndex].value;
    var roomId='';
    if(that.data.roomIndex!=0){
      roomId=that.data.roomList[that.data.roomIndex].value;
    }
    //保存数据
    if (app.globalData.isLogin) 
          {
            http.request(
              "/member/store/addDevice",
              "1",
              "post", {
                "deviceSn": that.data.deviceSn,
                "shareDevice": that.data.shareDevice,
                "deviceType": deviceType,
                "storeId": storeId,
                "roomId": roomId,
              },
              app.globalData.userDatatoken.accessToken,
              "",
              function success(info) {
                console.info('返回111===');
                if (info.code == 0) {
                  wx.showToast({
                    title: '添加成功',
                    icon: 'success'
                  })
                  that.setData({
                    deviceSn: ''
                  });
                  that.getDeviceList('refresh');
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
          } 



  },
  cancelAdd: function(){
      this.setData({
        storeIndex:'',
        deviceTypeIndex:'',
        roomIndex:'',
        shareDevice: false,
        deviceSn: '',
      })
  },
  delDevice: function(e){
    var that=this;
    var deviceId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定删除此设备绑定吗？为了避免误操作，仅允许超管操作',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/store/delDevice/"+deviceId,
              "1",
              "post", {
              },
              app.globalData.userDatatoken.accessToken,
              "",
              function success(info) {
                console.info('返回111===');
                if (info.code == 0) {
                  wx.showToast({
                    title: '删除成功',
                    icon: 'success'
                  })
                  that.getDeviceList('refresh');
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
          } 
        }
      }
    })
  }

})