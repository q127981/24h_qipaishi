// pages/statics/statics.js
import * as echarts from '../../js/echarts';
const app = getApp()
var http = require('../../../utils/http');
var util1 = require('../../../utils/util.js');

var Moment = require('../../../lib/moment.js');
var ininfo_x = []
var ininfo_y = []
var totalOrder = 0
var inorder = []
var inpeople_x = []
var inpeople_y = []
var roominfo_x = []
var roominfo_y = []
var roomtime = []
var income = []
var recharge = []
// 收益统计
function chartIninfo(canvas, width, height, dpr) {
  let that = this
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  var option = {
    grid: {
      left: '3%', //默认10%
      right: '5%', //默认10%
      bottom: '0', //默认60
      containLabel: true
      //grid区域是否包含坐标轴的刻度标签
    },
    legend: {
      data: ['营业收益'],
      right: 10,
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      // data: ['07-15', '07-16', '07-17', '07-17', '07-18', '07-19', '07-20'],
      data: ininfo_x
      // show: false
    },
    yAxis: {
      name: '单位：元',
      x: 'center',
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
      // show: false
    },
    series: [{
      name: '营业收益',
      type: 'line',
      smooth: true,
      areaStyle: {},
      data: ininfo_y,
      emphasis: {
        focus: 'series'
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}元',//显示单位
      },
    }]
  };
  if (ininfo_y.length > 15) {
    option.series[0].label = {}
    option.series[0].emphasis = {
      focus: 'series',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}元',//显示单位
      },
    }
  } 

  chart.setOption(option);
  return chart;
} 
// 订单统计
function chartInorder(canvas, width, height, dpr) {
  let that = this
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  var option = {
    title: {
      text: [
        '订单总数',
        totalOrder,
      ].join('\n'),
      top: 'center',
      left: 'center',
      // 可以设置显示的样式
      textStyle: {
        color: '#2c3542',
        fontWeight: 'normal',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '0',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        padAngle: 3,
        itemStyle: {
          borderRadius: 4
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}',//显示百分号
        },
        labelLine: {
          show: false
        },
        data: inorder
      }
    ]
  };

  chart.setOption(option);
  return chart;
} 
// 人数统计
function chartInpeople(canvas, width, height, dpr) {
  let that = this
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  var option = {
    grid: {
      left: '5%', //默认10%
      right: '5%', //默认10%
      bottom: '0', //默认60
      containLabel: true,
      //grid区域是否包含坐标轴的刻度标签
    },
    legend: {
      data: ['顾客数量'],
      right: 10,
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      // data: ['07-15', '07-16', '07-17', '07-17', '07-18', '07-19', '07-20'],
      data: inpeople_x
      // show: false
    },
    yAxis: {
      name: '单位：人',
      x: 'center',
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
      // show: false
    },
    series: [{
      name: '顾客数量',
      type: 'line',
      smooth: true,
      // data: [0, 0, 0, 0, 0, 0, 50],
      data: inpeople_y,
      label: {
        show: true,
        position: 'top',
        formatter: '{c}人',//显示单位
      }
    }]
  };
  if (inpeople_y.length > 15) {
    option.series[0].label = {}
    option.series[0].emphasis = {
      focus: 'series',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}人',//显示单位
      },
    }
  }
  chart.setOption(option);
  return chart;
} 
// 房间使用率
function chartRoom(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  var option = {
    grid: {
      left: '3%', //默认10%
      right: '5%', //默认10%
      bottom: '0', //默认60
      containLabel: true
      //grid区域是否包含坐标轴的刻度标签
    },
    legend: {
      data: ['房间使用率'],
      right: 10,
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      // data: ['07-15', '07-16', '07-17', '07-17', '07-18', '07-19', '07-20'],
      data: roominfo_x
      // show: false
    },
    yAxis: {
      name: '单位：百分比',
      x: 'center',
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
      axisLabel: {
        formatter: '{value} %',
        // ...
      },
      // show: false
    },
    series: [{
      name: '房间使用率',
      type: 'bar',
      barWidth: 15,
      smooth: true,
      data: roominfo_y,
      backgroundStyle: {
        color: 'rgba(180, 180, 180, 0.2)'
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',//显示单位
      },
    }]
  };

  if (roominfo_y.length > 7) {
    option.series[0].barWidth = '80%'
    option.series[0].barGap = '2%'
    option.series[0].label = {}
    option.series[0].emphasis = {
      focus: 'self',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',//显示单位
      },
    }
  }

  chart.setOption(option);
  return chart;
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    storeId: '', //列表搜索门店id
    stores: [],
    show: false,
    active1: 0,
    active2: 0,
    active3: 0,
    sdt: '',
    edt: '',
    dateShow: false, //日期控件
    minDate: new Date(2023, 0, 1).getTime(),
    start: '',
    end: '',
    ec_ininfo: {
      onInit: chartIninfo
    },
    ec_inorder: {
      onInit: chartInorder
    },
    ec_inpeople: {
      onInit: chartInpeople
    },
    ec_roominfo: {
      onInit: chartRoom
    },
    topinfo: '',
    businfo:'',
    sdt1: '',
    edt1: '',
    sdt2: '',
    sdt3: '',
    edt2: '',
    edt3: '',
    date: '',
    date_2: '',
    date_3: '',
    date7: '',
    date7_2: '',
    date7_3: '',
    date30: '',
    date30_2: '',
    date30_3: '',
    isDefine: false,
    isDefine1: false,
    isDefine2: false,
    isDefine3: false,
    type: '',
    ininfo_y: [],
    inorder: [],
    inpeople_y: [],
    roominfo_y: [],
    roomtime: [],
    income: [],
    recharge: [],
    beforeCloseFunction:null,
    mainColor: app.globalData.mainColor
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var date = Moment().format('YYYY-MM-DD'); //获取当前时间并格式化输出
    var date_2 = Moment().format('MM-DD');
    var date_3 = Moment().format('MM-DD');
    var date7 = Moment().subtract(6, 'days').format('YYYY-MM-DD');
    var date7_2 = Moment().subtract(6, 'days').format('MM-DD');
    var date7_3 = Moment().subtract(6, 'days').format('MM-DD');
    var date30 = Moment().subtract(30, 'days').format('YYYY-MM-DD');
    var date30_2 = Moment().subtract(30, 'days').format('MM-DD');
    var date30_3 = Moment().subtract(30, 'days').format('MM-DD');
    this.setData({
      date: date,
      sdt: date,
      edt: date,
      sdt1: date,
      edt1: date,
      sdt2: date,
      sdt3: date,
      edt2: date,
      edt3: date,
      date7: date7,
      date30: date30,
      date_2: date_2,
      date7_2: date7_2,
      date30_2: date30_2,
      date_3: date_3,
      date7_3: date7_3,
      date30_3: date30_3,
    })
    this.getXiaLaListAdmin()
    this.getTop()
    this.getBus()
    this.getIn()
    this.getInorder()
    this.getInpeople()
    this.getRoom()
    this.getRoomtime()
    this.getIncome()
    this.getRecharge()
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
            stores.unshift({text:'全部门店',value:""})
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
  //门店下拉菜单发生变化
  storeDropdown(event){
    //console.log(event)
    this.data.stores.map(it => {
      if(it.value == event.detail){
        this.setData({
          storeId: it.value,
        })
      }
    })
    this.getTop()
    this.getBus()
    this.getIn()
    this.getInorder()
    this.getInpeople()
    this.getRoom()
    this.getRoomtime()
    this.getIncome()
    this.getRecharge()
  },
  // 获取营业额数据 （收入、提现、待提现）
  getTop: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/chart/getRevenueChart",
        "1",
        "post", {
          "storeId": that.data.storeId
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              topinfo: info.data
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
  // 申请提现
  cashOut(){
    let that = this
    wx.showModal({
      title: '提示',
      content: `您申请提现${that.data.topinfo.totalMoney}元，申请提交后审核到账时间约为3个工作日内，通过微信商家支付直接转账至您的微信余额，因微信和美团等平台手续费原因，会收取提现金额收取1%的费用，请知悉。`,
      complete: (res) => {
        if (res.cancel) {
          
        }
    
        if (res.confirm) {
          if (app.globalData.isLogin) 
          {
            http.request(
              "/member/manager/applyWithdrawal",
              "1",
              "post", {
              },
              app.globalData.userDatatoken.accessToken,
              "",
              function success(info) {
                console.info('返回111===');
                console.info(info);
                if (info.code == 0) {
                  wx.showToast({
                    title: '提现成功',
                  })
                  that.getTop()
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
  // 选日期
  changeDate: function(e){
    this.setData({start:'',end:''})
    var info = e.currentTarget.dataset.info
    var type = e.currentTarget.dataset.type
    var sdt = ''
    var edt = this.data.date
    if(info == 1){
      sdt = this.data.date
    }else if(info == 7){
      sdt = this.data.date7
    }else if(info == 30){
      sdt = this.data.date30
    }
    if(type == 'bus'){
      this.setData({
        sdt: sdt,
        edt: edt,
        type: type,
        isDefine:false
      })
      this.getBus()
    }else if(type == 'in'){
      this.setData({
        sdt1: sdt,
        edt1: edt,
        type: type,
        isDefine1:false
      })
      this.getIn()
      this.getInorder()
      this.getInpeople()
    }else if(type == 'room'){
      this.setData({
        sdt2: sdt,
        edt2: edt,
        type: type,
        isDefine2:false
      })
      this.getRoom()
      this.getRoomtime()
    }else if(type == 'price'){
      this.setData({
        sdt3: sdt,
        edt3: edt,
        type: type,
        isDefine3:false
      })
      this.getIncome()
      this.getRecharge()
    }

  },
  // 自定义
  define(e){
    let type = e.currentTarget.dataset.type
    this.setData({
      show: true,
      type: type,
    })
    if(type == 'bus'){
      this.setData({isDefine: true})
    }else if(type == 'in'){
      this.setData({isDefine1: true})
    }else if(type == 'room'){
      this.setData({isDefine2: true})
    }
  },
  goSearch() {
    this.setData({ dateShow: true });
  },
  onClose() {
    this.setData({ dateShow: false});
  },
  formatDate(date) {
    date = new Date(date);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },
  onConfirm(event) {
    const [start, end] = event.detail;
    this.setData({
      dateShow: false,
      start: this.formatDate(start),
      end: this.formatDate(end)
    });
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
  onConfirm2() {
    if(this.data.start === '' && this.data.end === ''){
      this.setData({show:false})
      return
    }
    this.setData({show:false})
    let type = this.data.type
    if(type == 'bus'){
      this.setData({
        sdt: this.data.start,
        edt: this.data.end
      })
      this.getBus()
    }else if(type == 'in'){
      this.setData({
        sdt1: this.data.start,
        edt1: this.data.end
      })
      this.getIn()
      this.getInorder()
      this.getInpeople()
    }else if(type == 'room'){
      this.setData({
        sdt2: this.data.start,
        edt2: this.data.end
      })
      this.getRoom()
      this.getRoomtime()
    }
    else if(type == 'price'){
      this.setData({
        sdt3: this.data.start,
        edt3: this.data.end
      })
      this.getIncome()
      this.getRecharge()
    }
  },
  // tab切换
  onChange(event){
    var type = event.currentTarget.dataset.type
    if(type == 1){
      this.setData({
        active1: event.detail.name
      })
    }
    if(type == 2){
      this.setData({
        active2: event.detail.name
      })
    }
    if(type == 3){
      this.setData({
        active3: event.detail.name
      })
    }
  },
  // 获取经营统计数据（累积收入、订单数、下单人数）
  getBus: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/chart/getBusinessStatistics",
        "1",
        "post", {
          "storeId": that.data.storeId,
          "startTime": that.data.sdt,
          "endTime": that.data.edt
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              businfo: info.data
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
  // 获取收入统计
  getIn: function(){
    this.setData({ininfo_y: []})
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/chart/getRevenueStatistics",
        "1",
        "post", {
          "storeId": that.data.storeId,
          "startTime": that.data.sdt1,
          "endTime": that.data.edt1
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            ininfo_x = []
            ininfo_y = []
            info.data.map(it => {
              ininfo_y.push(it.value)
              ininfo_x.push(it.key)
            })
            that.setData({
              ininfo_y: ininfo_y
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
  // 获取订单统计
  getInorder: function(){
    totalOrder = 0
    this.setData({inorder: []})
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/chart/getOrderStatistics",
        "1",
        "post", {
          "storeId": that.data.storeId,
          "startTime": that.data.sdt1,
          "endTime": that.data.edt1
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            inorder = []
            info.data.map(it => {
              inorder.push({name:it.key,value:it.value})
              totalOrder +=it.value
            })
            that.setData({
              inorder: inorder
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
  // 获取消费人数统计
  getInpeople: function(){
    this.setData({inpeople_y: []})
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/chart/getMemberStatistics",
        "1",
        "post", {
          "storeId": that.data.storeId,
          "startTime": that.data.sdt1,
          "endTime": that.data.edt1
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            inpeople_y = []
            inpeople_x = []
            info.data.map(it => {
              inpeople_y.push(it.value)
              inpeople_x.push(it.key)
            })
            that.setData({
              inpeople_y: inpeople_y
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
  // 获取房间使用率统计
  getRoom: function(){
    this.setData({roominfo_y:[]})
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/chart/getRoomUseStatistics",
        "1",
        "post", {
          "storeId": that.data.storeId,
          "startTime": that.data.sdt2,
          "endTime": that.data.edt2
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            roominfo_y = []
            roominfo_x = []
            info.data.map(it => {
              roominfo_y.push(it.value)
              roominfo_x.push(it.key)
            })
            that.setData({
              roominfo_y: roominfo_y
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
  // 获取房间使用时长统计
  getRoomtime: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/chart/getRoomUseHourStatistics",
        "1",
        "post", {
          "storeId": that.data.storeId,
          "startTime": that.data.sdt2,
          "endTime": that.data.edt2
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            roomtime = info.data
            that.setData({
              roomtime: roomtime
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
   // 获取收入明细
  getIncome: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/chart/getIncomeStatistics",
        "1",
        "post", {
          "storeId": that.data.storeId,
          "startTime": that.data.sdt3,
          "endTime": that.data.edt3
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(that.data);
          if (info.code == 0) {
            that.setData({
              income: info.data
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
   // 获取充值明细
   getRecharge: function(){
    let that = this
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/chart/getRechargeStatistics",
        "1",
        "post", {
          "storeId": that.data.storeId,
          "startTime": that.data.sdt3,
          "endTime": that.data.edt3
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(that.data);
          if (info.code == 0) {
            that.setData({
              recharge: info.data
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
})