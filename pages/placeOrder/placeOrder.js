const datepicker = require('../../utils/datepicker')
const app = getApp()

var http = require('../../utils/http');
Page({
  data: {
    startTime: '选择开始时间',
    endTime:'选择结束时间',
    multiArray: [],//piker的item项
    multiIndex: [],//当前选择列的下标
    multiEndIndex:[],
    year: '',//选择的年
    month: '',//选择的月
    day: '',//选择的日
    hour: '',//选择的时
    minute: '',//选择的分,
    roomId:'',
    roomName:'',
    name:'',
    phone:''
  },
  onLoad: function (options) {
    // 获取携带的参数
    console.log(options); // 输出：12345
    if(options.id){
      this.setData({
        roomId:options.id,
        roomName:options.roomName
      })
    }
  },
  onShow: function () {
    //获取 datepicker 工具下的方法
    var loadPickerData = datepicker.loadPickerData()
    var getCurrentDate = datepicker.getCurrentDate()
    var GetMultiIndex = datepicker.GetMultiIndex()
 
    //这里写的是为了记录当前时间
    let year = parseInt(getCurrentDate.substring(0, 4));
    let month = parseInt(getCurrentDate.substring(5, 7));
    let day = parseInt(getCurrentDate.substring(8, 10));
    let hour = parseInt(getCurrentDate.substring(11, 13));
    let minute = parseInt(getCurrentDate.substring(14, 16));
    console.log(getCurrentDate);
    this.setData({
      multiArray: loadPickerData,//picker数组赋值，格式 [years, months, days, hours, minutes]
      multiIndex: GetMultiIndex,//设置pickerIndex，[0,0,0,0,0]
      multiEndIndex: GetMultiIndex,
      startTime: getCurrentDate, //设置当前时间 ，currentYears+'-'+mm+'-'+dd+' '+hh+':'+min
      year: year,//记录选择的年
      month: month,//记录选择的月
      day: day,//记录选择的日
      hour: hour,//记录选择的时
      minute: minute,//记录选择的分 
    });
 
  },
  bindMultiPickerChange: function (e) { //时间日期picker选择改变后，点击确定 
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiEndIndex: e.detail.value
    })
    console.log("multiIndex=======>" , this.data.multiIndex)
    const index = this.data.multiIndex; // 当前选择列的下标
    const year = this.data.multiArray[0][index[0]];
    const month = this.data.multiArray[1][index[1]];
    const day = this.data.multiArray[2][index[2]];
    const hour = this.data.multiArray[3][index[3]];
    const minute = this.data.multiArray[4][index[4]];
    console.log(`${year}-${month}-${day} ${hour}:${minute}`); 
 
    this.setData({
      startTime: year.replace('年', '/') + month.replace('月', '/') + day.replace('日', '') + ' ' + hour.replace('时', '') + ':' + minute.replace('分', ''),
      year: year, //记录选择的年
      month: month, //记录选择的月
      day: day, //记录选择的日
      hour: hour, //记录选择的时
      minute: minute, //记录选择的分 
    })
  },
  bindMultiPickerColumnChange: function (e) { //监听picker的滚动事件
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    let getCurrentDate = datepicker.getCurrentDate();//获取现在时间  
    let currentYear = parseInt(getCurrentDate.substring(0, 4));
    let currentMonth = parseInt(getCurrentDate.substring(5, 7));
    let currentDay = parseInt(getCurrentDate.substring(8, 10));
    let currentHour = parseInt(getCurrentDate.substring(11, 13));
    let currentMinute = parseInt(getCurrentDate.substring(14, 16));
    if (e.detail.column == 0) {//修改年份列 
      let yearSelected = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);//当前选择的年份
      this.setData({
        multiIndex: [0, 0, 0, 0, 0],//设置pickerIndex
        year: yearSelected //当前选择的年份
      });
      if (yearSelected == currentYear) {//当前选择的年份==当前年份  
        var loadPickerData = datepicker.loadPickerData();
        this.setData({
          multiArray: loadPickerData,//picker数组赋值
          multiIndex: [0, 0, 0, 0, 0] //设置pickerIndex
        });
      } else {  // 选择的年份！=当前年份 
        // 处理月份
        let monthArr = datepicker.loadMonths(1, 12)
        // 处理日期
        let dayArr = datepicker.loadDays(currentYear, currentMonth, 1)
        // 处理hour
        let hourArr = datepicker.loadHours(0, 24);
        // 处理minute
        let minuteArr = datepicker.loadMinutes(0, 60)
        // 给每列赋值回去
        this.setData({
          ['multiArray[1]']: monthArr,
          ['multiArray[2]']: dayArr,
          ['multiArray[3]']: hourArr,
          ['multiArray[4]']: minuteArr
        });
      }
    }
    if (e.detail.column == 1) {//修改月份列
      let mon = parseInt(this.data.multiArray[e.detail.column][e.detail.value]); //当前选择的月份
      this.setData({
        month: mon  // 记录当前列
      })
 
      if (mon == currentMonth) {//选择的月份==当前月份 
        if (this.data.year == currentYear) {
 
          // 处理日期
          let dayArr = datepicker.loadDays(currentYear, mon, currentDay)
          // 处理hour
          let hourArr = datepicker.loadHours(currentHour, 24);
          // 处理minute
          let minuteArr = datepicker.loadMinutes(currentMinute, 60)
 
          this.setData({
            ['multiArray[2]']: dayArr,
            ['multiArray[3]']: hourArr,
            ['multiArray[4]']: minuteArr
          })
        } else {
          // 处理日期
          let dayArr = datepicker.loadDays(this.data.year, mon, 1)
          // 处理hour
          let hourArr = datepicker.loadHours(0, 24);
          // 处理minute
          let minuteArr = datepicker.loadMinutes(0, 60)
 
          this.setData({
            ['multiArray[2]']: dayArr,
            ['multiArray[3]']: hourArr,
            ['multiArray[4]']: minuteArr
          });
        }
      } else {  // 选择的月份！=当前月份 
        // 处理日期
        let dayArr = datepicker.loadDays(this.data.year, mon, 1) // 传入当前年份，当前选择的月份去计算日
        // 处理hour
        let hourArr = datepicker.loadHours(0, 24);
        // 处理minute
        let minuteArr = datepicker.loadMinutes(0, 60)
console.log(dayArr,'日期');
        this.setData({
          ['multiArray[2]']: dayArr,
          ['multiArray[3]']: hourArr,
          ['multiArray[4]']: minuteArr
        });
      }
    }
    if (e.detail.column == 2) {//修改日
      let dd = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);//当前选择的日
      this.setData({
        day: dd
      })
      if (dd == currentDay) {//选择的日==当前日
        if (this.data.year == currentYear && this.data.month == currentMonth) {//选择的是今天 
 
          // 处理hour
          let hourArr = datepicker.loadHours(currentHour, 24);
          // 处理minute
          let minuteArr = datepicker.loadMinutes(currentMinute, 60)
 
          this.setData({
            ['multiArray[3]']: hourArr,
            ['multiArray[4]']: minuteArr
          });
 
        } else { //选择的不是今天 
          // 处理hour
          let hourArr = datepicker.loadHours(0, 24);
          // 处理minute
          let minuteArr = datepicker.loadMinutes(0, 60)
 
          this.setData({
            ['multiArray[3]']: hourArr,
            ['multiArray[4]']: minuteArr
          });
        }
      } else {  // 选择的日！=当前日 
        // 处理hour
        let hourArr = datepicker.loadHours(0, 24);
        // 处理minute
        let minuteArr = datepicker.loadMinutes(0, 60)
 
        this.setData({
          ['multiArray[3]']: hourArr,
          ['multiArray[4]']: minuteArr
        });
      }
    }
    if (e.detail.column == 3) {//修改时
      let hh = parseInt(this.data.multiArray[e.detail.column][e.detail.value]); //当前选择的时
      this.setData({
        hour: hh
      })
      if (hh == currentHour) {//选择的时==当前时 
        if (this.data.year == currentYear && this.data.month == currentMonth && this.data.month == currentMonth) {   // 选择的是今天
          // 处理minute
          let minuteArr = datepicker.loadMinutes(currentMinute, 60)
          this.setData({
            ['multiArray[4]']: minuteArr
          });
        } else { // 选择的不是今天
 
          // 处理minute
          let minuteArr = datepicker.loadMinutes(0, 60)
          this.setData({
            ['multiArray[4]']: minuteArr
          });
        }
      } else {//选择的时！=当前时 
        // 处理minute
        let minuteArr = datepicker.loadMinutes(0, 60)
        this.setData({
          ['multiArray[4]']: minuteArr
        });
      }
    }
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value; //将值赋回去
    console.log(data.multiIndex[e.detail.column])
    this.setData(data);  //将值赋回去
  },
  bindMultiPickerChanges: function (e) { //时间日期picker选择改变后，点击确定 
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    console.log("multiIndex" , this.data.multiIndex)
    const index = this.data.multiIndex; // 当前选择列的下标
    const year = this.data.multiArray[0][index[0]];
    const month = this.data.multiArray[1][index[1]];
    const day = this.data.multiArray[2][index[2]];
    const hour = this.data.multiArray[3][index[3]];
    const minute = this.data.multiArray[4][index[4]];
    console.log(`${year}-${month}-${day} ${hour}:${minute}`); 
 
    this.setData({
      endTime: year.replace('年', '/') + month.replace('月', '/') + day.replace('日', '') + ' ' + hour.replace('时', '') + ':' + minute.replace('分', ''),
      year: year, //记录选择的年
      month: month, //记录选择的月
      day: day, //记录选择的日
      hour: hour, //记录选择的时
      minute: minute, //记录选择的分 
    })
    //console.log(this.data.time); 
  },
  bindMultiPickerColumnChanges: function (e) { //监听picker的滚动事件
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    let getCurrentDate = datepicker.getCurrentDate();//获取现在时间  
    let currentYear = parseInt(getCurrentDate.substring(0, 4));
    let currentMonth = parseInt(getCurrentDate.substring(5, 7));
    let currentDay = parseInt(getCurrentDate.substring(8, 10));
    let currentHour = parseInt(getCurrentDate.substring(11, 13));
    let currentMinute = parseInt(getCurrentDate.substring(14, 16));
    if (e.detail.column == 0) {//修改年份列 
      let yearSelected = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);//当前选择的年份
      this.setData({
        multiIndex: [0, 0, 0, 0, 0],//设置pickerIndex
        year: yearSelected //当前选择的年份
      });
      if (yearSelected == currentYear) {//当前选择的年份==当前年份  
        var loadPickerData = datepicker.loadPickerData();
        this.setData({
          multiArray: loadPickerData,//picker数组赋值
          multiIndex: [0, 0, 0, 0, 0] //设置pickerIndex
        });
      } else {  // 选择的年份！=当前年份 
        // 处理月份
        let monthArr = datepicker.loadMonths(1, 12)
        // 处理日期
        let dayArr = datepicker.loadDays(currentYear, currentMonth, 1)
        // 处理hour
        let hourArr = datepicker.loadHours(0, 24);
        // 处理minute
        let minuteArr = datepicker.loadMinutes(0, 60)
        // 给每列赋值回去
        this.setData({
          ['multiArray[1]']: monthArr,
          ['multiArray[2]']: dayArr,
          ['multiArray[3]']: hourArr,
          ['multiArray[4]']: minuteArr
        });
      }
    }
    if (e.detail.column == 1) {//修改月份列
      let mon = parseInt(this.data.multiArray[e.detail.column][e.detail.value]); //当前选择的月份
      this.setData({
        month: mon  // 记录当前列
      })
 
      if (mon == currentMonth) {//选择的月份==当前月份 
        if (this.data.year == currentYear) {
 
          // 处理日期
          let dayArr = datepicker.loadDays(currentYear, mon, currentDay)
          // 处理hour
          let hourArr = datepicker.loadHours(currentHour, 24);
          // 处理minute
          let minuteArr = datepicker.loadMinutes(currentMinute, 60)
 
          this.setData({
            ['multiArray[2]']: dayArr,
            ['multiArray[3]']: hourArr,
            ['multiArray[4]']: minuteArr
          })
        } else {
          // 处理日期
          let dayArr = datepicker.loadDays(this.data.year, mon, 1)
          // 处理hour
          let hourArr = datepicker.loadHours(0, 24);
          // 处理minute
          let minuteArr = datepicker.loadMinutes(0, 60)
 
          this.setData({
            ['multiArray[2]']: dayArr,
            ['multiArray[3]']: hourArr,
            ['multiArray[4]']: minuteArr
          });
        }
      } else {  // 选择的月份！=当前月份 
        // 处理日期
        let dayArr = datepicker.loadDays(this.data.year, mon, 1) // 传入当前年份，当前选择的月份去计算日
        // 处理hour
        let hourArr = datepicker.loadHours(0, 24);
        // 处理minute
        let minuteArr = datepicker.loadMinutes(0, 60)
console.log(dayArr,'日期');
        this.setData({
          ['multiArray[2]']: dayArr,
          ['multiArray[3]']: hourArr,
          ['multiArray[4]']: minuteArr
        });
      }
    }
    if (e.detail.column == 2) {//修改日
      let dd = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);//当前选择的日
      this.setData({
        day: dd
      })
      if (dd == currentDay) {//选择的日==当前日
        if (this.data.year == currentYear && this.data.month == currentMonth) {//选择的是今天 
 
          // 处理hour
          let hourArr = datepicker.loadHours(currentHour, 24);
          // 处理minute
          let minuteArr = datepicker.loadMinutes(currentMinute, 60)
 
          this.setData({
            ['multiArray[3]']: hourArr,
            ['multiArray[4]']: minuteArr
          });
 
        } else { //选择的不是今天 
          // 处理hour
          let hourArr = datepicker.loadHours(0, 24);
          // 处理minute
          let minuteArr = datepicker.loadMinutes(0, 60)
 
          this.setData({
            ['multiArray[3]']: hourArr,
            ['multiArray[4]']: minuteArr
          });
        }
      } else {  // 选择的日！=当前日 
        // 处理hour
        let hourArr = datepicker.loadHours(0, 24);
        // 处理minute
        let minuteArr = datepicker.loadMinutes(0, 60)
 
        this.setData({
          ['multiArray[3]']: hourArr,
          ['multiArray[4]']: minuteArr
        });
      }
    }
    if (e.detail.column == 3) {//修改时
      let hh = parseInt(this.data.multiArray[e.detail.column][e.detail.value]); //当前选择的时
      this.setData({
        hour: hh
      })
      if (hh == currentHour) {//选择的时==当前时 
        if (this.data.year == currentYear && this.data.month == currentMonth && this.data.month == currentMonth) {   // 选择的是今天
          // 处理minute
          let minuteArr = datepicker.loadMinutes(currentMinute, 60)
          this.setData({
            ['multiArray[4]']: minuteArr
          });
        } else { // 选择的不是今天
 
          // 处理minute
          let minuteArr = datepicker.loadMinutes(0, 60)
          this.setData({
            ['multiArray[4]']: minuteArr
          });
        }
      } else {//选择的时！=当前时 
        // 处理minute
        let minuteArr = datepicker.loadMinutes(0, 60)
        this.setData({
          ['multiArray[4]']: minuteArr
        });
      }
    }
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value; //将值赋回去
    // this.setData(data);  //将值赋回去
  },
  // 提交
  submit(){
    var orderSubmitReqVO ={
      
    }
    var that = this
    if(that.data.endTime == "选择结束时间"){
      wx.showModal({
        content: '请选择结束时间',
        showCancel: false,
      })
      return
    }
    if(!that.data.phone ){
      wx.showModal({
        content: '请填写手机号',
        showCancel: false,
      })
      return
    }
    http.request(
      "/member/manager/submitOrder",
      "1",
      "post", {
        "roomId": that.data.roomId,
        "startTime":that.data.startTime,
        "endTime":that.data.endTime,
        "mobile":that.data.phone
      },
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        console.info('返回111===');
        console.info(info);
        if (info.code == 0) {
          wx.showToast({
            title: '操作成功',
            icon: 'success'
          })
          wx.navigateBack({
            delta: 1 // 返回的页面数，这里表示返回上一页
          });
          

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
  },
  
})