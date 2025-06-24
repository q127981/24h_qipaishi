const formatTime = date => {
  //console.log(date)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
// 手机号码验证
const checkPhone = value => {
    const reg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
    const result = reg.test(value)
    return result
}
 //门禁	1 //空开	2 //云喇叭	3 //灯具 4 //密码锁 5 //网关 6 //插座 7
//锁球器控制器（12V） 8//人脸门禁机 9//智能语音喇叭 10 //二维码识别器 11
//红外控制器 12//三路控制器 13//AI锁球器 14//计时器 16
function getDeviceTypeName(type){
  switch(type){
    case 1: return '磁力锁门禁';
    case 2: return '空开';
    case 3: return '云喇叭';
    case 4: return '灯具';
    case 5: return '智能锁';
    case 6: return '智能锁网关';
    case 7: return '插座';
    case 8: return '锁球器控制器（12V）';
    case 9: return '人脸门禁机';
    case 10: return '智能语音喇叭';
    case 11: return '二维码识别器';
    case 12: return '红外控制器';
    case 13: return '三路控制器';
    case 14: return 'AI锁球器';
    case 16: return '计时器';
  }
}
module.exports = {
  formatTime,
  formatNumber,
  checkPhone,
  getDeviceTypeName,
}
