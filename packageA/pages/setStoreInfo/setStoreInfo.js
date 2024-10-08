// pages/setStoreInfo/setStoreInfo.js
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList1: [],
    fileList2: [],
    fileList3: [],
    btnfileList: [],
    tgfileList: [],
    openfileList: [],
    wififileList: [],
    kffileList: [],
    czfileList: [],
    qhfileList: [],
    storeId: '', 
    storeName: '',
    cityName: '',
    address: '',
    wifiInfo: '',
    wifiPwd: '',
    simpleModel: true,
    kefuPhone: '',
    notice: '',
    headImg: '',
    btnImg: '',
    storeEnvImg: '',
    lat: '',
    lon: '',
    clearTime: '',
    clearOpen: '',
    qrCode: '',
    index: '',
    showTxPrice: '',
    txStartHour: '',
    delayLight: '',
    orderDoorOpen: '',
    clearOpenDoor: '',
    txHour: '',
    orderWebhook: '',
    citylist: [], //城市列表
    ritem: [
      {value: true, name: '是' , checked: 'true'},
      {value: 'false', name: '否'},
      ],
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
        "/member/store/getDetail/"+that.data.storeId,
        "1",
        "get", {
          "storeId": that.data.storeId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            that.data.citylist.map((it,index) => {
              if(it == info.data.cityName){
                that.setData({index: index})
              }
            })
            let fileList1 = [{url:info.data.headImg}]
            // let fileList4 = []
            // fileList4.push(info.data.btnImg);
            let fileList2 = []
            if(null!=info.data.bannerImg){
              let arr = info.data.bannerImg.split(",")
              arr.map(it => {
                fileList2.push({url:it})
              })
            }
            let fileList3 = []
            if(info.data.storeEnvImg){
              let arr2 = info.data.storeEnvImg.split(",")
              arr2.map(it => {
                fileList3.push({url:it})
              })
            }
            let btnfileList=[]; 
           if(info.data.btnImg){
             btnfileList=[{url:info.data.btnImg}];
           }
           let qhfileList=[];
           if(info.data.qhImg){
              qhfileList=[{url:info.data.qhImg}];
           }
           let tgfileList= [];
           if(info.data.tgImg){
            tgfileList=[{url:info.data.tgImg}];
           }
           let openfileList= [];
           if(info.data.openImg){
            openfileList=[{url:info.data.openImg}];
           }
           let czfileList= [];           
           if(info.data.czImg){
            czfileList=[{url:info.data.czImg}];
           }
           let wififileList= [];
           if(info.data.wifiImg){
            wififileList=[{url:info.data.wifiImg}];
           }
           let kffileList=[];
           if(info.data.kfImg){
            kffileList=[{url:info.data.kfImg}];
           }
            that.setData({
              storeId: info.data.storeId,
              storeName: info.data.storeName,
              cityName: info.data.cityName,
              address: info.data.address,
              wifiInfo: info.data.wifiInfo,
              wifiPwd: info.data.wifiPwd,
              simpleModel: info.data.simpleModel,
              kefuPhone: info.data.kefuPhone,
              notice: info.data.notice,
              orderWebhook: info.data.orderWebhook,
              fileList1: fileList1,
              fileList2: fileList2,
              fileList3: fileList3,
              btnfileList: btnfileList,
              qhfileList: qhfileList,
              tgfileList: tgfileList,
              openfileList: openfileList,
              czfileList: czfileList,
              wififileList: wififileList,
              kffileList: kffileList,
              lat: info.data.lat,
              lon: info.data.lon,
              clearTime: info.data.clearTime,
              clearOpen: info.data.clearOpen,
              qrCode: info.data.qrCode,
              showTxPrice: info.data.showTxPrice,
              txStartHour: info.data.txStartHour,
              delayLight: info.data.delayLight,
              txHour: info.data.txHour,
              orderDoorOpen: info.data.orderDoorOpen,
              clearOpenDoor: info.data.clearOpenDoor,
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
  // 定位
  onClickLocation(){
    this.goLocation()
  },
  goLocation(){
    // 获取用户经纬度
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        //console.log(res)
        that.setData({
          lat: res.latitude,
          lon: res.longitude
        })
      },
      fail(err) {
        //console.log(err)
      }
    })
  },
 
  // 图片上传
  afterRead(event) {
    //console.log(event)
    let that = this
    let type = event.currentTarget.dataset.info
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
        //console.log(res)
        var data = JSON.parse(res.data)
        // 上传完成需要更新 fileList
        if(type == '1'){
          const { fileList1 = [] } = that.data;
          fileList1.push({ url: data.data });
          that.setData({ fileList1: fileList1 });
        }else  if(type == '2'){
          const { fileList2 = [] } = that.data;
          fileList2.push({ url: data.data });
          that.setData({ fileList2: fileList2 });
        }else if(type == '3') {
          const { fileList3 = [] } = that.data;
          fileList3.push({ url: data.data });
          that.setData({ fileList3: fileList3 });
        }else if(type == '10'){
          const { btnfileList = [] } = that.data;
          btnfileList.push({ url: data.data });
          that.setData({ btnfileList: btnfileList });
        }else if(type == '11'){
          const { qhfileList = [] } = that.data;
          qhfileList.push({ url: data.data });
          that.setData({ qhfileList: qhfileList });
        }else if(type == '12'){
          const { tgfileList = [] } = that.data;
          tgfileList.push({ url: data.data });
          that.setData({ tgfileList: tgfileList });
        }else if(type == '13'){
          const { czfileList = [] } = that.data;
          czfileList.push({ url: data.data });
          that.setData({ czfileList: czfileList });
        }else if(type == '14'){
          const { openfileList = [] } = that.data;
          openfileList.push({ url: data.data });
          that.setData({ openfileList: openfileList });
        }else if(type == '15'){
          const { wififileList = [] } = that.data;
          wififileList.push({ url: data.data });
          that.setData({ wififileList: wififileList });
        }else if(type == '16'){
          const { kffileList = [] } = that.data;
          kffileList.push({ url: data.data });
          that.setData({ kffileList: kffileList });
        }
      },
    });
  },
  delete(event){
    let type = event.currentTarget.dataset.info
    let index = event.detail.index
    if(type == '1'){
      const { fileList1 = [] } = this.data;
      fileList1.splice(index,1)
      this.setData({fileList1})
    }else if(type == '2'){
      const { fileList2 = [] } = this.data;
      fileList2.splice(index,1)
      this.setData({fileList2})
    } else if(type == '3'){
      const { fileList3 = [] } = this.data;
      fileList3.splice(index,1)
      this.setData({fileList3})
    }else if(type == '10'){
      const { btnfileList = [] } = this.data;
      btnfileList.splice(index,1)
      this.setData({btnfileList})
    }else if(type == '11'){
      const { qhfileList = [] } = this.data;
      qhfileList.splice(index,1)
      this.setData({qhfileList})
    }else if(type == '12'){
      const { tgfileList = [] } = this.data;
      tgfileList.splice(index,1)
      this.setData({tgfileList})
    }else if(type == '13'){
      const { czfileList = [] } = this.data;
      czfileList.splice(index,1)
      this.setData({czfileList})
    }else if(type == '14'){
      const { openfileList = [] } = this.data;
      openfileList.splice(index,1)
      this.setData({openfileList})
    }else if(type == '15'){
      const { wififileList = [] } = this.data;
      wififileList.splice(index,1)
      this.setData({wififileList})
    }else if(type == '16'){
      const { kffileList = [] } = this.data;
      kffileList.splice(index,1)
      this.setData({kffileList})
    }
  },
  // 取消
  cancel: function(){
    wx.navigateBack()
  },
  previewImage(e){
    var currentUrl = e.currentTarget.dataset.src //获取当前点击图片链接
    wx.previewImage({
      urls: [currentUrl]
    })
},
  onChangeSwitch(e) {
    const { target: {dataset = {}} = {}, detail } = e
    this.setData({
      [dataset.tag]: detail.value
    })
  },
  onChangeSimpleModel(e){
    const { target: {dataset = {}} = {}, detail } = e
    this.setData({
      [dataset.tag]: detail.value
    })
  },
  // 保存
  submit: function(){
    let that = this
    //校验参数
    if(this.data.storeName 
      && this.data.cityName 
      && this.data.address 
      && this.data.lon
      && this.data.lat
      && this.data.wifiInfo 
      && this.data.wifiPwd
      && this.data.kefuPhone 
      && this.data.txStartHour
      && this.data.txHour
      && this.data.clearTime
      && this.data.notice
      && this.data.fileList1.length 
      && this.data.fileList2.length 
    ){}else{
      wx.showToast({
        title: '请填写完整',
        icon: 'none'
      })
      return;
    }
    let imgs = []
    let bannerImgs = []
    that.data.fileList2.map(it => {
      bannerImgs.push(it.url)
    })
    that.data.fileList3.map(it => {
      imgs.push(it.url)
    })
    let params={};
    if(this.data.simpleModel){
      //简洁模式
      params = {
        "storeId": that.data.storeId,
        "storeName": that.data.storeName,
        "cityName": that.data.cityName,
        "headImg": that.data.fileList1[0].url,
        "bannerImg": bannerImgs.join(","),
        "notice": that.data.notice,
        "orderWebhook": that.data.orderWebhook,
        "address": that.data.address,
        "wifiInfo": that.data.wifiInfo,
        "wifiPwd": that.data.wifiPwd,
        "simpleModel": that.data.simpleModel,
        "kefuPhone": that.data.kefuPhone,
        "lat": that.data.lat,
        "lon": that.data.lon,
        "clearTime": that.data.clearTime,
        "clearOpen": that.data.clearOpen,
        "showTxPrice": that.data.showTxPrice,
        "txStartHour": that.data.txStartHour,
        "delayLight": that.data.delayLight,
        "txHour": that.data.txHour,
        "orderDoorOpen": that.data.orderDoorOpen,
        "clearOpenDoor": that.data.clearOpenDoor,
      }
    }else{
      //个性化模式 需要上传那些模板图片
      if(this.data.fileList3.length
        && this.data.btnfileList.length
        && this.data.qhfileList.length
        && this.data.tgfileList.length
        && this.data.czfileList.length
        && this.data.openfileList.length
        && this.data.wififileList.length
        && this.data.kffileList.length){
          params = {
            "storeId": that.data.storeId,
            "storeName": that.data.storeName,
            "cityName": that.data.cityName,
            "headImg": that.data.fileList1[0].url,
            "btnImg": that.data.btnfileList[0].url,
            "qhImg": that.data.qhfileList[0].url,
            "tgImg": that.data.tgfileList[0].url,
            "czImg": that.data.czfileList[0].url,
            "openImg": that.data.openfileList[0].url,
            "wifiImg": that.data.wififileList[0].url,
            "kfImg": that.data.kffileList[0].url,
            "storeEnvImg": imgs.join(","),
            "bannerImg": bannerImgs.join(","),
            "notice": that.data.notice,
            "orderWebhook": that.data.orderWebhook,
            "address": that.data.address,
            "wifiInfo": that.data.wifiInfo,
            "wifiPwd": that.data.wifiPwd,
            "simpleModel": that.data.simpleModel,
            "kefuPhone": that.data.kefuPhone,
            "lat": that.data.lat,
            "lon": that.data.lon,
            "clearTime": that.data.clearTime,
            "clearOpen": that.data.clearOpen,
            "showTxPrice": that.data.showTxPrice,
            "txStartHour": that.data.txStartHour,
            "delayLight": that.data.delayLight,
            "txHour": that.data.txHour,
            "orderDoorOpen": that.data.orderDoorOpen,
            "clearOpenDoor": that.data.clearOpenDoor,
          };
      }else{
        wx.showToast({
          title: '请填写完整',
          icon: 'none'
        })
        return;
      }
    }
    console.log('提交保存门店信息');
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/save",
        "1",
        "post", params,
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
})