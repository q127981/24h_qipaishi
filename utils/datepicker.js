const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function getCurrentDate(){// 获取当前时间
  let date = new Date();   
  let currentYears=date.getFullYear();
  let currentMonths=date.getMonth()+1;
  let currentDay=date.getDate();
  let currentHours=date.getHours();
  let currentMinute=date.getMinutes();   
  
  var year=[currentYears].map(formatNumber)
  var mm=[currentMonths].map(formatNumber)
  var dd=[currentDay].map(formatNumber)
  var hh=[currentHours].map(formatNumber)
  var min=[currentMinute].map(formatNumber) 
  // return year+'年'+mm+'月'+dd+'日'+hh+':'+min;
  return year+'/'+mm+'/'+dd+' '+hh+':'+min; //2023-08-23-09:43
}
 
function GetMultiIndex(){ //一点开picker的选中设置  
	let arr=loadPickerData()
	console.log(arr);
	let date = new Date();   
	let currentYears=date.getFullYear();
  let currentMonths=date.getMonth()+1;
  let currentDay=date.getDate();
  let currentHours=date.getHours();
	let currentMinute=date.getMinutes();  
	console.log(currentYears);
	let yearindex=0
	let monthindex=0
	let dayindex=0
	let hoursindex=0
	let minuteindex=0
	arr.forEach((item,index)=>{
		switch (index) {
			case 0:
					currentYears=currentYears+'年'
					yearindex =item.indexOf(currentYears)
				break;
			case 1:
					currentMonths=[currentMonths].map(formatNumber)+'月'
					monthindex =item.indexOf(currentMonths)
				break;
			case 2:
					currentDay=[currentDay].map(formatNumber)+'日'
					dayindex =item.indexOf(currentDay)
				break;
			case 3:
					currentHours=[currentHours].map(formatNumber)+'时'
					hoursindex =item.indexOf(currentHours)
				break;
			case 4:
					currentMinute=[currentMinute].map(formatNumber)+'分'
					minuteindex =item.indexOf(currentMinute)
				break;
			default:
				break;
		}
	})
	//现在全部列，默认选第一个选项,可以直接在data里面定义 
	return [yearindex,monthindex,dayindex,hoursindex,minuteindex];
} 
 
function loadYears(startYear,endYear){//获取年份 
  /**
   * params参数
   * startYear 当前年份
   * endYear 循环结束月份 ，比如 5 年内 newDate().getFullYear() + 4，客户说只能预约两年内 
   * return 年份数组
  */
  let years=[];
  for (let i = startYear; i <= endYear; i++) {
    years.push("" + i+"年");
  } 
  // console.log(years,'years');
  return years;//返回年份数组 
}
 
 
function loadMonths(startMonth,endMonth){//获取月份
  // console.log(startMonth,endMonth,'startMonth,endMonth');
   /**
   * params参数
   * startMonth 当前月份
   * endMonth 循环结束月份，一般为 12个月
   * return 月份数组
  */ 
  let months=[];
  for (let i = startMonth; i <= endMonth; i++) {
    if (i < 10) {
      i = "0" + i;
    }
    months.push("" + i+"月");
  } 
  // console.log(months,'months');
  return months;//返回月份数组 
}
 
 
function loadDays(yearSelected,selectedMonths,startDay){ //获取日期  
  /**
   * params参数
   * currentYears 当前年份
   * selectedMonths 当前选择的月份
   * startDay   循环开始日 一般为1号， 希望从当前月份开始 ，startDay=currentDay
   * return 日期数组
  */
//  console.log(currentYears,selectedMonths,startDay,'111');
    let days=[];
    if (selectedMonths == 1 || selectedMonths == 3 || selectedMonths == 5 || selectedMonths == 7 || selectedMonths == 8 || selectedMonths == 10 || selectedMonths == 12) { //判断31天的月份，可以用正则简化
      for (let i = startDay; i <= 31; i++) {
        if (i < 10) {
          i = "0" + i;
        }
        days.push("" + i+'日');
      } 
    } else if (selectedMonths == 4 || selectedMonths == 6 || selectedMonths == 9 || selectedMonths == 11) { //判断30天的月份
      for (let i = startDay; i <= 30; i++) {
        if (i < 10) {
          i = "0" + i;
        }
        days.push("" + i+'日');
      } 
    } else if (selectedMonths == 2) { //判断2月份天数
      console.log('2月');
      let year = yearSelected 
      console.log(year,'year');
      if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {//闰年
        for (let i = startDay; i <= 29; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          days.push("" + i+'日');
        }
      } else {//不是闰年
        for (let i = startDay; i <= 28; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          days.push("" + i+'日');
        } 
      }
    }
    console.log(days,'days');
    return days;//返回日期数组
}
 
 
function loadHours(startHour,endHour){//获取小时
   /**
   * params参数
   * startHour 循环开始小时 一般为 0点， 希望从当前小时开始 startHour=currentHours
   * endHour 循环当前小时 ,一般为24个小时
   * return 小时数组
  */ 
  let hours=[];
   for (let i = startHour; i < endHour ; i++) {
    if (i < 10) {//看需求要不要加在前面+‘0’
      i = "0" + i;
    }
    hours.push("" + i+"时");
  }
  return hours;//返回小时数组 
}
 
 
function loadMinutes(startMinute,endMinute){//获取分钟
  /**
   * params参数
   * startMinute 循环开始分钟 一般为 0 开始，从当前分钟开始 startMinute=currentMinutes
   * endMinute 循环当前秒 ，一般为60分钟
   * return 分钟数组
  */  
 let minutes=[];
  for (let i = startMinute; i < endMinute ; i++) {
   if (i < 10) {
     i = "0" + i;
   }
   minutes.push("" + i+"分");
 }
 return minutes;//返回分钟数组 
}
 
//我没有用到秒，可以参考分钟的写法
 
function loadPickerData(){ //将Picker初始数据，开始时间设置为当前时间
  let date1 = new Date();   
  let currentYears=date1.getFullYear();
  let currentMonths=date1.getMonth()+1;
  let currentDay=date1.getDate();
  let currentHours=date1.getHours();
  let currentMinute=date1.getMinutes();  
  
  // 下面调用 自定义方法 
 
  //获取年份  loadYears(startYear,endYear)  
  //获取月份  loadMonths(startMonth,endMonth)
  //获取日期  loadDays(currentYears,currentMonths,startDay)
  //获取小时  loadHours(startHour,endHour)
  //获取分钟  loadMinutes(startMinute,endMinute)
  
  let years = loadYears(currentYears-2,date1.getFullYear() + 100)  //修改起始年份在两年前
  let months = loadMonths(1,12)   
  let days = loadDays(currentYears,currentMonths,1)  
  let hours = loadHours(0,24)  
  let minutes =  loadMinutes(0,60)
  return [years, months, days, hours, minutes]
}
 
//导出
module.exports = {
  loadPickerData:loadPickerData,
  getCurrentDate:getCurrentDate,
  GetMultiIndex:GetMultiIndex,
  loadYears:loadYears,
  loadMonths:loadMonths,
  loadDays:loadDays,
  loadHours:loadHours,
  loadMinutes:loadMinutes
}