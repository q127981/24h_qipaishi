const plugin = requirePlugin("myPlugin");

function blueDoorOpen(lockData){
   if(lockData==null||lockData.length < 50){
     wx.showToast({ icon: "none", title: "电子钥匙错误" });
   }else{
      //先打断所有蓝牙操作
      // plugin.stopAllOperations();
      // console.log("打断蓝牙操作");
      wx.showToast({ 
        icon: "loading", 
        title: "请靠近门锁" ,
        duration: 10000,
        mask: true  // 遮罩层，防止点击
      });
      // 控制智能锁    3.0以下版本
    // let  deviceId=0;
    //   plugin.controlLock(plugin.ControlAction.OPEN, lockData, res => {
    //         console.log("控制智能锁时设备连接已断开", res);
    //       }, null, deviceId).then(res => {
    //         console.log(res)
    //         if (res.errorCode == 0) {
    //             wx.showToast({ icon: "success", title: "已开锁" });
    //         } else {
    //             wx.hideLoading();
    //             wx.showToast({ icon: "none", title: "开锁失败" });
    //         }
    //    });

    //3.0以上版本
      plugin.controlLock({
        /* 控制智能锁方式 3 -开锁, 6 -闭锁 */
        controlAction: 3, 
        lockData: lockData,
        serverTime: Date.now(),
      }).then(res => {
          console.log(res);
          if (res.errorCode == 0) {
              wx.showToast({ icon: "success", title: "已开锁" });
          } else {
              wx.hideLoading();
              wx.showToast({ icon: "none", title: "开锁失败" });
          }
      })
  }
}
function queryLockPwd(lockData){
  wx.showLoading({ title: `请靠近门锁` });
  plugin.getAdminPasscode({ lockData: lockData}).then(result => {
    wx.hideLoading();
    if (result.errorCode === 0) {
        wx.showModal({
          content: `查询管理员密码成功, 密码: ${result.passcode}`,
          showCancel: false,
        })
    } else {
        wx.showToast({
          title: '查询失败',
          icon: 'error'
        })
    }
  })
}

function addCard(lockData){
  wx.showLoading({ title: `请靠近门锁` });
  plugin.addICCard({
    startDate: 0,
    endDate:  0,
    lockData: lockData,
    callback: (result) => {
        console.log(result, "中间步骤")
        switch (result.type) {
        case 1: {
            wx.showLoading({ title: `添加成功，正在上传` });
        }; break;
        case 2:{
            wx.showLoading({ title: `${result.description}, 请录入IC卡` });
        }; break;
        case 3: {
            wx.showLoading({ title: result.description });
        }; break;
        default: {
            wx.hideLoading();
            wx.showModal({
              content: result.errorMsg,
              showCancel: false,
            })
        }; break;
        }
    }
  }).then(res => {
    wx.hideLoading();
      if (res.errorCode === 0) {
          wx.showToast({ title: "添加成功" });
      } else {
          wx.showModal({
            content: `IC卡添加失败：${res.errorMsg}`,
            showCancel: false,
          })
      }
  })
}

function setLockGateWay(lockData){
  wx.showLoading({ title: `请靠近门锁` });
  plugin.setRemoteUnlockSwitchState({
    enable: true,
    lockData: lockData
  }).then(res => {
    wx.hideLoading();
    if (res.errorCode === 0) {
        wx.showToast({
          title: '设置成功',
          icon: 'success'
        })
        return res.lockData;
    } else {
      wx.showModal({
        content: `设置失败：${res.errorMsg}`,
        showCancel: false,
      })
      return 'error';
    }
  })
}

function setLockPwd(lockData,passcode){
  wx.showLoading({ title: `请靠近门锁` });
  plugin.modifyAdminPasscode({
    newPasscode: passcode,
    lockData: lockData
  }).then(res => {
    wx.hideLoading();
      if (res.errorCode === 0) {
          wx.showToast({
            title: '设置成功',
            icon: 'success'
          })
      } else {
        wx.showModal({
          content: `密码设置失败：${res.errorMsg}`,
          showCancel: false,
        })
      }
  })
}

function handleResetLock(lockData){
  setTimeout(() => {
    plugin.resetLock({ lockData }).then(res => {
      if (res.errorCode == 0){
        wx.showToast({
          title: '智能锁已重置',
          icon: 'success'
        })
      }else{
        wx.showToast({
          title: '重置失败',
          icon: 'error'
        })
      }
    });
  }, 3000);
  
}

function getPlugin(){
  return plugin;
}


module.exports = {
  blueDoorOpen: blueDoorOpen,
  queryLockPwd: queryLockPwd,
  addCard: addCard,
  setLockPwd: setLockPwd,
  setLockGateWay: setLockGateWay,
  handleResetLock: handleResetLock,
  getPlugin: getPlugin,
}