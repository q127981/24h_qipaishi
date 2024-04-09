/**
 *t访问网络 
 */
var util = require("util");
var app = getApp();
//一般访问网络
function request(url, urltype, method, data,  token,message,successBack, failBack) {

  if (message != "") {
    wx.showLoading({
      mask:true,
      title: message,
    })
  }
  var atempurl = app.globalData.baseUrl + url;
  //console.log('url++++++');
  //console.log(url);
  //console.log(urltype);
  //console.log(atempurl);
  //console.log(data);
  //console.log(token);
  //console.log('url++++++');
  var aheadertoken = '';
  if(token){
    aheadertoken = token;
  }else{
    aheadertoken = "test1"
  }
  //console.log('token++++++');
  //console.log(aheadertoken);
  //console.log('token++++++');

  wx.request({
    url: atempurl,
    data: data,
    header: {
      'tenant-id': app.globalData.tenantId,
      'Content-Type': 'application/json',
      'Authorization':'Bearer '+aheadertoken
    },
    method: method,
    success: function(res) {
      
      if (res.statusCode == 200) {

        if(res.data.code == 401){
          //直接到登录界面
          wx.navigateTo({
            url: '../login/login',
          })
        }else{
          successBack(res.data)
        }
        
      } 
      else if(res.statusCode == 401){
        //直接到登录界面
        wx.navigateTo({
          url: '../login/login',
        })
      }
      else {
        if (res.errMsg != null) {
          failBack(res.data)
        }
      }
      if (message != "") {
        setTimeout(function () {
          wx.hideLoading()
        }, 500)
      }
     
    },
    fail: function(err) {
      if (message != "") {
        setTimeout(function () {
          wx.hideLoading()
        }, 500)
      }
    failBack(err)
    },
  })
}
/*
微信一键登录
*/
function getLogin(phonecode,loginCode, successBack, failBack) {
  let that = this
  wx.login({
    success: function(res) {
      //console.log('++++==');
      //console.log(res);
      //console.log('++++==');
      if (res.code != null) {
        that.request(
          "/member/auth/weixin-mini-app-login",
          "1",
          "post", {
            "phoneCode": phonecode,
            "loginCode": loginCode
          },
          "登录中...",
          function success(info) {
            console.info('返回111===');
            console.info(info);
            if (info.code == 1) {
              //赋值给全局
              app.globalData.userData = info.data;
              app.globalData.isLogin=true;
              //console.log('456+++++++');
              //console.log(app.globalData.userData);
              //console.log('456+++++++');
              //缓存服务器返回的用户信息
              wx.setStorageSync("userDatatoken", info.data)
              successBack()
            } else {
              wx.showToast({
                title: info.msg,
              })
            }
          },
          function fail(info) {
            failBack()
          }
        )
      } else {
        //console.log('登录失败！' + res.errMsg)
      }
    }
  })
}
/**
 *
 *提问上传文件 
 */
function uploadFile(url, data, message, success, fail) {
  wx.showNavigationBarLoading()
  if (message != "") {
    wx.showLoading({
      title: message,
    })
  }

  wx.uploadFile({
    url: app.globalData.baseUrl + url, //仅为示例，非真实的接口地址
    filePath: data.temFile,
    name: data.file,
    formData: {
      token: app.globalData.userData.token,
    },
    header: {
      "Content-Type": "multipart/form-data"
    },
    success: function (res) {
      wx.hideNavigationBarLoading()
     
      if (res.statusCode == 200) {
        success(res.data)
      } else {
        fail(res)
      }
    },
    fail: function (err) {
      wx.hideNavigationBarLoading()
      if (message != "") {
        wx.hideLoading()
      }
      fail(err)
    },
  })
}

module.exports = {
  request: request,
  getLogin:getLogin,
  uploadFile:uploadFile
}