/**
 *t访问网络 
 */
var util = require("util");
var app = getApp();
//一般访问网络
function request(url, urltype, method, data, token, message, successBack, failBack) {

  if (message != "") {
    wx.showLoading({
      mask: true,
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
  if (token) {
    aheadertoken = token;
  } else {
    aheadertoken = ""
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
      'Authorization': 'Bearer ' + aheadertoken
    },
    method: method,
    success: function (res) {

      if (res.statusCode == 200) {

        if (res.data.code == 401) {
          //直接到登录界面
          wx.navigateTo({
            url: '../login/login',
          })
        } else {
          successBack(res.data)
        }

      }
      else if (res.statusCode == 401) {
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
    fail: function (err) {
      if (message != "") {
        setTimeout(function () {
          wx.hideLoading()
        }, 500)
      }
      failBack(err)
    },
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
  uploadFile: uploadFile
}