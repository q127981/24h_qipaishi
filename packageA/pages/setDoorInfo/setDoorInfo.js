// pages/setDoorInfo/setDoorInfo.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: '',
    roomClassList: [{id:0,name:'棋牌'},{id:1,name:'台球'},{id:2,name:'自习室'}],
    rcIndex: '',
    types: [{id:1,name:'小包'},{id:2,name:'中包'},{id:3,name:'大包'},{id:4,name:'豪包'},{id:5,name:'商务包'}],
    storeId: '',
    roomId: '',
    roomName: '',
    roomCallName: '',
    jumpClear: false,
    type: '',
    roomClass: '',
    price: '',
    deposit: '',
    tongxiaoPrice: '',
    minHour: '',
    leadHour: '',
    leadDay: '',
    label: '',
    sortId: '',
    yunlabaSound: '',
    fileList: [],
    banTimeStart: '',
    banTimeEnd: '',
    showtime: false, //时间弹
    timetype: '', //点击的开始还是结束
    currentDate: '12:00',
    showtimefalge:false,
    filter(type, options) {
      if (type === 'minute') {
        return options.filter((option) => option % 30 === 0);
      }
      return options;
    },
    showLabel: false,
    labels: [],
    isIpx: app.globalData.isIpx?true:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(options.storeId){
      this.setData({
        storeId: Number(options.storeId)
      })
    }
    if(options.roomId){
      this.setData({
        roomId: Number(options.roomId)
      })
      this.getData()
    }
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
  // 获取详情
  getData: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/getRoomDetail/"+that.data.roomId,
        "1",
        "get", {
          "roomId": that.data.roomId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            let fileList = []
            if(info.data.imageUrls){
              let arr = info.data.imageUrls.split(",")
              arr.map(it => {
                fileList.push({url:it})
              })
            }
            let ind = ''
            that.data.types.map((it,index) => {
              if(it.id == info.data.type){
                ind = index
              }
            })
            let rcIndex='';
            that.data.roomClassList.map((it,index) => {
              if(it.id == info.data.roomClass){
                rcIndex = index
              }
            })
            that.setData({
              index: ind,
              rcIndex: rcIndex,
              roomId: info.data.roomId,
              roomName: info.data.roomName,
              roomCallName: info.data.roomCallName,
              jumpClear: info.data.jumpClear,
              type: info.data.type,
              roomClass: info.data.roomClass,
              price: info.data.price,
              deposit: info.data.deposit,
              leadHour: info.data.leadHour,
              minHour: info.data.minHour,
              leadDay: info.data.leadDay,
              tongxiaoPrice: info.data.tongxiaoPrice,
              label: info.data.label,
              sortId: info.data.sortId,
              yunlabaSound: info.data.yunlabaSound,
              fileList: fileList,
              banTimeStart: info.data.banTimeStart,
              banTimeEnd: info.data.banTimeEnd,
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
  bindTypeChange: function(e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value,
      type: this.data.types[e.detail.value].id
    })
  },
  bindRoomClassChange: function(e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      rcIndex: e.detail.value,
      roomClass: this.data.roomClassList[e.detail.value].id
    })
  },
  // 图片上传
  afterRead(event) {
    let that = this
    const { file } = event.detail;
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
        // 上传完成需要更新 fileList
        var data = JSON.parse(res.data)
        const { fileList = [] } = that.data;
          fileList.push({ url: data.data });
          that.setData({ fileList: fileList });
      },
    });
  },
  delete(event){
    let index = event.detail.index
    const { fileList = [] } = this.data;
    fileList.splice(index,1)
    this.setData({fileList})
  },
  // 选时间
  chooseTime(e) {
    let timetype = e.currentTarget.dataset.type
    this.setData({ 
      showtime: true,
      timetype: timetype
    });
  },
  // 比较时间大小
  CompareDate:function (time1,time2)
    {
        var date = new Date();
        if(time1 && time2){
          var a = time1.split(":");
          var b = time2.split(":");
          return date.setHours(a[0],a[1]) < date.setHours(b[0],b[1]);
        }else{
          return true
        }
  },
  // 时间选择后赋值
  timeChange:function(event){
    let that = this
    if(that.data.timetype == 'start'){
      that.setData({
        showtime: false,
        banTimeStart: event.detail,
      })
    }else if(that.data.timetype == 'end'){
      that.setData({
        showtime: false,
        banTimeEnd: event.detail,
      })
    }
  },
  timeCancel:function(){
    let that = this
    that.setData({
      showtime: false
    })
  },

  // 取消
  cancel: function(){
    wx.navigateBack({
      delta: 1,
    })
  },
  // 保存
  submit: function(){
    console.log(this.data)
    if(this.data.roomName && this.data.roomCallName && this.data.type && this.data.price 
      && this.data.tongxiaoPrice
      && this.data.minHour && this.data.leadHour && this.data.leadDay  
      && this.data.label && this.data.fileList.length){
      let that = this
      let imgs = []
      that.data.fileList.map(it => {
        imgs.push(it.url)
      })
      if (app.globalData.isLogin) 
      {
        http.request(
          "/member/store/saveRoomDetail",
          "1",
          "post", {
            "roomId": that.data.roomId,
            "storeId": that.data.storeId,
            "roomName": that.data.roomName,
            "roomCallName": that.data.roomCallName,
            "jumpClear": that.data.jumpClear,
            "type": that.data.type,
            "roomClass": that.data.roomClass,
            "price": that.data.price,
            "deposit": that.data.deposit,
            "minHour": that.data.minHour,
            "leadHour": that.data.leadHour,
            "leadDay": that.data.leadDay,
            "tongxiaoPrice": that.data.tongxiaoPrice,
            "label": that.data.label,
            "imageUrls": imgs.join(","),
            "sortId": that.data.sortId,
            "yunlabaSound": that.data.yunlabaSound,
            "banTimeStart": that.data.banTimeStart,
            "banTimeEnd": that.data.banTimeEnd,
          },
          app.globalData.userDatatoken.accessToken,
          "",
          function success(info) {
            console.info('返回111===');
            console.info(info);
            if (info.code == 0) {
              wx.showToast({
                title: '设置成功',
                icon: 'success'
              })
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1,
                })
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
    }else{
      wx.showToast({
        title: '请填写完整',
        icon: 'none'
      })
    }
  },
  // 输入框只能输入数字
  inputNumber: function(e) {
    let that = this
    let value = e.detail.value  
    var anumber = value.replace(/[^\d]/g,'');
    that.setData({
      sortId: anumber
    })
    return anumber
  },
  // 输入框只能输入数字和小数点
  inputNumberDot: function(e) {
    let value = e.detail.value  
    return value.replace(/[^\d.]/g,'')
  },

 
  checkboxChange(e) {
    //console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    const labels = this.data.labels
    const values = e.detail.value
    for (let i = 0, lenI = labels.length; i < lenI; ++i) {
      labels[i].checked = false
      for (let j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (labels[i].label === values[j]) {
          labels[i].checked = true
          break
        }
      }
    }
    this.setData({
      labels: labels
    })
  },
 
  //清除禁用时间
  clearBanTime: function(){
    this.setData({
      banTimeStart: '',
      banTimeEnd: ''
    })

  },
  changeSwitchStatus: function() {
    this.setData({
      jumpClear: !this.data.jumpClear // 根据当前状态取反
    });
    console.log(this.data.jumpClear)
  },

})