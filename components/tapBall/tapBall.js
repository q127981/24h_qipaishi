Component({
    properties: {
      menuItems: {
        type: Array,
        value: [
          {
            text: '开大门',
            value: 'openDoor',
            icon: '../../img/open-door.png'
          },
          {
            text: '开包间',
            value: 'openCompartment',
            icon: '../../img/open-compartment.png'
  
          },
          {
            text: '续单',
            value: 'reorder',
            icon: '../../img/reorder.png'
          }
        ]
      }
    },
  
    data: {
      ballLeft: 20,
      ballTop: 400,
      isMenuOpen: false
    },
  
    lifetimes: {
      attached () {
        const screenWidth = wx.getSystemInfoSync().windowWidth;
        const screenHeight = wx.getSystemInfoSync().windowHeight;
        const ballSize = Math.ceil(screenWidth * 200 / 750);
        this.setData({
          ballLeft: screenWidth - ballSize,
          ballTop: screenHeight/2 + ballSize * 1.75,
          ballSize
        })
      }
    },
  
    methods: {
      handleTouchStart(e) {
        this.setData({
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          startBallLeft: this.data.ballLeft,
          startBallTop: this.data.ballTop
        });
      },
  
      handleTouchMove(e) {
        const { startX, startY, startBallLeft, startBallTop } = this.data;
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - startX;
        const deltaY = touchY - startY;
  
        this.setData({
          ballLeft: startBallLeft + deltaX,
          ballTop: startBallTop + deltaY
        });
      },
  
      handleTouchEnd() {
        const { ballLeft, ballTop, ballSize } = this.data;
        const screenWidth = wx.getSystemInfoSync().windowWidth;
        const screenHeight = wx.getSystemInfoSync().windowHeight;
  
        if (ballLeft < 0) {
          this.setData({
            ballLeft: 0
          });
        }
  
        if (ballLeft + ballSize > screenWidth) {
          this.setData({
            ballLeft: screenWidth - ballSize
          });
        }
  
        if (ballTop < 0) {
          this.setData({
            ballTop: 0
          });
        }
  
        if (ballTop + ballSize > screenHeight) {
          this.setData({
            ballTop: screenHeight - ballSize
          });
        }
      },
  
      toggleMenu() {
        this.setData({
          isMenuOpen: !this.data.isMenuOpen
        });
      },
  
      handleMenuItemTap(e) {
        const value = e.currentTarget.dataset.value;
        this.triggerEvent('menu-event', { value });
      }
    }
  });