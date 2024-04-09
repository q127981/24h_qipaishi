const plugin = requirePlugin("myPlugin");

function blueDoorOpen(lockData){
   if(lockData==null||lockData.length < 50){
    this.showModel("门锁配置异常");
   }else{
      wx.showToast({ 
        icon: "loading", 
        title: "开锁中..." ,
        duration: 10000,
        mask: true  // 遮罩层，防止点击
      });
      var deviceId="";
      plugin.controlLock(plugin.ControlAction.OPEN, lockData, res => {
        console.log("控制智能锁时设备连接已断开", res);
      }, null, deviceId).then(res => {
        console.log(res)
        if (res.deviceId) deviceId = res.deviceId;
        if (res.errorCode === 0) {
            wx.hideToast();
            wx.showToast({ icon: "success", title: "开锁成功" });
        } else {
          wx.hideToast();
          this.showModel(res.errorMsg);
        }
    })
   }
}

module.exports = {
  blueDoorOpen: blueDoorOpen
}