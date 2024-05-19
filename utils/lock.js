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
        title: "开锁中..." ,
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

module.exports = {
  blueDoorOpen: blueDoorOpen
}