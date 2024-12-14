// packageA/pages/addLock/addLock.js
const app = getApp()
const { lang } = require('../../../lib/moment');
var http = require('../../../utils/http');
var lock = require('../../../utils/lock');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx ? true : false,
    storeId:''  ,  //门店id
    kindList:[],   //分类列表
    name:'',       //分类名称
    picUrl:[],     //分类图片
    status:0,      //分类状态
    showremove:false,  //是否显示删除弹框
    showAddKind:false, //是否显示添加分类弹框
    showUpKind:false,  //是否显示修改分类弹框
    kindId:'',     //分类id
    index:'',      // 点击修改获取到的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      let that = this
      that.setData({
        storeId:options.storeId
      })
      that.getKindlist()
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  // 获取商品分类列表
  getKindlist: function () {
    let that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/product/category/list",
        "1",
        "get",
        {
          "shopId": that.data.storeId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            const kindList = info.data
            console.log(kindList)
            that.setData({
                kindList: kindList, 
            });
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {
          wx.stopPullDownRefresh();
        }
      );
    }
  },
  // 添加商品分类
  addKind: function () {
    let that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/product/category/create",
        "1",
        "post",
        {
          "shopId": that.data.storeId,
          "name":that.data.name,
          "picUrl":that.data.picUrl[0].url,
          "status":that.data.status
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            console.log(info)
            that.getKindlist()
            that.setData({
                name:'',
                picUrl:[]
            })
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {
          wx.stopPullDownRefresh();
        }
      );
    }
  },
  // 点击添加商品分类
  gotoAdd:function(){
    let that = this
    that.setData({
        showAddKind:true
    })
  },
  // 图片上传
  afterRead(event) {
    let that = this
    const { file } = event.detail;
    //console.log(file)
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    wx.uploadFile({
      url: app.globalData.baseUrl+'/member/store/uploadImg',
      filePath: file.url,
      name: 'file',
      header: {
        'tenant-id': app.globalData.tenantId,
        'Content-Type': 'application/json',
        'Authorization':'Bearer '+app.globalData.userDatatoken.accessToken,
      },
      success(res) {
        const data = JSON.parse(res.data)
          const { picUrl = [] } = that.data;
          picUrl.push({ url: data.data });
          that.setData({ picUrl: picUrl });        
      },
    });
  },
  //删除图片
  delete(event){
    let that = this
    that.setData({
        picUrl:[]
    })
  },
  // 点击删除按钮
  deleteKind:function(e){
    let that = this
    that.setData({
        kindId:e.currentTarget.dataset.id,
        showremove:true
    })
  },
  // 删除分类
  remove:function(){
    let that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/product/category/delete/"+that.data.kindId,
        "1",
        "post",
        {},
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            that.getKindlist()
            that.setData({
                kindId:'',
            })
          } else {
            wx.showModal({
                content: info.msg,
                showCancel: false,
              });
          }
        },
        function fail(info) {
          wx.stopPullDownRefresh();
        }
      );
    }
  },
  // 点击修改按钮
  goupdate:function(e){
    let that = this
    const index = e.currentTarget.dataset.index
    const kind = that.data.kindList[index]
    let picUrl = []
    picUrl.push({url:kind.picUrl})
    that.setData({
        index:index,
        showUpKind:true,
        name:kind.name,
        picUrl:picUrl,
        kindId:kind.id
    })
  },
  // 点击确认修改
  upKind:function(){
    let that = this;
    if (app.globalData.isLogin) {
      http.request(
        "/product/category/update",
        "1",
        "post",
        {
          "id": that.data.kindId,
          "shopId": that.data.storeId,
          "name":that.data.name,
          "picUrl":that.data.picUrl[0].url,
          "status":that.data.status
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            console.log(info)
            that.getKindlist()
            that.setData({
                name:'',
                picUrl:[],
                kindId:'',
            })
          } else {
            wx.showModal({
              content: info.msg,
              showCancel: false,
            });
          }
        },
        function fail(info) {
          wx.stopPullDownRefresh();
        }
      );
    }

  },
  // 取消按钮
  cancel:function(){
      let that = this
      that.setData({
        name:'',
        picUrl:[],
      })
  },
  
})