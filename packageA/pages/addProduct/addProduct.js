// packageA/pages/addLock/addLock.js
const app = getApp()
var http = require('../../../utils/http');
var lock = require('../../../utils/lock');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx ? true : false,
    productId:'', // 商品id
    storeId:'', // 门店id
    kindList:[], // 商品分类名称
    kindListAllInfo:[], // 商品分类列表所有信息
    show:false, // 分类选择是否显示
    image:[], // 商品封面
    sliderImage:[], // 商品轮播图
    storeName:'', // 商品名称
    productKind:'', // 选中的分类名称
    productKindId:'', // 选中的分类id
    price:'',  // 商品价格
    unitName: '',  // 单位名称
    stock:'',  // 商品库存
    productSpecificationList:[] , // 商品规格List
    showAddSpecification:false, // 控制是否显示添加规格的信息
    specificationName:'',  // 弹出框 规格名
    specificationValue:'', //弹出框 规格值
    addValue:false,  // 点击添加按钮 添加规格值
    valueIndex:'',   // 点击的索引
    addSpecificationValue: '',  // 点击弹出框 添加属性值
    propertyList:[], // 商品属性
    propertyIndex:0, // 点击属性位置
    shwoUpdatePrice:false, // 是否显示修改价格
    updatePrice:0,   // 修改价格
    shwoUpdateStock:false, // 是否显示修改库存
    updateStock:0,   // 修改库存
    temporarilyList:[],  // 修改商品信息 暂存数据
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
      if(options.productId){
        that.setData({
         productId: Number(options.productId)
        })
        that.getProductData()
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
  // 图片上传
  afterRead(event) {
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
        const data = JSON.parse(res.data)
        // 上传完成需要更新 fileList
        if(type == '1'){
          const { image = [] } = that.data;
          image.push({ url: data.data });
          that.setData({ image: image });
          console.log(that.data.image)
        }else  if(type == '2'){
          const { sliderImage = [] } = that.data;
          sliderImage.push({ url: data.data });
          that.setData({ sliderImage: sliderImage });
        }
      },
    });
  },
  // 商品属性图片上传
  propertyAfterRead(event) {
    let that = this
    let index = event.currentTarget.dataset.index
    const { file } = event.detail;

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
          let image = []
        const data = JSON.parse(res.data)
        const imageUrl =  data.data
        image.push({ url: imageUrl })
        const propertyList = that.data.propertyList
        propertyList[index].pic = image
        that.setData({
            propertyList : propertyList
        })
        console.log(that.data.propertyList)
      },
    });
  },
  delete(event){
    let type = event.currentTarget.dataset.info
    let index = event.detail.index
    if(type == '1'){
      const { image = [] } = this.data;
      image.splice(index,1)
      this.setData({image})
    }else if(type == '2'){
      const { sliderImage = [] } = this.data;
      sliderImage.splice(index,1)
      this.setData({sliderImage})
    }
  },
  propertyDelete(event){
      let that = this
    let index = event.currentTarget.dataset.index
    const propertyList = that.data.propertyList
    propertyList[index].pic = []
    that.setData({
        propertyList: propertyList
    })
  },
  // 下拉选择确认
  onConfirmCategory(event) {
      let that = this
      console.log(event)
     const kindName =  event.detail.value  // 选中的名称
     const index = event.detail.index   // 选中的下标
    // 处理完后关闭弹窗
    that.setData({
        show:false,
        productKind: kindName,
        productKindId: that.data.kindListAllInfo[index].id
    })
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
              let kindList = []
              for(let i =0; i<info.data.length;i++){
                kindList.push(info.data[i].name)
              }
              that.setData({
                  kindList:kindList,
                  kindListAllInfo:info.data
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
  // 点击显示选择器
  showPopup:function(){
    let that = this
    that.setData({
        show:true
    })
  },
  // 关闭选择器
  onClose:function(){
    let that = this
    that.setData({
        show:false
    })
  },
  cancelPicker:function(){
    let that = this
    that.setData({
        show:false
    })
  },
  //点击添加新规格
  showAddForm:function(){
    let that = this
    const length =  that.data.productSpecificationList.length
    if(length<2){
        that.setData({
            showAddSpecification:true
        })
    }else{
        //  todo  生成方法有误，超过两个属性生成不对
        wx.showToast({ title: '规格最多只能2个~', icon: 'none' });
    }
    
  },
  // 点击确定添加
  addSpecification:function(){
      let that = this
      const name  =  that.data.specificationName
      const value =  that.data.specificationValue
      const list  =  that.data.productSpecificationList
      list.push({detail:[value],value:name})
      that.setData({
        productSpecificationList:list,
        specificationName:'',
        specificationValue:''
      })
      console.log(that.data.productSpecificationList)
  },
  // 点击添加
  addValue:function(e){
      console.log(e)
      let that = this
      that.setData({
        addValue:true,
        valueIndex: e.currentTarget.dataset.index
      })
  },
  // 点击确认 添加规格属性值
  addSpecificationValue:function(){
      let that = this
      const value  =  that.data.addSpecificationValue
      const index =  that.data.valueIndex
      const list  =  that.data.productSpecificationList
      list[index].detail.push(value)
      that.setData({
        productSpecificationList:list,
        addSpecificationValue:'',
      })
  },
  // 点击value 删除相关value
  removeValue:function(e){
      let that = this
      const valueIndex =  e.currentTarget.dataset.closeindex
      const list =  that.data.productSpecificationList
      list.splice(valueIndex, 1)
      that.setData({
        productSpecificationList:list
      })
  },
  // 点击detail 取消某一个规格值
  removeDetail:function(e){
    let that = this
    const valueIndex  =  e.currentTarget.dataset.closeindex
    const detailIndex =  e.currentTarget.dataset.detailindex
    const list =  that.data.productSpecificationList
    list[valueIndex].detail.splice(detailIndex, 1)
    that.setData({
        productSpecificationList:list
      })
    },
  // 点击生成属性
generateProperty: function() {
    if(this.data.productSpecificationList.length==0){
        wx.showToast({
          title: '请先添加规格',
          icon:'error'
        })
        return
    }
    this.generateAttributes();
    console.log(this.data.propertyList); // 在控制台输出生成的属性组合
  },
  
  generateAttributes: function() {
    let that = this
    let attributes = [];

    function generateCombinations(index, currentCombination, currentDetail) {
      if (index === that.data.productSpecificationList.length) {
        attributes.push({
          value1: currentCombination[0] || "",
          value2: currentCombination[1] || "",
          detail: currentDetail,
          pic: that.data.image,
        //   pic: [],
          price: 0,
          stock: 0,
        });
        return;
      }
  
      const spec = that.data.productSpecificationList[index];
      if (spec.detail && spec.detail.length > 0) {
        for (const detail of spec.detail) {
          let newDetail = { ...currentDetail };
          newDetail[spec.value] = detail;
          generateCombinations.call(that, index + 1, [...currentCombination, detail], newDetail);
        }
      }
    }

    generateCombinations.call(that, 0, [], {});
    that.setData({ propertyList: attributes });
  },
  // 是否显示修改价格
  updatePrice:function(e){
      let that = this
    const index =  e.currentTarget.dataset.index
    that.setData({
        shwoUpdatePrice:true,
        updatePrice:that.data.propertyList[index].price,
        propertyIndex: index
    })
  },
   // 点击确认 修改价格
   comfrimUpdatePrice:function(){
    let that = this
    const propertyList = that.data.propertyList
    propertyList[that.data.propertyIndex].price = that.data.updatePrice
    that.setData({
        propertyList:propertyList
    })
   },
   // 是否显示修改库存
   updateStock:function(e){
    let that = this
    const index =  e.currentTarget.dataset.index
    that.setData({
        shwoUpdateStock:true,
        updateStock:that.data.propertyList[index].stock,
        propertyIndex: index
    })
   },
   // 点击确认 修改价格
   comfrimUpdateStock:function(){
    let that = this
    const propertyList = that.data.propertyList
    propertyList[that.data.propertyIndex].stock = that.data.updateStock
    that.setData({
        propertyList:propertyList
    })
   },
   // 保存信息
   submit:function(){
    let that = this

    if(that.data.storeName==''||that.data.image==[]
    ||that.data.sliderImage==[]||that.data.productKindId==''||that.data.unitName==''){
        wx.showToast({
          title: '商品信息不完整',
          icon:"error"
        })
        return
    }
    if(that.data.productSpecificationList.length==0){
        wx.showToast({
          title: '请添加规格',
          icon:'error'
        })
        return
    }
    if(that.data.propertyList.length==0){
        wx.showToast({
          title: '请生成属性',
          icon:'error'
        })
        return
    }
    
    const propertyList = that.data.propertyList
    propertyList.forEach(item=>{
        item.pic = item.pic[0].url
    })
    let images = []
    that.data.sliderImage.forEach(item=>{
        images.push(item.url)
    })

    if (that.data.productId == '') 
    {
      http.request(
        "/product/store-product/create",
        "1",
        "post",
        {
        "shopId": that.data.storeId,
        "shopName": that.data.storeId,
        "image": that.data.image[0].url,
        "slider_image": images,
        "store_name": that.data.storeName,
        "store_info":' ',
        "cate_id":that.data.productKindId,
        "price":that.data.price,
        "unit_name":that.data.unitName,
        "items":that.data.productSpecificationList,
        "attrs":propertyList,
        "spec_type": '1',
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          if(info.code==0){
            wx.navigateBack()
          }
        },
        function fail(info) {
          
        }
      )
    }else{
        that.setDetail()
        const propertyListReq = that.data.temporarilyList
        for(let i =0;i<propertyListReq.length;i++){
            propertyListReq[i].pic = propertyList[i].pic
            propertyListReq[i].price = propertyList[i].price
            propertyListReq[i].stock = propertyList[i].stock
        }
        http.request(
            "/product/store-product/create",
            "1",
            "post",
            {
            "id": that.data.productId,
            "shopId": that.data.storeId,
            "shopName": that.data.storeId,
            "image": that.data.image[0].url,
            "slider_image": images,
            "store_name": that.data.storeName,
            "store_info":' ',
            "cate_id":that.data.productKindId,
            "price":that.data.price,
            "unit_name":that.data.unitName,
            "items":that.data.productSpecificationList,
            "attrs":propertyListReq,
            "spec_type": '1',
            },
            app.globalData.userDatatoken.accessToken,
            "",
            function success(info) {
              console.info(info);
              if(info.code==0){
                wx.navigateBack()
              }
            },
            function fail(info) {
              
            }
          )

    }

   },
   // 获取商品详情
   getProductData:function(){
        let that = this
        http.request(
            "/product/store-product/info/"+that.data.productId,
            "1",
            "get", {
            },
            app.globalData.userDatatoken.accessToken,
            "",
            function success(info) {
              console.info('商品数据===');
              console.info(info);
              if(info.code==0){
                  let image = []
                  image.push({url:info.data.productInfo.image})
                  let slider_image = []
                  info.data.productInfo.slider_image.forEach(item=>{
                    slider_image.push({url:item})
                  })
                  let storeName = info.data.productInfo.store_name
                  let price = info.data.productInfo.price
                  let unit_name = info.data.productInfo.unit_name
                  let cate_id = info.data.productInfo.cate_id
                  let productSpecificationList = info.data.productInfo.items
                  console.log(that.data.kindListAllInfo)
                  let kindName =  ''
                  that.data.kindListAllInfo.forEach(kind=>{
                      if(kind.id==info.data.productInfo.cate_id){
                          console.log(111)
                        kindName = kind.name
                      }
                  })
                  let propertyList = []
                  if(info.data.productInfo.attrs){
                      for(let i =0;i<info.data.productInfo.attrs.length;i++){
                        let item = info.data.productInfo.attrs[i]
                        item.value1 = item.sku.split(',')[0]
                        item.value2 = item.sku.split(',')[1]
                        let pic = []
                        pic.push({url:item.pic})
                        item.pic = pic
                        propertyList.push(item)
                      }
                  }
                  that.setData({
                    image:image,
                    sliderImage:slider_image,
                    storeName:storeName,
                    price:price,
                    unitName:unit_name,
                    productSpecificationList: productSpecificationList,
                    propertyList:propertyList,
                    productKind: kindName,
                    productKindId:cate_id
                  })
              }

            },
            function fail(info) {
              
            }
          )
   },
   // 修改传递过来的attrs没有detail
   setDetail: function() {
    this.setDetailAttributes();
  },
  setDetailAttributes: function() {
    let that = this
    let attributes = [];

    function generateCombinations(index, currentCombination, currentDetail) {
      if (index === that.data.productSpecificationList.length) {
        attributes.push({
          value1: currentCombination[0] || "",
          value2: currentCombination[1] || "",
          detail: currentDetail,
          pic: that.data.image,
          price: 0,
          stock: 0,
        });
        return;
      }
  
      const spec = that.data.productSpecificationList[index];
      if (spec.detail && spec.detail.length > 0) {
        for (const detail of spec.detail) {
          let newDetail = { ...currentDetail };
          newDetail[spec.value] = detail;
          generateCombinations.call(that, index + 1, [...currentCombination, detail], newDetail);
        }
      }
    }

    generateCombinations.call(that, 0, [], {});
    that.setData({ temporarilyList: attributes });
  },

})