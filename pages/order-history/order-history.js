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

  // 获取历史订单列表（尽量自动适配后端返回结构）
  fetchOrderHistory() {
    wx.showLoading({ title: '加载中...', mask: true });
    request({ url: '/api/order/history', method: 'GET' })
      .then(res => {
        wx.hideLoading();
        const body = res && res.data ? res.data : {};
        console.log('订单历史接口原始返回：', body);

        let records = [];
        let total = 0;

        const pickFromObj = (obj) => {
          if (!obj || typeof obj !== 'object') return false;

          // 优先匹配常见字段
          if (Array.isArray(obj.records)) {
            records = obj.records;
            total = typeof obj.total === 'number' ? obj.total : obj.records.length;
            return true;
          }
          if (Array.isArray(obj.rows)) {
            records = obj.rows;
            total = typeof obj.total === 'number' ? obj.total : obj.rows.length;
            return true;
          }
          if (Array.isArray(obj.list)) {
            records = obj.list;
            total = typeof obj.total === 'number' ? obj.total : obj.list.length;
            return true;
          }
          if (Array.isArray(obj.items)) {
            records = obj.items;
            total = typeof obj.total === 'number' ? obj.total : obj.items.length;
            return true;
          }

          // 通用兜底：找到第一个数组字段
          const keys = Object.keys(obj);
          for (let i = 0; i < keys.length; i += 1) {
            const key = keys[i];
            if (Array.isArray(obj[key])) {
              records = obj[key];
              total = typeof obj.total === 'number' ? obj.total : obj[key].length;
              return true;
            }
          }
          return false;
        };

        // 先尝试在 body 顶层取，再尝试 body.data
        let found = pickFromObj(body);
        if (!found && body && typeof body.data === 'object') {
          found = pickFromObj(body.data);
        }

        if (!found) {
          console.warn('未能从返回结果中解析到订单数组，将保持空列表展示');
        }

        this.setData({
          orderList: records,
          totalCount: total
        });
      })
      .catch(err => {
        wx.hideLoading();
        console.error('订单历史接口请求失败，使用 MOCK 数据：', err);
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