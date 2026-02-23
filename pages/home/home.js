// pages/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    width: 300,
    height: 300,
    renderWidth: 300,
    renderHeight: 300,
  },
  /**
   * 
   */
  startCarve() {
    // 使用 navigateTo 进行普通跳转
    wx.navigateTo({
      url: '/pages/carve/carve' // 目标页面的绝对路径
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const info = wx.getSystemInfoSync();
    const width = info.windowWidth;
    const height = info.windowHeight;
    const dpi = info.pixelRatio;
    this.setData({
      width, height,
      renderWidth: width * dpi,
      renderHeight: height * dpi
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }

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

  }

  // --- 核心路由分发器 ---
  ,navToTab(e) {
    // 从用户点击的 DOM 节点上，抓取 data-url 属性的值
    const targetUrl = e.currentTarget.dataset.url;
    
    if (!targetUrl) return;

    // 因为目标都是底部 TabBar 页面，必须使用 switchTab
    wx.switchTab({
      url: targetUrl,
      success: () => {
        console.log('成功跳转至:', targetUrl);
      },
      fail: (err) => {
        console.error('跳转失败, 请检查路径是否在 app.json 的 tabBar 中:', err);
      }
    });
  }
})