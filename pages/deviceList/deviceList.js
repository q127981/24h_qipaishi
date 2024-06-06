const app = getApp()
var http = require('../../utils/http');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: '', //列表搜索门店id
    stores: [],
    deviceTypes: [{value:'',text:'所有设备'},{value:1,text:'门禁'},{value:2,text:'空开'},{value:3,text:'云喇叭'},{value:4,text:'灯具'},{value:5,text:'密码锁'},{value:6,text:'网关'},{value:7,text:'插座'}],
    deviceType: '',
    deviceList:[],
    isIpx: app.globalData.isIpx?true:false,
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getXiaLaListAdmin();
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
    that.data.pageNo = 1;
    this.getDeviceList("refresh");
    that.data.canLoadMore = true;
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      that.data.pageNo++;
      this.getDeviceList('');
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
            stores.unshift({text:"全部门店",value:""})
           that.setData({
             stores: stores,
             storeId: stores[0].value
           })
          }else{
            wx.showModal({
              content: '请求服务异常，请稍后重试',
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
            if (e == "refresh"){
              that.setData({
                deviceList: info.data.list
              })
            }else{
              if (info.data != null && info.data.list != null && info.data.list.length < 10) {
                that.setData({
                  canLoadMore: false
                })
              }
              let arr = that.data.deviceList;
              let arrs = arr.concat(info.data.list)
              that.setData({
                deviceList: arrs,
              })
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
})