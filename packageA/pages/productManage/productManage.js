// packageA/pages/addLock/addLock.js
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx ? true : false,
    storeId: '',
    productList:[],  // 商品列表
    kindList:[],  // 分类列表
    currentPage: 1, // 当前页码
    isShow: 1, // 查看是否上架的商品 1上架 0未上架
    hasMore: false, // 是否可以价值更多
    showremove:false, // 删除商品的弹窗
    id:'', // 商品id
    mainColor: app.globalData.mainColor, // 下拉选择项颜色
    kind: -1,
    value2: '0',
    kindOption: [
        { text: '全部分类', value: -1}
      ],
      option2: [
        { text: '默认排序', value: '0' }
      ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      let that = this
      that.setData({
          storeId:options.storeId
      })
    //   that.getKindlist()
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
    let that = this
    that.getKindlist()
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
      let that = this
      that.getProductlist(false)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

   // 获取商品列表
getProductlist: function (refuse = false) {
    let that = this;
    if (app.globalData.isLogin) {
      let currentPage = refuse ? 1 : that.data.currentPage + 1; 
      that.setData({ currentPage });
      http.request(
        "/product/store-product/page",
        "1",
        "post",
        {
          "storeId": that.data.storeId,
          "cateId": that.data.kind == -1 ? null : that.data.kind ,
          "pageSize": 10,
          "pageNo": currentPage
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if (info.code == 0) {
            const productList = info.data.list.map((item) => ({
                ...item,
                kindName: that.findKindName(item.cateId),
              }));
            if (!refuse) {
              that.setData({
                productList: that.data.productList.concat(productList), 
                hasMore: that.data.currentPage * 10 < info.data.total,
              });
            } else {
              that.setData({
                productList: productList,
                hasMore: that.data.currentPage * 10 < info.data.total,
              });
            }
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
    } else {
      that.gotologin();
    }
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
            console.log(info)
          if (info.code == 0) {
            const kindList = info.data
            that.setData({
                kindList: kindList, 
            });
            that.getProductlist(true)
            const kindOption = that.data.kindOption
            that.data.kindList.forEach(item=>{
                kindOption.push({text:item.name,value:item.id})
            })
            that.setData({
                kindOption:kindOption
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
    } else {
      that.gotologin();
    }
  },
  // 获取分类名称
findKindName: function(cateId) {
  let that = this;
  for (let i = 0; i < that.data.kindList.length; i++) {
    const item = that.data.kindList[i];
    if (item.id == cateId) {
      return item.name; // 找到匹配的 id，返回名称
    }
  }
},

// 删除商品 展示弹窗
deleteProduct:function(e){
    let that = this
    that.setData({
        showremove: true,
        id: e.currentTarget.dataset.id
    })
},
// 跳转到修改页面
goupdate:function(e){
    let that = this
    wx.navigateTo({
        url: '../addProduct/addProduct?productId='+e.currentTarget.dataset.id+'&&storeId='+that.data.storeId,
      })
},

// 确定删除商品
remove:function(){
    let that = this
    http.request(
      "/product/store-product/delete/"+that.data.id,
      "1",
      "post",{
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        that.setData({
          id: ''
        })
        that.getProductlist(true)
      },
      function fail(info) {
      }
    )
},

// 是否上架
changeShow:function(e){
    let that = this
    const id =  e.currentTarget.dataset.id
    const isShow =  e.currentTarget.dataset.isshow
    const index =  e.currentTarget.dataset.index

    const productList = that.data.productList
    http.request(
        "/product/store-product/sale",
        "1",
        "post",{
            "id": id,
            "status": isShow
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
            if (info.code == 0) {
                productList[index].isShow = isShow ==1 ? 0:1
                that.setData({
                    productList:productList
                })
            }
        },
        function fail(info) {
        }
      )
},
// 新增商品跳转到商品信息页面
gotoAdd:function(){
    let that = this
    wx.navigateTo({
      url: '../addProduct/addProduct?storeId='+that.data.storeId,
    })
},
// 点击顶部下拉选项
kindFilter(e){
    console.log(e)
    let that = this
    that.setData({
        kind: e.detail
    })
    that.getProductlist(true)
},
})