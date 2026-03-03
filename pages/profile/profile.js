// pages/profile/profile.js
Page({
  data: {},

  onLoad(options) { },

  // 普通子页面跳转 (保留返回键)
  navTo(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) return;
    wx.navigateTo({
      url: url,
      fail: (err) => {
        console.warn('跳转失败, 请检查app.json中是否配置了该页面:', err);
        wx.showToast({ title: '页面开发中', icon: 'none' });
      }
    });
  },

  // TabBar 页面跳转 (如画图台 carve 页面)
  navToTab(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) return;
    wx.switchTab({
      url: url
    });
  }
})