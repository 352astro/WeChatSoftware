// pages/cart/cart.js
Page({
  data: {},
  onLoad() {
  },

  // 点击“去结算”按钮，跳转到订单提交页面
  goToSubmitOrder() {
    // 注意：因为 order-submit 肯定不在底部的 TabBar 里，所以这里用 navigateTo
    wx.navigateTo({
      url: '/pages/order-submit/order-submit',
      fail: (err) => {
        // 避坑：如果你没在 app.json 注册这个页面，就会报错
        console.error('跳转提交订单页失败，请检查 app.json 是否已注册该页面', err);
        wx.showToast({
          title: '页面开发中',
          icon: 'none'
        });
      }
    });
  }
})