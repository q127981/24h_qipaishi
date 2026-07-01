// pages/user/user.js
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    titleBarHeight: 0,
    isLogin:app.globalData.isLogin,
    storeId: '',
    notice:'',
    richText: '',
    readOnly: false,
    placeholder: '快来编辑吧~',
    storeInfo:'',
    dataLoaded: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
        storeId: options.storeId,
        dataLoaded: false,
    })
    that.getData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
 

  //到登录界面
  gotologin(){
    wx.navigateTo({
      url: '../login/login',
    })
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
          console.info(info);
          if (info.code == 0) {
            that.setData({
                storeInfo: info.data,
                dataLoaded: true,
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
  //编辑器初始化完成时触发，可以获取组件实例
  onEditorReady() {
    this.setData({
        richText : this.selectComponent('#richText'), //获取组件实例
    })
  },
  //插入图片
  insertImageEvent() {
    wx.chooseImage({
      count: 1,
      success: res => {
        let path = res.tempFilePaths[0];
        wx.uploadFile({
            url: app.globalData.baseUrl+'/member/store/uploadImg',
            filePath: path,
            name: 'file',
            header: {
              'tenant-id': app.globalData.tenantId,
              'Content-Type': 'application/json',
              'Authorization':'Bearer '+app.globalData.userDatatoken.accessToken,
            },
          success: res => {
            let path = JSON.parse(res.data).data
            //调用子组件（富文本组件）方法，图片应先上传再插入，不然预览时无法查看图片。
            this.data.richText.insertImageMethod(path).then(res => {
              console.log('[insert image success callback]=>', res)
            }).catch(res => {
              console.log('[insert image fail callback]=>', res)
            });
          }
        })
      }
    })
  },
  // 清理按钮
  clearBeforeEvent(){
    this.data.richText.clear();
  },
  // 清空成功回调
  clearSuccess(){
    wx.showToast({
      title: '已清空',
      icon: 'success',
      duration: 1500,
    });
  },
  // 手动保存
  saveContent(){
    this.data.richText.getEditorContent();
  },
  // 获取到富文本中的值
  getEditorContent(res){
    let { value } = res.detail;
    let content = value.html;
    // 清除富文本编辑器产生的空标签
    let trimmed = content.replace(/<p><br\s*\/?><\/p>/gi, '').replace(/<p>\s*<\/p>/gi, '').trim();
    if (trimmed === '') {
      content = '';
    } else {
      content = trimmed;
    }
    this.data.storeInfo.notice = content
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/store/save",
        "1",
        "post", this.data.storeInfo,
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
    } else{
        this.gotologin()
    }

  },
})