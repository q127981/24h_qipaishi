// pages/doorSubmit/doorSubmit.js
const app = getApp()
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
const citys = {'4时': [0,30],'5时': [0,30],'6时': [0,30],'7时': [0,30],'8时': [0,30],'9时': [0,30],'10时': [0,30],'11时': [0,30],'12时': [0,30],'13时': [0,30],'14时': [0,30],'15时': [0,30],'16时': [0,30],'17时': [0,30],'18时': [0,30],'19时': [0,30],'20时': [0,30],'21时': [0,30],'22时': [0,30],'23时': [0,30],'24时': [0,30]};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userNum: 4, //拼场人数
    ruleDesc: '',
    roomInfo: '', //房间信息
    show: false,
    beforeCloseFunction:null,
    columns: [
      {
        values: Object.keys(citys),
        className: 'column1',
      },
      {
        values: citys['4时'],
        className: 'column2',
        defaultIndex: 0,
      },
    ],
    submit_order_hour:4,//预定的小时数
    isIpx: app.globalData.isIpx?true:false,
    doorname:'',//店名

    //////////////////////////////////
    select_time_index:0,
    daytime:'',
    begin_month_day_time:'',
    begin_hour_minute_time:'',
    end_month_day_time:'',
    end_hour_minute_time:'',
    minDate:'',//可选最小时间
    minHour:'',//可选最小小时
    timeHourArr:[],
    timeHourAllArr:[],
    //订单提交
    submit_begin_time:'',//开始时间
    submit_end_time:'',//结束时间
    weixinOrderNo:'',//微信支付订单号
    nightLong:false,//是否通宵
    ///////////////
    currentDate: '12:00',
    showtimefalge:false,
    filter(type, options) {
      if (type === 'minute') {
        return options.filter((option) => option % 30 === 0);
      }
      return options;
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;
    this.setData({
      roomInfo: JSON.parse(options.roomInfo) 
    })
    //console.log('房间信息=====');
    //console.log(that.data.roomInfo);
    //console.log('房间信息=====');
    
    if(options.doorname){
      that.setData({
        doorname: options.doorname
      });
    }
    wx.showModal({
      title: '温馨提示',
      content: '约局功能仅供好友间线下娱乐组局使用，禁止发布赌博等违法行为，请遵守治安管理条例，勿发布违法信息!',
      showCancel: false
    })
    this.setData({beforeCloseFunction: this.beforeClose()})

    //设置禁用时间
    this.sethour();
    this.setroomlistHour(0);
    //初始化时间
    this.loadingtime();
  },

  //初始化时间
  loadingtime:function(){
    var that = this;
    var date = new Date(); //获取当前时间
    var year = date.getFullYear();
    var month = date.getMonth() + 1; //获取当前月份
    var day = date.getDate(); //获取当前日期

    //console.log('开始时间======='+month);
    if (month < 10) {
      month = '0' + month;
    };
    if (day < 10) {
      day = '0' + day;
    };

    that.setData({
      daytime: [month, day].map(util1.formatNumber).join('.'),
      begin_month_day_time: month+'月'+day+'日',
    });
    var hour = date.getHours(); //获取当前小时
    var minute = date.getMinutes(); //获取当前分钟 
    //取整时间
    if(minute<=30){
      minute = 30;
    }else{
      minute = 0;
      hour = hour+1;
    }
    that.setData({
      currentDate:[hour, minute].map(util1.formatNumber).join(':'),
      minDate:[hour, minute].map(util1.formatNumber).join(':'),
      minHour:hour,
      begin_hour_minute_time:[hour, minute].map(util1.formatNumber).join(':'),
      submit_begin_time:year+'-'+month+'-'+day+' '+[hour, minute].map(util1.formatNumber).join(':')
    });
    const str = [year, month,day].map(util1.formatNumber).join('-')+' '+[hour, minute].map(util1.formatNumber).join(':');
    //console.log('时间信息===111====='+str);
    const newdate = new Date(str);
    var atime = this.haveSomeMinutesTime(newdate,4*60)
    //console.log('几小时过后的======时间信息==='+atime);
  },
  haveSomeMinutesTime:function(newDate,n) {
    var that = this;
    if (n == null) {
      n = 0;
    }
    var date = newDate.setMinutes(newDate.getMinutes() + n);
    newDate = new Date(date);
    var year = newDate.getFullYear();
    var month = newDate.getMonth() + 1; //获取当前月份
    var day = newDate.getDate(); //获取当前日期   
    var h = newDate.getHours();
    var m = newDate.getMinutes();
    var s = newDate.getSeconds();
    if (month < 10) {
      month = '0' + month;
    };
    if (day < 10) {
      day = '0' + day;
    };
    if (h < 10) {
      h = '0' + h;
    };
    if (m < 10) {
      m = '0' + m;
    };
    if (s < 10) {
      s = '0' + s;
    };
    var time = year + month + day + h + m + s;

    //console.log('结束时间======='+month);

    that.setData({
      end_month_day_time: month+'月'+day+'日',
      end_hour_minute_time:[h, m].map(util1.formatNumber).join(':'),
      submit_end_time:year+'-'+month+'-'+day+' '+[h, m].map(util1.formatNumber).join(':')
    });
    return time;
  },
  //点击的时间
  selectTimeHour:function(event){
    console.log("nightLong:"+this.data.nightLong)
    let that = this
    var date = new Date(); //获取当前时间
    var year = date.getFullYear();
    var  alist = that.data.daytime.split('.');
    var month = alist[0]; //获取当前月份
    var day = alist[1]; //获取当前日期
    var hour = date.getHours(); //获取当前小时
    var minute = date.getMinutes(); //获取当前分钟 
    const str = [year, month,day].map(util1.formatNumber).join('-')+' '+that.data.begin_hour_minute_time;
    
    const newdate = new Date(str);
    let atimeindex = event.currentTarget.dataset.index;
    that.setData({
      select_time_index: atimeindex,
      nightLong: false
    })
    
    if(atimeindex == 0){
      that.setData({
        submit_order_hour: 4
      })
      this.haveSomeMinutesTime(newdate,4*60)
    }else if(atimeindex == 1){
      that.setData({
        submit_order_hour: 5
      })
      this.haveSomeMinutesTime(newdate,5*60)
    }else if(atimeindex == 2){
      that.setData({
        submit_order_hour: 6
      })
      this.haveSomeMinutesTime(newdate,6*60)
    }else if(atimeindex == 3){
      hour = 23; 
      minute = 0; 
      that.setData({
        nightLong: true,
        begin_hour_minute_time:[hour, minute].map(util1.formatNumber).join(':'),
        submit_order_hour: 9,
        submit_begin_time:year+'-'+month+'-'+day+' '+[hour, minute].map(util1.formatNumber).join(':')
      });
      const str1 = [year, month,day].map(util1.formatNumber).join('-')+' '+that.data.begin_hour_minute_time;
      const newdate1 = new Date(str1);
      this.haveSomeMinutesTime(newdate1,9*60)
    }else if(atimeindex == 4){
      that.setData({
        select_time_index: -1
      })
    }
    console.log("nightLong:"+this.data.nightLong)
  },
  sethour:function(){
    var that = this;
    var timearr = [];
    for(var i =0;i<24;i++){
      var atemp = {
        hourname:'',//小时
        useflage:false//是否可以使用
      };
      atemp.hourname = i;
      atemp.useflage = false;
      timearr.push(atemp)
    }
    that.setData({
      timeHourArr: timearr
    })
  },
  // sethour:function(){
  //   var that = this;
  //   var myDate = new Date();
  //   var ah = myDate.getHours();       //获取当前小时数(0-23)
  //   var timearr = [];
  //   var aci = false;
  //   var anewtime = 0;

  //   for(var i =0;i<24;i++){
  //       var atime = ah+i;
  //       var atemp = {
  //         hourname:'',//小时
  //         useflage:false//是否可以使用
  //       };
  //       if(atime == 24){
  //         atemp.hourname = '0'
  //         atemp.useflage = false
  //         aci = true;
  //       }else{
  //         if(aci){
  //           atime = atime-24;
  //           atemp.hourname = atime
  //           atemp.useflage = false
  //         }else{
  //           atemp.hourname = atime
  //           atemp.useflage = false
  //         }
  //       }
  //       timearr.push(atemp)
  //   }
  //   this.setData({
  //     timeHourArr: timearr
  //   })
  // },
  //设置列表禁用时间轴
  setroomlistHour:function(aindex){
    var that = this;
    var date = new Date(); //获取当前时间
    var year = date.getFullYear();
    var anewdate = that.data.daytime .replace(".", "-");
    var atimestring1 = [year, anewdate].map(util1.formatNumber).join('-')

    var atemplist = []; 
    var atemp = that.data.roomInfo.disabledTimeSlot;
    var requestkeyArr=[];
    var requestvalueArr=[];
    Object.keys(atemp).sort().forEach(function(key){
      if(key == atimestring1){
        requestkeyArr.push(key);
        requestvalueArr.push(atemp[key]);
      }
    });
    //console.log('得到了禁用的小时数=====');
    //console.log(atimestring1);
    //console.log(requestkeyArr);
    //console.log(requestvalueArr);
    //console.log('得到了禁用的小时数=====');
    if(!requestvalueArr.length){
      return
    }
    var listarr1 = requestvalueArr[aindex];//这个地方0的索引值就是日期选择的索引值
    if(listarr1)
    {
        //时间处理，标记时间短是否可用
        var edittimeHourArr = [];
        for(var k = 0;k<listarr1.length;k++){
          var atime1 = listarr1[k];
          var astartTime = atime1.startTime;
          var aendTime = atime1.endTime;

          var ahourend1 = aendTime.split(':');
          var ahourstart1 = astartTime.split(':');

          var num1 = Number(ahourend1[0]);
          var num2 = Number(ahourstart1[0]);

          var ahourint = num1-num2;//得到相差几个小时
          //得到时段
          for(var n=0;n<=ahourint;n++){
            var num = Number(ahourstart1[0]);
            var acounttime = num+n;
            edittimeHourArr.push(acounttime);//保存禁用小时数据
          }
        }
        //console.log('得到了禁用的小时数=====');
        //console.log(edittimeHourArr);
        //console.log('得到了禁用的小时数=====');
        var anewlist = [];

        var aoldtimeHourArr =  that.data.timeHourArr;
        //console.log('aoldtimeHourArr======0000');
        //console.log(aoldtimeHourArr);
        //console.log('aoldtimeHourArr=====1111');

        for(var y=0;y<aoldtimeHourArr.length;y++){
          var atemp1 = aoldtimeHourArr[y];
          var atempold = {
            hourname:'',//小时
            useflage:false//是否可以使用
          };
          atempold.hourname = atemp1.hourname;
          var atimeh = aoldtimeHourArr[y];
          var aserchbool = false;
          for(var m=0;m<edittimeHourArr.length;m++){
            var aedith = edittimeHourArr[m];
            if(atimeh.hourname == aedith){
              aserchbool = true;
              break;
            }
            // else if(atimeh.hourname == '次' && aedith==0){
            //   aserchbool = true;
            //   break;
            // }
          }
          if(aserchbool){
            atempold.useflage = true;
          }else{
            atempold.useflage = false;
          }
          anewlist.push(atempold);
        }
        atemplist.push(anewlist);
    }
    else{
      atemplist.push(that.data.timeHourArr);
    }
    //console.log('整合后的=====');
    //console.log(atemplist);
    //console.log('整合后的=====');
    that.setData({
      timeHourAllArr: atemplist
    });
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
  //图片点击事件
  imgYu: function(event) {
    var that = this;
    if(that.data.roomInfo.imageUrls){
      var RoomImageList = that.data.roomInfo.imageUrls.split(",")
      var src = RoomImageList[0]+'?Content-Type=image/jpg'; //获取data-src
      var imgList = RoomImageList; //获取data-list
      //图片预览
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: imgList // 需要预览的图片http链接列表
      })
    }else{
      wx.showToast({
        title: '该房间暂无图片介绍',
        icon: 'none'
      })
    }
  },
  // 人数变化
  onChange:function(event){
    var that = this
    var userNum = event.detail
    this.setData({
      userNum: userNum
    })
  },
  submit: function(){
    var that = this
    if(this.data.ruleDesc===''){
      wx.showToast({
        title: '请填写玩法规则',
        icon: 'error'
      })
      return
    }
    
    console.info('时间===');
    console.info(that.data.submit_begin_time);
    console.info(that.data.submit_end_time);
    console.info('时间===');
    
    if (app.globalData.isLogin) 
    {
      http.request(
        "/member/game/save",
        "1",
        "post", {
          "storeId": that.data.roomInfo.storeId,
          "roomId": that.data.roomInfo.roomId,
          "ruleDesc": that.data.ruleDesc,
          "userNum": that.data.userNum,
          "startTime": that.data.submit_begin_time,
          "endTime": that.data.submit_end_time,
        },
        app.globalData.userDatatoken.accessToken,
        "",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            wx.showToast({
              title: '发起组局成功',
            })
            setTimeout(() => {
              wx.switchTab({
                url: '../door/door',
              })
            }, 1000);
          }
        },
        function fail(info) {
          
        }
      )
    } 
    else {
      //console.log('未登录失败！')
    }
  },
  // 点击其他时间
  otherTime(){
    this.setData({show: true})
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
  //其他时间点击确定
  onTimeConfirm(event) {
    let that = this
    //console.log(event.detail)
    var value = event.detail.value
    var hour = Number(value[0].replace(/[^\d]/g, " "))
    var minute = Number((value[1] / 60).toFixed(1))

    var anewhour = 0
    if(minute>0){
      anewhour = hour+0.5
    }else{
      anewhour = hour
    }
    //判断当前日期有没有被预定的时间段
    var atimelist = that.data.timeHourAllArr[0];
    var aselecttime = false;
    if(atimelist)
    {
        for(var i = 0;i<atimelist.length;i++){
            var aobjtemp = atimelist[i];
            if(aobjtemp.useflage==true && aobjtemp==hour){
              //选择了禁用时间
              aselecttime = true;
              break;
            }
        }
    }
    if(aselecttime){
       wx.showToast({
         title: '选择的该时段已经被预定，请重新选择',
         icon: 'none'
       })
       return;
    }
    var date = new Date(); //获取当前时间
    var year = date.getFullYear();
    var  alist = that.data.daytime.split('.');
    var month = alist[0]; //获取当前月份
    var day = alist[1]; //获取当前日期
    const str = [year, month,day].map(util1.formatNumber).join('-')+' '+that.data.begin_hour_minute_time;
    const newdate = new Date(str);
    var atime = this.haveSomeMinutesTime(newdate,anewhour*60)
    //console.log('几小时过后的======时间信息==='+atime);
    //改变价格
    this.setData({
      select_time_index:4,
      show: false,
    })
  },
  onTimeCancel(){
    this.setData({show: false})
  },
  setshowSelectHour:function(){
    let that = this
    that.setData({
      showtimefalge: true
    })
  },
  //时间选择，点击确定
  timeChange:function(event){
    let that = this;
    //console.log('选择的时间==='+event.detail);
    var date = new Date(); //获取当前时间
    // var year = date.getFullYear();
    var hour = date.getHours(); //获取当前小时
    var minute = date.getMinutes(); //获取当前分钟
    var atime = event.detail.split(':');
    //console.log('选择的时间==='+atime);
    //console.log('选择的时间小于当前时间==='+hour+'===='+minute);
    var atimebool = false;
    if(atime[0]>hour){
      atimebool = true;
    }else if(atime[0]==hour && atime[1]>=minute){
      atimebool = true;
    }
    if(!atimebool){
      wx.showToast({
        title: '选择时间不能小于当前时间',
        icon: 'none'
      })
    }else{
      //判断选择的时间是否在禁用时间段里面
      //console.log('禁用的时段===');
      //console.log(that.data.timeHourAllArr);
      
      var atimelist = that.data.timeHourAllArr[0];
      var aselecttime = false;
      if(atimelist){
        for(var i = 0;i<atimelist.length;i++){
          var aobjtemp = atimelist[i];
          if(aobjtemp.useflage==true && aobjtemp==atime[0]){
            //选择了禁用时间
            aselecttime = true;
            break;
          }
        }
      }
      if(aselecttime){
        wx.showToast({
          title: '选择的该时段已经被预定，请重新选择',
          icon: 'none'
        })
        return;
      }
      ////////////////////////////////////////////
      var year1 = date.getFullYear();
      var  alist = that.data.daytime.split('.');
      var month1 = alist[0]; //获取当前月份
      var day1 = alist[1]; //获取当前日期
      that.setData({
        showtimefalge: false,
      })
      that.setData({
        begin_hour_minute_time: event.detail,
        submit_begin_time:year1+'-'+month1+'-'+day1+' '+event.detail
      })
      const str = [year1, month1,day1].map(util1.formatNumber).join('-')+' '+event.detail;
      console.info('时间信息===111');
      console.info(str);
      const newdate1 = new Date(str);
      var aindex = -1;
      if(that.data.select_time_index == 0){
        aindex = 4;
      }else if(that.data.select_time_index == 1){
        aindex = 5;
      }else if(that.data.select_time_index == 2){
        aindex = 6;
      }else if(that.data.select_time_index == 3){
        aindex = 9;
      }
      if(aindex>0){
        that.haveSomeMinutesTime(newdate1,aindex*60)
      }
    }
  },
  //时间选择，点击取消
  timeCancel:function(){
    let that = this
    that.setData({
      showtimefalge: false
    })
  },
})