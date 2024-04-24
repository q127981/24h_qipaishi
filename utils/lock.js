const plugin = requirePlugin("myPlugin");

function blueDoorOpen(lockData){
   if(lockData==null||lockData.length < 50){
     wx.showToast({ icon: "none", title: "电子钥匙错误" });
   }else{
      wx.showToast({ 
        icon: "loading", 
        title: "开锁中..." ,
        duration: 10000,
        mask: true  // 遮罩层，防止点击
      });
      // 控制智能锁
      plugin.controlLock({
        /* 控制智能锁方式 3 -开锁, 6 -闭锁 */
        controlAction: 3,
        lockData: lockData,
        serverTime: Date.now(),
      }).then(res => {
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