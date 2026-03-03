import request from '../../utils/request.js';

Page({
  onLoad() {
    wx.showLoading({ title: '系统加载中', mask: true });
    this.startInit();
  },

  startInit() {
    const token = wx.getStorageSync('token');
    // 有 token 直接走，没 token 去登录
    token ? this.delayedNavigate() : this.doLogin();
  },

  doLogin() {
    wx.login({
      success: (res) => {
        request({
          url: '/api/user/login',
          method: 'POST',
          data: { code: res.code }
        })
        .then(res => {
          // 只要后端返回了 token 就算成功
          const data = res.data.data;
          if (data && data.token) {
            wx.setStorageSync('token', data.token);
            wx.setStorageSync('userid', data.id);
            wx.setStorageSync('openid', data.openid);
            this.delayedNavigate();
          }
        })
        .catch(() => wx.hideLoading()); // 失败直接关掉 loading，不做额外弹窗
      }
    });
  },

  delayedNavigate() {
    setTimeout(() => {
      wx.hideLoading();
      wx.reLaunch({ url: '/pages/home/home' });
    }, 1500);
  }
});