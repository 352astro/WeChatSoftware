import request from '../../utils/request.js';

Page({
  data: {
    orderList: [],
    totalCount: 0,
    statusBarHeight: 20 // 默认给一个 20px 的状态栏高度兜底
  },

  onLoad() {
    // 动态获取设备的系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      // 获取手机顶部的电量/信号栏高度
      statusBarHeight: systemInfo.statusBarHeight
    });
  },

  onShow() {
    this.fetchOrderHistory();
  },

  // --- 新增：手动返回上一页的方法 ---
  goBack() {
    wx.navigateBack({
      delta: 1, // 返回上一级页面
      fail: () => {
        // 如果没有上一级页面（比如直接扫码进来的），则跳回主页
        wx.switchTab({ url: '/pages/profile/profile' });
      }
    });
  },

  // 获取历史订单列表 (原逻辑保持不变)
  fetchOrderHistory() {
    wx.showLoading({ title: '加载中...', mask: true });
    request({ url: '/api/order/history', method: 'GET' })
      .then(res => {
        wx.hideLoading();
        if (res.data && res.data.records) {
          this.setData({
            orderList: res.data.records,
            totalCount: res.data.total
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        this.setData({
          orderList: [{ orderId: 'MOCK202603040001' }, { orderId: 'MOCK202603040002' }]
        });
      });
  },

  goToDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    if (!orderId) return;
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${orderId}` });
  }
});