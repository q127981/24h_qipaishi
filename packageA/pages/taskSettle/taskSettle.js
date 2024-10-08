// pages/taskSettle/taskSettle.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
var Moment = require('../../../lib/moment.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    option2: [
      { text: '全部状态', value: '' },
      // { text: '待接单', value: 0 },
      { text: '已接单', value: 1 },
      { text: '已开始', value: 2 },
      { text: '已完成', value: 3 },
      // { text: '已取消', value: 4 },
      { text: '被驳回', value: 5 },
      { text: '已结算', value: 6 },
    ],
    finishNum:0,//未结算数量
    status: 3,
    sdt: '',
    edt: '',
    show: false, //日期控件
    minDate: new Date(2023, 0, 1).getTime(),
    info: '', //保洁员列表传过来的信息
    money:'',
    storeId: '', //列表搜索门店id
    stores: [],
    pageNo: 1,
    pageSize: 10,
    canLoadMore: true,//是否还能加载更多
    list: [],
  },
  goSearch() {
    this.setData({ 
      show: true,
    });
  },
  onClose() {
    this.setData({ show: false });
  },
  formatDate(date) {
    date = new Date(date);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },
  onConfirm(event) {
    const [start, end] = event.detail;
    this.setData({
      show: false,
      // sdt: this.formatDate(start),
      // edt: this.formatDate(end),
      sdt: Moment(start).format("YYYY-MM-DD"),
      edt: Moment(end).format("YYYY-MM-DD")
    });
    this.getMainListdata("refresh")
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let info = JSON.parse(options.info)
    this.setData({info: info})
    this.getXiaLaListAdmin()
    this.getMainListdata("refresh")
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
    let that = this;
    that.setData({
        pageNo: 1,
        canLoadMore:true,
        list:[]
    })
    this.getMainListdata('refresh');
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let that = this;
    if (that.data.canLoadMore) {
      this.getMainListdata('')
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
  //获取列表数据
  getMainListdata:function(e){
    var that = this;
    let message = "";
    if (app.globalData.isLogin) 
    {
      if (e == "refresh") { //刷新，page变为1
        message = "正在加载"
        that.setData({
          pageNo:1,
          list:[],
          finishNum: 0
        })
      }
      http.request(
        "/member/manager/getClearManagerPage",
        "1",
        "post", {
          "pageNo": that.data.pageNo,
          "pageSize": that.data.pageSize,
          "storeId": that.data.info.storeId,
          "userId": that.data.info.userId,
          "status": that.data.status,
          "startTime": that.data.sdt,
          "endTime": that.data.edt
        },
        app.globalData.userDatatoken.accessToken,
        message,
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            if(info.data.list.length === 0){
              that.setData({
                canLoadMore: false,
                finishNum: 0
            })
            }else{
               //有数据
              if(that.data.list){
                //列表已有数据  那么就追加
                let arr = that.data.list;
                let arrs = arr.concat(info.data.list);
                that.setData({
                  list: arrs,
                  pageNo: that.data.pageNo + 1,
                  canLoadMore: arrs.length < info.data.total,
                  finishNum:info.data.total
                })
              }else{
                that.setData({
                  list: info.data.list,
                  pageNo: that.data.pageNo + 1,
                  finishNum:info.data.total
                });
              }
            }
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
  // 结算
  toSettle(){
    if(this.data.money === ''){
      wx.showToast({
        title: '请填写结算金额',
        icon: 'error'
      })
      return
    }
    let that = this
    wx.showModal({
      title: '提示',
      content: '是否确定结算？',
      complete: (res) => {
        if (res.cancel) {
          
        }
    
        if (res.confirm) {
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/manager/settlementClearUser",
              "1",
              "post", {
                "userId": that.data.info.userId,
                "storeId": that.data.info.storeId,
                "money": Number(that.data.money),
                "startTime": that.data.sdt,
                "endTime": that.data.edt
              },
              app.globalData.userDatatoken.accessToken,
              "保存中",
              function success(info) {
                console.info('返回111===');
                console.info(info);
                if (info.code == 0) {
                  wx.showToast({
                    title: '结算成功'
                  })
                  setTimeout(() => {
                    wx.navigateBack()
                  }, 1000);
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
  },
  //门店下拉菜单发生变化
  storeDropdown(event){
    //console.log(event)
    this.data.stores.map(it => {
      if(it.value === event.detail){
        this.setData({
          storeId: it.value,
        })
      }
    })
    this.getMainListdata("refresh")
  },
  //状态下拉菜单发生变化
  statusDropdown(event){
    this.data.option2.map(it => {
      if(it.value === event.detail){
        this.setData({
          status: it.value
        })
      }
    })
    this.getMainListdata("refresh")
  },
  // 详情页
  goTaskDetail(e){
    var id = e.currentTarget.dataset.info
    wx.navigateTo({
      url: '../taskDetail/taskDetail?id='+id,
    })
  },
})