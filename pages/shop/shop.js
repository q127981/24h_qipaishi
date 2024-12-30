var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const app = getApp()

Page({
    data: {
      orderType: 'takeout', // 默认外卖
      address: null,
      store: null,
      location: null,
      isLogin: app.globalData.isLogin,
      title: '商品点单',
      text: '滚动通知',
      goods: [],
      ads: [],
      loading: true,
      currentCateId: 0,
      cateScrollTop: 0,
      menuScrollIntoView: '',
      cart: [],
      goodDetailModalVisible: false,
      good: {},
      category: {},
      cartPopupVisible: false,
      popupVisible:false,
      sizeCalcState: false,
      newValue: [],
      shopAd: '',
      isCartShow: true,
      uToast: null,
      storeId:'',
      doorinfodata:{},
      lat:'',
      lon:'',
      selectedIndex: 0,
      goodNum:0,  // 商品数量
      cartTotalPrice: 0.00, // 购物车总价
      animationData: {},
      cartNum:0
    },
  
    /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    that.setData({
        storeId: options.storeId
    })
  },

  getProductList:function(){
      let that = this
    http.request(
        "/product/store-product/products",
        "1",
        "get", {
            shopId : that.data.storeId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
        let goods = info.data
        if(goods.length==0){
            wx.showToast({
              title: '暂无商品',
            })
        }
        that.setData({
            goods: goods
        })
        that.refreshCart()
        that.calculateCartTotalPrice()
        // 计算左侧和右侧数量
        that.leftKindNum()
        that.rightGoodNum()
        },
        function fail(info) {
          wx.showToast({
            title: '修改失败，请重试',
            icon:'none'
          })
        }
      )
  },
  showGoodDetailModal: function(e){
    let that = this
    let item = e.currentTarget.dataset.item
    let good = e.currentTarget.dataset.good
    that.setData({
        isCartShow: true,
        good: JSON.parse(JSON.stringify({
            ...good,
            number: 1
          })),
        category: JSON.parse(JSON.stringify(item)),
        goodDetailModalVisible: true,
    })
      that.changePropertyDefault(0, 0, true);
  },
   changePropertyDefault :function(index, key, isDefault){
       let that = this
    let valueStr = "";
    console.log(that.data.good)
    if (isDefault) {
      let newValue = []
      for (let i = 0; i < that.data.good.productAttr.length; i++) {
        newValue[i] = that.data.good.productAttr[i].attrValueArr[0];
      }
      console.log(newValue)
      that.setData({
        newValue: newValue
      })
    } else {
        that.data.newValue[index] = that.data.good.productAttr[index].attrValueArr[key];
    }
    valueStr = that.data.newValue.join(",");
    let productValue = that.data.good.productValue[valueStr];
    if (!productValue) {
      let skukey = JSON.parse(JSON.stringify(that.data.newValue));
      skukey.sort((a, b) => a.localeCompare(b));
      valueStr = skukey.join(",");
      productValue = that.data.good.productValue[valueStr];
    }
    let newValue = that.data.newValue
    that.setData({
        'good.number': 1,
        'good.price': parseFloat(productValue.price).toFixed(2),
        'good.stock': productValue.stock,
        'good.image': productValue.image ? productValue.image : that.data.good.value.image,
        'good.valueStr': valueStr,
        newValue: newValue,
      });
  },
   closeGoodDetailModal: function() {
       let that = this
       that.setData({
        goodDetailModalVisible: false,
        category: {},
        good: {}
       })
  },
  changeDefault :function(e){
      const index = e.currentTarget.dataset.index;
      const key = e.currentTarget.dataset.key;
      let that = this
      let valueStr = "";
      that.data.newValue[index] = that.data.good.productAttr[index].attrValueArr[key];
      valueStr = that.data.newValue.join(",");
      let productValue = that.data.good.productValue[valueStr];
      if (!productValue) {
        let skukey = JSON.parse(JSON.stringify(that.data.newValue));
        skukey.sort((a, b) => a.localeCompare(b));
        valueStr = skukey.join(",");
        productValue = that.data.good.productValue[valueStr];
      }
      let newValue = that.data.newValue
      that.setData({
        selectedIndex: index,
        'good.number': 1,
        'good.price': parseFloat(productValue.price).toFixed(2),
        'good.stock': productValue.stock,
        'good.image': productValue.image ? productValue.image : that.data.good.value.image,
        'good.valueStr': valueStr,
         newValue: newValue,
      });
    },
      calcSize: function () {
        let that = this;
        let h = 10;
        const query = wx.createSelectorQuery();
    
        const adsView = query.select('#ads');
        adsView.fields({ size: true }).exec((res) => {
          if (res && res.length > 0 && res[0].height) {
            h += Math.floor(res[0].height);
          }
        });
        const goods = that.data.goods;
        goods.forEach((item) => {
          const cateView = query.select(`#cate-${item.id}`);
          cateView.fields({ size: true }).exec((res) => {
            if (res && res.length > 0 && res[0].height) {
              console.log("h3:", h);
              item.top = h;
              h += Math.floor(res[0].height);
              item.bottom = h;
              that.setData({ goods: goods });
            } else {
              console.warn(`Element with ID #cate-${item.id} not found.`);
            }
          });
        });
      
        that.setData({ sizeCalcState: true });
      },
      handleMenuTap(e) {
        let that = this
          console.log(e.currentTarget.id)
          let index = e.currentTarget.id
          const categoryId = index.split('-')[1];
          this.setData({
            menuScrollIntoView: `cate-${categoryId}`,
          });
          console.log(that.data.cart)
      },
        handlePropertyReduce:function(){
            let that = this
        if (that.data.good.number === 1){
            return;
        }
        let reduceNumber = that.data.good.number - 1;
        that.setData({
            'good.number':reduceNumber
        })
      },
       handlePropertyAdd:function (){
           let that = this
           let addnum = that.data.good.number + 1;
           that.setData({
            'good.number':addnum
           })
      },
       handleAddToCartInModal:function(){
        let that = this
        if (that.data.good.stock <= 0) {
            wx.showToast({
                title: '商品库存不足',
                icon:'none'
              })
          return;
        }
        that.handleAddToCart(that.data.category, that.data.good, that.data.good.number);
        that.leftKindNum()
        that.rightGoodNum()
        that.closeGoodDetailModal();
      },
       handleAddToCart:function(cate, newGood, num) {
        console.log(newGood)
        let that = this
        const index = that.data.cart.findIndex((item) => {
            return item.id === newGood.id && item.valueStr === newGood.valueStr;
        });
        let car = that.data.cart
        if (index > -1) {
          car[index].number += num
          that.setData({
              cart: car
          })
        } else {
            car.push({
            id: newGood.id,
            shopId: newGood.shopId,
            cate_id: cate.id,
            name: newGood.storeName,
            price: newGood.price,
            number: num,
            stock: newGood.stock,
            image: newGood.image,
            valueStr: that.data.good.valueStr
          });
          that.setData({
            cart: car
        })
        }
        // let goodSrorageNum = wx.getStorageSync('goodNum')
        let goodSrorageNum = that.data.goodNum
        let goodNum = parseInt((goodSrorageNum==null || goodSrorageNum=='' ? 0 : goodSrorageNum)+num)
        that.setData({
            goodNum: goodNum
        })
        wx.setStorageSync("cart", JSON.parse(JSON.stringify(that.data.cart)));
        wx.setStorageSync("goodNum", JSON.parse(JSON.stringify(goodNum)));
        //计算价格 
        that.calculateCartTotalPrice()
      },
      getCartGoodsNumber() {
          let that = this
          console.log(that.data.cart.reduce((acc, cur) => acc + cur.number, 0))
        return that.data.cart.reduce((acc, cur) => acc + cur.number, 0)
      },
       refreshCart:function(){
           let that = this
        if (that.data.goods && that.data.goods.length > 0) {
          let newGoods = that.data.goods;
          that.data.cart = [];
          let newCart = wx.getStorageSync("cart") || [];
          let tmpCart = [];
          if (newCart) {
            for (let i in newCart) {
              for (let ii in newGoods) {
                for (let iii in newGoods[ii].goodsList) {
                  if (newCart[i].id == newGoods[ii].goodsList[iii].id) {
                    tmpCart.push(newCart[i]);
                  }
                }
              }
            }
            that.setData({
                cart: tmpCart,
                cartPopupVisible:false
            })
          }
          let num = 0;
          tmpCart.forEach(item=>{
              num += item.number
          })
        //   let goodSrorageNum = wx.getStorageSync('goodNum')
        let goodSrorageNum = num
          that.setData({
              goodNum: goodSrorageNum==null || goodSrorageNum=='' ? 0 : goodSrorageNum
          })
        }
      },
      //计算价格 
      calculateCartTotalPrice() {
          let that  = this
        let totalPrice = that.data.cart.reduce((acc, cur) => acc + cur.number * cur.price, 0);
        that.setData({
          cartTotalPrice: parseFloat(totalPrice).toFixed(2)
        });
      },
       toPay:function (){
        let that = this
        if (!app.globalData.isLogin) {
          that.gotologin()
          return;
        } else {
          wx.showLoading({
            title: "加载中"
          });
          // 由于购物车内容存放的是在本地 如果存在多个店铺添加进入了购物车 那么会导致结算时出现不存在的商品
          // todo 需要结合shopId进行过滤一次 并将购物车中的内容清除
        //   const cart = that.data.cart
        //   let topay = [] // 当前门店的商品
        //   let afterFiter = [] // 点击结算后 cart内容
        //   cart.forEach(item=>{
        //       if(item.shopId==that.data.storeId){
        //         topay.push(item)
        //       }else{
        //         afterFiter.push(item)
        //       }
        //   })
        //   wx.setStorageSync("payCart", JSON.parse(JSON.stringify(topay)));
        //   wx.setStorageSync("cart", JSON.parse(JSON.stringify(afterFiter)));
        //   wx.setStorageSync("goodNum", JSON.parse(JSON.stringify(afterFiter.length)));
        //   that.setData({
        //       cart:afterFiter
        //   })
        //     that.refreshCart()
        //     that.calculateCartTotalPrice()
        //     that.leftKindNum()
        //     that.rightGoodNum()

          const cart = that.data.cart
          let topay = [] // 当前门店的商品
          cart.forEach(item=>{
              if(item.shopId==that.data.storeId){
                topay.push(item)
              }
          })
        wx.setStorageSync("payCart", JSON.parse(JSON.stringify(topay)));

            wx.navigateTo({
              url: "/pages/pay/pay?storeId=" + that.data.storeId
            });
        }
        wx.hideLoading();
      },
         //到登录界面
        gotologin() {
            wx.navigateTo({
             url: '../login/login',
            })
        },
        handleCartClear:function (){ //清空购物车
            let that = this
            wx.showModal({
                title: '提示',
                content: '确定清空购物车么',
                success: ({
                    confirm
                }) => {
                    if (confirm) {
                        that.setData({
                            cart:[],
                            popupVisible:false,
                            goodNum:0,
                            totalPrice:0.00
                        })
                        wx.setStorageSync('cart', JSON.parse(JSON.stringify(that.data.cart)))
                        wx.removeStorageSync('goodNum')
                        that.leftKindNum()
                        that.rightGoodNum()
                    }
                }
            })
        },
        openCartPopup:function () {
            let that = this
            that.setData({
                popupVisible:true,
                animationData: wx.createAnimation({
                    duration: 300,
                    timingFunction: 'ease-out'
                  }).translateY(0).step()
            })
          },
          closePopup() {
            this.setData({
              popupVisible: false,
              animationData: wx.createAnimation({
                duration: 300,
                timingFunction: 'ease-in'
              }).translateY('100%').step()
            });
          },
          handleCartItemReduce:function(e){
            let that = this
            let index =  e.currentTarget.dataset.index
            let cart = that.data.cart
            let goodNum = that.data.goodNum
            if (cart[index].number === 1) {
                cart.splice(index, 1)
            } else {
                cart[index].number -= 1
            }
            that.setData({
                cart: cart,
                goodNum: goodNum - 1 < 0 ? 0 : goodNum - 1
            })
            if (!that.data.cart.length) {
                that.setData({
                    popupVisible:false
                })
            }
            wx.setStorageSync('cart', JSON.parse(JSON.stringify(cart)))
            // wx.setStorageSync('goodNum', JSON.parse(JSON.stringify(goodNum - 1 < 0 ? 0 : goodNum - 1)))
            //计算价格 
            that.calculateCartTotalPrice()
            that.leftKindNum()
            that.rightGoodNum()
          },
           handleCartItemAdd:function (e){
               console.log(e)
            let that = this
            let index =  e.currentTarget.dataset.index
            let cart = that.data.cart
            let goodNum = that.data.goodNum
            cart[index].number += 1
            that.setData({
                cart: cart,
                goodNum: goodNum + 1
            })
            wx.setStorageSync('cart', JSON.parse(JSON.stringify(cart)))
            // wx.setStorageSync('goodNum', JSON.parse(JSON.stringify(goodNum + 1)))
            //计算价格 
            that.calculateCartTotalPrice()
            that.leftKindNum()
            that.rightGoodNum()
        },
        menuCartNum: function (id) {
            let that = this
            return that.data.cart.reduce((acc, cur) => {
              if (cur.cate_id === id) {
                return acc + cur.number;
              }
              return acc;
            }, 0);
          },
        updateCartNum(id) {
            let that = this
            that.setData({
               cartNum: that.menuCartNum(id)
             });
        },
        // 计算左侧分类数量
        leftKindNum:function(){
            let that = this
            // if (that.data.cart.length > 0) {
                console.log(that.data.cart)
                console.log(that.data.goods)
                that.data.goods.forEach(item => {
                  item.kindNum = that.data.cart.reduce((acc, cur) => {
                    return cur.cate_id === item.id ? acc + cur.number : acc;
                  }, 0);
                });
                that.setData({ goods: that.data.goods });
            //   }
        },
        // 计算右侧商品数量
        rightGoodNum:function(){
            let that = this
            // if (that.data.cart.length > 0) {
                that.data.goods.forEach(category => {
                  category.goodsList.forEach(item => {
                    item.carNum = that.data.cart.reduce((acc, cur) => {
                      return cur.id === item.id ? acc + cur.number : acc;
                    }, 0);
                  });
                });
                console.log(that.data.goods)
                that.setData({ goods: that.data.goods });
            //   }
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
    that.getStoreInfodata()
    that.getProductList()
    // that.refreshCart()
    that.refreshCart()
    that.calculateCartTotalPrice()
    that.leftKindNum()
    that.rightGoodNum()
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

   //获取门店信息
   getStoreInfodata: function (e) {
    var that = this;
    that.getLocation().then((res) => { });;
    console.log("getStoreInfodata");
    console.log(that.data.lat);
    console.log(that.data.lon);
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getStoreInfo" + '/' + that.data.storeId,
        "1",
        "get", {
        "lat": that.data.lat,
        "lon": that.data.lon,
      },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          if (info.code == 0) {
              that.setData({
                doorinfodata: info.data,
              });
          } else {
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
  getLocation: function () {
    return new Promise((r, t) => {
      let that = this;
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          const latitude = res.latitude
          const longitude = res.longitude
          that.setData({
            lat: latitude,
            lon: longitude,
          });
          // that.getMainListdata('refresh');
          // 处理位置信息，比如将位置信息显示在页面上
          // 示例中使用的是util.js中的函数，开发者可以根据需要自行编写
          //util.showLocation(latitude, longitude)
        },
        fail: function (res) {
          // that.getMainListdata('refresh');
          // 如果获取位置信息失败，可以处理错误情况
          //console.log('获取位置失败', res.errMsg)
        }
      })
    });
  },


  });